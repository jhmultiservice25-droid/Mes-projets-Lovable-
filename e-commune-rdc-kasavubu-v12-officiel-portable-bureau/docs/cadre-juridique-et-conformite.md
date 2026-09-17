# Cadre juridique et conformité — e-Commune RDC

> Document d'architecture et de conformité. Il ne remplace pas un avis juridique, un acte administratif, une décision budgétaire ni une validation de l'autorité compétente.

## 1. Gouvernance d'une commune

Le modèle applicatif s'appuie notamment sur la **Loi organique n° 08/016 du 7 octobre 2008** portant composition, organisation et fonctionnement des entités territoriales décentralisées et leurs rapports avec l'État et les provinces, telle que modifiée.

Principes traduits dans e-Commune :

- la commune est une entité territoriale décentralisée dotée de la personnalité juridique et de l'autonomie de gestion ;
- ses organes sont le **Conseil communal** et le **Collège exécutif communal** ;
- le Conseil communal est l'organe délibérant ;
- le Collège exécutif communal est l'organe de gestion et d'exécution ;
- le Bourgmestre est l'autorité de la commune et le chef du Collège exécutif ;
- le Bourgmestre est notamment responsable de l'administration, officier de l'état civil et ordonnateur principal du budget ;
- l'administration communale comprend les services propres à la commune sous la direction du Bourgmestre ainsi que les services du pouvoir central qui y sont affectés.

Source : https://www.leganet.cd/Legislation/Droit%20Public/Administration.ter/L.08.16.17.10.2008.htm

### Quartiers et avenues

La **Loi organique n° 10/011 du 18 mai 2010** organise les subdivisions territoriales. Le quartier est l'échelon administratif de base de la commune ; il comprend des avenues et/ou rues et est dirigé par un Chef de quartier assisté d'un adjoint, sous l'autorité du Bourgmestre. Le modèle de données distingue donc `communes`, `quartiers` et `avenues`.

Source : https://www.leganet.be/Legislation/Droit%20Public/Administration.ter/L.10.011.18.05.2010.htm

## 2. Habilitations numériques et agents

La règle produit demandée est stricte :

- le **Bourgmestre voit toutes les données et tous les modules de sa commune** ;
- le **Bourgmestre est le seul rôle applicatif pouvant créer un compte agent, le suspendre ou lui attribuer un rôle** ;
- un agent ne peut jamais être rattaché depuis l'interface à une autre commune que celle de la session du Bourgmestre ;
- toute attribution, suspension ou modification d'accès doit être journalisée.

Cette règle concerne les **habilitations informatiques**. Elle ne signifie pas que la plateforme crée juridiquement un emploi ou nomme administrativement un agent. Le compte doit conserver une référence à l'acte de nomination, d'affectation, à la décision ou à toute pièce administrative appropriée.

Pour les agents de carrière, consulter notamment la **Loi n°16/013 du 15 juillet 2016 portant statut des agents de carrière des services publics de l'État**.

Source : https://www.leganet.cd/Legislation/JO/2016/JOS.03.08.2016.pdf

## 3. Finances publiques et recettes

La **Loi n°11/011 du 13 juillet 2011 relative aux finances publiques** couvre les budgets des provinces et des entités territoriales décentralisées, la gestion, l'exécution et le contrôle des finances publiques.

Source : https://mail.leganet.cd/Legislation/Droit%20Public/compta/Loi.11.011.13.07.2011.htm

L'**Ordonnance-loi n°18/004 du 13 mars 2018** fixe la nomenclature des impôts, droits, taxes et redevances de la province et de l'ETD ainsi que les modalités de répartition. Elle prévoit que les règles de perception sont fixées par édit ou décision des organes délibérants conformément à la législation nationale.

Source : https://www.leganet.cd/Legislation/JO/2018/JOS.23.04.2018.II.pdf

Conséquence technique : e-Commune ne doit **jamais coder en dur un taux comme s'il était juridiquement permanent**. Le catalogue fiscal doit conserver : base légale, acte de mise en œuvre, date d'effet, date de fin éventuelle, méthode de calcul et version.

## 4. Code du numérique

Le projet prend comme référence l'**Ordonnance-loi n°23/010 du 13 mars 2023 portant Code du numérique**.

Source officielle/gouvernementale : https://are.gouv.cd/wp-content/uploads/2023/05/04042023-ORDONNANCE-LOI-23-010-DU-13-MARS-PORTANT-CODE-DU-NUMERIQUE_compressed.pdf

Axes traduits dans l'architecture :

- dématérialisation des échanges administratifs et guichet numérique ;
- archivage électronique et intégrité des documents ;
- écrits, signatures, cachets et horodatage électroniques lorsque juridiquement applicables ;
- sécurité, confidentialité et traçabilité ;
- protection des données personnelles : finalité, licéité, transparence, minimisation, durée de conservation, droits des personnes et encadrement des transferts ;
- registre interne des traitements ;
- étude d'impact pour les traitements à risque élevé ;
- inventaire des formalités d'autorisation, déclaration ou homologation applicables aux services numériques publics.

Les modalités administratives d'application du Code évoluent. Avant mise en production, les procédures actuellement exigées (autorisation, déclaration, homologation, protection des données, cybersécurité, hébergement, certification électronique) doivent être **revalidées à la date du déploiement auprès des autorités compétentes et par conseil juridique congolais**.

### Mesures d’application récentes à surveiller

Le Ministère de l’Économie numérique a annoncé en mars 2026 deux arrêtés du 11 mars 2026 opérationnalisant notamment les régimes d’**autorisation** et de **déclaration** des activités et services numériques. L’arrêté relatif aux autorisations vise entre autres certains services d’hébergement d’applications, services de confiance et plateformes numériques. Une analyse de qualification doit être faite pour déterminer si le déploiement concret d’e-Commune, son hébergeur ou ses prestataires entrent dans un régime donné.

Source : https://economienumerique.gouv.cd/

En matière de données personnelles, des procédures ont également été publiées/annoncées dans le cadre de l’exercice provisoire de certaines fonctions de protection des données. Leur base juridique et certaines modalités font l’objet de discussions doctrinales. e-Commune ne doit donc pas figer dans le code des frais, délais ou formulaires comme s’ils étaient immuables : ils doivent être gérés dans un registre de conformité et vérifiés au moment du déploiement.

## 5. Identité visuelle de l'État

La Présidence a annoncé en 2023 une nouvelle charte graphique et une logique d'identité visuelle unique / « Marque État ». Des comptes rendus officiels insistent également sur l'usage de canaux numériques institutionnels et d'adresses professionnelles.

Sources :
- https://www.presidence.cd/actualite-detail/actualite/presidence_de_la_republique_la_modernisation_du_cabinet_presidentiel_prend_forme
- https://www.presidence.cd/mentions_legales

Le présent prototype **ne copie pas les éléments graphiques propriétaires du site de la Présidence**. Ses mentions légales indiquent que les graphismes et ressources multimédias ne peuvent être repris sans autorisation. L'interface reprend donc seulement une direction institutionnelle inspirée des symboles nationaux : bleu ciel, jaune, rouge, blanc et bleu profond, avec la police Arial.

Les couleurs nationales sont décrites par la Présidence : bleu (paix/espoir), rouge (sang des martyrs), jaune (richesse), étoile jaune (unité/avenir).

Source : https://www.presidence.cd/detail-symbole/1

Les armoiries nationales sont utilisées **sans altération**. La Présidence décrit l'emblème comme une tête de léopard, une défense d'éléphant, une lance et la devise « Justice, Paix, Travail ».

Source : https://www.presidence.cd/detail-symbole/2

## 6. Fatshimétrie locale

Le module « Fatshimétrie locale » ne doit pas être un tableau politique ou promotionnel. Sa fonction est de rendre vérifiable l'exécution des projets publics dans la commune.

Chaque projet doit stocker :

- identifiant PIP/programme ou autre référence officielle ;
- autorité contractante ;
- source de financement ;
- budget et décaissements ;
- calendrier prévu/réel ;
- avancement physique et financier ;
- géolocalisation ;
- jalons ;
- pièces et liens de preuve ;
- date de dernière vérification ;
- validateur ;
- statut « preuve manquante / à vérifier / vérifié ».

Les valeurs sans source doivent apparaître comme **non vérifiées**. Les données actuellement livrées dans le prototype sont explicitement marquées « démonstration ».

## 7. Avant mise en production

Minimum recommandé :

1. audit juridique RDC du périmètre exact de la commune pilote ;
2. validation des actes locaux/provinciaux et du catalogue fiscal ;
3. connexion à l'annuaire ou à l'identité professionnelle officielle ;
4. MFA obligatoire pour les profils sensibles ;
5. chiffrement des secrets et données sensibles ;
6. sauvegardes chiffrées et plan de continuité ;
7. politiques PostgreSQL RLS par `commune_id` ;
8. journal d'audit append-only / export scellé ;
9. registre des traitements et analyse d'impact ;
10. validation des formalités du Code du numérique et de ses mesures d'application ;
11. limites géographiques validées par une source administrative compétente ;
12. hébergement, domaines et e-mails institutionnels approuvés.

## 8. Pilote Kasa-Vubu et référentiel territorial

Le pilote est configuré sur la **Commune de Kasa-Vubu**, Ville-Province de Kinshasa, district de Funa. Le portail communal consulté en 2026 publie sept quartiers : Anciens Combattants, Assossa, Katanga, Lubumbashi, Lodja, O.N.L. et Salongo, ainsi que les chefs et adjoints correspondants.

Sources :
- https://www.kasa-vubu.cd/informations-municipales/
- https://www.kasa-vubu.cd/liste-des-quartiers-chefs-de-quartiers-et-eurs-adjoints/

Le référentiel est chargé dans `apps/web/src/lib/pilot-data.ts` et `database/pilot-kasa-vubu.sql`. Pour la production, l'administration doit confirmer les dénominations, titulaires, limites et géométries officielles.

## 9. Structures sanitaires et santé de proximité

L'article 50 de la Loi organique n°08/016 confie au Conseil communal plusieurs matières de proximité ayant une dimension sanitaire : organisation et gestion d'un service de secours et de premiers soins ; service d'hygiène ; assainissement ; campagne de vaccination ; lutte contre le VIH/SIDA et les maladies endémiques ; création/organisation de services publics et établissements publics communaux dans le respect de la législation nationale.

Conséquences d'architecture :

- le registre distingue **structure existante** et **structure créée par la commune** ;
- une structure créée par la commune conserve la référence de l'acte communal, du financement et, le cas échéant, du projet Fatshimétrie ;
- une référence d'autorisation/agrément sanitaire est requise avant de la considérer comme opérationnelle dans l'application ;
- les inspections sanitaires et mesures correctives sont historisées ;
- le module ne prétend pas transférer à la commune les compétences réglementaires nationales/provinciales de santé ;
- le registre de départ est non exhaustif et doit être consolidé avec la Zone de santé de Kasa-Vubu et la DPS Kinshasa.

Quelques structures ont été introduites uniquement comme référentiel de démarrage à partir de sources publiques/sectorielles : Centre hospitalier d'État Mama Pamela Delargy, Centre de santé de référence CASOP, Centre médical SONAL, Centre de santé Chrisco et Centre de santé Sainte-Marie.

Sources de départ :
- OMS Afrique : https://www.afro.who.int/fr/news/coronavirus-en-rdc-des-latrines-et-incinerateurs-modernes-fournis-par-loms-dans-les-centres?country=975&name=Democratic+Republic+of+Congo
- CPLT Kinshasa / Action Damien : https://actiondamienrdcongo.org/hosp_map
- Rapport ASSK : https://usi.umontreal.ca/fileadmin/usi/Documents/ASSK_Rapport_de_capitalisation_Mars_2024__1_.pdf
