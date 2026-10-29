-- Workflow de dépôt et de suivi des dossiers citoyens.
-- Les pièces jointes sont volontairement exclues tant qu'un stockage privé sécurisé n'est pas configuré.
CREATE TABLE IF NOT EXISTS public_dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE RESTRICT,
  reference TEXT NOT NULL,
  tracking_token_hash TEXT NOT NULL,
  service_code TEXT NOT NULL,
  service_label TEXT NOT NULL,
  request_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  privacy_consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'RECEIVED'
    CHECK (status IN ('RECEIVED','UNDER_REVIEW','NEEDS_INFO','APPROVED','REJECTED','COMPLETED')),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  UNIQUE (commune_id, reference),
  UNIQUE (tracking_token_hash)
);
CREATE INDEX IF NOT EXISTS idx_public_dossiers_commune_status_created
  ON public_dossiers(commune_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_dossiers_commune_reference
  ON public_dossiers(commune_id, reference);

CREATE TABLE IF NOT EXISTS public_dossier_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune_id UUID NOT NULL REFERENCES communes(id) ON DELETE RESTRICT,
  dossier_id UUID NOT NULL REFERENCES public_dossiers(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  message TEXT NOT NULL,
  visible_to_citizen BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_public_dossier_events_dossier_date
  ON public_dossier_events(dossier_id, created_at ASC);

-- Les soumissions publiques ne doivent jamais être accessibles hors du tenant de la session.
-- Les contrôles d'accès sont appliqués dans les routes API; activer RLS après validation du rôle SQL applicatif.


-- Compteur de limitation des dépôts publics : IP pseudonymisée par HMAC côté serveur.
CREATE TABLE IF NOT EXISTS public_dossier_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  hits INTEGER NOT NULL DEFAULT 0 CHECK (hits >= 0)
);
