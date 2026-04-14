const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/', async (req, res) => {
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

router.get('/:id', async (req, res) => {
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

router.get('/:id/roster', async (req, res) => {
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

router.get('/:id/coaches', async (req, res) => {
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

router.get('/:id/stats', async (req, res) => {
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

router.get('/:id/meets', async (req, res) => {
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

module.exports = router;
