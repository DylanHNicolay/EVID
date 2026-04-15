const { Router } = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = Router();

router.get('/:id', async (req, res) => {
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

router.get('/:id/teams', async (req, res) => {
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

router.get('/:id/meets', async (req, res) => {
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

router.get('/:id/results', async (req, res) => {
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
       ORDER BY m.meet_date DESC, e.height`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('athlete results error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/personal-bests', async (req, res) => {
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

router.get('/:id/progression', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT me.total_score AS score, m.meet_date AS date,
              m.name AS meet_name, e.height, e.dives_required, e.event_name,
              me.final_rank
       FROM meet_entries me
       JOIN events e ON e.id = me.event_id
       JOIN meets m  ON m.id = e.meet_id
       WHERE me.athlete_id = $1 AND me.total_score IS NOT NULL
       ORDER BY m.meet_date, e.height`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('progression error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Media (Photos & Videos) ──────────────────

router.get('/:athleteId/media/photos', async (req, res) => {
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

router.get('/:athleteId/media/videos', async (req, res) => {
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

async function verifyAthleteOwner(req, res) {
  const decoded = verifyToken(req.headers.authorization);
  if (!decoded) {
    res.status(401).json({ error: 'No token' });
    return null;
  }

  const ar = await pool.query(
    'SELECT id FROM athletes WHERE id = $1 AND user_id = $2',
    [req.params.athleteId, decoded.id]
  );
  if (ar.rows.length === 0) {
    res.status(403).json({ error: 'Not authorized for this athlete' });
    return null;
  }

  return decoded;
}

router.post('/:athleteId/media/photos', async (req, res) => {
  try {
    const decoded = await verifyAthleteOwner(req, res);
    if (!decoded) return;

    const { title, url, meet_entry_id } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO athlete_photos (athlete_id, title, url, meet_entry_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.athleteId, title, url, meet_entry_id || null]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('upload photo error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:athleteId/media/videos', async (req, res) => {
  try {
    const decoded = await verifyAthleteOwner(req, res);
    if (!decoded) return;

    const { title, video_url, meet_entry_id } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO athlete_videos (athlete_id, title, video_url, meet_entry_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.athleteId, title, video_url, meet_entry_id || null]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('upload video error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:athleteId/media/photos/:photoId', async (req, res) => {
  try {
    const decoded = await verifyAthleteOwner(req, res);
    if (!decoded) return;

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
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('delete photo error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:athleteId/media/videos/:videoId', async (req, res) => {
  try {
    const decoded = await verifyAthleteOwner(req, res);
    if (!decoded) return;

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
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('delete video error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
