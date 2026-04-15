const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/home/recent-meets', async (_req, res) => {
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

router.get('/home/top-events', async (_req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const query = `
      SELECT
        me.id AS entry_id, a.id AS athlete_id, a.first_name, a.last_name, a.gender,
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

router.get('/home/commitments', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT cc.id, a.id AS athlete_id, a.first_name, a.last_name, a.hometown, a.avatar_url,
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

module.exports = router;
