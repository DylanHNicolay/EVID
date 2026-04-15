const { Router } = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = Router();

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function normalizeHeight(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v === '1m' || v === '1 meter' || v === '1 meter springboard') return '1m';
  if (v === '3m' || v === '3 meter' || v === '3 meter springboard') return '3m';
  if (v === 'platform' || v === 'tower') return 'platform';
  return null;
}

function normalizeCategory(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'men' || v === 'male' || v === 'm') return 'men';
  if (v === 'women' || v === 'female' || v === 'w') return 'women';
  if (v === 'mixed' || v === 'mix' || v === 'x') return 'mixed';
  return null;
}

function toOptionalInt(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isInteger(n)) return null;
  return n;
}

function toRequiredNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

const DEFAULT_POINTS_BY_RANK = [16, 13, 11, 9, 7, 5, 4, 3, 2, 1];

function applyDerivedPlacements(rows) {
  const byEvent = new Map();
  rows.forEach((row, index) => {
    const key = `${row.eventName}::${row.height}::${row.category}`;
    if (!byEvent.has(key)) byEvent.set(key, []);
    byEvent.get(key).push({ index, row });
  });

  byEvent.forEach((entries) => {
    const sorted = [...entries].sort((a, b) => b.row.score - a.row.score);
    const derivedRankByIndex = new Map();
    sorted.forEach((entry, i) => {
      derivedRankByIndex.set(entry.index, i + 1);
    });

    entries.forEach(({ index, row }) => {
      const derivedRank = derivedRankByIndex.get(index) || null;
      const finalRank = row.finalRank ?? derivedRank;
      rows[index].finalRank = finalRank;

      if (row.points === null) {
        const points = finalRank
          ? (DEFAULT_POINTS_BY_RANK[finalRank - 1] ?? 0)
          : 0;
        rows[index].points = points;
      }
    });
  });

  return rows;
}

function csvEscape(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function randomScoreForHeight(height) {
  const key = String(height || '').toLowerCase();
  if (key === 'platform') {
    return Number((210 + Math.random() * 190).toFixed(3));
  }
  if (key === '3m') {
    return Number((220 + Math.random() * 200).toFixed(3));
  }
  return Number((215 + Math.random() * 195).toFixed(3));
}

function defaultEventsForAthletePool({ hasMen, hasWomen }) {
  const templates = [
    { event_name: '1 Meter 6 Dive', height: '1m' },
    { event_name: '3 Meter 6 Dive', height: '3m' },
    { event_name: 'Platform 6 Dive', height: 'platform' },
  ];

  const rows = [];
  if (hasMen) {
    templates.forEach((t) => rows.push({ ...t, category: 'men' }));
  }
  if (hasWomen) {
    templates.forEach((t) => rows.push({ ...t, category: 'women' }));
  }
  if (!hasMen && !hasWomen) {
    templates.forEach((t) => rows.push({ ...t, category: 'mixed' }));
  }
  return rows;
}

function parseCsvText(csvText) {
  const rawLines = String(csvText || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (rawLines.length === 0) return { rows: [], errors: [] };

  const headers = parseCsvLine(rawLines[0]).map((h) => h.toLowerCase());
  const headerIndex = Object.fromEntries(headers.map((h, idx) => [h, idx]));

  const required = ['athlete_id', 'event_name', 'height', 'category', 'score'];
  const missing = required.filter((h) => headerIndex[h] === undefined);
  if (missing.length > 0) {
    return { rows: [], errors: [`CSV missing required columns: ${missing.join(', ')}`] };
  }

  const rows = rawLines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return {
      athlete_id: cells[headerIndex.athlete_id] || '',
      event_name: cells[headerIndex.event_name] || '',
      height: cells[headerIndex.height] || '',
      category: cells[headerIndex.category] || '',
      score: cells[headerIndex.score] || '',
      points: headerIndex.points === undefined ? '' : (cells[headerIndex.points] || ''),
      final_rank: headerIndex.final_rank === undefined ? '' : (cells[headerIndex.final_rank] || ''),
    };
  });

  return { rows, errors: [] };
}

async function authorizeForTeam(req, res, teamId) {
  let decoded;
  try {
    decoded = verifyToken(req.headers.authorization);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  const { rows } = await pool.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
  if (rows.length === 0) return res.status(401).json({ error: 'User not found' });
  const user = rows[0];

  if (user.role === 'admin') return user;
  if (user.role !== 'coach') return res.status(403).json({ error: 'Forbidden' });

  const coachRows = await pool.query('SELECT team_id FROM coaches WHERE user_id = $1', [user.id]);
  if (coachRows.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
  if (String(coachRows.rows[0].team_id) !== String(teamId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return user;
}

async function prepareRows({ teamId, meetId, csvText, rows }) {
  const errors = [];

  if (!meetId) {
    errors.push('meetId is required');
    return { errors, normalizedRows: [] };
  }

  const meetCheck = await pool.query('SELECT id FROM meets WHERE id = $1', [meetId]);
  if (meetCheck.rows.length === 0) {
    errors.push('Meet not found');
    return { errors, normalizedRows: [] };
  }

  if (Array.isArray(rows) && rows.length > 0) {
    errors.push('Manual row payloads are no longer supported. Upload CSV text only.');
    return { errors, normalizedRows: [] };
  }

  if (!csvText || String(csvText).trim().length === 0) {
    errors.push('csvText is required');
    return { errors, normalizedRows: [] };
  }

  const parsed = parseCsvText(csvText);
  const candidateRows = parsed.rows;
  errors.push(...parsed.errors);

  if (candidateRows.length === 0) {
    errors.push('No result rows provided');
    return { errors, normalizedRows: [] };
  }

  const normalizedRows = [];
  candidateRows.forEach((row, index) => {
    const rowNumber = index + 1;
    const athleteId = Number(row.athlete_id ?? row.athleteId);
    const eventName = String(row.event_name ?? row.eventName ?? '').trim();
    const height = normalizeHeight(row.height);
    const category = normalizeCategory(row.category);
    const score = toRequiredNumber(row.score);
    const rawPoints = row.points;
    const rawFinalRank = row.final_rank ?? row.finalRank;
    const points = toOptionalInt(rawPoints);
    const finalRank = toOptionalInt(rawFinalRank);

    if (!Number.isInteger(athleteId)) {
      errors.push(`Row ${rowNumber}: athlete_id must be an integer`);
    }
    if (!eventName) {
      errors.push(`Row ${rowNumber}: event_name is required`);
    }
    if (!height) {
      errors.push(`Row ${rowNumber}: height must be one of 1m, 3m, platform`);
    }
    if (!category) {
      errors.push(`Row ${rowNumber}: category must be one of men, women, mixed`);
    }
    if (score === null) {
      errors.push(`Row ${rowNumber}: score must be a number`);
    }
    if (
      rawPoints !== null &&
      rawPoints !== undefined &&
      String(rawPoints).trim() !== '' &&
      points === null
    ) {
      errors.push(`Row ${rowNumber}: points must be an integer`);
    }
    if (
      rawFinalRank !== null &&
      rawFinalRank !== undefined &&
      String(rawFinalRank).trim() !== '' &&
      finalRank === null
    ) {
      errors.push(`Row ${rowNumber}: final_rank must be an integer`);
    }
    if (finalRank !== null && finalRank < 1) {
      errors.push(`Row ${rowNumber}: final_rank must be greater than 0`);
    }
    if (points !== null && points < 0) {
      errors.push(`Row ${rowNumber}: points cannot be negative`);
    }

    normalizedRows.push({
      athleteId,
      eventName,
      height,
      category,
      score,
      points,
      finalRank,
    });
  });

  const athleteIds = [...new Set(normalizedRows.map((r) => r.athleteId).filter(Number.isInteger))];
  if (athleteIds.length > 0) {
    const athleteCheck = await pool.query(
      'SELECT id FROM athletes WHERE team_id = $1 AND id = ANY($2::bigint[])',
      [teamId, athleteIds]
    );
    const valid = new Set(athleteCheck.rows.map((r) => Number(r.id)));
    athleteIds.forEach((id) => {
      if (!valid.has(id)) errors.push(`Athlete ${id} is not on team ${teamId}`);
    });
  }

  const normalizedWithDerived = applyDerivedPlacements(normalizedRows);

  return {
    errors,
    normalizedRows: normalizedWithDerived,
    summary: {
      row_count: normalizedWithDerived.length,
      athlete_count: athleteIds.length,
      event_count: new Set(
        normalizedWithDerived.map((r) => `${r.eventName}::${r.height}::${r.category}`)
      ).size,
    },
  };
}

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

router.get('/:id/results/upload/sample-csv', async (req, res) => {
  try {
    const teamId = req.params.id;
    const user = await authorizeForTeam(req, res, teamId);
    if (!user || !user.id) return;

    const requestedMeetId = Number(req.query.meetId);
    const hasRequestedMeet = Number.isInteger(requestedMeetId);

    const meetsRes = await pool.query(
      `SELECT DISTINCT m.id, m.name, m.meet_date
       FROM meet_teams mt
       JOIN meets m ON m.id = mt.meet_id
       WHERE mt.team_id = $1
       ORDER BY m.meet_date DESC`,
      [teamId]
    );

    if (meetsRes.rows.length === 0) {
      return res.status(404).json({ error: 'No meets found for this team' });
    }

    const meets = meetsRes.rows;
    const meetById = new Map(meets.map((m) => [Number(m.id), m]));

    if (hasRequestedMeet && !meetById.has(requestedMeetId)) {
      return res.status(400).json({ error: 'Requested meet does not belong to this team' });
    }

    const athleteRes = await pool.query(
      `SELECT id, gender
       FROM athletes
       WHERE team_id = $1
       ORDER BY id`,
      [teamId]
    );

    if (athleteRes.rows.length === 0) {
      return res.status(404).json({ error: 'No athletes found for this team' });
    }

    const menAthletes = athleteRes.rows
      .filter((a) => a.gender === 'men')
      .map((a) => Number(a.id));
    const womenAthletes = athleteRes.rows
      .filter((a) => a.gender === 'women')
      .map((a) => Number(a.id));
    const allAthletes = athleteRes.rows.map((a) => Number(a.id));

    let selectedMeet = hasRequestedMeet ? meetById.get(requestedMeetId) : meets[0];
    let eventRows = [];

    const orderedMeetCandidates = hasRequestedMeet
      ? [selectedMeet]
      : meets;

    for (const meet of orderedMeetCandidates) {
      const eventsRes = await pool.query(
        `SELECT event_name, height, category
         FROM events
         WHERE meet_id = $1
         ORDER BY category, height, event_name`,
        [meet.id]
      );
      if (eventsRes.rows.length > 0) {
        selectedMeet = meet;
        eventRows = eventsRes.rows;
        break;
      }
    }

    if (eventRows.length === 0) {
      eventRows = defaultEventsForAthletePool({
        hasMen: menAthletes.length > 0,
        hasWomen: womenAthletes.length > 0,
      });
    }

    const sampleRows = [];
    for (const event of eventRows) {
      const category = String(event.category || 'mixed').toLowerCase();
      let athletePool = allAthletes;
      if (category === 'men') athletePool = menAthletes;
      if (category === 'women') athletePool = womenAthletes;
      if (athletePool.length === 0) continue;

      const rankedRows = athletePool
        .map((athleteId) => ({
          athlete_id: athleteId,
          event_name: String(event.event_name || '').trim(),
          height: String(event.height || '').trim(),
          category,
          score: randomScoreForHeight(event.height),
        }))
        .sort((a, b) => b.score - a.score)
        .map((row, idx) => ({
          ...row,
          final_rank: idx + 1,
          points: DEFAULT_POINTS_BY_RANK[idx] ?? 0,
        }));

      sampleRows.push(...rankedRows);
    }

    if (sampleRows.length === 0) {
      return res.status(400).json({ error: 'Unable to generate sample rows for this team' });
    }

    const header = 'athlete_id,event_name,height,category,score,points,final_rank';
    const lines = [header, ...sampleRows.map((row) => (
      [
        row.athlete_id,
        csvEscape(row.event_name),
        row.height,
        row.category,
        row.score.toFixed(3),
        row.points,
        row.final_rank,
      ].join(',')
    ))];

    const safeMeetId = Number(selectedMeet.id);
    const filename = `team-${teamId}-meet-${safeMeetId}-sample-results.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(lines.join('\n'));
  } catch (err) {
    console.error('team sample csv error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/results/upload/preview', async (req, res) => {
  try {
    const teamId = req.params.id;
    const user = await authorizeForTeam(req, res, teamId);
    if (!user || !user.id) return;

    const { meetId, csvText, rows } = req.body || {};
    const prepared = await prepareRows({ teamId, meetId, csvText, rows });

    res.json({
      authorized: true,
      errors: prepared.errors,
      summary: prepared.summary || { row_count: 0, athlete_count: 0, event_count: 0 },
      preview_rows: prepared.normalizedRows,
      truncated_preview: false,
    });
  } catch (err) {
    console.error('team results preview error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/results/upload/confirm', async (req, res) => {
  const teamId = req.params.id;
  const client = await pool.connect();
  try {
    const user = await authorizeForTeam(req, res, teamId);
    if (!user || !user.id) return;

    const { meetId, csvText, rows } = req.body || {};
    const prepared = await prepareRows({ teamId, meetId, csvText, rows });
    if (prepared.errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: prepared.errors,
      });
    }

    await client.query('BEGIN');

    const eventMap = new Map();
    for (const row of prepared.normalizedRows) {
      const key = `${row.eventName}::${row.height}::${row.category}`;
      if (eventMap.has(key)) continue;

      const existing = await client.query(
        `SELECT id FROM events
         WHERE meet_id = $1 AND event_name = $2 AND height = $3 AND category = $4
         LIMIT 1`,
        [meetId, row.eventName, row.height, row.category]
      );

      if (existing.rows.length > 0) {
        eventMap.set(key, existing.rows[0].id);
      } else {
        const inserted = await client.query(
          `INSERT INTO events (meet_id, event_name, height, category)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [meetId, row.eventName, row.height, row.category]
        );
        eventMap.set(key, inserted.rows[0].id);
      }
    }

    for (const row of prepared.normalizedRows) {
      const key = `${row.eventName}::${row.height}::${row.category}`;
      const eventId = eventMap.get(key);

      await client.query(
        `INSERT INTO meet_entries (event_id, athlete_id, team_id, final_rank, total_score, points)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (event_id, athlete_id)
         DO UPDATE SET
           team_id = EXCLUDED.team_id,
           final_rank = EXCLUDED.final_rank,
           total_score = EXCLUDED.total_score,
           points = EXCLUDED.points`,
        [eventId, row.athleteId, teamId, row.finalRank, row.score, row.points]
      );
    }

    const touchedCategories = [...new Set(prepared.normalizedRows.map((r) => r.category))];
    for (const category of touchedCategories) {
      const scoreResult = await client.query(
        `SELECT COALESCE(SUM(me.points), 0)::numeric AS team_score
         FROM meet_entries me
         JOIN events e ON e.id = me.event_id
         WHERE e.meet_id = $1 AND me.team_id = $2 AND e.category = $3`,
        [meetId, teamId, category]
      );

      await client.query(
        `INSERT INTO meet_teams (meet_id, team_id, gender, team_score)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (meet_id, team_id, gender)
         DO UPDATE SET team_score = EXCLUDED.team_score`,
        [meetId, teamId, category, scoreResult.rows[0].team_score]
      );
    }

    await client.query(
      `UPDATE meets
       SET status = 'completed', uploaded_by_user_id = $1
       WHERE id = $2`,
      [user.id, meetId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Meet results confirmed',
      imported_rows: prepared.normalizedRows.length,
      summary: prepared.summary,
      categories_updated: touchedCategories,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('team results confirm error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

router.post('/:id/meets/schedule', async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    if (!Number.isInteger(teamId)) {
      return res.status(400).json({ error: 'Invalid team id' });
    }

    const user = await authorizeForTeam(req, res, teamId);
    if (!user || !user.id) return;

    const {
      name,
      meetDate,
      dateEnd,
      location,
      course,
      meetType,
      season,
      gender,
      logoUrl,
      attendingTeamIds,
    } = req.body || {};

    const trimmedName = String(name || '').trim();
    const trimmedDate = String(meetDate || '').trim();
    const trimmedEnd = String(dateEnd || '').trim();
    const trimmedLocation = String(location || '').trim();
    const trimmedSeason = String(season || '').trim();
    const trimmedLogoUrl = String(logoUrl || '').trim();

    if (!trimmedName) {
      return res.status(400).json({ error: 'Meet name is required' });
    }
    if (!trimmedDate) {
      return res.status(400).json({ error: 'Meet date is required' });
    }

    const validCourse = ['SCY', 'LCM', 'SCM'];
    const validMeetType = ['championship', 'invitational', 'dual', 'exhibition'];
    const validGender = ['men', 'women', 'mixed'];

    const finalCourse = validCourse.includes(course) ? course : 'SCY';
    const finalMeetType = validMeetType.includes(meetType) ? meetType : 'invitational';
    const finalGender = validGender.includes(gender) ? gender : 'mixed';

    const requestedAttendingTeams = Array.isArray(attendingTeamIds)
      ? attendingTeamIds
      : [];

    const normalizedAttendingIds = [
      ...new Set(
        requestedAttendingTeams
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id))
      ),
    ].filter((id) => id !== teamId);

    const allParticipantTeamIds = [teamId, ...normalizedAttendingIds];

    const teamsCheck = await pool.query(
      `SELECT id, name, school
       FROM teams
       WHERE id = ANY($1::bigint[])`,
      [allParticipantTeamIds]
    );

    const validTeamIds = new Set(teamsCheck.rows.map((row) => Number(row.id)));
    const missingTeamIds = allParticipantTeamIds.filter((id) => !validTeamIds.has(id));
    if (missingTeamIds.length > 0) {
      return res.status(400).json({
        error: `Invalid team IDs: ${missingTeamIds.join(', ')}`,
      });
    }

    const insertedMeet = await pool.query(
      `INSERT INTO meets
         (name, meet_date, date_end, location, course, meet_type, season, status, logo_url, uploaded_by_user_id)
       VALUES
         ($1, $2, NULLIF($3, '')::date, NULLIF($4, ''), $5, $6, NULLIF($7, ''), 'upcoming', NULLIF($8, ''), $9)
       RETURNING id, name, meet_date, date_end, location, course, meet_type, season, status, logo_url`,
      [
        trimmedName,
        trimmedDate,
        trimmedEnd,
        trimmedLocation,
        finalCourse,
        finalMeetType,
        trimmedSeason,
        trimmedLogoUrl,
        user.id,
      ]
    );

    const meet = insertedMeet.rows[0];

    const insertValues = allParticipantTeamIds
      .map((_, idx) => `($1, $${idx + 2}, $${allParticipantTeamIds.length + 2}, 0)`)
      .join(', ');

    await pool.query(
      `INSERT INTO meet_teams (meet_id, team_id, gender, team_score)
       VALUES ${insertValues}
       ON CONFLICT (meet_id, team_id, gender)
       DO NOTHING`,
      [meet.id, ...allParticipantTeamIds, finalGender]
    );

    const participantTeams = teamsCheck.rows
      .filter((row) => allParticipantTeamIds.includes(Number(row.id)))
      .map((row) => ({
        id: Number(row.id),
        name: row.name,
        school: row.school,
      }));

    res.status(201).json({
      success: true,
      message: 'Meet scheduled',
      meet,
      team_gender: finalGender,
      participant_teams: participantTeams,
    });
  } catch (err) {
    console.error('schedule meet error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
