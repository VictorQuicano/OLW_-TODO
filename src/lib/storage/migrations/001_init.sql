-- Items: everything we want to eat, visit, watch, listen to or do together.
CREATE TABLE IF NOT EXISTS items (
  id              TEXT PRIMARY KEY,
  type            TEXT NOT NULL CHECK (type IN ('restaurant','place','movie','music','trip','activity','other')),
  title           TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  description     TEXT,
  image_url       TEXT,
  status          TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea','planned','completed','archived')),

  -- Flexible date: "2026-10" + "month", "2026-winter" + "season", "someday" + "someday"...
  date_value      TEXT,
  date_precision  TEXT CHECK (date_precision IN ('day','month','season','year','someday')),

  location        TEXT,
  external_url    TEXT,
  notes           TEXT,

  -- Category-specific fields (cuisine, price range, year, genre, artist, budget...) as JSON.
  details         TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(details)),

  -- Per-person completion ("completed together" when both are 1).
  completed_a     INTEGER NOT NULL DEFAULT 0 CHECK (completed_a IN (0,1)),
  completed_b     INTEGER NOT NULL DEFAULT 0 CHECK (completed_b IN (0,1)),

  created_by      TEXT NOT NULL CHECK (created_by IN ('a','b')),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  CHECK ((date_value IS NULL) = (date_precision IS NULL))
);

CREATE INDEX IF NOT EXISTS items_status_idx ON items (status);
CREATE INDEX IF NOT EXISTS items_type_idx   ON items (type);
