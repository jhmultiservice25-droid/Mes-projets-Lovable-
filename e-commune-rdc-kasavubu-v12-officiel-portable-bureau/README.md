# e-Commune RDC — Kasa-Vubu V12 — Dashboard officiel + Portable Bureau Windows

## Interface officielle au démarrage

La page d’accueil du mode portable Node.js est désormais **le tableau de bord institutionnel officiel validé pour le pilote Kasa-Vubu**. Au double-clic sur le raccourci Windows, l’application ouvre directement ce dashboard. La capture de référence est conservée dans `docs/dashboard-officiel-kasa-vubu.png`.

Le tableau de bord comprend : territoire Kasa-Vubu, KPI citoyens/recettes/santé/projets, activité récente, Cabinet du Bourgmestre, Fatshimétrie locale, carte/territoire et services internes. Le bouton `+ Créer un accès agent` ouvre réellement le formulaire de création d’un agent inactif. Les menus officiels donnent accès aux modules Citoyens, État civil, Recettes, Commerces & étalages, Plaintes, Urbanisme, Parcelles, Santé, Territoire, Carte, Fatshimétrie, Gouvernance, Personnel, Audit et Paramètres.


## Ouverture recommandee sous Windows

1. Extraire completement le ZIP.
2. Double-cliquer sur `INSTALLER-PORTABLE-BUREAU.bat`.
3. Le programme copie e-Commune sur le Bureau dans `e-Commune-Kasa-Vubu`.
4. Il cree un raccourci Windows `e-Commune Kasa-Vubu`.
5. Le raccourci lance l'application avec `runtime\node.exe`.

Le runtime Node.js est rendu portable au premier lancement. Aucun Docker et aucun `npm install` ne sont requis pour ouvrir le mode portable.

---

Pour ouvrir immédiatement le logiciel sous Windows : **extraire le ZIP puis double-cliquer sur `E-COMMUNE.bat`**. Ce lanceur utilise uniquement Node.js et le serveur intégré `portable/server.js` : **aucun `npm install`, aucun Docker et aucun PostgreSQL ne sont nécessaires pour ouvrir l’interface**. Le code Next.js/PostgreSQL complet reste présent pour le mode avancé et la poursuite du développement.

---

# e-Commune RDC — pilote institutionnel Kasa-Vubu

Prototype interne d'administration numérique d'une commune congolaise, désormais configuré avec **Kasa-Vubu (Kinshasa)** comme commune pilote. La plateforme reste conçue en multi-commune, mais le jeu de démarrage, la carte et le référentiel territorial pointent sur Kasa-Vubu.

## Principes structurants

- **Bourgmestre = visibilité complète dans sa commune**.
- **Seul le Bourgmestre crée/suspend les accès agents et attribue les rôles**.
- Cloisonnement strict par `commune_id`.
- Création d'un compte numérique ≠ recrutement / nomination administrative.
- Journalisation des opérations sensibles.
- Références légales, fiscales et sanitaires versionnées.
- Données de démonstration clairement distinguées des données vérifiées.
- Identité visuelle institutionnelle inspirée des couleurs nationales et de la logique « Marque État », sans reproduire les graphismes protégés du site de la Présidence.
- Armoiries nationales affichées sans altération. Pour une installation officielle, utiliser le fichier institutionnel approuvé par l'autorité compétente.

## Pilote Kasa-Vubu

Le référentiel pilote reprend les **7 quartiers publiés par le portail de la commune** :

1. Anciens Combattants
2. Assossa
3. Katanga
4. Lubumbashi
5. Lodja
6. O.N.L.
7. Salongo

Le code contient aussi les noms des chefs et chefs adjoints publiés sur le portail communal au moment de la recherche. Ces informations doivent être revérifiées à chaque déploiement officiel.

Sources :
- https://www.kasa-vubu.cd/informations-municipales/
- https://www.kasa-vubu.cd/liste-des-quartiers-chefs-de-quartiers-et-eurs-adjoints/

### Initialisation PostgreSQL du pilote

Sous Windows, PostgreSQL est installé **directement comme service Windows**, sans conteneur. Le lanceur `E-COMMUNE.bat` détecte `psql.exe`, crée automatiquement la base `ecommune_kasavubu` si elle n'existe pas, applique `database/schema.sql`, charge `database/pilot-kasa-vubu.sql` et exécute les migrations disponibles.

Pour reconfigurer la connexion locale, utiliser `CONFIGURER-POSTGRESQL.bat`.

`database/pilot-kasa-vubu.sql` crée la commune, ses 7 quartiers, le référentiel viaire pilote, des équipements territoriaux sourcés, un registre sanitaire non exhaustif et un portefeuille initial de projets publics réels pour la Fatshimétrie.

## Architecture

- `apps/web` — Next.js 16 / React 19 / TypeScript
- `services/python` — FastAPI pour analytics, contrôles de données et futurs traitements IA/documentaires
- `database` — PostgreSQL 16+ installé localement sous Windows
- `scripts/windows` — détection, configuration et initialisation de PostgreSQL Windows
- `docs` — architecture RBAC et cadre juridique

Production recommandée : **Node.js 24 LTS**.

## Modules

1. Tableau de bord exécutif Kasa-Vubu
2. Citoyens & ménages
3. État civil
4. Recettes & taxes
5. Commerces & marchés
6. Plaintes & interventions
7. Urbanisme
8. **Parcelles & domaine communal**
9. **Structures sanitaires**
10. **Territoire & équipements**
11. Carte communale interactive
12. Fatshimétrie locale / projets publics sourcés
13. Gouvernance communale
14. Personnel & habilitations
15. Audit & conformité
16. Paramètres institutionnels

## Structures sanitaires

Le module sanitaire distingue :

- les structures existantes identifiées dans le territoire ;
- les structures **créées, construites, réhabilitées ou financées par la commune** ;
- le statut projet / à vérifier / en activité ;
- la nature de propriété/gestion ;
- le quartier, l'adresse et la géolocalisation ;
- les services offerts ;
- la référence de l'acte communal ;
- la référence d'autorisation/agrément sanitaire ;
- le financement ;
- le lien vers un projet de Fatshimétrie ;
- les inspections, constats et mesures correctives ;
- la source et le niveau de vérification.

Le statut **« En activité »** d'une structure créée par la commune ne doit pas être utilisé sans document d'autorisation/agrément applicable. e-Commune est un système de gestion et de preuve ; il ne se substitue pas aux autorités sanitaires.

Le rôle `SANTE_HYGIENE` a été ajouté. Comme pour tous les autres agents, **seul le Bourgmestre peut créer le compte et lui attribuer ce rôle**.

Le registre préchargé cite quelques structures documentées de la Zone de santé de Kasa-Vubu, notamment Mama Pamela Delargy, CASOP, SONAL, Chrisco et Sainte-Marie. Il est explicitement **non exhaustif** et doit être consolidé avec la Zone de santé / DPS Kinshasa avant usage officiel.

Références de démarrage :
- OMS Afrique, Centre hospitalier d'État Mama Pamela Delargy : https://www.afro.who.int/fr/news/coronavirus-en-rdc-des-latrines-et-incinerateurs-modernes-fournis-par-loms-dans-les-centres?country=975&name=Democratic+Republic+of+Congo
- CPLT Kinshasa / cartographie sanitaire : https://actiondamienrdcongo.org/hosp_map
- Rapport ASSK : https://usi.umontreal.ca/fileadmin/usi/Documents/ASSK_Rapport_de_capitalisation_Mars_2024__1_.pdf

## Démarrage

```bash
cp apps/web/.env.example apps/web/.env.local
npm install
npm run dev
```

Ouvrir `http://localhost:3000`.

### Compte local de démonstration

- e-mail : `bourgmestre@demo.ecommune.cd`
- mot de passe : `Ecommune-2026!`
- commune : `Commune de Kasa-Vubu`

Ces identifiants sont strictement destinés au prototype local. En production, définir `AUTH_SECRET`, désactiver `DEMO_MODE` et raccorder un fournisseur d'identité professionnel.

## Carte

La carte démarre désormais sur **Kasa-Vubu**, utilise Leaflet/OpenStreetMap et expose des couches pour la limite communale, les quartiers, les équipements, les structures sanitaires, les projets publics et les parcelles. La relation OpenStreetMap de Kasa-Vubu utilisée comme référentiel de travail est **388094**. La recherche géographique passe par Nominatim côté serveur.

Le fond OpenStreetMap ne vaut pas, à lui seul, preuve de limite administrative officielle. La limite communale et les géométries parcellaires opposables doivent être validées puis importées en GeoJSON depuis une source administrative compétente. Le module `Parcelles & domaine communal` pré-valide les FeatureCollections Polygon/MultiPolygon sans inventer de parcelles lorsque la donnée officielle est absente.

## Fatshimétrie sourcée — Kasa-Vubu

Le prototype ne contient plus de pourcentages fictifs pour les projets publics. Quatre fiches sourcées sont préchargées :

- construction du bâtiment administratif du SG aux Sports et Loisirs à Kasa-Vubu, inscrite au **PIP 2026-2028** pour **6 694 172 125 CDF** en 2026 ;
- modernisation du **Pont Victoire** ;
- réhabilitation de la **route Gambela** entre l'Enseignement et le rond-point Force ;
- modernisation de l'**avenue Éthiopie** dans le cadre de « Kinshasa Ezo Bonga ».

La règle de produit est volontairement stricte : une source qui prouve la programmation ou l'existence d'un chantier ne suffit pas à inventer son pourcentage d'avancement. `physical_progress` et `financial_progress` restent `NULL` tant qu'une preuve quantitative datée n'est pas enregistrée.

Sources de démarrage :
- Ministère du Plan — PIP 2026-2028 : https://plan.gouv.cd/wp-content/uploads/2025/10/PIP-2026-2028.pdf
- ITPAFUH Kinshasa — Pont Victoire : https://kinshasaitpafuh.cd/2026/04/13/kinshasa-ezo-bonga-le-pont-victoire-se-refait-progressivement-une-beaute/
- ITPAFUH Kinshasa — Gambela / Éthiopie : https://kinshasaitpafuh.cd/2026/01/13/kinshasa_infrastructures-lelu-de-la-commune-de-kasa-vubu-andre-nkongolo-nkongolo-satisfait-des-travaux-de-voirie-realises-dans-sa-circonscription/
- ACP — avenue Éthiopie, 22 août 2026 : https://acp.cd/urbain/programme-kinshasa-ezo-bonga-les-travaux-de-modernisation-de-lavenue-ethiopie-en-cours/

## Cadre juridique

Le modèle communal s'appuie notamment sur la **Loi organique n°08/016 du 7 octobre 2008**. Son article 50 attribue au Conseil communal des matières d'intérêt communal comprenant notamment l'organisation d'un service de secours et de premiers soins, un service d'hygiène, les campagnes de vaccination, la lutte contre les maladies endémiques ainsi que la création/organisation de services et établissements publics communaux dans le respect de la législation nationale.

Cela justifie un module de pilotage sanitaire de proximité, sans donner à e-Commune le pouvoir de contourner les agréments, normes ou compétences du secteur de la santé.

## Documents de conception

- `docs/cadre-juridique-et-conformite.md`
- `docs/architecture-rbac.md`
- `docs/referentiel-territorial-kasa-vubu.md`

## Références principales

- Loi organique n°08/016 du 7 octobre 2008 — ETD et communes : https://www.leganet.cd/Legislation/Droit%20Public/Administration.ter/L.08.16.17.10.2008.htm
- Loi organique n°10/011 du 18 mai 2010 — subdivisions territoriales : https://www.leganet.be/Legislation/Droit%20Public/Administration.ter/L.10.011.18.05.2010.htm
- Loi n°11/011 du 13 juillet 2011 — finances publiques : https://mail.leganet.cd/Legislation/Droit%20Public/compta/Loi.11.011.13.07.2011.htm
- Loi n°16/013 du 15 juillet 2016 — agents de carrière : https://www.leganet.cd/Legislation/JO/2016/JOS.03.08.2016.pdf
- Ordonnance-loi n°18/004 du 13 mars 2018 — nomenclature ETD : https://www.leganet.cd/Legislation/JO/2018/JOS.23.04.2018.II.pdf
- Ordonnance-loi n°23/010 du 13 mars 2023 — Code du numérique : https://are.gouv.cd/wp-content/uploads/2023/05/04042023-ORDONNANCE-LOI-23-010-DU-13-MARS-PORTANT-CODE-DU-NUMERIQUE_compressed.pdf
- Présidence — modernisation / charte graphique : https://www.presidence.cd/actualite-detail/actualite/presidence_de_la_republique_la_modernisation_du_cabinet_presidentiel_prend_forme
- Présidence — symboles : https://presidence.cd/symboles-de-la-republique

## Avertissement de mise en production

Ce dépôt fournit une architecture et un prototype fonctionnel de contrôle d'accès, pas une certification de conformité. Avant usage administratif réel : validation juridique congolaise, validation de la Zone de santé/DPS pour le registre sanitaire, vérification des actes et taux locaux, formalités du Code du numérique, sécurité offensive/défensive, RLS PostgreSQL, identité professionnelle, MFA, sauvegardes, hébergement approuvé et validation des limites administratives.

## V4 — Parcelles, perception numérique et marchés/étalages

Cette version ajoute trois workflows opérationnels côté interface, avec persistance locale de démonstration en attendant le branchement PostgreSQL :

- **Numérisation des parcelles** : fiche parcellaire, quartier, avenue, usage, occupant, propriétaire déclaré, source documentaire, superficie déclarée, sommets GPS, export GeoJSON et import GeoJSON. La géométrie reste distincte de la preuve juridique de propriété.
- **Perception numérique** : catalogue fiscal versionné, validation explicite de la base légale/acte de mise en œuvre, liquidation, canal de paiement (caisse/banque/Mobile Money), référence externe, quittance unique, impression, rapprochement et export CSV.
- **Marchés & étalages** : marché, code d'emplacement, zone, occupant, activité, période d'occupation, référence fiscale, statut, situation de paiement, inspections et export CSV. Une fiche d'étalage peut ouvrir directement le module Recettes avec le contribuable et la référence préremplis.
- **RBAC** : nouveau rôle `MARCHES` pour les agents chargés des marchés et étalages. Le Bourgmestre demeure le seul utilisateur habilité à créer les comptes agents et attribuer ce rôle.
- **Boutons** : les commandes qui étaient purement décoratives ont été reliées à des routes, formulaires, exports ou fenêtres d'action explicites.

### Important pour la mise en production

La persistance `localStorage` de ces nouveaux workflows sert uniquement à la démonstration interactive. Le schéma PostgreSQL contient désormais les tables/colonnes nécessaires (`parcels`, `markets`, `market_stalls`, `market_stall_inspections`, `revenue_payments`, `revenue_receipts`). Avant usage administratif réel, remplacer la persistance locale par des Route Handlers/Server Actions transactionnels connectés à PostgreSQL, activer les politiques RLS par `commune_id`, journaliser chaque mutation et intégrer les opérateurs de paiement autorisés.

## V5 — PostgreSQL opérationnel (parcelles, recettes, étalages, audit)

La V5 remplace la persistance `localStorage` des trois workflows prioritaires par PostgreSQL :

- numérisation des parcelles et import GeoJSON ;
- catalogue fiscal, perception, paiement, quittance et rapprochement ;
- marchés/étalages, état d'occupation, suivi de paiement et inspections ;
- comptes agents créés par le Bourgmestre ;
- journal d'audit PostgreSQL attribué à l'agent connecté et à sa commune.

### Démarrage neuf

Sous Windows :

1. installer Node.js 20.9+ ;
2. installer PostgreSQL 16 ou plus récent pour Windows ;
3. double-cliquer sur `E-COMMUNE.bat`.

Le lanceur crée automatiquement `ecommune_kasavubu`, exécute `database/schema.sql`, charge `database/pilot-kasa-vubu.sql`, applique les migrations, puis démarre Next.js. Le compte Bourgmestre de démonstration est créé dans PostgreSQL afin que la session utilise un véritable UUID de compte et de commune.

### Mise à niveau depuis la V4

Pour une base V4 déjà existante, appliquer `database/migrations/005_postgresql_persistence.sql`. Sous Windows V8, le lanceur applique automatiquement les migrations présentes dans `database/migrations`. Pour repartir de zéro sur un poste pilote, utiliser `REINITIALISER-BASE-E-COMMUNE.bat` après sauvegarde des données utiles.

### Garanties techniques de cette version

- toutes les requêtes métiers sont filtrées par `commune_id` issu de la session serveur ;
- une perception est enregistrée dans une transaction unique : liquidation + paiement + quittance + audit ;
- une référence externe de paiement ne peut pas être enregistrée deux fois pour le même canal et la même commune ;
- le code d'un étalage peut servir de référence contribuable et son état de paiement est mis à jour après perception ;
- les numérisations parcellaires gardent leur source et restent `TO_VALIDATE` jusqu'à validation administrative ;
- la création et la suspension des comptes agents sont auditées et restent réservées au Bourgmestre.

> La V5 est un socle technique de pilote. Avant production administrative, ajouter notamment une authentification forte réelle, la politique de sauvegarde/restauration, les politiques RLS PostgreSQL, la gestion documentaire probante, la politique de conservation et la revue juridique finale des traitements et des références fiscales.

## V6 — Export Excel, CSV, PDF et JSON

Les registres PostgreSQL principaux disposent maintenant d'un menu **Exporter / télécharger**. Les formats disponibles sont Excel (`.xlsx`), CSV, PDF et JSON ; le registre parcellaire conserve en plus son export GeoJSON. Les quittances peuvent également être téléchargées individuellement. Chaque export est inscrit dans le journal d'audit (`DATA_EXPORT`) avec l'agent, le format, le volume et le périmètre exporté.

Voir `docs/v6-exports-et-telechargements.md`.

## V8 — Démarrage Windows Node.js + PostgreSQL local, sans Docker

La version Windows fonctionne maintenant sans Docker et sans conteneur. PostgreSQL est installé directement sur Windows et fonctionne comme un service local normal.

### Prérequis

1. **Node.js 20.9+** ;
2. **PostgreSQL 16 ou plus récent pour Windows**, avec `psql.exe` ;
3. extraire complètement le ZIP.

### Démarrage

Double-cliquer simplement sur **`E-COMMUNE.bat`**.

Au premier lancement, le système :

- vérifie Node.js et npm ;
- détecte PostgreSQL même lorsque `psql.exe` n'est pas dans le PATH ;
- tente de démarrer le service PostgreSQL Windows s'il est arrêté ;
- demande les identifiants PostgreSQL locaux ;
- crée automatiquement la base `ecommune_kasavubu` ;
- applique le schéma, le pilote Kasa-Vubu et les migrations ;
- configure `DATABASE_URL` ;
- installe les dépendances npm si nécessaire ;
- lance Next.js avec Node.js ;
- ouvre automatiquement `http://localhost:3000`.

Fichiers fournis :

- `E-COMMUNE.bat` — raccourci de lancement ;
- `DEMARRER-E-COMMUNE.bat` — lanceur complet ;
- `CONFIGURER-POSTGRESQL.bat` — change serveur/port/utilisateur/mot de passe PostgreSQL ;
- `VERIFIER-POSTGRESQL.bat` — teste la connexion ;
- `INSTALLER-E-COMMUNE-WINDOWS.bat` — préparation initiale ;
- `REINITIALISER-BASE-E-COMMUNE.bat` — recrée la base locale (destructif) ;
- `WINDOWS-LISEZ-MOI.txt` — guide rapide.

Le secret PostgreSQL local est conservé dans `.ecommune-postgresql.env`, fichier exclu de Git. Pour arrêter l'application web, utiliser **Ctrl+C** dans la fenêtre Node.js ; il n'est pas nécessaire d'arrêter le service PostgreSQL.


## V9 — Correctif de démarrage Windows

La V9 corrige le lanceur Windows :

- le navigateur est maintenant ouvert **en arrière-plan après détection du serveur**, sans bloquer le démarrage de Node.js ;
- le lanceur appelle directement le workspace Next.js avec les bons arguments ;
- Node.js **20.9+** est accepté ;
- PostgreSQL ne bloque plus l'ouverture de l'interface : sans base configurée, le tableau de bord démarre en **mode démonstration** ;
- une fois PostgreSQL configuré via `CONFIGURER-POSTGRESQL.bat`, les workflows persistants utilisent la base locale ;
- les erreurs de démarrage sont enregistrées dans `logs\demarrage.log`.

Démarrage recommandé : double-cliquer sur `E-COMMUNE.bat`.
