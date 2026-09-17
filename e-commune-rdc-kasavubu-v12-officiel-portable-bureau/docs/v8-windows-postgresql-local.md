# V8 — Windows sans Docker

Cette variante lance e-Commune avec **Node.js/Next.js** et un **PostgreSQL installé directement sous Windows**.

## Flux de démarrage

`E-COMMUNE.bat` appelle `DEMARRER-E-COMMUNE.bat`, qui vérifie Node.js, appelle `scripts/windows/Postgres-ECommune.ps1`, initialise la base `ecommune_kasavubu` si nécessaire, installe les dépendances npm puis lance `npm run dev`.

Le helper PostgreSQL :

- détecte `psql.exe` dans le `PATH` ou sous `C:\Program Files\PostgreSQL\*\bin` ;
- tente de démarrer un service Windows `postgresql*` lorsqu'il est arrêté ;
- demande la configuration locale lors du premier lancement ;
- crée la base `ecommune_kasavubu` ;
- applique `database/schema.sql`, le pilote Kasa-Vubu et les migrations ;
- écrit `DATABASE_URL` dans `.env` et `apps/web/.env.local`.

Le fichier `.ecommune-postgresql.env` contient le secret de connexion local. Il est exclu de Git et ne doit pas être transmis.

## Réinitialisation

`REINITIALISER-BASE-E-COMMUNE.bat` demande une confirmation explicite, termine les connexions à la base pilote, supprime la base puis la recrée avec le schéma courant.
