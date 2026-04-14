const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/', async (req, res) => {
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

module.exports = router;
