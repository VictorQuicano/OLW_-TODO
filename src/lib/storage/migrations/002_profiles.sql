-- Each person's chosen character (a Kenney Cube Pet id).
CREATE TABLE IF NOT EXISTS profiles (
  user_key   TEXT PRIMARY KEY CHECK (user_key IN ('a','b')),
  pet        TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
