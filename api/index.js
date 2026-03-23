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
    const { email, password, firstName, lastName, role } = req.body;
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

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [email, hash, dbRole, firstName, lastName]
    );
    const user = rows[0];

    if (dbRole === 'athlete') {
      await pool.query(
        `INSERT INTO athletes (user_id, first_name, last_name) VALUES ($1, $2, $3)`,
        [user.id, firstName, lastName]
      );
    } else if (dbRole === 'coach') {
      await pool.query(
        `INSERT INTO coaches (user_id, team_id, title) VALUES ($1, (SELECT id FROM teams LIMIT 1), 'Coach')`,
        [user.id]
      );
    }

    const token = signToken(user);
    res.status(201).json({ token, user: userPayload(user) });
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
    if (user.role === 'athlete') {
      const ar = await pool.query('SELECT id FROM athletes WHERE user_id = $1', [user.id]);
      if (ar.rows.length > 0) athleteId = ar.rows[0].id;
    }

    res.json({ ...userPayload(user), athlete_id: athleteId });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('me error:', err);
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
              u.banner_url, u.location,
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
         FROM teams WHERE name ILIKE $1
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
