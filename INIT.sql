BEGIN;

-- ─────────────────────────────────────────────
-- Core user accounts
-- ─────────────────────────────────────────────
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('athlete', 'coach', 'admin')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_initial VARCHAR(1),
  date_of_birth DATE,
  gender VARCHAR(50),
  preferred_first_name TEXT,
  uss_number VARCHAR(50),
  location TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Teams / clubs / schools
-- ─────────────────────────────────────────────
CREATE TABLE teams (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT,
  school TEXT,
  division TEXT,
  conference TEXT,
  location TEXT,
  logo_url TEXT,
  banner_url TEXT,
  accent_color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, school)
);

-- ─────────────────────────────────────────────
-- Coaching staff
-- ─────────────────────────────────────────────
CREATE TABLE coaches (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Coach',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Athlete profiles
-- ─────────────────────────────────────────────
CREATE TABLE athletes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('men', 'women')),
  graduation_year INT,
  hometown TEXT,
  height_cm NUMERIC(5,2),
  bio TEXT,
  recruiting_email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (graduation_year IS NULL OR graduation_year BETWEEN 1980 AND 2100),
  CHECK (height_cm IS NULL OR height_cm > 0)
);

-- ─────────────────────────────────────────────
-- Meets
-- ─────────────────────────────────────────────
CREATE TABLE meets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  meet_date DATE NOT NULL,
  date_end DATE,
  location TEXT,
  course TEXT CHECK (course IN ('SCY', 'LCM', 'SCM')),
  meet_type TEXT CHECK (meet_type IN ('championship', 'invitational', 'dual', 'exhibition')),
  season TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('draft', 'upcoming', 'completed', 'cancelled')),
  logo_url TEXT,
  uploaded_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (date_end IS NULL OR date_end >= meet_date)
);

-- ─────────────────────────────────────────────
-- Teams participating in a meet, with per-gender team scores
-- ─────────────────────────────────────────────
CREATE TABLE meet_teams (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meet_id BIGINT NOT NULL REFERENCES meets(id) ON DELETE CASCADE,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  gender TEXT NOT NULL CHECK (gender IN ('men', 'women', 'mixed')),
  team_score NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (meet_id, team_id, gender)
);

-- ─────────────────────────────────────────────
-- Events within a meet
-- ─────────────────────────────────────────────
CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meet_id BIGINT NOT NULL REFERENCES meets(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  height TEXT NOT NULL CHECK (height IN ('1m', '3m', 'platform')),
  category TEXT NOT NULL CHECK (category IN ('women', 'men', 'mixed')),
  dives_required INT NOT NULL DEFAULT 6 CHECK (dives_required > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Athlete entries in events
-- ─────────────────────────────────────────────
CREATE TABLE meet_entries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  athlete_id BIGINT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
  final_rank INT,
  total_score NUMERIC(10,3),
  points INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, athlete_id)
);

-- ─────────────────────────────────────────────
-- Individual dive results with judge scores
-- ─────────────────────────────────────────────
CREATE TABLE dive_results (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meet_entry_id BIGINT NOT NULL REFERENCES meet_entries(id) ON DELETE CASCADE,
  dive_number INT NOT NULL CHECK (dive_number > 0),
  dive_code TEXT,
  dd NUMERIC(4,2) NOT NULL CHECK (dd > 0),
  j1 NUMERIC(4,2),
  j2 NUMERIC(4,2),
  j3 NUMERIC(4,2),
  j4 NUMERIC(4,2),
  j5 NUMERIC(4,2),
  award NUMERIC(10,3),
  score NUMERIC(10,3),
  is_personal_best BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (meet_entry_id, dive_number)
);

-- ─────────────────────────────────────────────
-- Athlete photos
-- ─────────────────────────────────────────────
CREATE TABLE athlete_photos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  athlete_id BIGINT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Athlete videos
-- ─────────────────────────────────────────────
CREATE TABLE athlete_videos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  athlete_id BIGINT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  dive_result_id BIGINT REFERENCES dive_results(id) ON DELETE SET NULL,
  title TEXT,
  video_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Dive list simulations
-- ─────────────────────────────────────────────
CREATE TABLE dive_list_simulations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  athlete_id BIGINT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  total_dd NUMERIC(6,2),
  projected_score NUMERIC(10,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- College commitments
-- ─────────────────────────────────────────────
CREATE TABLE college_commitments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  athlete_id BIGINT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  school_logo_url TEXT,
  commitment_date DATE,
  quote TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────
CREATE INDEX idx_athletes_name ON athletes (last_name, first_name);
CREATE INDEX idx_athletes_team ON athletes (team_id);
CREATE INDEX idx_athletes_gender ON athletes (gender);
CREATE INDEX idx_athletes_user ON athletes (user_id);
CREATE INDEX idx_coaches_team ON coaches (team_id);
CREATE INDEX idx_coaches_user ON coaches (user_id);
CREATE INDEX idx_meets_date ON meets (meet_date DESC);
CREATE INDEX idx_meets_season ON meets (season);
CREATE INDEX idx_meets_status ON meets (status);
CREATE INDEX idx_meet_teams_meet ON meet_teams (meet_id);
CREATE INDEX idx_meet_teams_team ON meet_teams (team_id);
CREATE INDEX idx_events_meet ON events (meet_id);
CREATE INDEX idx_entries_event_rank ON meet_entries (event_id, final_rank);
CREATE INDEX idx_entries_athlete ON meet_entries (athlete_id);
CREATE INDEX idx_dive_results_entry ON dive_results (meet_entry_id);
CREATE INDEX idx_athlete_photos ON athlete_photos (athlete_id);
CREATE INDEX idx_athlete_videos ON athlete_videos (athlete_id);
CREATE INDEX idx_commitments_athlete ON college_commitments (athlete_id);

COMMIT;