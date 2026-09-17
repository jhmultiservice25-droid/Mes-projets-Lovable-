# V6 — Exports et téléchargements

Cette version ajoute un mécanisme d'export commun aux registres opérationnels d'e-Commune Kasa-Vubu.

## Formats

- Excel `.xlsx` : classeur avec feuille `Informations` (registre, commune, agent, date, périmètre, nombre de lignes) et feuille `Données`.
- CSV `.csv` : UTF-8 avec BOM, séparateur `;`, adapté à l'ouverture sous Excel en environnement francophone.
- PDF `.pdf` : état imprimable avec en-tête de registre et métadonnées de génération.
- JSON `.json` : objet structuré contenant les métadonnées et les lignes exportées.
- GeoJSON `.geojson` : conservé spécifiquement pour le registre parcellaire.

## Registres couverts

- Perceptions et quittances
- Catalogue fiscal
- Marchés et étalages
- Parcelles
- Structures sanitaires
- Fatshimétrie locale
- Personnel / agents
- Journal d'audit

Les exports sur les écrans filtrés portent sur la vue filtrée. Les noms de fichiers sont horodatés.

## Traçabilité

Avant la génération du fichier, le client appelle `POST /api/exports/log`. L'API écrit un événement `DATA_EXPORT` dans `audit_logs` avec :

- agent connecté ;
- commune de la session ;
- registre exporté ;
- format ;
- nombre de lignes ;
- périmètre / filtre ;
- horodatage ;
- IP et user-agent lorsque disponibles.

La génération locale du fichier évite d'écrire une copie temporaire des données exportées sur le serveur applicatif.

## Dépendances ajoutées

- `xlsx`
- `jspdf`
- `jspdf-autotable`

Après extraction de l'archive :

```bash
npm install
npm run dev
```
