-- e-Commune RDC — initialisation territoriale du pilote Kasa-Vubu.
-- Exécuter APRÈS database/schema.sql.
-- Les données issues de référentiels ouverts restent marquées comme telles et
-- doivent être validées par la commune / le service sectoriel avant usage opposable.

INSERT INTO communes (code, official_name, city_or_territory, province, official_email, official_domain, legal_reference, population_estimate, surface_km2, osm_relation_id, boundary_source, boundary_validation_status, center_lat, center_lon)
VALUES (
  'KIN-KSV',
  'Commune de Kasa-Vubu',
  'Ville de Kinshasa',
  'Kinshasa',
  'contact@kasavubu-kinshasa.cd',
  'kasa-vubu.cd',
  'Loi organique n°08/016 du 07 octobre 2008; référentiel communal 2026',
  81703,
  5.04,
  388094,
  'OpenStreetMap relation 388094 — référentiel opérationnel, validation administrative requise',
  'REFERENCE_ONLY',
  -4.3422900,
  15.3024700
)
ON CONFLICT (code) DO UPDATE SET
  official_name=EXCLUDED.official_name, city_or_territory=EXCLUDED.city_or_territory, province=EXCLUDED.province,
  official_email=EXCLUDED.official_email, official_domain=EXCLUDED.official_domain, population_estimate=EXCLUDED.population_estimate,
  surface_km2=EXCLUDED.surface_km2, osm_relation_id=EXCLUDED.osm_relation_id, boundary_source=EXCLUDED.boundary_source,
  boundary_validation_status=EXCLUDED.boundary_validation_status, center_lat=EXCLUDED.center_lat, center_lon=EXCLUDED.center_lon, updated_at=now();

WITH c AS (SELECT id FROM communes WHERE code='KIN-KSV')
INSERT INTO quartiers (commune_id, code, name, chief_name, deputy_name, boundary_source, boundary_validation_status)
SELECT c.id, q.code, q.name, q.chief, q.deputy, 'OpenStreetMap / portail communal', 'TO_VALIDATE'
FROM c CROSS JOIN (VALUES
  ('Q01','Anciens Combattants','SHONGO LOLA François','LUSAMAKE LUAKANYONGA'),
  ('Q02','Assossa','IFOMA BONDJA Pauline','NZUZI NDONGALA'),
  ('Q03','Katanga','MINKULU OTSHUL AMBEL','MOTINGIYA BOSENGELE'),
  ('Q04','Lubumbashi','FOLO LISONGI','MANGALA TABALA'),
  ('Q05','Lodja','MWAMBA KABAMBA Berdam','MBUKU KIBAKA Georges'),
  ('Q06','O.N.L.','LELO NDOSIMAU','YASSA BATUKUDIDI'),
  ('Q07','Salongo','MAKUNDJI NGADY Baudouin','LUYENGO YUNGA Fiston')
) AS q(code,name,chief,deputy)
ON CONFLICT (commune_id, code) DO UPDATE SET name=EXCLUDED.name, chief_name=EXCLUDED.chief_name, deputy_name=EXCLUDED.deputy_name, active=TRUE;

WITH c AS (SELECT id FROM communes WHERE code='KIN-KSV')
INSERT INTO data_sources (commune_id, code, label, source_type, url, retrieved_at, notes)
SELECT c.id, s.code, s.label, s.source_type, s.url, now(), s.notes FROM c CROSS JOIN (VALUES
  ('SRC-COMMUNE','Portail officiel de la commune de Kasa-Vubu','OFFICIAL','https://www.kasa-vubu.cd/','Quartiers, administration, population, adresse et informations communales'),
  ('SRC-OSM','OpenStreetMap — Kasa-Vubu relation 388094','OPEN_REFERENCE','https://www.openstreetmap.org/relation/388094','Limites, voies et équipements; non opposable sans validation administrative'),
  ('SRC-SANTE','Ministère de la Santé publique, Hygiène et Prévoyance sociale','SECTORAL','https://sante.gouv.cd/hopitaux','Référencement sectoriel des établissements hospitaliers'),
  ('SRC-CPLT','CPLT Kinshasa / Action Damien','SECTORAL','https://actiondamienrdcongo.org/hosp_map','Structures de diagnostic et traitement / données sanitaires')
) AS s(code,label,source_type,url,notes)
ON CONFLICT (commune_id, code) DO UPDATE SET label=EXCLUDED.label, source_type=EXCLUDED.source_type, url=EXCLUDED.url, retrieved_at=now(), notes=EXCLUDED.notes;

WITH c AS (SELECT id FROM communes WHERE code='KIN-KSV'), src AS (SELECT id FROM data_sources WHERE commune_id=(SELECT id FROM c) AND code='SRC-OSM')
INSERT INTO territorial_boundaries (commune_id, boundary_level, external_relation_id, source_id, validation_status)
SELECT c.id, 'COMMUNE', 388094, src.id, 'REFERENCE_ONLY' FROM c, src
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM communes WHERE code='KIN-KSV'),
streets(qcode,code,name) AS (VALUES
  ('Q01','Q01-V001','Avenue des Sports'),
  ('Q01','Q01-V002','Avenue Gambela'),
  ('Q01','Q01-V003','Avenue Kasa-Vubu'),
  ('Q01','Q01-V004','Rue Befale'),
  ('Q01','Q01-V005','Rue Bomboma'),
  ('Q01','Q01-V006','Rue Busu-Melo'),
  ('Q01','Q01-V007','Rue Djolu'),
  ('Q01','Q01-V008','Rue Gemena'),
  ('Q01','Q01-V009','Rue Ikelemba'),
  ('Q01','Q01-V010','Rue Irebu'),
  ('Q01','Q01-V011','Rue Lopori'),
  ('Q02','Q02-V001','Avenue de la Force Publique'),
  ('Q02','Q02-V002','Rue Sandoa'),
  ('Q03','Q03-V001','Avenue Busu-Djanoa'),
  ('Q03','Q03-V002','Avenue Lisala'),
  ('Q03','Q03-V003','Avenue Maringa'),
  ('Q03','Q03-V004','Avenue Shaba'),
  ('Q03','Q03-V005','Rond-point Kimpwanza'),
  ('Q03','Q03-V006','Rue Bomboma'),
  ('Q03','Q03-V007','Rue Bongandanga'),
  ('Q03','Q03-V008','Rue Bosobolo'),
  ('Q03','Q03-V009','Rue Eala'),
  ('Q03','Q03-V010','Rue Gemena'),
  ('Q05','Q05-V001','Avenue Kasa-Vubu'),
  ('Q05','Q05-V002','Avenue Lokalama'),
  ('Q05','Q05-V003','Enseignement'),
  ('Q05','Q05-V004','Luozi'),
  ('Q05','Q05-V005','Mpozo'),
  ('Q05','Q05-V006','Rue Kanda-Kanda'),
  ('Q05','Q05-V007','Rue Lodja'),
  ('Q05','Q05-V008','Rue Mangai'),
  ('Q05','Q05-V009','Rue Masi-Manimba'),
  ('Q05','Q05-V010','Rue Oshwe'),
  ('Q05','Q05-V011','Rue Popo Kabaka'),
  ('Q05','Q05-V012','Rue Tshikapa'),
  ('Q04','Q04-V001','Avenue de la Force Publique'),
  ('Q04','Q04-V002','Avenue Gambela'),
  ('Q04','Q04-V003','Avenue Kasa-Vubu'),
  ('Q04','Q04-V004','Avenue Lukandu'),
  ('Q04','Q04-V005','Avenue Opala'),
  ('Q04','Q04-V006','Avenue Shaba'),
  ('Q04','Q04-V007','Place du 17 Mai'),
  ('Q04','Q04-V008','Rue Banalia'),
  ('Q04','Q04-V009','Rue Faradje'),
  ('Q04','Q04-V010','Rue Momboyo'),
  ('Q04','Q04-V011','Rue Sandoa'),
  ('Q04','Q04-V012','Rue Yahuma'),
  ('Q06','Q06-V001','Avenue Assossa'),
  ('Q06','Q06-V002','Avenue Birmanie'),
  ('Q06','Q06-V003','Avenue de Zomfi'),
  ('Q06','Q06-V004','Avenue des Sports'),
  ('Q06','Q06-V005','Avenue Dialele'),
  ('Q06','Q06-V006','Avenue Saio'),
  ('Q06','Q06-V007','Rue de Binanga'),
  ('Q06','Q06-V008','Rue de Bombo'),
  ('Q06','Q06-V009','Rue de Dembo'),
  ('Q06','Q06-V010','Rue de Kasangulu'),
  ('Q06','Q06-V011','Rue de Kibambi'),
  ('Q06','Q06-V012','Rue de Kiduma'),
  ('Q06','Q06-V013','Rue de Kimbola'),
  ('Q06','Q06-V014','Rue de Kimpemba'),
  ('Q06','Q06-V015','Rue de Kimwenza'),
  ('Q06','Q06-V016','Rue de Kimwisi'),
  ('Q06','Q06-V017','Rue de Kinanga'),
  ('Q06','Q06-V018','Rue de Kindongolosi'),
  ('Q06','Q06-V019','Rue de Kintanu'),
  ('Q06','Q06-V020','Rue de Kinzwana'),
  ('Q06','Q06-V021','Rue de Kipaku'),
  ('Q06','Q06-V022','Rue de Kipaku bis'),
  ('Q06','Q06-V023','Rue de Kivuka'),
  ('Q06','Q06-V024','Rue de Lemfu'),
  ('Q06','Q06-V025','Rue de Mbonda'),
  ('Q06','Q06-V026','Rue de Selo'),
  ('Q06','Q06-V027','Rue de Yongo'),
  ('Q07','Q07-V001','Avenue Assossa'),
  ('Q07','Q07-V002','Avenue de la Victoire'),
  ('Q07','Q07-V003','Avenue Gambela'),
  ('Q07','Q07-V004','Enseignement'),
  ('Q07','Q07-V005','Luozi'),
  ('Q07','Q07-V006','Rond-point Kimpwanza'),
  ('Q07','Q07-V007','Rue de Kanda-kanda'),
  ('Q07','Q07-V008','Rue Dibaya'),
  ('Q07','Q07-V009','Rue Inzia'),
  ('Q07','Q07-V010','Triomphal')
)
INSERT INTO avenues (commune_id, quartier_id, code, name, source_reference, validation_status)
SELECT c.id, qrt.id, streets.code, streets.name, 'OpenStreetMap/OpenAlfa — référentiel viaire pilote', 'OPEN_REFERENCE'
FROM c JOIN streets ON TRUE JOIN quartiers qrt ON qrt.commune_id=c.id AND qrt.code=streets.qcode
ON CONFLICT (commune_id, code) DO UPDATE SET quartier_id=EXCLUDED.quartier_id, name=EXCLUDED.name, source_reference=EXCLUDED.source_reference, validation_status=EXCLUDED.validation_status;

WITH c AS (SELECT id FROM communes WHERE code='KIN-KSV'),
assets(code,name,category,subtype,address,lat,lon,source_code,validation) AS (VALUES
  ('ADM-KSV-001','Maison communale de Kasa-Vubu','ADMINISTRATION','Maison communale','Avenue des Sports, Kasa-Vubu',-4.34229,15.30247,'SRC-COMMUNE','OFFICIAL'),
  ('SAN-KSV-000','Hôpital du Cinquantenaire','SANTE','Hôpital','Avenue Pierre Mulele / ex-24 Novembre',-4.34191,15.29631,'SRC-SANTE','SECTORAL'),
  ('EDU-KSV-001','Lycée Motema Mpiko','EDUCATION','École / lycée','Avenue Assossa',-4.34559,15.30153,'SRC-OSM','OPEN_REFERENCE'),
  ('EDU-KSV-002','Lycée 2 et 3 Kasa-Vubu','EDUCATION','École / lycée',NULL,-4.34458,15.30016,'SRC-OSM','OPEN_REFERENCE'),
  ('EDU-KSV-003','Université Catholique Cardinal Malula','EDUCATION','Université',NULL,-4.33964,15.29911,'SRC-OSM','OPEN_REFERENCE'),
  ('EDU-KSV-004','Athénée de la Victoire','EDUCATION','École','Rue de Kasangulu',NULL,NULL,'SRC-OSM','OPEN_REFERENCE'),
  ('EDU-KSV-005','Complexe Scolaire KANDA','EDUCATION','École','Avenue des Sports',NULL,NULL,'SRC-OSM','OPEN_REFERENCE'),
  ('EDU-KSV-006','École Armée du Salut','EDUCATION','École','Rue Faradje',NULL,NULL,'SRC-OSM','OPEN_REFERENCE'),
  ('EDU-KSV-007','Lycée Madame de Sévigné','EDUCATION','Lycée','Avenue de l''Enseignement',NULL,NULL,'SRC-OSM','OPEN_REFERENCE'),
  ('EDU-KSV-008','Lycée Toyokana','EDUCATION','Lycée','113, Avenue Lisala',NULL,NULL,'SRC-OSM','OPEN_REFERENCE'),
  ('EDU-KSV-009','Institut national pilote d''enseignement des sciences de santé','EDUCATION','Institut supérieur / sciences de santé','Boulevard Triomphal, Kasa-Vubu',NULL,NULL,'SRC-OSM','OPEN_REFERENCE'),
  ('CUL-KSV-001','Bibliothèque Miezi','CULTURE','Bibliothèque','103, Avenue Sport',-4.3412,15.29958,'SRC-OSM','OPEN_REFERENCE'),
  ('CUL-KSV-002','Carrefour des Jeunes','CULTURE','Centre des arts / jeunesse','Avenue Kasa-Vubu',NULL,NULL,'SRC-OSM','OPEN_REFERENCE'),
  ('MAR-KSV-001','Marché Gambela','MARCHE','Marché public / populaire','Avenue Gambela',-4.33583,15.31028,'SRC-OSM','OPEN_REFERENCE')
)
INSERT INTO territorial_assets (commune_id, code, name, category, subtype, address_detail, latitude, longitude, source_id, validation_status)
SELECT c.id, a.code, a.name, a.category, a.subtype, a.address, a.lat, a.lon, ds.id, a.validation
FROM c JOIN assets a ON TRUE LEFT JOIN data_sources ds ON ds.commune_id=c.id AND ds.code=a.source_code
ON CONFLICT (commune_id, code) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, subtype=EXCLUDED.subtype, address_detail=EXCLUDED.address_detail, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude, source_id=EXCLUDED.source_id, validation_status=EXCLUDED.validation_status, updated_at=now();

WITH c AS (SELECT id FROM communes WHERE code='KIN-KSV'),
     lodja AS (SELECT q.id FROM quartiers q JOIN c ON q.commune_id=c.id WHERE q.code='Q05')
INSERT INTO health_facilities (
  commune_id, code, name, facility_type, ownership_type, origin, status, health_zone, quartier_id,
  address_detail, latitude, longitude, beds_capacity, services, source_reference, source_url
)
SELECT c.id, 'SAN-KSV-000', 'Hôpital du Cinquantenaire', 'Hôpital', 'TO_QUALIFY', 'EXISTING', 'ACTIVE',
       'Kasa-Vubu', NULL, 'Avenue Pierre Mulele / ex-24 Novembre', -4.3419100, 15.2963100, 515,
       '["urgences","chirurgie","gynécologie","médecine spécialisée"]'::jsonb,
       'Ministère de la Santé; coordonnées OSM/Wikidata', 'https://sante.gouv.cd/hopitaux'
FROM c
UNION ALL
SELECT c.id, 'SAN-KSV-001', 'Centre hospitalier d''État Mama Pamela Delargy', 'Centre hospitalier / référence', 'STATE', 'EXISTING', 'ACTIVE',
       'Kasa-Vubu', NULL, 'Boulevard Opala, Kasa-Vubu', NULL, NULL, NULL,
       '["premiers soins","maternité","soins généraux"]'::jsonb,
       'OMS Afrique — Zone de santé de Kasa-Vubu, 2021',
       'https://www.afro.who.int/fr/news/coronavirus-en-rdc-des-latrines-et-incinerateurs-modernes-fournis-par-loms-dans-les-centres?country=975&name=Democratic+Republic+of+Congo'
FROM c
UNION ALL
SELECT c.id, 'SAN-KSV-002', 'Centre de santé de référence CASOP', 'Centre de santé de référence', 'PARTNER', 'EXISTING', 'ACTIVE',
       'Kasa-Vubu', lodja.id, '200, avenue de l''Enseignement', -4.3334200, 15.3134000, NULL,
       '["consultations","dépistage","santé communautaire"]'::jsonb,
       'CPLT Kinshasa / Action Damien', 'https://actiondamienrdcongo.org/hosp_map'
FROM c, lodja
UNION ALL
SELECT c.id, 'SAN-KSV-003', 'Centre médical SONAL', 'Centre médical / hôpital', 'TO_QUALIFY', 'EXISTING', 'ACTIVE',
       'Kasa-Vubu', NULL, 'Avenue Kasa-Vubu', -4.3523000, 15.3068100, NULL,
       '["consultations","soins généraux"]'::jsonb, 'Référentiel OSM / zone de santé', NULL
FROM c
UNION ALL
SELECT c.id, 'SAN-KSV-004', 'Centre de santé Chrisco', 'Centre de santé', 'TO_QUALIFY', 'EXISTING', 'TO_VERIFY',
       'Kasa-Vubu', NULL, 'Rue Oshwe', NULL, NULL, NULL, '["consultations","santé sexuelle et reproductive"]'::jsonb,
       'Projet ASSK — Zone de santé de Kasa-Vubu', NULL
FROM c
UNION ALL
SELECT c.id, 'SAN-KSV-005', 'Centre de santé Sainte-Marie', 'Centre de santé', 'TO_QUALIFY', 'EXISTING', 'TO_VERIFY',
       'Kasa-Vubu', NULL, 'Rue Ikelemba', NULL, NULL, NULL, '["consultations","santé sexuelle et reproductive"]'::jsonb,
       'Projet ASSK — Zone de santé de Kasa-Vubu', NULL
FROM c
ON CONFLICT (commune_id, code) DO UPDATE SET
  name=EXCLUDED.name, facility_type=EXCLUDED.facility_type, ownership_type=EXCLUDED.ownership_type, status=EXCLUDED.status,
  quartier_id=EXCLUDED.quartier_id, address_detail=EXCLUDED.address_detail, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  beds_capacity=EXCLUDED.beds_capacity, services=EXCLUDED.services, source_reference=EXCLUDED.source_reference, source_url=EXCLUDED.source_url, updated_at=now();


-- Sources Fatshimétrie / investissements publics réellement identifiés.
WITH c AS (SELECT id FROM communes WHERE code='KIN-KSV')
INSERT INTO data_sources (commune_id, code, label, source_type, url, retrieved_at, notes)
SELECT c.id, s.code, s.label, s.source_type, s.url, now(), s.notes FROM c CROSS JOIN (VALUES
  ('SRC-PIP-2026','Ministère du Plan — Programme d''investissements publics 2026-2028','OFFICIAL','https://plan.gouv.cd/wp-content/uploads/2025/10/PIP-2026-2028.pdf','Programmation budgétaire nationale; le PIP confirme l''inscription mais pas automatiquement l''exécution physique.'),
  ('SRC-KIN-ITP','Ministère provincial ITPAFUH — Ville de Kinshasa','OFFICIAL','https://kinshasaitpafuh.cd/','Suivi officiel provincial des chantiers de voirie et d''infrastructures.'),
  ('SRC-ACP','Agence Congolaise de Presse','SECTORAL','https://acp.cd/','Source publique d''actualité; à rattacher à la source administrative primaire lorsqu''elle est disponible.')
) AS s(code,label,source_type,url,notes)
ON CONFLICT (commune_id, code) DO UPDATE SET label=EXCLUDED.label, source_type=EXCLUDED.source_type, url=EXCLUDED.url, retrieved_at=now(), notes=EXCLUDED.notes;

-- Portefeuille réel de la Fatshimétrie locale. Les pourcentages restent NULL
-- lorsqu'aucune preuve officielle ne fournit une mesure quantitative exploitable.
WITH c AS (SELECT id FROM communes WHERE code='KIN-KSV'),
p(extref,name,sector,funding,program,authority,budget,status) AS (VALUES
  ('PIP-2026-KSV-SL-03','Construction du bâtiment administratif du SG aux Sports et Loisirs à Kasa-Vubu','SPORTS_ADMIN','Budget de l''État','PIP 2026-2028 — Sports et Loisirs','État / Secrétariat Général aux Sports et Loisirs',6694172125::numeric,'PLANNED'),
  ('KEB-2026-KSV-PONT-VICTOIRE','Modernisation du Pont Victoire sur la rivière Kalamu','ROAD_DRAINAGE','Ville-Province de Kinshasa','Kinshasa Ezo Bonga','Ministère provincial ITPAFUH',NULL::numeric,'IN_PROGRESS'),
  ('KEB-2026-KSV-GAMBELA','Réhabilitation de la route Gambela, de l''Enseignement au rond-point Force','ROAD','Ville-Province de Kinshasa','Kinshasa Ezo Bonga / voirie urbaine','Ministère provincial ITPAFUH',NULL::numeric,'IN_PROGRESS'),
  ('KEB-2026-KSV-ETHIOPIE','Modernisation de l''avenue Éthiopie','ROAD','Ville-Province de Kinshasa','Kinshasa Ezo Bonga','Ville-Province de Kinshasa / ITPAFUH',NULL::numeric,'IN_PROGRESS')
)
INSERT INTO state_projects (commune_id, external_reference, name, sector, funding_source, program_reference, contracting_authority, budget_cdf, physical_progress, financial_progress, status, is_demo)
SELECT c.id, p.extref, p.name, p.sector, p.funding, p.program, p.authority, p.budget, NULL, NULL, p.status, FALSE
FROM c CROSS JOIN p
ON CONFLICT DO NOTHING;

-- Mettre à jour les fiches existantes si le seed est rejoué.
WITH c AS (SELECT id FROM communes WHERE code='KIN-KSV'),
p(extref,name,sector,funding,program,authority,budget,status) AS (VALUES
  ('PIP-2026-KSV-SL-03','Construction du bâtiment administratif du SG aux Sports et Loisirs à Kasa-Vubu','SPORTS_ADMIN','Budget de l''État','PIP 2026-2028 — Sports et Loisirs','État / Secrétariat Général aux Sports et Loisirs',6694172125::numeric,'PLANNED'),
  ('KEB-2026-KSV-PONT-VICTOIRE','Modernisation du Pont Victoire sur la rivière Kalamu','ROAD_DRAINAGE','Ville-Province de Kinshasa','Kinshasa Ezo Bonga','Ministère provincial ITPAFUH',NULL::numeric,'IN_PROGRESS'),
  ('KEB-2026-KSV-GAMBELA','Réhabilitation de la route Gambela, de l''Enseignement au rond-point Force','ROAD','Ville-Province de Kinshasa','Kinshasa Ezo Bonga / voirie urbaine','Ministère provincial ITPAFUH',NULL::numeric,'IN_PROGRESS'),
  ('KEB-2026-KSV-ETHIOPIE','Modernisation de l''avenue Éthiopie','ROAD','Ville-Province de Kinshasa','Kinshasa Ezo Bonga','Ville-Province de Kinshasa / ITPAFUH',NULL::numeric,'IN_PROGRESS')
)
UPDATE state_projects sp SET
  name=p.name, sector=p.sector, funding_source=p.funding, program_reference=p.program,
  contracting_authority=p.authority, budget_cdf=p.budget, status=p.status, is_demo=FALSE
FROM c, p
WHERE sp.commune_id=c.id AND sp.external_reference=p.extref;

-- Preuves publiques du portefeuille. SOURCE_VERIFIED signifie que la source a
-- été identifiée, pas que l'avancement physique ou financier a été certifié.
WITH evidence(extref,title,org,url,evidence_date,notes) AS (VALUES
  ('PIP-2026-KSV-SL-03','PIP 2026-2028 — Sports et Loisirs, p.60','Ministère du Plan','https://plan.gouv.cd/wp-content/uploads/2025/10/PIP-2026-2028.pdf','2025-10-05'::date,'Confirme la programmation et le coût de 6 694 172 125 CDF pour 2026; ne prouve pas à lui seul l''exécution.'),
  ('KEB-2026-KSV-PONT-VICTOIRE','Kinshasa Ezo Bonga : modernisation du Pont Victoire','Ministère provincial ITPAFUH — Kinshasa','https://kinshasaitpafuh.cd/2026/04/13/kinshasa-ezo-bonga-le-pont-victoire-se-refait-progressivement-une-beaute/','2026-04-13'::date,'Confirme l''existence du chantier et décrit son état à la date de publication.'),
  ('KEB-2026-KSV-GAMBELA','Voirie à Kasa-Vubu : route Gambela en réhabilitation','Ministère provincial ITPAFUH — Kinshasa','https://kinshasaitpafuh.cd/2026/01/13/kinshasa_infrastructures-lelu-de-la-commune-de-kasa-vubu-andre-nkongolo-nkongolo-satisfait-des-travaux-de-voirie-realises-dans-sa-circonscription/','2026-01-13'::date,'Confirme la réhabilitation du corridor Enseignement–rond-point Force.'),
  ('KEB-2026-KSV-ETHIOPIE','Programme Kinshasa Ezo Bonga : avenue Éthiopie','Agence Congolaise de Presse / communiqué Hôtel de Ville','https://acp.cd/urbain/programme-kinshasa-ezo-bonga-les-travaux-de-modernisation-de-lavenue-ethiopie-en-cours/','2026-08-22'::date,'Confirme la poursuite des travaux entre Enseignement, Victoire et l''avenue Kasa-Vubu.')
)
INSERT INTO project_evidence (project_id, evidence_type, title, source_organization, source_url, evidence_date, validation_status, notes)
SELECT sp.id, 'OFFICIAL_WEB', e.title, e.org, e.url, e.evidence_date, 'SOURCE_VERIFIED', e.notes
FROM evidence e JOIN state_projects sp ON sp.external_reference=e.extref
ON CONFLICT DO NOTHING;

-- --- V5 : compte pilote et marché de référence ------------------------------
-- Le mot de passe de démonstration reste géré par variable d'environnement.
-- Cette ligne fournit uniquement un véritable UUID PostgreSQL à la session.
INSERT INTO users (commune_id, email, full_name, role, service_name, employee_reference, legal_act_reference, mfa_required, active)
SELECT c.id, 'bourgmestre@demo.ecommune.cd', 'Bourgmestre — compte pilote Kasa-Vubu', 'BOURGMESTRE',
       'Cabinet du Bourgmestre', 'DEMO-BGM-KSV', 'Compte technique de démonstration — ne vaut pas nomination', FALSE, TRUE
FROM communes c WHERE c.code = 'KIN-KSV'
ON CONFLICT (commune_id, email) DO UPDATE SET active = TRUE;

INSERT INTO markets (commune_id, code, name, management_type, legal_act_reference, active)
SELECT c.id, 'GAMBELA', 'Marché Gambela', 'A_QUALIFIER', NULL, TRUE
FROM communes c WHERE c.code = 'KIN-KSV'
ON CONFLICT (commune_id, code) DO UPDATE SET name = EXCLUDED.name, active = TRUE;
