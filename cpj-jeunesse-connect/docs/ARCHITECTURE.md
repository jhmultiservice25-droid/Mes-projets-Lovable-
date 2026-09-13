# Architecture Jeunesse Connect / CPJ

## Hébergement
- Frontend public : Vercel (`cpj-jeunesse-connect`)
- Base de données : Supabase PostgreSQL (`xpxvadpgsrfjqbtdmgcw`)
- API métier : Supabase Edge Function `cpj-api`
- Authentification Espace Membre : Supabase Edge Function `member-api`

## Rôles institutionnels
- `super_admin` : pilotage central des 26 CPJ et gestion des accès provinciaux.
- `cpj_admin` : administration de la province attribuée.
- `committee` : compte membre du comité, avec permissions limitées.

## Fatshimétrie
Chaque CPJ ne publie que la carte de sa province.

### Kinshasa
Kinshasa est une ville-province ; la carte territoriale utilise donc les 24 communes :
Bandalungwa, Barumbu, Bumbu, Gombe, Kalamu, Kasa-Vubu, Kimbanseke, Kinshasa, Kintambo, Kisenso, Lemba, Limete, Lingwala, Makala, Maluku, Masina, Matete, Mont-Ngafula, N'djili, N'sele, Ngaba, Ngaliema, Ngiri-Ngiri, Selembao.

### Autres provinces
Pour les autres provinces, la carte doit être alimentée avec les unités administratives pertinentes :
- villes ;
- territoires ;
- éventuellement communes/secteurs/chefferies pour un niveau de détail supplémentaire.

Chaque projet doit comporter au minimum : province, unité territoriale, coordonnées, secteur, avancement, description et statut de publication.

## Participation citoyenne Fatshimétrie
- consultation publique ;
- commentaires par projet ;
- réponses ;
- emojis/réactions ;
- photo citoyenne du projet ;
- pas de route permettant au CPJ de supprimer discrétionnairement les commentaires publics.

## Données cartographiques
Pour les limites administratives, utiliser une source publique/autoritative et conserver l'attribution de la source dans les métadonnées. Le frontend ne doit pas dépendre d'un CDN cartographique bloquant pour afficher le reste du portail.

## Secrets
Les secrets Supabase/Vercel et les mots de passe administrateurs restent hors GitHub.
