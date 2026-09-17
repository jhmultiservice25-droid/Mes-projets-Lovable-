# V5 — workflows PostgreSQL

## 1. Parcelles

Interface `Parcelles & domaine communal` → `POST /api/parcels`.

La géométrie est conservée en GeoJSON, avec référence, quartier, avenue, usage, occupant déclaré, propriétaire déclaré, superficie déclarée, source, auteur et statut `TO_VALIDATE`. Un import GeoJSON utilise `POST /api/parcels/import` et conserve la référence de source. La numérisation ne vaut pas titre de propriété.

## 2. Perception numérique

Le catalogue fiscal est lu/écrit via `/api/fiscal-catalog`. Une référence active exige une base légale, un acte de mise en œuvre et une confirmation du service compétent.

`POST /api/revenue/payments` exécute une transaction PostgreSQL unique :

1. contrôle de la référence fiscale active et de sa période ;
2. création de la liquidation (`revenue_items`) ;
3. création du paiement (`revenue_payments`) ;
4. création de la quittance (`revenue_receipts`) avec jeton de vérification ;
5. mise à jour éventuelle de l'étalage si son code est la référence contribuable ;
6. écriture du journal d'audit.

Le rapprochement est séparé de l'encaissement via `/api/revenue/payments/[id]/reconcile`.

## 3. Marchés et étalages

`/api/markets/stalls` gère le registre des emplacements. Chaque étalage est rattaché à un marché, un code unique, un occupant, une activité, une période, une référence fiscale facultative et des états d'occupation/paiement.

`/api/markets/stalls/[id]/inspections` crée une inspection historisée et attribuée à l'agent connecté.

## 4. Comptes agents

`/api/agents` est branché sur `users`. Seul le Bourgmestre peut créer un agent. Le compte est créé inactif afin qu'une activation explicite soit faite après contrôle. L'API `[id]` permet au Bourgmestre d'activer/suspendre le compte.

## 5. Audit

Les opérations sensibles écrivent dans `audit_logs` : utilisateur, commune, action, entité, motif, données avant/après, métadonnées, user-agent, IP lorsque disponible et horodatage. `/api/audit` alimente la page `Audit & conformité` et permet l'export CSV côté interface.
