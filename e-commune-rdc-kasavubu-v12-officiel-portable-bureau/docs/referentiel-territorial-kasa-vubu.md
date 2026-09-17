# Référentiel territorial Kasa-Vubu — pilote e-Commune

## Objet

Ce document décrit le niveau de confiance des données territoriales embarquées dans le pilote. Il sépare volontairement :

1. la donnée publiée par la commune ou une administration publique ;
2. la donnée sectorielle publiée par un service public/partenaire reconnu ;
3. le référentiel géographique ouvert utile au repérage ;
4. la donnée qui doit encore être validée avant usage administratif opposable.

## Identité territoriale de démarrage

- Commune : Kasa-Vubu, Ville-Province de Kinshasa, district de Funa.
- Population affichée par le portail communal au moment de la recherche : 81 703 habitants.
- Superficie affichée par le portail communal : 5,04 km².
- Nombre de quartiers : 7.
- Relation OpenStreetMap utilisée pour le repérage : 388094.
- Adresse communale publiée : Avenue Sport, Kasa-Vubu, Kinshasa.

Sources :
- https://www.kasa-vubu.cd/
- https://www.kasa-vubu.cd/informations-municipales/
- https://www.kasa-vubu.cd/contact/
- https://www.openstreetmap.org/relation/388094

## Quartiers

Le pilote reprend : Anciens Combattants, Assossa, Katanga, Lubumbashi, Lodja, O.N.L. et Salongo. Les noms des chefs et adjoints présents dans le code proviennent du portail communal et doivent être revérifiés à chaque mise en production.

## Voirie

Le fichier `apps/web/src/lib/territory-data.ts` contient un premier référentiel de voies par quartier. Il provient du graphe OpenStreetMap exposé via OpenAlfa. Ce jeu facilite la recherche, le rattachement des dossiers et le prototype cartographique ; il ne remplace pas le registre viaire officiel.

Référence : https://dr-congo-streets.openalfa.com/kasa-vubu

## Équipements

Le pilote distingue les équipements dont la source est officielle/sectorielle et ceux seulement repérés dans un référentiel ouvert. L'inventaire contient notamment :

- Maison communale de Kasa-Vubu ;
- Hôpital du Cinquantenaire ;
- Lycée Motema Mpiko ;
- Lycée 2 et 3 Kasa-Vubu ;
- Université Catholique Cardinal Malula ;
- Athénée de la Victoire ;
- Complexe Scolaire KANDA ;
- École Armée du Salut ;
- Lycée Madame de Sévigné ;
- Lycée Toyokana ;
- Institut national pilote d'enseignement des sciences de santé ;
- Bibliothèque Miezi ;
- Carrefour des Jeunes ;
- Marché Gambela.

Les établissements issus d'OpenStreetMap/OpenAlfa restent `REFERENTIEL_OUVERT` jusqu'à confirmation communale ou sectorielle.

## Parcelles

Aucune parcelle fictive n'est préchargée. Le module `Parcelles & domaine communal` accepte une FeatureCollection GeoJSON de Polygon/MultiPolygon et effectue une pré-validation structurelle. En production, l'import doit être persisté dans PostgreSQL/PostGIS avec : source, date de validité, auteur de l'import, niveau de validation, identifiant parcellaire, journal d'audit et contrôle des droits.

## Carte

La carte utilise Leaflet et des tuiles OpenStreetMap. La route `/api/map/boundaries` interroge Overpass pour la relation 388094 et tente de charger les limites de quartiers disponibles. Une défaillance du service Overpass ne doit pas bloquer le reste du tableau de bord.

## Projets publics / Fatshimétrie

Les projets préchargés sont sourcés à partir du PIP national, du ministère provincial ITPAFUH de Kinshasa et de l'ACP lorsqu'elle relaie une source de l'Hôtel de Ville. Une preuve de programmation ou une actualité de chantier n'est pas transformée automatiquement en pourcentage d'avancement.

## Règle de gouvernance de la donnée

Aucune donnée ouverte ne devient « officielle » par simple import. Le workflow cible est :

`SOURCE IDENTIFIÉE -> IMPORT -> CONTRÔLE TECHNIQUE -> VALIDATION SERVICE COMPÉTENT -> VALIDATION ADMINISTRATIVE -> PUBLICATION INTERNE`.

Pour une donnée sensible (foncier, état civil, santé, recettes), le journal d'audit doit conserver l'auteur, la date, l'objet modifié et la justification.
