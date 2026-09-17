# Architecture RBAC — e-Commune RDC

## Principe

Le système est **multi-commune**, mais un utilisateur administratif appartient à une seule commune dans la première version. Toutes les opérations métiers portent un `commune_id` dérivé de la session.

Le client web n'est jamais considéré comme source d'autorité. Masquer un bouton n'est qu'un confort visuel : les API doivent revérifier chaque permission.

## Rôles

- `BOURGMESTRE` : accès complet dans sa commune ; seul rôle habilité à créer/suspendre les comptes et attribuer les rôles.
- `BOURGMESTRE_ADJOINT` : vue large et traitement opérationnel sans administration des comptes.
- `SECRETAIRE_COMMUNAL` : actes, gouvernance, coordination et lecture transversale.
- `CHEF_SERVICE` : accès à son périmètre de service.
- `ETAT_CIVIL` : registre citoyen et état civil.
- `REGIE_RECETTES` : fiscalité, facturation et suivi de recettes.
- `CAISSIER` : encaissement et quittances, sans administration des rôles.
- `URBANISME` : dossiers, inspections, cartographie et projets.
- `SANTE_HYGIENE` : registre sanitaire, inspections de proximité et suivi des structures, sans administration des comptes.
- `CHEF_QUARTIER` : population, plaintes et suivi territorial du quartier.
- `AGENT` : accès minimal aux opérations nécessaires.
- `AUDITEUR` : lecture étendue et journaux, sans modification métier.

## Invariants

1. `session.communeId` prime sur tout `communeId` transmis par le navigateur.
2. `agents:create`, `agents:disable` et `roles:assign` sont réservés au Bourgmestre.
3. Le Bourgmestre ne peut créer un agent que dans sa commune.
4. Le rôle `SANTE_HYGIENE` est attribué exclusivement par le Bourgmestre ; il permet de tenir le registre sanitaire mais pas de créer des comptes.
5. Un compte agent doit conserver la référence de l'acte administratif qui justifie son affectation.
6. Toute modification d'habilitation produit un événement d'audit.
7. Les profils caisse/recettes ne doivent pas pouvoir effacer silencieusement une quittance.
8. Les validations sensibles doivent à terme utiliser MFA/réauthentification et signature/horodatage appropriés.

## Contrôles déjà présents dans le starter

- cookie de session signé HMAC, HTTP-only ;
- contrôle de rôle côté route `/api/agents` ;
- `communeId` imposé par la session ;
- navigation filtrée par permissions ;
- trigger PostgreSQL interdisant la création d'un agent par un non-Bourgmestre ou par un Bourgmestre d'une autre commune.

## À renforcer avant production

- fournisseur d'identité réel (SSO/annuaire officiel) ;
- stockage des comptes et sessions en base ;
- hachage fort des mots de passe si mot de passe local ;
- MFA ;
- RLS PostgreSQL ;
- révocation centralisée des sessions ;
- contrôle fin par service/quartier ;
- approbations à double contrôle pour opérations financières ;
- logs append-only et supervision sécurité.
