-- Security hardening: disable the legacy seeded pilot identity.
-- The demo account is not an appointed official and must never remain active by default.
-- Restrict the update to the exact seed markers to avoid disabling a legitimate account
-- that happens to use a similar email address.
UPDATE users
SET active = FALSE
WHERE lower(email) = 'bourgmestre@demo.ecommune.cd'
  AND employee_reference = 'DEMO-BGM-KSV';

