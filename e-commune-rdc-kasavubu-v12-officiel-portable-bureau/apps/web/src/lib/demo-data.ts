export type PublicProject = {
  id: string;
  name: string;
  sector: string;
  funding: string;
  program: string;
  budgetCdf: number | null;
  physical: number | null;
  financial: number | null;
  status: string;
  evidence: string;
  evidenceDate: string;
  verified: boolean;
  verificationScope: string;
  sourceLabel: string;
  sourceUrl: string;
  lat: number | null;
  lon: number | null;
};

/**
 * Fatshimétrie locale — portefeuille réel sourcé pour Kasa-Vubu.
 *
 * Principe : une programmation budgétaire ou l'existence d'un chantier peut être
 * vérifiée sans que son pourcentage d'avancement le soit. Les champs physical et
 * financial restent donc à null tant qu'une source probante ne fournit pas une
 * mesure suffisamment précise et datée.
 */
export const projects: PublicProject[] = [
  {
    id: "PIP-2026-KSV-SL-03",
    name: "Construction du bâtiment administratif du SG aux Sports et Loisirs à Kasa-Vubu",
    sector: "Sports & administration publique",
    funding: "Budget de l'État",
    program: "PIP 2026-2028 — Sports et Loisirs",
    budgetCdf: 6_694_172_125,
    physical: null,
    financial: null,
    status: "Programmé au PIP 2026",
    evidence: "Inscrit au Programme d'investissements publics 2026-2028, page 60.",
    evidenceDate: "2025-10-05",
    verified: true,
    verificationScope: "Programmation budgétaire",
    sourceLabel: "Ministère du Plan — PIP 2026-2028",
    sourceUrl: "https://plan.gouv.cd/wp-content/uploads/2025/10/PIP-2026-2028.pdf",
    lat: null,
    lon: null,
  },
  {
    id: "KEB-2026-KSV-PONT-VICTOIRE",
    name: "Modernisation du Pont Victoire sur la rivière Kalamu",
    sector: "Voirie & drainage",
    funding: "Ville-Province de Kinshasa",
    program: "Kinshasa Ezo Bonga",
    budgetCdf: null,
    physical: null,
    financial: null,
    status: "En travaux — source officielle",
    evidence: "Le ministère provincial documente le remplacement de l'ouvrage et l'avancement du chantier.",
    evidenceDate: "2026-04-13",
    verified: true,
    verificationScope: "Existence et exécution du chantier",
    sourceLabel: "Ministère provincial ITPAFUH — Kinshasa",
    sourceUrl: "https://kinshasaitpafuh.cd/2026/04/13/kinshasa-ezo-bonga-le-pont-victoire-se-refait-progressivement-une-beaute/",
    lat: null,
    lon: null,
  },
  {
    id: "KEB-2026-KSV-GAMBELA",
    name: "Réhabilitation de la route Gambela, de l'Enseignement au rond-point Force",
    sector: "Voirie",
    funding: "Ville-Province de Kinshasa",
    program: "Kinshasa Ezo Bonga / voirie urbaine",
    budgetCdf: null,
    physical: null,
    financial: null,
    status: "En réhabilitation — source officielle",
    evidence: "Le ministère provincial indique que l'axe est en réhabilitation et que les travaux évoluent.",
    evidenceDate: "2026-01-13",
    verified: true,
    verificationScope: "Existence et exécution du chantier",
    sourceLabel: "Ministère provincial ITPAFUH — Kinshasa",
    sourceUrl: "https://kinshasaitpafuh.cd/2026/01/13/kinshasa_infrastructures-lelu-de-la-commune-de-kasa-vubu-andre-nkongolo-nkongolo-satisfait-des-travaux-de-voirie-realises-dans-sa-circonscription/",
    lat: null,
    lon: null,
  },
  {
    id: "KEB-2026-KSV-ETHIOPIE",
    name: "Modernisation de l'avenue Éthiopie",
    sector: "Voirie",
    funding: "Ville-Province de Kinshasa",
    program: "Kinshasa Ezo Bonga",
    budgetCdf: null,
    physical: null,
    financial: null,
    status: "En cours — mise à jour août 2026",
    evidence: "L'ACP, citant un communiqué de l'Hôtel de Ville, confirme la poursuite des travaux à Kasa-Vubu.",
    evidenceDate: "2026-08-22",
    verified: true,
    verificationScope: "Existence et exécution du chantier",
    sourceLabel: "ACP / communiqué de l'Hôtel de Ville de Kinshasa",
    sourceUrl: "https://acp.cd/urbain/programme-kinshasa-ezo-bonga-les-travaux-de-modernisation-de-lavenue-ethiopie-en-cours/",
    lat: null,
    lon: null,
  },
];

export const agents = [
  ["EC-KSV-0001", "Patrick Mbuyi", "Secrétariat communal", "Secrétaire communal", "Actif", "Aujourd'hui 08:14"],
  ["EC-KSV-0008", "Chantal Ilunga", "État civil", "Agent de l'état civil", "Actif", "Aujourd'hui 07:58"],
  ["EC-KSV-0012", "Junior Kanku", "Régie des recettes", "Régie des recettes", "Actif", "Hier 17:42"],
  ["EC-KSV-0019", "Merveille Banza", "Urbanisme", "Service urbanisme", "Suspendu", "11 sept. 2026"],
];
