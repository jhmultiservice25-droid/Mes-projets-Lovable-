export const kasaVubuPilot = {
  code: "KIN-KSV",
  officialName: "Commune de Kasa-Vubu",
  shortName: "Kasa-Vubu",
  province: "Kinshasa",
  district: "Funa",
  center: { lat: -4.34229, lon: 15.30247 },
  surfaceKm2: 5.04,
  population: 81703,
  neighborhoodsCount: 7,
  osmRelationId: 388094,
  officialAddress: "Avenue Sport / Avenue des Sports, Commune de Kasa-Vubu, Kinshasa",
  officialDomain: "kasa-vubu.cd",
  bourgmestre: "MASSOMBO MPOYI Phinnées",
  bourgmestreAdjoint: "MOSWALO LIMETEBI Sandra",
  referenceNote: "Pilote e-Commune — données territoriales documentées, à valider par l'administration communale avant usage opposable.",
};

export const kasaVubuQuartiers = [
  { code: "Q01", name: "Anciens Combattants", chief: "SHONGO LOLA François", deputy: "LUSAMAKE LUAKANYONGA" },
  { code: "Q02", name: "Assossa", chief: "IFOMA BONDJA Pauline", deputy: "NZUZI NDONGALA" },
  { code: "Q03", name: "Katanga", chief: "MINKULU OTSHUL AMBEL", deputy: "MOTINGIYA BOSENGELE" },
  { code: "Q04", name: "Lubumbashi", chief: "FOLO LISONGI", deputy: "MANGALA TABALA" },
  { code: "Q05", name: "Lodja", chief: "MWAMBA KABAMBA Berdam", deputy: "MBUKU KIBAKA Georges" },
  { code: "Q06", name: "O.N.L.", chief: "LELO NDOSIMAU", deputy: "YASSA BATUKUDIDI" },
  { code: "Q07", name: "Salongo", chief: "MAKUNDJI NGADY Baudouin", deputy: "LUYENGO YUNGA Fiston" },
] as const;

export const kasaVubuCouncil = [
  { name: "ENGIA MOKE BUNGA Guy", function: "Président" },
  { name: "KIABANZAWOKO NDONA Ruphin", function: "Vice-Président" },
  { name: "MWAMBA WA BINUNU Jean-Luc", function: "Rapporteur" },
  { name: "YOMBO NKASHAMA Mado", function: "Questeure" },
  { name: "TSHIBANGU KALOMBO Augustin", function: "Conseiller" },
  { name: "MAKESA NZAMBA Guylain", function: "Conseiller" },
  { name: "IYOLO BESAMBO Djodjo", function: "Conseiller" },
  { name: "BANZA KALONJI Juguel", function: "Conseiller" },
  { name: "MATONDO NKODIA Gianny", function: "Conseiller" },
] as const;

export type HealthFacility = {
  id: string;
  name: string;
  type: string;
  ownership: "État" | "Commune" | "Partenaire" | "Privé / confessionnel" | "À qualifier";
  origin: "Référentiel existant" | "Créée par la commune";
  status: "En activité" | "À vérifier" | "Projet";
  quartier?: string;
  address?: string;
  phone?: string;
  lat?: number;
  lon?: number;
  beds?: number;
  services: string[];
  source: string;
  sourceStatus: "Source publique" | "Source sectorielle" | "Référentiel cartographique";
  communalActRef?: string;
  healthAuthorizationRef?: string;
  projectId?: string;
};

// Référentiel pilote non exhaustif. Il sert à initialiser le registre et doit être
// consolidé avec la Zone de santé de Kasa-Vubu / DPS Kinshasa avant production.
export const healthFacilities: HealthFacility[] = [
  {
    id: "SAN-KSV-000",
    name: "Hôpital du Cinquantenaire",
    type: "Hôpital",
    ownership: "À qualifier",
    origin: "Référentiel existant",
    status: "En activité",
    address: "Avenue Pierre Mulele / ex-24 Novembre, Kasa-Vubu",
    lat: -4.34191,
    lon: 15.29631,
    beds: 515,
    services: ["Urgences", "Chirurgie", "Gynécologie", "Médecine spécialisée"],
    source: "Ministère de la Santé; coordonnées OSM/Wikidata",
    sourceStatus: "Source publique",
  },
  {
    id: "SAN-KSV-001",
    name: "Centre hospitalier d'État Mama Pamela Delargy",
    type: "Centre hospitalier / référence",
    ownership: "État",
    origin: "Référentiel existant",
    status: "En activité",
    address: "Boulevard Opala, Kasa-Vubu",
    services: ["Premiers soins", "Maternité", "Soins généraux"],
    source: "OMS Afrique — remise d'ouvrages PCI, Zone de santé de Kasa-Vubu (2021)",
    sourceStatus: "Source publique",
  },
  {
    id: "SAN-KSV-002",
    name: "Centre de santé de référence CASOP",
    type: "Centre de santé de référence",
    ownership: "Partenaire",
    origin: "Référentiel existant",
    status: "En activité",
    quartier: "Lodja",
    address: "200, avenue de l'Enseignement",
    phone: "+243 818 792 972",
    lat: -4.33342,
    lon: 15.3134,
    services: ["Consultations", "Dépistage", "Santé communautaire"],
    source: "CPLT Kinshasa / Action Damien + convention sanitaire documentée",
    sourceStatus: "Source sectorielle",
  },
  {
    id: "SAN-KSV-003",
    name: "Centre médical SONAL",
    type: "Centre médical / hôpital",
    ownership: "À qualifier",
    origin: "Référentiel existant",
    status: "En activité",
    address: "Avenue Kasa-Vubu",
    lat: -4.3523,
    lon: 15.30681,
    services: ["Consultations", "Soins généraux"],
    source: "Référentiel OpenStreetMap + liste de sites sanitaires de la zone de santé",
    sourceStatus: "Référentiel cartographique",
  },
  {
    id: "SAN-KSV-004",
    name: "Centre de santé Chrisco",
    type: "Centre de santé",
    ownership: "À qualifier",
    origin: "Référentiel existant",
    status: "À vérifier",
    address: "Rue Oshwe",
    services: ["Consultations", "Santé sexuelle et reproductive"],
    source: "Projet ASSK — structures appuyées dans la Zone de santé de Kasa-Vubu",
    sourceStatus: "Source sectorielle",
  },
  {
    id: "SAN-KSV-005",
    name: "Centre de santé Sainte-Marie",
    type: "Centre de santé",
    ownership: "À qualifier",
    origin: "Référentiel existant",
    status: "À vérifier",
    address: "Rue Ikelemba",
    services: ["Consultations", "Santé sexuelle et reproductive"],
    source: "Projet ASSK — structures appuyées dans la Zone de santé de Kasa-Vubu",
    sourceStatus: "Source sectorielle",
  },
];
