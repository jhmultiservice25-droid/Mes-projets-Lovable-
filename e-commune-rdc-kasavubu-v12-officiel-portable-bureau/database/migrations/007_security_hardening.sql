-- Security hardening: persistent login throttling.
-- The key is an HMAC of the normalized account identifier; raw email addresses are not stored.
CREATE TABLE IF NOT EXISTS login_rate_limits (
  identity_hash TEXT PRIMARY KEY CHECK (identity_hash ~ '^[a-f0-9]{64}$'),
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0)
);
CREATE INDEX IF NOT EXISTS idx_login_rate_limits_window ON login_rate_limits(window_started_at);

-- Existing pilot accounts must be assigned a real scrypt password hash out-of-band.
-- NULL password hashes intentionally prevent login; no demo password is seeded.
