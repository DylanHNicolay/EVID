const { Router } = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { BCRYPT_ROUNDS, signToken, userPayload, verifyToken, profilePayload } = require('../middleware/auth');

const router = Router();

router.post('/auth/register', async (req, res) => {
  try {
    const {
      email, password, firstName, lastName, role,
      middleInitial, dateOfBirth, gender, preferredFirstName,
      ussNumber, graduationYear, hometown, avatarUrl, bannerUrl,
      teamId, coachTitle,
    } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const dbRole = role === 'diver' ? 'athlete' : role;
    if (!['athlete', 'coach'].includes(dbRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const finalAvatar = avatarUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`;
    const finalBanner = bannerUrl || 'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=1200';

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO users
         (email, password_hash, role, first_name, last_name,
          middle_initial, date_of_birth, gender, preferred_first_name,
          uss_number, avatar_url, banner_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        email, hash, dbRole, firstName, lastName,
        middleInitial || null, dateOfBirth || null, gender || null,
        preferredFirstName || null, ussNumber || null,
        finalAvatar, finalBanner,
      ]
    );
    const user = rows[0];

    let athleteId = null;
    if (dbRole === 'athlete') {
      const ar = await pool.query(
        `INSERT INTO athletes
           (user_id, first_name, last_name, gender, graduation_year, hometown, avatar_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [
          user.id, firstName, lastName,
          gender || null, graduationYear || null, hometown || null,
          finalAvatar,
        ]
      );
      athleteId = ar.rows[0].id;
    } else if (dbRole === 'coach') {
      if (!teamId) {
        return res.status(400).json({ error: 'Team is required for coach accounts' });
      }
      await pool.query(
        `INSERT INTO coaches (user_id, team_id, title) VALUES ($1, $2, $3)`,
        [user.id, teamId, coachTitle || 'Coach']
      );
    }

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { ...userPayload(user), athlete_id: athleteId, team_id: teamId || null },
    });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let athleteId = null;
    if (user.role === 'athlete') {
      const ar = await pool.query('SELECT id FROM athletes WHERE user_id = $1', [user.id]);
      if (ar.rows.length > 0) athleteId = ar.rows[0].id;
    }

    const token = signToken(user);
    res.json({ token, user: { ...userPayload(user), athlete_id: athleteId } });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/auth/me', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (!decoded) return res.status(401).json({ error: 'No token' });

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (rows.length === 0) return res.status(401).json({ error: 'User not found' });

    const user = rows[0];
    let athleteId = null;
    let teamId = null;
    if (user.role === 'athlete') {
      const ar = await pool.query('SELECT id FROM athletes WHERE user_id = $1', [user.id]);
      if (ar.rows.length > 0) athleteId = ar.rows[0].id;
    } else if (user.role === 'coach') {
      const cr = await pool.query('SELECT team_id FROM coaches WHERE user_id = $1', [user.id]);
      if (cr.rows.length > 0) teamId = cr.rows[0].team_id;
    }

    res.json({ ...userPayload(user), athlete_id: athleteId, team_id: teamId });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/auth/profile', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (!decoded) return res.status(401).json({ error: 'No token' });

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (rows.length === 0) return res.status(401).json({ error: 'User not found' });

    const user = rows[0];
    let athleteData = {};
    if (user.role === 'athlete') {
      const ar = await pool.query(
        'SELECT hometown, graduation_year, bio, gender AS athlete_gender FROM athletes WHERE user_id = $1',
        [user.id]
      );
      if (ar.rows.length > 0) {
        athleteData = {
          athlete_hometown: ar.rows[0].hometown,
          athlete_graduation_year: ar.rows[0].graduation_year,
          athlete_bio: ar.rows[0].bio,
          athlete_gender: ar.rows[0].athlete_gender,
        };
      }
    }

    res.json({ ...profilePayload(user), ...athleteData });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('profile get error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/auth/profile', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (!decoded) return res.status(401).json({ error: 'No token' });

    const {
      first_name, last_name, middle_initial, date_of_birth,
      gender, preferred_first_name, uss_number,
      avatar_url, banner_url, location,
      athlete_hometown, athlete_graduation_year, athlete_bio, athlete_gender,
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           middle_initial = COALESCE($3, middle_initial),
           date_of_birth = COALESCE($4, date_of_birth),
           gender = COALESCE($5, gender),
           preferred_first_name = COALESCE($6, preferred_first_name),
           uss_number = COALESCE($7, uss_number),
           avatar_url = COALESCE($8, avatar_url),
           banner_url = COALESCE($9, banner_url),
           location = COALESCE($10, location),
           updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        first_name || null, last_name || null,
        middle_initial || null, date_of_birth || null,
        gender || null, preferred_first_name || null, uss_number || null,
        avatar_url || null, banner_url || null, location || null,
        decoded.id,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    let athleteData = {};

    if (user.role === 'athlete') {
      const ar = await pool.query(
        `UPDATE athletes
         SET first_name = $1,
             last_name = $2,
             gender = COALESCE($3, gender),
             hometown = COALESCE($4, hometown),
             graduation_year = COALESCE($5, graduation_year),
             bio = COALESCE($6, bio),
             avatar_url = COALESCE($7, avatar_url)
         WHERE user_id = $8
         RETURNING hometown, graduation_year, bio, gender AS athlete_gender`,
        [
          user.first_name, user.last_name,
          athlete_gender || null, athlete_hometown || null,
          athlete_graduation_year || null, athlete_bio || null,
          avatar_url || null, decoded.id,
        ]
      );
      if (ar.rows.length > 0) {
        athleteData = {
          athlete_hometown: ar.rows[0].hometown,
          athlete_graduation_year: ar.rows[0].graduation_year,
          athlete_bio: ar.rows[0].bio,
          athlete_gender: ar.rows[0].athlete_gender,
        };
      }
    } else if (user.first_name || user.last_name) {
      await pool.query(
        `UPDATE athletes SET first_name = $1, last_name = $2 WHERE user_id = $3`,
        [user.first_name, user.last_name, decoded.id]
      );
    }

    res.json({ ...profilePayload(user), ...athleteData });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('profile update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
