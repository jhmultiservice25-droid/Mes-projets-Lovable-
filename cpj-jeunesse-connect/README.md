# Jeunesse Connect — CPJ

Sauvegarde privée du projet Jeunesse Connect / Conseil Provincial de la Jeunesse.

## Production
- Site public : https://cpj-jeunesse-connect.vercel.app/
- Frontend : Vercel, projet `cpj-jeunesse-connect`
- Backend / données : Supabase, projet `xpxvadpgsrfjqbtdmgcw`
- API principale : Edge Function `cpj-api`
- Espace membre : Edge Function `member-api`

## Fatshimétrie
La phase pilote concerne Kinshasa. La carte publique n'affiche pas la RDC entière : elle représente uniquement la province concernée et sa structure territoriale.

Kinshasa étant une ville-province, la déclinaison territoriale utilise ses 24 communes. Pour les autres provinces, le moteur devra utiliser les villes et territoires de la province concernée.

Les projets sont rattachés à une unité territoriale et l'interface permet :
- survol/clic d'une commune, ville ou territoire ;
- affichage des projets correspondants ;
- progression et graphiques ;
- commentaires citoyens ;
- réponses, emojis et photos ;
- ajout/modification des projets depuis le portail CPJ.

## Sécurité
Aucun mot de passe, hash d'administration, `service_role` Supabase, clé privée ou secret de production ne doit être commité dans ce dépôt.

## Structure
- `frontend/fatshimetrie.html` : page Fatshimétrie autonome et légère
- `vercel.json` : routage Vercel
- `package.json` : build statique
- `.env.example` : références non secrètes
- `docs/ARCHITECTURE.md` : architecture et règles d'accès
