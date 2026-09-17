CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- e-Commune RDC — modèle multi-commune.
-- Règle structurante : commune_id est obligatoire sur les données métiers afin
-- d'empêcher les fuites inter-communes. Les politiques RLS doivent être activées
-- avant production lorsque l'API PostgreSQL sera branchée.

CREATE TYPE user_role AS ENUM (
  'BOURGMESTRE',
  'BOURGMESTRE_ADJOINT',
  'SECRETAIRE_COMMUNAL',
  'CHEF_SERVICE',
  'ETAT_CIVIL',
  'REGIE_RECETTES',
  'MARCHES',
  'CAISSIER',
  'URBANISME',
  'SANTE_HYGIENE',
  'CHEF_QUARTIER',
  'AGENT',
  'AUDITEUR'
);

CREATE TABLE communes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  official_name TEXT NOT NULL,
  city_or_territory TEXT,
  province TEXT NOT NULL,
  official_email TEXT,
  official_domain TEXT,
  legal_reference TEXT,
  population_estimate INTEGER CHECK (population_estimate IS NULL OR population_estimate >= 0),
  surface_km2 NUMERIC(10,3),
  osm_relation_id BIGINT,
  boundary_source TEXT,
  boundary_validation_status TEXT NOT NULL DEFAULT 'TO_VALIDATE',
  boundary_geojson JSONB,
  center_lat NUMERIC(10,7),
  center_lon NUMERIC(10,7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quartiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  legal_act_reference TEXT,
  chief_name TEXT,
  deputy_name TEXT,
  osm_relation_id BIGINT,
  boundary_source TEXT,
  boundary_validation_status TEXT NOT NULL DEFAULT 'TO_VALIDATE',
  boundary_geojson JSONB,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (commune_id, code)
);

CREATE TABLE avenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  quartier_id UUID REFERENCES quartiers(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  geometry_geojson JSONB,
  source_reference TEXT,
  validation_status TEXT NOT NULL DEFAULT 'TO_VALIDATE',
  UNIQUE (commune_id, code)
);

CREATE TABLE data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('OFFICIAL','SECTORAL','OPEN_REFERENCE','INTERNAL')),
  url TEXT,
  document_reference TEXT,
  retrieved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (commune_id, code)
);

CREATE TABLE territorial_boundaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  quartier_id UUID REFERENCES quartiers(id) ON DELETE CASCADE,
  boundary_level TEXT NOT NULL CHECK (boundary_level IN ('COMMUNE','QUARTIER')),
  external_relation_id BIGINT,
  geometry_geojson JSONB,
  source_id UUID REFERENCES data_sources(id),
  validation_status TEXT NOT NULL DEFAULT 'TO_VALIDATE',
  valid_from DATE,
  valid_until DATE,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE territorial_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subtype TEXT,
  quartier_id UUID REFERENCES quartiers(id),
  avenue_id UUID REFERENCES avenues(id),
  address_detail TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  geometry_geojson JSONB,
  ownership_type TEXT,
  managing_authority TEXT,
  source_id UUID REFERENCES data_sources(id),
  validation_status TEXT NOT NULL DEFAULT 'TO_VALIDATE',
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (commune_id, code)
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE RESTRICT,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  service_name TEXT,
  employee_reference TEXT,
  legal_act_reference TEXT,
  password_hash TEXT,
  mfa_required BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  disabled_at TIMESTAMPTZ,
  UNIQUE (commune_id, email)
);
ALTER TABLE users ADD CONSTRAINT users_created_by_fk FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE territorial_boundaries ADD CONSTRAINT territorial_boundaries_verified_by_fk FOREIGN KEY (verified_by) REFERENCES users(id);
ALTER TABLE territorial_assets ADD CONSTRAINT territorial_assets_verified_by_fk FOREIGN KEY (verified_by) REFERENCES users(id);

-- Garde-fou DB : tout nouveau compte non-Bourgmestre doit être créé par un
-- Bourgmestre actif de LA MÊME commune. La création initiale du Bourgmestre est
-- un acte de bootstrap d'infrastructure et doit être contrôlée séparément.
CREATE OR REPLACE FUNCTION enforce_bourgmestre_agent_creator() RETURNS trigger AS $$
DECLARE creator users%ROWTYPE;
BEGIN
  IF NEW.role <> 'BOURGMESTRE' THEN
    IF NEW.created_by IS NULL THEN
      RAISE EXCEPTION 'created_by requis pour un compte agent';
    END IF;
    SELECT * INTO creator FROM users WHERE id = NEW.created_by;
    IF creator.id IS NULL OR creator.role <> 'BOURGMESTRE' OR creator.active IS NOT TRUE THEN
      RAISE EXCEPTION 'seul un Bourgmestre actif peut créer un compte agent';
    END IF;
    IF creator.commune_id <> NEW.commune_id THEN
      RAISE EXCEPTION 'création inter-commune interdite';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_bourgmestre_agent_creator
BEFORE INSERT ON users
FOR EACH ROW EXECUTE FUNCTION enforce_bourgmestre_agent_creator();

CREATE TABLE citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id),
  citizen_number TEXT NOT NULL,
  national_identifier TEXT,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  gender TEXT,
  birth_date DATE,
  birth_place TEXT,
  phone TEXT,
  email TEXT,
  quartier_id UUID REFERENCES quartiers(id),
  avenue_id UUID REFERENCES avenues(id),
  address_detail TEXT,
  verification_status TEXT NOT NULL DEFAULT 'PENDING',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (commune_id, citizen_number)
);

CREATE TABLE civil_registry_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id),
  citizen_id UUID REFERENCES citizens(id),
  case_type TEXT NOT NULL CHECK (case_type IN ('BIRTH','MARRIAGE','DEATH','COPY','OTHER')),
  reference TEXT NOT NULL,
  registry_reference TEXT,
  legal_basis TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  assigned_to UUID REFERENCES users(id),
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMPTZ,
  document_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (commune_id, reference)
);

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id),
  reference TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  activity_type TEXT,
  responsible_name TEXT,
  quartier_id UUID REFERENCES quartiers(id),
  avenue_id UUID REFERENCES avenues(id),
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (commune_id, reference)
);

CREATE TABLE fiscal_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id),
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  legal_basis_reference TEXT NOT NULL,
  implementation_act_reference TEXT,
  calculation_rule JSONB NOT NULL DEFAULT '{}'::jsonb,
  valid_from DATE NOT NULL,
  valid_until DATE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (commune_id, code, valid_from)
);

CREATE TABLE revenue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id),
  fiscal_catalog_id UUID REFERENCES fiscal_catalog(id),
  reference TEXT NOT NULL,
  taxpayer_name TEXT NOT NULL,
  taxpayer_reference TEXT,
  amount_cdf NUMERIC(18,2) NOT NULL CHECK (amount_cdf >= 0),
  status TEXT NOT NULL DEFAULT 'DUE',
  payment_channel TEXT,
  external_payment_reference TEXT,
  issued_by UUID REFERENCES users(id),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  receipt_number TEXT,
  voided_by UUID REFERENCES users(id),
  void_reason TEXT,
  UNIQUE (commune_id, reference),
  UNIQUE (commune_id, receipt_number)
);

CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id),
  reference TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  status TEXT NOT NULL DEFAULT 'OPEN',
  quartier_id UUID REFERENCES quartiers(id),
  avenue_id UUID REFERENCES avenues(id),
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  assigned_to UUID REFERENCES users(id),
  due_at TIMESTAMPTZ,
  resolution_note TEXT,
  resolution_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  UNIQUE (commune_id, reference)
);

CREATE TABLE parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id),
  reference TEXT NOT NULL,
  quartier_id UUID REFERENCES quartiers(id),
  avenue_id UUID REFERENCES avenues(id),
  geometry_geojson JSONB,
  current_use TEXT,
  source_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (commune_id, reference)
);

CREATE TABLE urbanism_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id),
  parcel_id UUID REFERENCES parcels(id),
  reference TEXT NOT NULL,
  case_type TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  legal_basis TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (commune_id, reference)
);

-- Fatshimétrie locale / suivi des projets financés par l'État.
CREATE TABLE state_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id),
  external_reference TEXT,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  funding_source TEXT NOT NULL,
  program_reference TEXT,
  contracting_authority TEXT,
  contractor TEXT,
  budget_cdf NUMERIC(20,2),
  budget_usd NUMERIC(20,2),
  disbursed_cdf NUMERIC(20,2),
  physical_progress NUMERIC(5,2) CHECK (physical_progress BETWEEN 0 AND 100),
  financial_progress NUMERIC(5,2) CHECK (financial_progress BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'PLANNED',
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  geometry_geojson JSONB,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  last_verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES state_projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  planned_date DATE,
  achieved_date DATE,
  progress NUMERIC(5,2) CHECK (progress BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'PLANNED'
);

CREATE TABLE project_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES state_projects(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL,
  title TEXT NOT NULL,
  source_organization TEXT,
  source_url TEXT,
  document_reference TEXT,
  document_hash TEXT,
  evidence_date DATE,
  validation_status TEXT NOT NULL DEFAULT 'PENDING',
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Registre des structures sanitaires de proximité.
-- Une structure créée/financée par la commune reste soumise aux normes et
-- autorisations sanitaires applicables : e-Commune conserve les références
-- documentaires mais ne se substitue pas à l'autorité sanitaire compétente.
CREATE TABLE health_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  facility_type TEXT NOT NULL,
  ownership_type TEXT NOT NULL DEFAULT 'TO_QUALIFY',
  management_authority TEXT,
  origin TEXT NOT NULL DEFAULT 'EXISTING' CHECK (origin IN ('EXISTING','COMMUNAL_CREATED')),
  status TEXT NOT NULL DEFAULT 'TO_VERIFY' CHECK (status IN ('PROJECT','TO_VERIFY','ACTIVE','SUSPENDED','CLOSED')),
  health_zone TEXT,
  health_area TEXT,
  quartier_id UUID REFERENCES quartiers(id),
  avenue_id UUID REFERENCES avenues(id),
  address_detail TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  beds_capacity INTEGER CHECK (beds_capacity IS NULL OR beds_capacity >= 0),
  maternity_beds INTEGER CHECK (maternity_beds IS NULL OR maternity_beds >= 0),
  ambulance_count INTEGER CHECK (ambulance_count IS NULL OR ambulance_count >= 0),
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  opening_hours TEXT,
  phone TEXT,
  email TEXT,
  communal_act_reference TEXT,
  health_authorization_reference TEXT,
  funding_source TEXT,
  state_project_id UUID REFERENCES state_projects(id),
  source_reference TEXT,
  source_url TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (origin <> 'COMMUNAL_CREATED' OR communal_act_reference IS NOT NULL),
  CHECK (origin <> 'COMMUNAL_CREATED' OR status <> 'ACTIVE' OR health_authorization_reference IS NOT NULL),
  UNIQUE (commune_id, code)
);

CREATE TABLE health_facility_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES health_facilities(id) ON DELETE CASCADE,
  inspection_type TEXT NOT NULL,
  inspected_at TIMESTAMPTZ NOT NULL,
  result_status TEXT NOT NULL DEFAULT 'TO_VERIFY',
  findings TEXT,
  corrective_actions TEXT,
  due_at TIMESTAMPTZ,
  inspector_user_id UUID REFERENCES users(id),
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE communal_acts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id),
  reference TEXT NOT NULL,
  act_type TEXT NOT NULL,
  title TEXT NOT NULL,
  legal_basis TEXT,
  deliberating_body TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  signed_by UUID REFERENCES users(id),
  signed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  document_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (commune_id, reference)
);

CREATE TABLE personal_data_processing_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id),
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  data_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  data_subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  recipients JSONB NOT NULL DEFAULT '[]'::jsonb,
  retention_rule TEXT,
  cross_border_transfer BOOLEAN NOT NULL DEFAULT FALSE,
  transfer_details TEXT,
  high_risk BOOLEAN NOT NULL DEFAULT FALSE,
  impact_assessment_reference TEXT,
  owner_user_id UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE digital_compliance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id),
  record_type TEXT NOT NULL,
  authority TEXT,
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'TO_VALIDATE',
  valid_from DATE,
  valid_until DATE,
  notes TEXT,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  commune_id UUID REFERENCES communes(id),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  ip_address INET,
  user_agent TEXT,
  legal_reason TEXT,
  before_data JSONB,
  after_data JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_avenues_commune_quartier ON avenues(commune_id, quartier_id);
CREATE INDEX idx_assets_commune_category ON territorial_assets(commune_id, category);
CREATE INDEX idx_boundaries_commune_level ON territorial_boundaries(commune_id, boundary_level);
CREATE UNIQUE INDEX uq_boundaries_external_relation ON territorial_boundaries(commune_id, external_relation_id) WHERE external_relation_id IS NOT NULL;
CREATE UNIQUE INDEX uq_projects_external_reference ON state_projects(commune_id, external_reference) WHERE external_reference IS NOT NULL;
CREATE UNIQUE INDEX uq_project_evidence_source ON project_evidence(project_id, source_url) WHERE source_url IS NOT NULL;
CREATE INDEX idx_citizens_commune_name ON citizens(commune_id, last_name, first_name);
CREATE INDEX idx_cases_commune_status ON civil_registry_cases(commune_id, status);
CREATE INDEX idx_revenue_commune_status ON revenue_items(commune_id, status);
CREATE INDEX idx_complaints_commune_status ON complaints(commune_id, status);
CREATE INDEX idx_projects_commune_status ON state_projects(commune_id, status);
CREATE INDEX idx_health_facilities_commune_status ON health_facilities(commune_id, status);
CREATE INDEX idx_health_facilities_quartier ON health_facilities(commune_id, quartier_id);
CREATE INDEX idx_audit_commune_created ON audit_logs(commune_id, created_at DESC);
CREATE INDEX idx_users_commune_role ON users(commune_id, role) WHERE active = TRUE;

COMMENT ON TABLE territorial_boundaries IS 'Les géométries ouvertes facilitent le travail cartographique; leur validation administrative est obligatoire avant usage opposable.';
COMMENT ON TABLE territorial_assets IS 'Inventaire communal des équipements avec traçabilité de la source et niveau de validation.';
COMMENT ON TABLE users IS 'La création d’un compte numérique ne vaut ni recrutement, ni nomination, ni affectation administrative.';
COMMENT ON TABLE state_projects IS 'Suivi local des projets publics; les valeurs d’avancement doivent être accompagnées de preuves vérifiables.';
COMMENT ON TABLE health_facilities IS 'Registre sanitaire communal; une structure créée par la commune exige un acte communal et une autorisation sanitaire avant statut ACTIVE.';
COMMENT ON TABLE fiscal_catalog IS 'Aucun taux n’est réputé valable sans base légale et période de validité documentées.';

-- --- Numérisation parcellaire ------------------------------------------------
-- La géométrie numérique ne constitue pas, à elle seule, un titre de propriété.
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS usage_type TEXT;
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS occupant_name TEXT;
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS declared_owner_name TEXT;
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS declared_area_m2 NUMERIC(18,2) CHECK (declared_area_m2 IS NULL OR declared_area_m2 >= 0);
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS validation_status TEXT NOT NULL DEFAULT 'TO_VALIDATE';
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES users(id);
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- --- Marchés et étalages -----------------------------------------------------
CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  quartier_id UUID REFERENCES quartiers(id),
  avenue_id UUID REFERENCES avenues(id),
  address_detail TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  management_type TEXT,
  legal_act_reference TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (commune_id, code)
);

CREATE TABLE IF NOT EXISTS market_stalls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  stall_code TEXT NOT NULL,
  zone_code TEXT,
  stall_type TEXT NOT NULL DEFAULT 'STALL',
  activity_type TEXT,
  occupant_name TEXT,
  occupant_phone TEXT,
  business_id UUID REFERENCES businesses(id),
  occupation_start DATE,
  occupation_end DATE,
  fiscal_catalog_id UUID REFERENCES fiscal_catalog(id),
  occupancy_status TEXT NOT NULL DEFAULT 'OCCUPIED' CHECK (occupancy_status IN ('OCCUPIED','FREE','SUSPENDED','CLOSED')),
  payment_status TEXT NOT NULL DEFAULT 'DUE' CHECK (payment_status IN ('CURRENT','DUE','LATE','EXEMPT')),
  last_inspection_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (commune_id, market_id, stall_code)
);

CREATE TABLE IF NOT EXISTS market_stall_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  stall_id UUID NOT NULL REFERENCES market_stalls(id) ON DELETE CASCADE,
  inspected_by UUID REFERENCES users(id),
  inspected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  result TEXT NOT NULL,
  observations TEXT,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- --- Perception numérique ---------------------------------------------------
CREATE TABLE IF NOT EXISTS revenue_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  revenue_item_id UUID REFERENCES revenue_items(id),
  payment_reference TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('CASH','BANK','MOBILE_MONEY','OTHER')),
  amount_cdf NUMERIC(18,2) NOT NULL CHECK (amount_cdf >= 0),
  external_reference TEXT,
  received_by UUID REFERENCES users(id),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reconciliation_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (reconciliation_status IN ('PENDING','RECONCILED','REJECTED')),
  reconciled_by UUID REFERENCES users(id),
  reconciled_at TIMESTAMPTZ,
  UNIQUE (commune_id, payment_reference)
);

CREATE TABLE IF NOT EXISTS revenue_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL UNIQUE REFERENCES revenue_payments(id),
  receipt_number TEXT NOT NULL,
  verification_token TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,
  UNIQUE (commune_id, receipt_number),
  UNIQUE (commune_id, verification_token)
);

-- --- V5 PostgreSQL opérationnel ----------------------------------------------
-- Champs de saisie terrain conservés même lorsqu'une avenue n'est pas encore
-- normalisée dans le référentiel territorial.
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS avenue_text TEXT;
ALTER TABLE parcels ADD COLUMN IF NOT EXISTS location_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_parcels_commune_created ON parcels(commune_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_stalls_commune_status ON market_stalls(commune_id, occupancy_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_market_inspections_stall_date ON market_stall_inspections(stall_id, inspected_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_payments_commune_date ON revenue_payments(commune_id, received_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_revenue_external_reference
  ON revenue_payments(commune_id, channel, external_reference)
  WHERE external_reference IS NOT NULL AND external_reference <> '';

COMMENT ON TABLE revenue_receipts IS 'Quittance numérique liée à un paiement. Toute annulation est tracée; une quittance annulée ne doit jamais être supprimée.';
COMMENT ON TABLE revenue_payments IS 'Journal des encaissements communaux; le rapprochement est une étape distincte de la perception.';
COMMENT ON TABLE market_stall_inspections IS 'Contrôles terrain des étalages et emplacements; les observations sont historisées.';
