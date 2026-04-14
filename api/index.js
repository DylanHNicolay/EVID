const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'divecloud-dev-secret';
const BCRYPT_ROUNDS = 12;

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'mydb',
});

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function userPayload(u) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    first_name: u.first_name,
    last_name: u.last_name,
    avatar_url: u.avatar_url || null,
  };
}

// ─── Auth ────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
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

app.post('/api/auth/login', async (req, res) => {
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

app.get('/api/auth/me', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token' });
    }
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
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

// ─── User Profile (Edit) ─────────────────────────────

app.get('/api/auth/profile', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token' });
    }
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
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

    res.json({ ...user, ...athleteData });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('profile get error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/auth/profile', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token' });
    }
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);

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
        first_name || undefined, last_name || undefined,
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

    res.json({ ...user, ...athleteData });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('profile update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Athlete Media (Photos & Videos) ──────────────────

app.get('/api/athletes/:athleteId/media/photos', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ap.id, ap.title, ap.url, ap.created_at,
              m.name AS meet_name, e.height AS event_height, me.total_score
       FROM athlete_photos ap
       LEFT JOIN meet_entries me ON me.id = ap.meet_entry_id
       LEFT JOIN events e ON e.id = me.event_id
       LEFT JOIN meets m ON m.id = e.meet_id
       WHERE ap.athlete_id = $1
       ORDER BY ap.created_at DESC`,
      [req.params.athleteId]
    );
    res.json(rows);
  } catch (err) {
    console.error('get photos error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/athletes/:athleteId/media/videos', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT av.id, av.title, av.video_url, av.created_at,
              m.name AS meet_name, e.height AS event_height, me.total_score
       FROM athlete_videos av
       LEFT JOIN meet_entries me ON me.id = av.meet_entry_id
       LEFT JOIN events e ON e.id = me.event_id
       LEFT JOIN meets m ON m.id = e.meet_id
       WHERE av.athlete_id = $1
       ORDER BY av.created_at DESC`,
      [req.params.athleteId]
    );
    res.json(rows);
  } catch (err) {
    console.error('get videos error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/athletes/:athleteId/media/photos', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token' });
    }
    jwt.verify(header.slice(7), JWT_SECRET);

    const { title, url, meet_entry_id } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO athlete_photos (athlete_id, title, url, meet_entry_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.athleteId, title, url, meet_entry_id || null]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('upload photo error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/athletes/:athleteId/media/videos', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token' });
    }
    jwt.verify(header.slice(7), JWT_SECRET);

    const { title, video_url, meet_entry_id } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO athlete_videos (athlete_id, title, video_url, meet_entry_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.athleteId, title, video_url, meet_entry_id || null]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('upload video error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/athletes/:athleteId/media/photos/:photoId', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token' });
    }
    jwt.verify(header.slice(7), JWT_SECRET);

    const { rows } = await pool.query(
      `DELETE FROM athlete_photos
       WHERE id = $1 AND athlete_id = $2
       RETURNING id`,
      [req.params.photoId, req.params.athleteId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('delete photo error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/athletes/:athleteId/media/videos/:videoId', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token' });
    }
    jwt.verify(header.slice(7), JWT_SECRET);

    const { rows } = await pool.query(
      `DELETE FROM athlete_videos
       WHERE id = $1 AND athlete_id = $2
       RETURNING id`,
      [req.params.videoId, req.params.athleteId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('delete video error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Home ────────────────────────────────────────────────

app.get('/api/home/recent-meets', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, meet_date, date_end, location, logo_url
      FROM meets
      WHERE status = 'completed'
      ORDER BY meet_date DESC
      LIMIT 6
    `);
    res.json(rows);
  } catch (err) {
    console.error('recent-meets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/home/top-events', async (_req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const query = `
      SELECT
        me.id AS entry_id, a.first_name, a.last_name, a.gender,
        t.accent_color AS team_color, t.name AS team_name,
        e.event_name, e.height, e.dives_required, me.total_score
      FROM meet_entries me
      JOIN events e   ON e.id  = me.event_id
      JOIN meets m    ON m.id  = e.meet_id
      JOIN athletes a ON a.id  = me.athlete_id
      LEFT JOIN teams t ON t.id = me.team_id
      WHERE m.status = 'completed'
        AND m.meet_date >= ($1::date - INTERVAL '1 year')
        AND m.meet_date <= $1::date
        AND me.total_score IS NOT NULL
        AND a.gender = $2
      ORDER BY me.total_score DESC
      LIMIT 5
    `;
    const [menResult, womenResult] = await Promise.all([
      pool.query(query, [today, 'men']),
      pool.query(query, [today, 'women']),
    ]);
    res.json({ men: menResult.rows, women: womenResult.rows });
  } catch (err) {
    console.error('top-events error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/home/commitments', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT cc.id, a.first_name, a.last_name, a.hometown, a.avatar_url,
             cc.school_name, cc.school_logo_url, cc.commitment_date, cc.quote
      FROM college_commitments cc
      JOIN athletes a ON a.id = cc.athlete_id
      ORDER BY cc.commitment_date DESC NULLS LAST
      LIMIT 3
    `);
    res.json(rows);
  } catch (err) {
    console.error('commitments error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Meets listing ───────────────────────────────────────

app.get('/api/meets', async (req, res) => {
  try {
    const { name, sort, date, range } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (name) {
      conditions.push(`m.name ILIKE $${idx}`);
      params.push(`%${name}%`);
      idx++;
    }

    if (date === 'past') {
      conditions.push(`m.status = 'completed'`);
    } else if (date === 'upcoming') {
      conditions.push(`m.status = 'upcoming'`);
    }

    if (range === 'week') {
      conditions.push(`m.meet_date >= NOW() - INTERVAL '7 days'`);
    } else if (range === 'month') {
      conditions.push(`m.meet_date >= NOW() - INTERVAL '30 days'`);
    } else if (range === 'year') {
      conditions.push(`m.meet_date >= NOW() - INTERVAL '365 days'`);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    let orderBy;
    if (sort === 'top') {
      orderBy = 'ORDER BY team_count DESC, m.meet_date DESC';
    } else {
      orderBy = 'ORDER BY m.meet_date DESC';
    }

    const query = `
      SELECT m.id, m.name, m.meet_date, m.date_end, m.location,
             m.status, m.logo_url, m.meet_type,
             COUNT(DISTINCT mt.team_id) AS team_count
      FROM meets m
      LEFT JOIN meet_teams mt ON mt.meet_id = m.id
      ${where}
      GROUP BY m.id
      ${orderBy}
      LIMIT 50
    `;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('meets listing error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Meet detail ─────────────────────────────────────────

app.get('/api/meets/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, meet_date, date_end, location, course,
              meet_type, season, status, logo_url
       FROM meets WHERE id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Meet not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('meet detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/meets/:id/teams', async (req, res) => {
  try {
    const gender = req.query.gender || 'men';
    const { rows } = await pool.query(
      `SELECT mt.team_id, t.name, t.logo_url, t.accent_color, mt.team_score
       FROM meet_teams mt
       JOIN teams t ON t.id = mt.team_id
       WHERE mt.meet_id = $1 AND mt.gender = $2
       ORDER BY mt.team_score DESC`,
      [req.params.id, gender]
    );
    res.json(rows);
  } catch (err) {
    console.error('meet teams error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/meets/:id/results', async (req, res) => {
  try {
    const gender = req.query.gender || 'men';
    const { rows } = await pool.query(
      `SELECT me.id, a.first_name || ' ' || a.last_name AS name,
              t.name AS team, e.height AS event,
              me.total_score AS score, me.points, me.final_rank
       FROM meet_entries me
       JOIN events e   ON e.id  = me.event_id
       JOIN athletes a ON a.id  = me.athlete_id
       LEFT JOIN teams t ON t.id = me.team_id
       WHERE e.meet_id = $1 AND e.category = $2
       ORDER BY e.height, me.total_score DESC`,
      [req.params.id, gender]
    );
    res.json(rows);
  } catch (err) {
    console.error('meet results error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Athletes (profile) ─────────────────────────────────

app.get('/api/athletes/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.first_name, a.last_name, a.gender, a.graduation_year,
              a.hometown, a.bio, a.avatar_url,
              u.banner_url, u.location, u.middle_initial, u.date_of_birth, 
              u.gender AS user_gender, u.preferred_first_name, u.uss_number,
              t.id AS team_id, t.name AS team_name, t.logo_url AS team_logo,
              t.accent_color AS team_color
       FROM athletes a
       LEFT JOIN users u  ON u.id = a.user_id
       LEFT JOIN teams t  ON t.id = a.team_id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Athlete not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('athlete detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/athletes/:id/teams', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.id, t.name, t.location, t.abbreviation, t.accent_color
       FROM athletes a
       JOIN teams t ON t.id = a.team_id
       WHERE a.id = $1`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('athlete teams error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/athletes/:id/meets', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (m.id, e.height)
              m.id AS meet_id, m.name AS meet_name, m.meet_date, m.location, m.logo_url,
              e.height AS event, e.dives_required AS dives,
              me.total_score AS score, me.final_rank AS rank
       FROM meet_entries me
       JOIN events e ON e.id = me.event_id
       JOIN meets m  ON m.id = e.meet_id
       WHERE me.athlete_id = $1
       ORDER BY m.id, e.height, me.total_score DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('athlete meets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/athletes/:id/results', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT me.id AS entry_id, e.event_name, e.height, e.dives_required,
              me.total_score, me.final_rank, me.points,
              m.name AS meet_name, m.meet_date,
              json_agg(
                json_build_object(
                  'dive_number', dr.dive_number, 'dive_code', dr.dive_code,
                  'dd', dr.dd, 'j1', dr.j1, 'j2', dr.j2, 'j3', dr.j3,
                  'j4', dr.j4, 'j5', dr.j5, 'award', dr.award,
                  'score', dr.score, 'is_personal_best', dr.is_personal_best
                ) ORDER BY dr.dive_number
              ) AS dives
       FROM meet_entries me
       JOIN events e      ON e.id = me.event_id
       JOIN meets m       ON m.id = e.meet_id
       LEFT JOIN dive_results dr ON dr.meet_entry_id = me.id
       WHERE me.athlete_id = $1
       GROUP BY me.id, e.event_name, e.height, e.dives_required,
                me.total_score, me.final_rank, me.points, m.name, m.meet_date
       ORDER BY m.meet_date DESC, e.height
       LIMIT 20`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('athlete results error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/athletes/:id/personal-bests', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (e.height)
              e.height, e.event_name, e.dives_required,
              me.total_score, m.name AS meet_name, m.meet_date, m.course,
              m.season, me.id AS entry_id
       FROM meet_entries me
       JOIN events e ON e.id = me.event_id
       JOIN meets m  ON m.id = e.meet_id
       WHERE me.athlete_id = $1 AND me.total_score IS NOT NULL
       ORDER BY e.height, me.total_score DESC`,
      [req.params.id]
    );

    const entryIds = rows.map(r => r.entry_id);
    let divesMap = {};
    if (entryIds.length > 0) {
      const dr = await pool.query(
        `SELECT meet_entry_id, dive_number, dive_code, dd, j1, j2, j3, j4, j5,
                award, score, is_personal_best
         FROM dive_results WHERE meet_entry_id = ANY($1)
         ORDER BY dive_number`,
        [entryIds]
      );
      for (const d of dr.rows) {
        if (!divesMap[d.meet_entry_id]) divesMap[d.meet_entry_id] = [];
        divesMap[d.meet_entry_id].push(d);
      }
    }

    const result = rows.map(r => ({
      ...r,
      dives: divesMap[r.entry_id] || [],
    }));
    res.json(result);
  } catch (err) {
    console.error('personal-bests error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/athletes/:id/progression', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.meet_date AS date, MAX(me.total_score) AS score
       FROM meet_entries me
       JOIN events e ON e.id = me.event_id
       JOIN meets m  ON m.id = e.meet_id
       WHERE me.athlete_id = $1 AND me.total_score IS NOT NULL
       GROUP BY m.meet_date
       ORDER BY m.meet_date`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('progression error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Teams ───────────────────────────────────────────────

app.get('/api/teams', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    let query, params;
    if (q) {
      query = `SELECT id, name, abbreviation, school, location, logo_url
               FROM teams
               WHERE name ILIKE $1 OR abbreviation ILIKE $1 OR school ILIKE $1
               ORDER BY name
               LIMIT 30`;
      params = [`%${q}%`];
    } else {
      query = `SELECT id, name, abbreviation, school, location, logo_url
               FROM teams ORDER BY name LIMIT 30`;
      params = [];
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('teams search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/teams/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, abbreviation, school, division, conference,
              location, logo_url, banner_url, accent_color
       FROM teams WHERE id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Team not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('team detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/teams/:id/roster', async (req, res) => {
  try {
    const gender = req.query.gender || 'men';
    const { rows } = await pool.query(
      `SELECT a.id, a.first_name || ' ' || a.last_name AS name,
              a.hometown, a.graduation_year, a.gender,
              COALESCE(MAX(me.total_score), 0) AS points
       FROM athletes a
       LEFT JOIN meet_entries me ON me.athlete_id = a.id
       WHERE a.team_id = $1 AND a.gender = $2
       GROUP BY a.id, a.first_name, a.last_name, a.hometown, a.graduation_year, a.gender
       ORDER BY a.last_name, a.first_name`,
      [req.params.id, gender]
    );
    res.json(rows);
  } catch (err) {
    console.error('team roster error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/teams/:id/coaches', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, u.first_name || ' ' || u.last_name AS name,
              c.title, c.photo_url
       FROM coaches c
       JOIN users u ON u.id = c.user_id
       WHERE c.team_id = $1
       ORDER BY c.title`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('team coaches error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/teams/:id/stats', async (req, res) => {
  try {
    const id = req.params.id;
    const [rosterRes, meetsRes, coachRes] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM athletes WHERE team_id = $1', [id]),
      pool.query('SELECT COUNT(DISTINCT meet_id)::int AS count FROM meet_teams WHERE team_id = $1', [id]),
      pool.query('SELECT COUNT(*)::int AS count FROM coaches WHERE team_id = $1', [id]),
    ]);
    res.json({
      roster_count: rosterRes.rows[0].count,
      meet_count: meetsRes.rows[0].count,
      coach_count: coachRes.rows[0].count,
    });
  } catch (err) {
    console.error('team stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/teams/:id/meets', async (req, res) => {
  try {
    const season = req.query.season;
    let query = `
      SELECT DISTINCT m.id, m.name, m.meet_date, m.date_end, m.location,
             m.status, m.meet_type, m.season, m.logo_url
      FROM meet_teams mt
      JOIN meets m ON m.id = mt.meet_id
      WHERE mt.team_id = $1`;
    const params = [req.params.id];

    if (season) {
      query += ` AND m.season = $2`;
      params.push(season);
    }
    query += ` ORDER BY m.meet_date DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('team meets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Search ──────────────────────────────────────────────

app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.trim().length === 0) {
      return res.json({ athletes: [], teams: [], meets: [] });
    }
    const pattern = `%${q.trim()}%`;

    const [athletes, teams, meets] = await Promise.all([
      pool.query(
        `SELECT id, first_name, last_name, hometown
         FROM athletes
         WHERE first_name || ' ' || last_name ILIKE $1
         LIMIT 5`,
        [pattern]
      ),
      pool.query(
        `SELECT id, name, location, logo_url
         FROM teams
         WHERE name ILIKE $1 OR abbreviation ILIKE $1 OR school ILIKE $1
         LIMIT 5`,
        [pattern]
      ),
      pool.query(
        `SELECT id, name, meet_date, location
         FROM meets WHERE name ILIKE $1
         ORDER BY meet_date DESC
         LIMIT 5`,
        [pattern]
      ),
    ]);

    res.json({
      athletes: athletes.rows,
      teams: teams.rows,
      meets: meets.rows,
    });
  } catch (err) {
    console.error('search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
