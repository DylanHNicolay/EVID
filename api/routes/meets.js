const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/', async (req, res) => {
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

router.get('/:id', async (req, res) => {
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

router.get('/:id/teams', async (req, res) => {
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

router.get('/:id/results', async (req, res) => {
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

module.exports = router;
