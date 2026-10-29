"use client";

import Link from "next/link";

const quarters = [
  { name: "Anciens Combattants", chief: "SHONGO LOLA François", deputy: "LUSAMAKE LUAKANYONGA", population: "KALUBI MBIYE Baudouin" },
  { name: "Assossa", chief: "IFOMA BONDJA Pauline", deputy: "NZUZI NDONGALA", population: "MUKAWU MAMBENGA" },
  { name: "Katanga", chief: "MINKULU OTSHUL AMBEL", deputy: "MOTINGIYA BOSENGELE", population: "EWELE BALILIWE" },
  { name: "Lubumbashi", chief: "FOLO LISONGI", deputy: "MANGALA TABALA", population: "MAMBUENI DIABANZA" },
  { name: "Lodja", chief: "MWAMBA KABAMBA Berdam", deputy: "MBUKU KIBAKA Georges", population: "OMBA NINGA Albertine" },
  { name: "O.N.L.", chief: "LELO NDOSIMAU", deputy: "YASSA BATUKUDIDI", population: "DEMBO KIOSO Nana" },
  { name: "Salongo", chief: "MAKUNDJI NGADY Baudouin", deputy: "LUYENGO YUNGA Fiston", population: "VELA KUTA Alphonsine" },
];

const services = [
  ["Affaires sociales", "Accompagnement social et orientation des personnes vulnérables."],
  ["Agriculture", "Suivi des activités agricoles et accompagnement de proximité."],
  ["Aménagement de la ville", "Organisation de l’espace communal et amélioration du cadre de vie."],
  ["Antenne de la fonction publique", "Relais administratif relatif aux procédures de la fonction publique."],
  ["Archives", "Classement, conservation et consultation des documents administratifs."],
  ["Assainissement", "Salubrité, drainage, évacuation et suivi des opérations d’assainissement."],
  ["Budget et contrôle", "Suivi budgétaire et contrôle interne."],
  ["Commerce extérieur", "Orientation des opérateurs économiques concernés par les échanges extérieurs."],
  ["Comptabilité", "Traitement comptable et suivi des pièces justificatives."],
  ["Contentieux et affaires juridiques", "Suivi des litiges et accompagnement juridique des dossiers."],
  ["Culture et arts", "Encadrement des initiatives culturelles et artistiques."],
  ["Décentralisation", "Suivi des mécanismes de gouvernance locale."],
  ["DERCO", "Encadrement des activités communautaires, ASBL et autorisations."],
  ["Droits humains", "Orientation et sensibilisation sur la protection des droits fondamentaux."],
  ["Économie nationale", "Observation économique locale et orientation des opérateurs."],
  ["Énergie", "Suivi des questions énergétiques et signalements locaux."],
  ["Entrepreneuriat, PME et artisanat", "Orientation des entrepreneurs, PME et artisans."],
  ["Environnement", "Protection du milieu, gestion des déchets et sensibilisation."],
  ["État civil", "Actes de naissance, mariage, décès, attestations et légalisation."],
  ["Genre, famille et enfant", "Accompagnement des familles et protection de l’enfant."],
  ["Habitat", "Questions d’habitat, de logement et d’occupation."],
  ["Hygiène et santé publique", "Prévention sanitaire, hygiène et salubrité."],
  ["Infrastructures et travaux publics", "Suivi des travaux, voiries et équipements publics."],
  ["Industrie", "Orientation des activités industrielles présentes dans la commune."],
  ["Informatique", "Support numérique et modernisation administrative."],
  ["Jeunesse", "Programmes jeunesse, participation citoyenne et initiatives locales."],
  ["Office national de l’emploi", "Orientation vers les dispositifs publics d’emploi."],
  ["Ordonnancement", "Suivi des engagements et opérations financières."],
  ["Pêche et élevage", "Suivi des activités de pêche, d’élevage et des produits animaux."],
  ["Personnel de l’intérieur", "Gestion administrative et suivi du personnel."],
  ["Population", "Attestations de résidence, recensement et orientation administrative."],
  ["Plan", "Planification locale et suivi des priorités."],
  ["Prévoyance sociale", "Orientation sociale et information sur la prévoyance."],
  ["Protection civile", "Prévention des risques et coordination des interventions."],
  ["Secrétariat communal", "Accueil, courrier et coordination documentaire."],
  ["Solidarité et actions humanitaires", "Entraide et accompagnement des situations sensibles."],
  ["Sports et loisirs", "Activités sportives, loisirs et animation locale."],
  ["Tourisme", "Valorisation du patrimoine et de l’identité communale."],
  ["Transport cyclomoteur", "Orientation et encadrement des activités de transport à cyclomoteur."],
  ["Transport et engins sans moteur", "Encadrement des engins sans moteur et de la mobilité locale."],
  ["Urbanisme", "Parcelles, domaine public, permis, conformité et organisation urbaine."],
];

const news = [
  { date: "1 avril 2026", title: "La commune de Kasa-Vubu avec son bourgmestre et Lumumba Vea salue la victoire des Léopards" },
  { date: "1 avril 2026", title: "Qualification des Léopards à la Coupe du monde : message de félicitations" },
  { date: "31 mars 2026", title: "État civil : rappel sur la gratuité de la déclaration de naissance dans le délai légal" },
  { date: "7 mars 2026", title: "Campagne d’assainissement et inspection des avenues" },
];

export default function PortailPublicKasaVubu() {
  return (
    <main className="public-site">
      <header className="public-header">
        <Link href="/portail-public" className="brand"><span className="brand-mark">★</span><span><small>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</small><strong>e-Commune <em>· Kasa-Vubu</em></strong></span></Link>
        <nav aria-label="Navigation publique"><a href="#commune">La commune</a><a href="#services">Services</a><a href="#actualites">Actualités</a><a href="#demarches">Démarches</a><a href="#contact">Contact</a></nav>
        <Link className="admin-link" href="/">Espace administratif ↗</Link>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">VILLE DE KINSHASA · DISTRICT DE FUNA</span>
          <h1>La commune de Kasa-Vubu, <span>au service de ses citoyens.</span></h1>
          <p>Un portail pour découvrir la commune, trouver le service compétent, consulter les informations publiques et préparer vos démarches administratives.</p>
          <div className="hero-actions"><a className="button primary" href="#demarches">Préparer une démarche</a><a className="button secondary" href="#services">Explorer les services</a></div>
          <p className="disclaimer">Portail numérique de démonstration : les dépôts officiels et les références de dossier doivent être raccordés au système de traitement validé par la commune.</p>
        </div>
        <div className="hero-card"><div className="seal">★</div><span>ADMINISTRATION DE PROXIMITÉ</span><h2>Informer · Orienter · Traiter · Rendre compte</h2><p>Une porte d’entrée numérique vers les services communaux et les quartiers.</p><div className="hero-card-bottom"><span>7 quartiers référencés</span><span>Kinshasa · RDC</span></div></div>
      </section>

      <section className="stats" aria-label="Repères communaux"><div><strong>7</strong><span>quartiers référencés</span></div><div><strong>41</strong><span>services listés sur le portail source*</span></div><div><strong>9</strong><span>membres du conseil municipal indiqués</span></div><div><strong>2026</strong><span>référentiel de présentation</span></div></section>
      <p className="small-note">*Le site source affiche des nombres différents selon les pages. Les chiffres administratifs et statistiques doivent être confirmés avant publication définitive.</p>

      <section id="commune" className="section intro-section"><div className="section-heading"><span className="eyebrow">DÉCOUVRIR KASA-VUBU</span><h2>Une commune centrale, historique et proche de ses habitants</h2><p>Kasa-Vubu fait partie des communes de la ville de Kinshasa. Son administration coordonne les services de proximité, le suivi des quartiers et l’orientation des citoyens.</p></div><div className="info-grid"><article><span className="card-icon">⌂</span><h3>Présentation</h3><p>Identité communale, organisation territoriale et informations utiles aux habitants.</p></article><article><span className="card-icon">▤</span><h3>Histoire et patrimoine</h3><p>Repères historiques, mémoire urbaine et patrimoine communal à valoriser.</p></article><article><span className="card-icon">◎</span><h3>Gouvernance locale</h3><p>Exécutif communal, conseil municipal, administration et relais territoriaux.</p></article></div></section>

      <section className="leadership"><div><span className="eyebrow">EXÉCUTIF COMMUNAL</span><h2>Les autorités communales</h2><p>Les noms ci-dessous sont repris du portail consulté et doivent être confirmés par l’administration avant toute mise en production officielle.</p></div><div className="leader-cards"><article><div className="avatar">MP</div><div><span>Bourgmestre</span><h3>MASSOMBO MPOYI Phinnées</h3><p>Coordination administrative et conduite des priorités communales.</p></div></article><article><div className="avatar">ML</div><div><span>Bourgmestre adjointe</span><h3>MOSWALO LIMETEBI Sandra</h3><p>Appui à la coordination des missions de proximité et au suivi administratif.</p></div></article></div></section>

      <section className="section" id="quartiers"><div className="section-heading"><span className="eyebrow">ADMINISTRATION TERRITORIALE</span><h2>Les sept quartiers</h2><p>Le portail source publie les noms de responsables territoriaux. Ces informations personnelles de fonction sont affichées ici à titre de référence et doivent être revalidées avant usage opérationnel.</p></div><div className="quarter-grid">{quarters.map((q) => <article className="quarter-card" key={q.name}><span className="quarter-number">{String(quarters.indexOf(q)+1).padStart(2,"0")}</span><h3>{q.name}</h3><dl><dt>Chef de quartier</dt><dd>{q.chief}</dd><dt>Chef adjoint</dt><dd>{q.deputy}</dd><dt>Chargé de population</dt><dd>{q.population}</dd></dl></article>)}</div></section>

      <section id="services" className="section services-section"><div className="section-heading"><span className="eyebrow">ANNUAIRE ADMINISTRATIF</span><h2>Trouvez le service compétent</h2><p>Consultez les missions principales puis contactez l’administration pour confirmer les pièces, frais éventuels, délais et horaires applicables.</p></div><label className="service-search">⌕ <input id="service-search" type="search" placeholder="Rechercher un service (ex. état civil, urbanisme…)" onChange={(e) => { const q=e.target.value.toLocaleLowerCase("fr"); document.querySelectorAll("[data-service]").forEach((el) => { const node=el as HTMLElement; node.hidden=!node.dataset.service?.includes(q); }); }} /></label><div className="service-grid">{services.map(([name, desc], i) => <article data-service={(name+" "+desc).toLocaleLowerCase("fr")} className="service-card" key={name}><span>{String(i+1).padStart(2,"0")}</span><h3>{name}</h3><p>{desc}</p><a href="#contact">Demander une orientation →</a></article>)}</div></section>

      <section id="demarches" className="section steps-section"><div className="section-heading"><span className="eyebrow">DÉMARCHES ADMINISTRATIVES</span><h2>Préparez votre démarche en quelques étapes</h2><p>Le portail doit guider l’usager sans présenter un dépôt comme officiel tant que le traitement numérique n’est pas raccordé au registre communal.</p></div><div className="steps-grid"><article><span>01</span><h3>Identifier le service</h3><p>État civil, urbanisme, population ou autre service selon votre besoin.</p></article><article><span>02</span><h3>Préparer les informations</h3><p>Vérifiez auprès du service les pièces requises, les frais éventuels et les délais.</p></article><article><span>03</span><h3>Transmettre la demande</h3><p>Utilisez le contact officiel ou rendez-vous au guichet communal jusqu’à l’activation du dépôt numérique.</p></article><article><span>04</span><h3>Suivre la référence</h3><p>Le suivi en ligne sera activé lorsque le portail sera connecté au registre des dossiers.</p></article></div><div className="notice"><strong>Important</strong><p>Ce portail public ne génère pas encore de référence administrative et ne reçoit pas de pièces personnelles. N’envoyez pas de documents d’identité ou d’état civil via une interface de démonstration.</p></div></section>

      <section id="actualites" className="section news-section"><div className="section-heading"><span className="eyebrow">INFORMATIONS PUBLIQUES</span><h2>Actualités et actions communales</h2><p>Sélection de titres publiés sur le portail source. Les liens vers les articles originaux doivent être conservés lors de l’intégration complète.</p></div><div className="news-grid">{news.map((item) => <article key={item.title}><span>{item.date}</span><h3>{item.title}</h3><p>Consulter l’information et vérifier la date ainsi que la source avant de la reprendre dans une communication officielle.</p><a href="https://kasavubu.cd/actualites/" target="_blank" rel="noreferrer">Consulter le portail source ↗</a></article>)}</div><div className="project-strip"><div><span className="eyebrow">ACTION PUBLIQUE</span><h3>Projets, travaux et cadre de vie</h3><p>Un espace destiné à publier les projets, campagnes de salubrité, travaux, partenariats, dates, responsables et preuves d’avancement.</p></div><a className="button secondary" href="https://kasavubu.cd/projets/" target="_blank" rel="noreferrer">Voir les projets publiés ↗</a></div></section>

      <section id="contact" className="contact-section"><div><span className="eyebrow">BESOIN D’ORIENTATION ?</span><h2>Contactez l’administration communale</h2><p>Adresse publiée sur le portail : Avenue Sport, Commune de Kasa-Vubu, Kinshasa, RDC.</p></div><div className="contact-card"><div><span>Téléphone</span><a href="tel:+243817333604">+243 817 333 604</a></div><div><span>Courriel publié sur le portail</span><a href="mailto:contact@kasavubu.gouv.cd">contact@kasavubu.gouv.cd</a></div><a className="button primary" href="https://kasavubu.cd/contact/" target="_blank" rel="noreferrer">Ouvrir le contact source ↗</a></div></section>

      <footer className="public-footer"><div className="brand"><span className="brand-mark">★</span><span><small>COMMUNE DE KASA-VUBU</small><strong>e-Commune RDC</strong></span></div><p>Portail public et outil de gestion communale — version de travail, non encore validée pour les démarches officielles.</p><div><a href="#commune">La commune</a><a href="#services">Services</a><a href="#demarches">Démarches</a><a href="#contact">Contact</a><Link href="/">Espace administratif</Link></div><small>Les informations institutionnelles, contacts et procédures doivent être confirmés par l’autorité communale avant mise en production.</small></footer>

      <style jsx global>{`
        :root{--pub-navy:#062a45;--pub-blue:#087fb3;--pub-cyan:#13a8d9;--pub-yellow:#f5d400;--pub-ink:#152f45;--pub-muted:#657c8d;--pub-line:#dce6ec;--pub-bg:#f5f8fa}
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0}
        .public-site{font-family:Arial,Helvetica,sans-serif;color:var(--pub-ink);background:#fff;line-height:1.55}
        .public-header{min-height:86px;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:16px clamp(20px,5vw,76px);border-bottom:1px solid var(--pub-line);background:#fff}
        .brand{display:flex;gap:12px;align-items:center;text-decoration:none;color:var(--pub-navy)}.brand-mark{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--pub-blue);border:2px solid #8bd9f5;color:white;font-size:23px}.brand small{display:block;font-size:9px;letter-spacing:.8px;color:var(--pub-muted)}.brand strong{display:block;font-size:20px;line-height:1.3}.brand em{font-style:normal;color:var(--pub-blue)}
        .public-header nav{display:flex;gap:22px;flex-wrap:wrap}.public-header nav a,.public-footer a{font-size:13px;text-decoration:none;color:#35536a}.public-header nav a:hover,.public-footer a:hover{color:var(--pub-blue)}.admin-link{white-space:nowrap;color:var(--pub-blue);font-size:12px;font-weight:700;text-decoration:none}
        .hero{padding:clamp(42px,7vw,94px) clamp(20px,8vw,120px);display:grid;grid-template-columns:minmax(0,1.3fr) minmax(280px,.7fr);gap:55px;align-items:center;background:linear-gradient(125deg,#f3fbff,#fff 60%,#eef8fc)}
        .eyebrow{display:block;font-size:10px;letter-spacing:1.3px;font-weight:800;color:var(--pub-blue)}.hero h1{font-size:clamp(36px,5vw,64px);letter-spacing:-1.9px;line-height:1.05;margin:17px 0 22px;max-width:780px;color:var(--pub-navy)}.hero h1 span{color:var(--pub-blue)}.hero-copy>p{max-width:690px;color:#587083;font-size:16px}.hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin:28px 0}.button{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:8px;font-weight:700;font-size:12px;text-decoration:none}.button.primary{background:var(--pub-blue);color:#fff}.button.secondary{border:1px solid #b8d2e0;color:var(--pub-navy);background:white}.hero-copy .disclaimer{font-size:11px;color:#7a8d9b;max-width:670px}
        .hero-card{padding:30px;border-radius:18px;background:var(--pub-navy);color:white;box-shadow:0 20px 50px #062a4520;position:relative;overflow:hidden}.hero-card:after{content:"";position:absolute;width:210px;height:210px;border:35px solid #ffffff0b;border-radius:50%;right:-85px;top:-75px}.seal{width:62px;height:62px;border:2px solid #6bcbed;border-radius:50%;display:grid;place-items:center;font-size:30px;color:var(--pub-yellow);margin-bottom:28px}.hero-card>span{font-size:10px;letter-spacing:1.1px;color:#8bd9f5}.hero-card h2{font-size:27px;line-height:1.18;margin:12px 0}.hero-card p{font-size:13px;color:#c1d5e1}.hero-card-bottom{display:flex;justify-content:space-between;gap:10px;border-top:1px solid #ffffff26;padding-top:16px;margin-top:25px;font-size:10px;color:#c1d5e1}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);padding:26px clamp(20px,8vw,120px);background:#fff;border-bottom:1px solid var(--pub-line)}.stats>div{padding:6px 24px;border-right:1px solid var(--pub-line)}.stats>div:first-child{padding-left:0}.stats>div:last-child{border:0}.stats strong{display:block;font-size:29px;color:var(--pub-navy)}.stats span{font-size:11px;color:var(--pub-muted)}.small-note{padding:0 clamp(20px,8vw,120px);font-size:10px;color:#8a6b22;background:#fff;margin:0}
        .section{padding:76px clamp(20px,8vw,120px)}.section-heading{max-width:760px;margin-bottom:30px}.section-heading h2,.leadership h2,.contact-section h2{font-size:clamp(27px,3vw,39px);line-height:1.15;letter-spacing:-.7px;color:var(--pub-navy);margin:10px 0}.section-heading p,.leadership>div>p,.contact-section>div>p{color:var(--pub-muted);font-size:14px;max-width:760px}
        .info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.info-grid article,.service-card,.quarter-card,.steps-grid article,.news-grid article{border:1px solid var(--pub-line);border-radius:12px;padding:22px;background:#fff}.card-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:10px;background:#e8f7fd;color:var(--pub-blue);font-size:23px}.info-grid h3,.service-card h3,.quarter-card h3,.steps-grid h3,.news-grid h3{color:var(--pub-navy);margin:14px 0 7px;font-size:17px}.info-grid p,.service-card p,.steps-grid p,.news-grid p{font-size:12px;color:var(--pub-muted);margin:0}
        .leadership{padding:55px clamp(20px,8vw,120px);background:#f2f8fb;display:grid;grid-template-columns:.8fr 1.2fr;gap:45px;align-items:center}.leader-cards{display:grid;gap:14px}.leader-cards article{display:flex;gap:16px;align-items:center;padding:19px;background:white;border:1px solid var(--pub-line);border-radius:12px}.avatar{width:52px;height:52px;border-radius:50%;background:#e1f5fc;color:var(--pub-blue);display:grid;place-items:center;font-weight:800}.leader-cards span{font-size:10px;color:var(--pub-blue);font-weight:800;text-transform:uppercase;letter-spacing:.7px}.leader-cards h3{font-size:16px;margin:4px 0;color:var(--pub-navy)}.leader-cards p{font-size:12px;color:var(--pub-muted);margin:0}
        .quarter-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.quarter-number{color:var(--pub-blue);font-weight:800;font-size:11px}.quarter-card h3{margin-top:6px}.quarter-card dl{margin:15px 0 0}.quarter-card dt{font-size:10px;color:var(--pub-muted);margin-top:10px}.quarter-card dd{font-size:12px;margin:2px 0 0;font-weight:600}
        .services-section{background:#f6f9fb}.service-search{display:flex;align-items:center;gap:12px;padding:0 16px;height:50px;background:#fff;border:1px solid var(--pub-line);border-radius:9px;max-width:620px;margin-bottom:22px;color:var(--pub-blue)}.service-search input{border:0;outline:0;width:100%;font:inherit;font-size:13px}.service-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}.service-card{padding:18px}.service-card>span{font-size:10px;color:var(--pub-blue);font-weight:800}.service-card h3{font-size:15px;margin:8px 0}.service-card p{min-height:48px}.service-card a,.news-grid a{display:inline-block;margin-top:14px;color:var(--pub-blue);font-weight:700;font-size:11px;text-decoration:none}
        .steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:13px}.steps-grid article>span{width:34px;height:34px;display:grid;place-items:center;background:var(--pub-navy);color:white;border-radius:8px;font-weight:800;font-size:12px}.steps-grid h3{font-size:15px}.notice{margin-top:20px;padding:18px 20px;border-left:4px solid #e1b800;background:#fff9dc;border-radius:5px}.notice strong{font-size:12px}.notice p{font-size:12px;margin:5px 0 0;color:#735e21}
        .news-section{background:#fff}.news-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:13px}.news-grid article>span{font-size:10px;color:var(--pub-blue);font-weight:700}.news-grid h3{font-size:15px}.project-strip{margin-top:22px;padding:24px;border-radius:12px;background:#eaf7fc;display:flex;align-items:center;justify-content:space-between;gap:20px}.project-strip h3{font-size:21px;color:var(--pub-navy);margin:7px 0}.project-strip p{font-size:12px;color:var(--pub-muted);max-width:700px;margin:0}
        .contact-section{padding:60px clamp(20px,8vw,120px);display:grid;grid-template-columns:1fr 1fr;gap:45px;background:var(--pub-navy);color:white}.contact-section h2{color:white}.contact-section>div>p{color:#c1d5e1}.contact-card{background:white;border-radius:12px;padding:24px;color:var(--pub-ink);display:grid;gap:16px}.contact-card span{display:block;color:var(--pub-muted);font-size:10px}.contact-card a:not(.button){color:var(--pub-blue);font-size:14px;font-weight:700;text-decoration:none}.contact-card .button{justify-self:start}
        .public-footer{padding:32px clamp(20px,5vw,76px);display:grid;grid-template-columns:1fr 1.5fr;gap:18px;align-items:center;background:#f3f7f9}.public-footer>p{font-size:11px;color:var(--pub-muted)}.public-footer>div:last-of-type{grid-column:1/-1;display:flex;gap:20px;flex-wrap:wrap;border-top:1px solid var(--pub-line);padding-top:16px}.public-footer>small{grid-column:1/-1;color:#8093a1;font-size:10px}
        @media(max-width:980px){.public-header{flex-wrap:wrap}.public-header nav{order:3;width:100%;gap:15px}.hero{grid-template-columns:1fr;gap:30px}.hero-card{max-width:560px}.leadership{grid-template-columns:1fr}.service-grid,.quarter-grid{grid-template-columns:repeat(2,1fr)}.news-grid{grid-template-columns:repeat(2,1fr)}.steps-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:600px){.public-header{padding:14px 18px}.public-header nav{gap:12px}.public-header nav a{font-size:11px}.admin-link{font-size:11px}.hero{padding:42px 20px}.hero h1{font-size:38px}.stats{grid-template-columns:repeat(2,1fr);gap:10px}.stats>div{padding:10px;border:0;border-bottom:1px solid var(--pub-line)}.stats>div:first-child{padding-left:10px}.section{padding:48px 20px}.info-grid,.service-grid,.quarter-grid,.news-grid,.steps-grid{grid-template-columns:1fr}.contact-section{grid-template-columns:1fr;padding:48px 20px}.project-strip{align-items:flex-start;flex-direction:column}.public-footer{grid-template-columns:1fr}.public-footer>div:last-of-type{grid-column:auto}.public-footer>small{grid-column:auto}.service-card p{min-height:0}}
      `}</style>
    </main>
  );
}
