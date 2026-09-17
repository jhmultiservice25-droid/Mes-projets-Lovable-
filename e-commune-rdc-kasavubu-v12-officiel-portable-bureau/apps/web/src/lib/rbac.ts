export type UserRole =
  | "BOURGMESTRE"
  | "BOURGMESTRE_ADJOINT"
  | "SECRETAIRE_COMMUNAL"
  | "CHEF_SERVICE"
  | "ETAT_CIVIL"
  | "REGIE_RECETTES"
  | "MARCHES"
  | "CAISSIER"
  | "URBANISME"
  | "SANTE_HYGIENE"
  | "CHEF_QUARTIER"
  | "AGENT"
  | "AUDITEUR";

export type Permission =
  | "dashboard:view"
  | "citizens:view"
  | "citizens:write"
  | "civil:view"
  | "civil:write"
  | "revenue:view"
  | "revenue:write"
  | "business:view"
  | "business:write"
  | "complaints:view"
  | "complaints:write"
  | "urbanism:view"
  | "urbanism:write"
  | "health:view"
  | "health:write"
  | "map:view"
  | "projects:view"
  | "projects:write"
  | "governance:view"
  | "governance:write"
  | "personnel:view"
  | "agents:create"
  | "agents:disable"
  | "roles:assign"
  | "settings:manage"
  | "audit:view";

export const ROLE_LABELS: Record<UserRole, string> = {
  BOURGMESTRE: "Bourgmestre",
  BOURGMESTRE_ADJOINT: "Bourgmestre adjoint",
  SECRETAIRE_COMMUNAL: "Secrétaire communal",
  CHEF_SERVICE: "Chef de service",
  ETAT_CIVIL: "Agent de l'état civil",
  REGIE_RECETTES: "Régie des recettes",
  MARCHES: "Marchés & étalages",
  CAISSIER: "Caissier",
  URBANISME: "Service urbanisme",
  SANTE_HYGIENE: "Santé & hygiène",
  CHEF_QUARTIER: "Chef de quartier",
  AGENT: "Agent communal",
  AUDITEUR: "Auditeur / contrôle",
};

const common: Permission[] = ["dashboard:view", "map:view"];

const ROLE_PERMISSIONS: Record<UserRole, Permission[] | "*"> = {
  BOURGMESTRE: "*",
  BOURGMESTRE_ADJOINT: [
    ...common,
    "citizens:view",
    "civil:view",
    "revenue:view",
    "business:view",
    "complaints:view",
    "complaints:write",
    "urbanism:view",
    "health:view",
    "projects:view",
    "governance:view",
    "personnel:view",
    "audit:view",
  ],
  SECRETAIRE_COMMUNAL: [
    ...common,
    "citizens:view",
    "civil:view",
    "business:view",
    "complaints:view",
    "urbanism:view",
    "health:view",
    "projects:view",
    "governance:view",
    "governance:write",
    "personnel:view",
  ],
  CHEF_SERVICE: [
    ...common,
    "citizens:view",
    "complaints:view",
    "complaints:write",
    "health:view",
    "projects:view",
    "personnel:view",
  ],
  ETAT_CIVIL: [...common, "citizens:view", "citizens:write", "civil:view", "civil:write"],
  REGIE_RECETTES: [...common, "revenue:view", "revenue:write", "business:view", "projects:view"],
  MARCHES: [...common, "business:view", "business:write", "revenue:view"],
  CAISSIER: [...common, "revenue:view", "revenue:write"],
  URBANISME: [...common, "citizens:view", "urbanism:view", "urbanism:write", "health:view", "projects:view", "projects:write"],
  SANTE_HYGIENE: [
    ...common,
    "citizens:view",
    "complaints:view",
    "complaints:write",
    "health:view",
    "health:write",
    "projects:view",
  ],
  CHEF_QUARTIER: [...common, "citizens:view", "complaints:view", "complaints:write", "health:view", "projects:view"],
  AGENT: [...common, "citizens:view", "complaints:view"],
  AUDITEUR: [
    ...common,
    "citizens:view",
    "civil:view",
    "revenue:view",
    "business:view",
    "complaints:view",
    "urbanism:view",
    "health:view",
    "projects:view",
    "governance:view",
    "personnel:view",
    "audit:view",
  ],
};

export function hasPermission(role: UserRole, permission: Permission) {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions === "*" || permissions.includes(permission);
}

export function canCreateAgents(role: UserRole) {
  return role === "BOURGMESTRE";
}
