CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('athlete', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teams (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  school TEXT,
  conference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, school)
);

CREATE TABLE athletes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  graduation_year INT,
  height_cm NUMERIC(5,2),
  bio TEXT,
  recruiting_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (graduation_year IS NULL OR graduation_year BETWEEN 1980 AND 2100),
  CHECK (height_cm IS NULL OR height_cm > 0)
);

CREATE TABLE meets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  meet_date DATE NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  uploaded_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meet_id BIGINT NOT NULL REFERENCES meets(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  height TEXT NOT NULL CHECK (height IN ('1m', '3m', 'platform')),
  category TEXT NOT NULL CHECK (category IN ('women', 'men', 'mixed')),
  dives_required INT NOT NULL DEFAULT 6 CHECK (dives_required > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meet_entries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  athlete_id BIGINT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
  final_rank INT,
  total_score NUMERIC(10,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, athlete_id)
);

CREATE TABLE dive_results (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meet_entry_id BIGINT NOT NULL REFERENCES meet_entries(id) ON DELETE CASCADE,
  dive_number INT NOT NULL CHECK (dive_number > 0),
  dive_code TEXT,
  dd NUMERIC(4,2) NOT NULL CHECK (dd > 0),
  score NUMERIC(10,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (meet_entry_id, dive_number)
);

CREATE TABLE athlete_videos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  athlete_id BIGINT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  dive_result_id BIGINT REFERENCES dive_results(id) ON DELETE SET NULL,
  video_url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dive_list_simulations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  athlete_id BIGINT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  total_dd NUMERIC(6,2),
  projected_score NUMERIC(10,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_athletes_name ON athletes (last_name, first_name);
CREATE INDEX idx_athletes_team ON athletes (team_id);
CREATE INDEX idx_meets_date ON meets (meet_date DESC);
CREATE INDEX idx_events_meet ON events (meet_id);
CREATE INDEX idx_entries_event_rank ON meet_entries (event_id, final_rank);
CREATE INDEX idx_dive_results_entry ON dive_results (meet_entry_id);

COMMIT;
