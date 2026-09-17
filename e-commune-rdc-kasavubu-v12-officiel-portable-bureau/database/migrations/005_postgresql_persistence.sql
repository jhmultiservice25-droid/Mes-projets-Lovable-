-- Migration V4 -> V5 : persistance PostgreSQL et audit des workflows ajoutés.
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS avenue_text TEXT;
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS location_notes TEXT;
CREATE INDEX IF NOT EXISTS idx_parcels_commune_created ON parcels(commune_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_stalls_commune_status ON market_stalls(commune_id, occupancy_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_market_inspections_stall_date ON market_stall_inspections(stall_id, inspected_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_payments_commune_date ON revenue_payments(commune_id, received_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_revenue_external_reference ON revenue_payments(commune_id, channel, external_reference) WHERE external_reference IS NOT NULL AND external_reference <> '';

INSERT INTO users (commune_id, email, full_name, role, service_name, employee_reference, legal_act_reference, mfa_required, active)
SELECT c.id, 'bourgmestre@demo.ecommune.cd', 'Bourgmestre — compte pilote Kasa-Vubu', 'BOURGMESTRE', 'Cabinet du Bourgmestre', 'DEMO-BGM-KSV', 'Compte technique de démonstration — ne vaut pas nomination', FALSE, TRUE
FROM communes c WHERE c.code = 'KIN-KSV'
ON CONFLICT (commune_id, email) DO UPDATE SET active = TRUE;

INSERT INTO markets (commune_id, code, name, management_type, legal_act_reference, active)
SELECT c.id, 'GAMBELA', 'Marché Gambela', 'A_QUALIFIER', NULL, TRUE
FROM communes c WHERE c.code = 'KIN-KSV'
ON CONFLICT (commune_id, code) DO UPDATE SET name = EXCLUDED.name, active = TRUE;
