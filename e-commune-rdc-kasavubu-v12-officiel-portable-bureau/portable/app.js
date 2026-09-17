const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const now=()=>new Date().toLocaleString('fr-FR');
const uid=p=>`${p}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const money=v=>Number(v||0).toLocaleString('fr-FR')+' CDF';

const defaults={
 citizens:[
  {id:'CH-KSV-2026-01750',name:'Fiche citoyenne pilote',quartier:'Assossa',status:'Validé'},
  {id:'CH-KSV-2026-01751',name:'Ménage pilote',quartier:'Lodja',status:'À vérifier'}
 ],
 civil:[
  {ref:'EC-KSV-2026-00942',act:'Acte de naissance',office:'Bureau État civil',status:'En validation'},
  {ref:'EC-KSV-2026-00918',act:'Copie intégrale',office:'Bureau État civil',status:'Validé'}
 ],
 parcels:[
  {id:'KSV-P-001',quartier:'Assossa',avenue:'Gambela',usage:'Habitation',occupant:'Ménage pilote',area:'245',status:'À valider'},
  {id:'KSV-P-002',quartier:'Lodja',avenue:'Éthiopie',usage:'Commerce',occupant:'Opérateur pilote',area:'118',status:'À valider'}
 ],
 payments:[{receipt:'TX-KSV-2026-03817',date:'16/09/2026 13:51',tax:'Quittance communale',payer:'Occupant GAM-A-001',amount:25000,channel:'Mobile Money',status:'Payé'}],
 businesses:[
  {id:'COM-KSV-001',name:'Commerce pilote Gambela',sector:'Commerce général',quartier:'Katanga',status:'Actif'},
  {id:'COM-KSV-002',name:'Boutique pilote',sector:'Détail',quartier:'Assossa',status:'À renouveler'}
 ],
 complaints:[
  {ref:'PL-KSV-2026-00183',subject:'Plainte salubrité',service:'Service technique',status:'Assigné'},
  {ref:'PL-KSV-2026-00184',subject:'Occupation irrégulière',service:'Urbanisme',status:'À examiner'}
 ],
 urbanism:[
  {ref:'UR-KSV-2026-00411',subject:'Dossier urbanisme',quartier:'Salongo',status:'À examiner'},
  {ref:'UR-KSV-2026-00405',subject:'Demande d’alignement',quartier:'Lodja',status:'En étude'}
 ],
 stalls:[
  {code:'GAM-A-001',market:'Gambela',zone:'A',occupant:'Occupant pilote',activity:'Vivres',status:'Occupé',payment:'À jour'},
  {code:'GAM-B-014',market:'Gambela',zone:'B',occupant:'—',activity:'—',status:'Libre',payment:'—'}
 ],
 health:[
  {name:'Mama Pamela Delargy',quartier:'Kasa-Vubu',type:'Centre hospitalier',status:'À vérifier'},
  {name:'CASOP',quartier:'Lodja',type:'Centre de santé',status:'Référencé'},
  {name:'SONAL',quartier:'À préciser',type:'Centre de santé',status:'À vérifier'},
  {name:'Chrisco',quartier:'À préciser',type:'Centre de santé',status:'À vérifier'},
  {name:'Sainte-Marie',quartier:'À préciser',type:'Structure sanitaire',status:'À vérifier'}
 ],
 territory:[
  {type:'Quartier',name:'Anciens Combattants',status:'Référencé'}, {type:'Quartier',name:'Assossa',status:'Référencé'},
  {type:'Quartier',name:'Katanga',status:'Référencé'}, {type:'Quartier',name:'Lubumbashi',status:'Référencé'},
  {type:'Quartier',name:'Lodja',status:'Référencé'}, {type:'Quartier',name:'O.N.L.',status:'Référencé'}, {type:'Quartier',name:'Salongo',status:'Référencé'}
 ],
 projects:[
  {sector:'SPORTS & LOISIRS',name:'Bâtiment administratif du SG',budget:'6 694 172 125 CDF',status:'Sourcé'},
  {sector:'VOIRIE',name:'Pont Victoire',budget:'À documenter',status:'Sourcé'},
  {sector:'VOIRIE',name:'Route Gambela',budget:'À documenter',status:'Sourcé'},
  {sector:'VOIRIE',name:'Avenue Éthiopie',budget:'À documenter',status:'Sourcé'}
 ],
 governance:[
  {ref:'ACT-KSV-012',kind:'Décision communale',subject:'Dossier nécessitant arbitrage',status:'À examiner'},
  {ref:'ACT-KSV-009',kind:'Note de service',subject:'Organisation interne',status:'Publié'}
 ],
 agents:[{name:'Bourgmestre Kasa-Vubu',role:'BOURGMESTRE',status:'Actif'},{name:'Agent Santé pilote',role:'SANTE_HYGIENE',status:'Inactif'}],
 audit:[]
};
const state={};for(const[k,v]of Object.entries(defaults)){try{state[k]=JSON.parse(localStorage.getItem(`ecommune_${k}`))||v}catch{state[k]=v}}
function save(k){localStorage.setItem(`ecommune_${k}`,JSON.stringify(state[k]))}
function audit(action,detail){state.audit.unshift({date:now(),agent:'Bourgmestre',action,detail});state.audit=state.audit.slice(0,250);save('audit')}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}

const nav=[
 ['dashboard','⌂','Tableau de bord'],['citizens','◉','Citoyens'],['civil','▤','État civil'],['taxes','₣','Recettes & taxes'],['businesses','▦','Commerces'],['complaints','!','Plaintes & interventions'],['urbanism','#','Urbanisme'],['parcels','▱','Parcelles & domaine'],['health','✚','Structures sanitaires'],['territory','▧','Territoire & équipements'],['map','◇','Carte communale'],['projects','▥','Fatshimétrie locale'],['governance','§','Gouvernance'],['agents','♙','Personnel & accès'],['audit','✓','Audit & conformité'],['settings','⚙','Paramètres']
];
const pageMeta={
 dashboard:['Tableau de bord —<br>Kasa-Vubu','Pilotage consolidé de l’administration communale'],citizens:['Citoyens','Population & ménages'],civil:['État civil','Naissances · mariages · décès'],taxes:['Recettes & taxes','Taxes · droits · quittances'],businesses:['Commerces','Activités économiques et autorisations'],complaints:['Plaintes & interventions','Affectation · intervention · preuve'],urbanism:['Urbanisme','Dossiers · alignements · inspections'],parcels:['Parcelles & domaine','Numérisation et suivi parcellaire'],health:['Structures sanitaires','Structures · couverture · projets'],territory:['Territoire & équipements','Quartiers · avenues · équipements'],map:['Carte communale','Territoire interactif de Kasa-Vubu'],projects:['Fatshimétrie locale','Suivi des projets financés par l’État'],governance:['Gouvernance','Actes · décisions · validation'],agents:['Personnel & accès','Habilitations et rôles'],audit:['Audit & conformité','Traçabilité · contrôles · sécurité'],settings:['Paramètres','Configuration institutionnelle']
};
let current='dashboard';
$('#nav').innerHTML=nav.map(([id,ico,label])=>`<button class="nav-btn ${id==='dashboard'?'active':''}" data-page="${id}"><span class="nav-ico">${ico}</span><span>${label}</span></button>`).join('');
$('#nav').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(!b)return;go(b.dataset.page)});
function go(id){if(!pageMeta[id])return;current=id;render();window.scrollTo({top:0,behavior:'smooth'})}

function download(name,text,type){const b=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),600);toast(`Téléchargement : ${name}`)}
function exportCsv(name,rows){if(!rows.length)return toast('Aucune donnée à exporter');const keys=Object.keys(rows[0]),q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const txt='\ufeff'+[keys.join(';'),...rows.map(r=>keys.map(k=>q(r[k])).join(';'))].join('\r\n');download(`${name}-${new Date().toISOString().slice(0,10)}.csv`,txt,'text/csv;charset=utf-8');audit('DATA_EXPORT',`${name} CSV · ${rows.length} ligne(s)`)}
function exportJson(name,rows){download(`${name}-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(rows,null,2),'application/json');audit('DATA_EXPORT',`${name} JSON · ${rows.length} ligne(s)`)}
function exportExcel(name,rows){if(!rows.length)return toast('Aucune donnée à exporter');const keys=Object.keys(rows[0]);const html=`<html><head><meta charset="utf-8"></head><body><h3>e-Commune Kasa-Vubu</h3><table border="1"><tr>${keys.map(k=>`<th>${esc(k)}</th>`).join('')}</tr>${rows.map(r=>`<tr>${keys.map(k=>`<td>${esc(r[k])}</td>`).join('')}</tr>`).join('')}</table></body></html>`;download(`${name}-${new Date().toISOString().slice(0,10)}.xls`,html,'application/vnd.ms-excel');audit('DATA_EXPORT',`${name} Excel · ${rows.length} ligne(s)`)}
function exportButtons(name,source){return `<button class="btn small" data-export="csv" data-name="${name}" data-source="${source}">CSV</button><button class="btn small" data-export="xls" data-name="${name}" data-source="${source}">Excel</button><button class="btn small" data-export="json" data-name="${name}" data-source="${source}">JSON</button><button class="btn small" data-print>PDF / Imprimer</button>`}
function table(rows,cols){if(!rows.length)return '<div class="card empty">Aucune donnée.</div>';return `<div class="table-wrap"><table><thead><tr>${Object.values(cols).map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${Object.keys(cols).map(k=>`<td>${k==='amount'?money(r[k]):esc(r[k]??'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}

function dashboard(){
 const recent=[
  ['EC-KSV-2026-00942','Acte de naissance','Bureau État civil','En validation','14:32'],
  ['TX-KSV-2026-03817','Quittance communale','Régie financière','Payé','13:51'],
  ['PL-KSV-2026-00183','Plainte salubrité','Service technique','Assigné','12:20'],
  ['UR-KSV-2026-00411','Dossier urbanisme','Urbanisme','À examiner','11:48'],
  ['CH-KSV-2026-01750','Fiche citoyen','Population','Validé','10:07']
 ];
 return `
 <div class="territory-banner">
  <div class="territory-main"><div class="overline">COMMUNE PILOTE · DISTRICT DE FUNA</div><h3>Commune de Kasa-Vubu</h3><p>Anciens Combattants · Assossa · Katanga · Lubumbashi · Lodja · O.N.L. · Salongo</p></div>
  <div class="territory-stats"><div class="territory-stat"><strong>7</strong><span>quartiers</span></div><div class="territory-stat"><strong>5,04 km²</strong><span>superficie</span></div><div class="territory-stat"><strong>81 703</strong><span>habitants</span></div><button class="territory-link" data-go="territory">Voir le territoire</button></div>
 </div>
 <div class="notice-strip"><div class="notice-title">Environnement pilote<br>institutionnel</div><div class="notice-text">Les données opérationnelles restent distinctes des référentiels validés par l’administration compétente.</div><button class="text-link" data-go="audit">Voir la conformité →</button></div>
 <div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-icon">◉</div><div class="kpi-copy"><small>Citoyens au registre</small><strong>48 726</strong><span>Donnée de démonstration</span></div></div>
  <div class="kpi-card"><div class="kpi-icon">₣</div><div class="kpi-copy"><small>Recettes du mois</small><strong>186,4 M FC</strong><span>82 % de l’objectif démo</span></div></div>
  <div class="kpi-card"><div class="kpi-icon">✚</div><div class="kpi-copy"><small>Structures sanitaires</small><strong>5</strong><span>Référentiel pilote non exhaustif</span></div></div>
  <div class="kpi-card"><div class="kpi-icon">▥</div><div class="kpi-copy"><small>Projets publics suivis</small><strong>4</strong><span>Fiches sourcées</span></div></div>
 </div>
 <div class="panel-grid">
  <section class="panel"><div class="panel-title-row"><div><h3>Activité récente</h3><div class="panel-sub">Dernières opérations de démonstration</div></div><button class="pill-link" data-go="audit">Journal complet</button></div>
   <div class="recent-table"><div class="recent-row head"><span>Référence</span><span>Opération</span><span>Service</span><span>Statut</span><span>Heure</span></div>${recent.map(r=>`<div class="recent-row"><span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span><span><em class="status-chip">${r[3]}</em></span><span>${r[4]}</span></div>`).join('')}</div>
  </section>
  <section class="panel"><h3>Cabinet du Bourgmestre</h3><div class="panel-sub">Décisions et validations requises</div><div class="cabinet-list"><div class="cabinet-item"><div class="cabinet-num">12</div><span>Actes / dossiers nécessitant arbitrage</span></div><div class="cabinet-item"><div class="cabinet-num">5</div><span>Habilitations d’agents à revoir</span></div><div class="cabinet-item"><div class="cabinet-num">7</div><span>Engagements budgétaires à contrôler</span></div></div><button class="cabinet-link" data-go="governance">Ouvrir la gouvernance →</button>
  </section>
 </div>
 <div class="lower-grid">
  <section class="panel"><div class="panel-title-row"><div><h3>Fatshimétrie locale</h3><div class="panel-sub">Suivi probant des projets financés par l’État</div></div><button class="text-link" data-go="projects">Tout ouvrir</button></div>
   ${state.projects.map(p=>`<div class="project-item"><div class="project-meta"><small>${esc(p.sector)}</small><strong>${esc(p.name)}</strong></div><div class="project-bar"></div><div class="project-source">${esc(p.status)}</div></div>`).join('')}
  </section>
  <section class="panel"><h3>Territoire & santé</h3><div class="panel-sub">Carte interactive de Kasa-Vubu</div><div class="map-preview"><div><div class="diamond">◇</div><strong>7 quartiers · 84 voies · équipements repérés</strong><span>Limites · santé · éducation · marchés · administration · projets</span></div></div><div class="map-actions"><button class="btn-blue" data-go="map">Ouvrir la carte</button><button class="btn-outline" data-go="territory">Référentiel territorial</button></div></section>
 </div>
 <section class="panel services-panel"><h3>Services internes</h3><div class="panel-sub">Accès aux principales fonctions de l’ETD</div><div class="services-grid">
  ${[['citizens','◉','Registre citoyen','Population & ménages'],['civil','▤','État civil','Naissances · mariages · décès'],['taxes','₣','Recettes','Taxes · droits · quittances'],['complaints','!','Plaintes','Affectation · intervention · preuve'],['urbanism','#','Urbanisme','Parcelles · inspections · dossiers'],['health','✚','Santé','Structures · couverture · projets'],['territory','▧','Territoire','Quartiers · avenues · équipements'],['audit','✓','Audit','Traçabilité · contrôles · sécurité']].map(x=>`<button class="service-tile" data-go="${x[0]}"><span class="service-icon">${x[1]}</span><strong>${x[2]}</strong><span>${x[3]}</span></button>`).join('')}
 </div></section>`
}
function moduleHead(title,desc,actions=''){return `<div class="module-head"><div><h3>${title}</h3><p>${desc}</p></div><div class="actions">${actions}</div></div>`}
function citizens(){return moduleHead('Registre citoyen','Population et ménages de la commune',exportButtons('citoyens','citizens'))+table(state.citizens,{id:'Référence',name:'Citoyen / ménage',quartier:'Quartier',status:'Statut'})}
function civil(){return moduleHead('État civil','Naissances, mariages, décès et délivrance de copies',exportButtons('etat-civil','civil'))+table(state.civil,{ref:'Référence',act:'Opération',office:'Service',status:'Statut'})}
function taxes(){const total=state.payments.reduce((s,p)=>s+Number(p.amount||0),0);return `<div class="stats-row"><div class="stat-card"><small>Total enregistré</small><strong>${money(total)}</strong></div><div class="stat-card"><small>Quittances</small><strong>${state.payments.length}</strong></div><div class="stat-card"><small>Canaux</small><strong>${new Set(state.payments.map(x=>x.channel)).size}</strong></div><div class="stat-card"><small>Rapprochement</small><strong>À contrôler</strong></div></div>`+moduleHead('Perception numérique','Liquidation, paiement et quittance communale',`<button class="btn primary" data-modal="payment">+ Nouvelle perception</button>${exportButtons('recettes','payments')}`)+table(state.payments,{receipt:'Quittance',date:'Date',tax:'Taxe / droit',payer:'Contribuable',amount:'Montant CDF',channel:'Canal',status:'Statut'})}
function businesses(){return moduleHead('Commerces & étalages','Registre des activités économiques, autorisations et occupation des marchés',`<button class="btn primary" data-modal="stall">+ Nouvel étalage</button>${exportButtons('commerces','businesses')}`)+`<div class="card" style="margin-bottom:14px"><h3 style="margin:0 0 12px;font-size:14px">Commerces enregistrés</h3>${table(state.businesses,{id:'Code',name:'Commerce',sector:'Secteur',quartier:'Quartier',status:'Statut'})}</div><div class="card"><div class="module-head" style="margin-bottom:12px"><div><h3 style="font-size:14px">Étalages & marchés</h3><p>Occupants, activité et suivi de paiement</p></div><div class="actions">${exportButtons('etalages','stalls')}</div></div>${table(state.stalls,{code:'Code',market:'Marché',zone:'Zone',occupant:'Occupant',activity:'Activité',status:'Occupation',payment:'Paiement'})}</div>`}
function complaints(){return moduleHead('Plaintes & interventions','Enregistrement, affectation et suivi de résolution',exportButtons('plaintes','complaints'))+table(state.complaints,{ref:'Référence',subject:'Objet',service:'Service',status:'Statut'})}
function urbanism(){return moduleHead('Urbanisme','Dossiers, inspections, alignements et occupations',exportButtons('urbanisme','urbanism'))+table(state.urbanism,{ref:'Référence',subject:'Dossier',quartier:'Quartier',status:'Statut'})}
function parcels(){return moduleHead('Numérisation des parcelles','Référentiel de travail — une géométrie ne vaut pas titre de propriété.',`<button class="btn primary" data-modal="parcel">+ Nouvelle parcelle</button>${exportButtons('parcelles','parcels')}`)+table(state.parcels,{id:'Code',quartier:'Quartier',avenue:'Avenue',usage:'Usage',occupant:'Occupant',area:'Surface m²',status:'Statut'})}
function health(){return moduleHead('Structures sanitaires','Référentiel sanitaire communal à valider avec les autorités compétentes.',exportButtons('structures-sanitaires','health'))+table(state.health,{name:'Structure',quartier:'Quartier',type:'Type',status:'Vérification'})}
function territory(){return moduleHead('Territoire & équipements','7 quartiers, avenues et équipements communaux',exportButtons('territoire','territory'))+table(state.territory,{type:'Type',name:'Nom',status:'Statut'})}
function mapPage(){return moduleHead('Carte communale','Kasa-Vubu — couches territoriales, équipements et projets')+`<div class="map-full"><div><div style="font-size:52px;color:#0798cb">◇</div><strong>Kasa-Vubu · Kinshasa</strong><p>7 quartiers · 84 voies · structures sanitaires · marchés · projets</p><div class="actions" style="justify-content:center"><button class="btn primary" data-go="parcels">Parcelles</button><button class="btn" data-go="health">Santé</button><button class="btn" data-go="projects">Projets</button></div></div></div>`}
function projects(){return moduleHead('Fatshimétrie locale','Suivi des projets publics localisés dans la commune.',exportButtons('fatshimetrie','projects'))+table(state.projects,{sector:'Secteur',name:'Projet',budget:'Budget / source',status:'Statut'})}
function governance(){return moduleHead('Gouvernance communale','Actes, décisions et dossiers soumis au Cabinet du Bourgmestre',exportButtons('gouvernance','governance'))+table(state.governance,{ref:'Référence',kind:'Type',subject:'Objet',status:'Statut'})}
function agents(){return moduleHead('Personnel & habilitations','Le Bourgmestre est le seul habilité à créer les comptes agents dans ce pilote.',`<button class="btn primary" data-modal="agent">+ Créer un accès agent</button>${exportButtons('agents','agents')}`)+table(state.agents,{name:'Agent',role:'Rôle',status:'Compte'})}
function auditPage(){return moduleHead('Audit & conformité','Traçabilité des opérations réalisées sur ce poste.',`<button class="btn danger" id="clear-audit">Vider le journal local</button>${exportButtons('audit','audit')}`)+table(state.audit,{date:'Date',agent:'Agent',action:'Action',detail:'Détail'})}
function settings(){return `<div class="split"><div class="card"><h3>Paramètres institutionnels</h3><div class="info-list"><div class="info-row"><span>Commune</span><b>Kasa-Vubu</b></div><div class="info-row"><span>Province</span><b>Kinshasa</b></div><div class="info-row"><span>Profil</span><b>Bourgmestre</b></div><div class="info-row"><span>Démarrage</span><b>Node.js portable Windows</b></div></div></div><div class="card"><h3>Maintenance locale</h3><p style="font-size:10px;color:#7890a1">Réinitialise uniquement les données pilotes stockées dans ce navigateur.</p><button class="btn danger" id="reset-local">Réinitialiser les données locales</button></div></div>`}
const views={dashboard,citizens,civil,taxes,businesses,complaints,urbanism,parcels,health,territory,map:mapPage,projects,governance,agents,audit:auditPage,settings};

function render(){
 $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.page===current));
 const m=pageMeta[current]||pageMeta.dashboard;$('#breadcrumb').textContent=`E-COMMUNE / KASA-VUBU / ${nav.find(x=>x[0]===current)?.[2]?.toUpperCase()||'TABLEAU DE BORD'}`;$('#page-title').innerHTML=m[0];$('#page-subtitle').textContent=m[1];
 $('#content').innerHTML=views[current]();bind();
}
function bind(){
 $$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
 $$('[data-modal]').forEach(b=>b.onclick=()=>openModal(b.dataset.modal));
 $$('[data-export]').forEach(b=>b.onclick=()=>{const rows=state[b.dataset.source]||[];if(b.dataset.export==='csv')exportCsv(b.dataset.name,rows);else if(b.dataset.export==='xls')exportExcel(b.dataset.name,rows);else exportJson(b.dataset.name,rows)});
 $$('[data-print]').forEach(b=>b.onclick=()=>window.print());
 const ca=$('#clear-audit');if(ca)ca.onclick=()=>{if(confirm('Vider le journal local ?')){state.audit=[];save('audit');render()}};
 const rs=$('#reset-local');if(rs)rs.onclick=()=>{if(confirm('Réinitialiser les données locales de démonstration ?')){Object.keys(defaults).forEach(k=>localStorage.removeItem(`ecommune_${k}`));location.reload()}};
}
function modalShell(title,body){return `<div class="modal-back"><div class="modal"><button class="close-x" type="button">×</button><h3>${title}</h3>${body}</div></div>`}
function openModal(type){
 let html='';
 if(type==='parcel')html=modalShell('Nouvelle parcelle',`<form id="form-parcel" class="form-grid"><div class="field"><label>Quartier</label><select name="quartier" required>${['Anciens Combattants','Assossa','Katanga','Lubumbashi','Lodja','O.N.L.','Salongo'].map(x=>`<option>${x}</option>`).join('')}</select></div><div class="field"><label>Avenue</label><input name="avenue" required></div><div class="field"><label>Usage</label><select name="usage"><option>Habitation</option><option>Commerce</option><option>Mixte</option><option>Public</option></select></div><div class="field"><label>Surface déclarée (m²)</label><input name="area" type="number" min="0"></div><div class="field wide"><label>Occupant déclaré</label><input name="occupant"></div><div class="field wide"><label>Source / document</label><input name="source" placeholder="Référence du document ou relevé terrain" required></div><div class="modal-foot field wide"><button type="button" class="btn cancel">Annuler</button><button class="btn primary">Enregistrer</button></div></form>`);
 if(type==='payment')html=modalShell('Nouvelle perception',`<form id="form-payment" class="form-grid"><div class="field"><label>Taxe / droit</label><select name="tax"><option>Étalage marché</option><option>Occupation du domaine</option><option>Droit administratif</option><option>Autre perception validée</option></select></div><div class="field"><label>Montant CDF</label><input name="amount" type="number" min="0" required></div><div class="field wide"><label>Contribuable / référence</label><input name="payer" required></div><div class="field"><label>Canal</label><select name="channel"><option>Caisse</option><option>Mobile Money</option><option>Banque</option></select></div><div class="field"><label>Référence externe</label><input name="external"></div><div class="modal-foot field wide"><button type="button" class="btn cancel">Annuler</button><button class="btn primary">Valider et générer la quittance</button></div></form>`);
 if(type==='stall')html=modalShell('Nouvel étalage',`<form id="form-stall" class="form-grid"><div class="field"><label>Marché</label><input name="market" value="Gambela" required></div><div class="field"><label>Zone</label><input name="zone" required></div><div class="field"><label>Code étalage</label><input name="code" placeholder="GAM-A-002" required></div><div class="field"><label>Activité</label><input name="activity"></div><div class="field wide"><label>Occupant</label><input name="occupant"></div><div class="modal-foot field wide"><button type="button" class="btn cancel">Annuler</button><button class="btn primary">Enregistrer</button></div></form>`);
 if(type==='agent')html=modalShell('Créer un accès agent',`<form id="form-agent" class="form-grid"><div class="field wide"><label>Nom de l’agent</label><input name="name" required></div><div class="field"><label>Rôle</label><select name="role"><option>AGENT</option><option>MARCHES</option><option>SANTE_HYGIENE</option><option>RECETTES</option><option>URBANISME</option><option>AUDITEUR</option></select></div><div class="field"><label>État initial</label><input value="Inactif" disabled></div><div class="modal-foot field wide"><button type="button" class="btn cancel">Annuler</button><button class="btn primary">Créer le compte</button></div></form>`);
 document.body.insertAdjacentHTML('beforeend',html);const m=$('.modal-back');if(!m)return;$('.close-x',m).onclick=()=>m.remove();const c=$('.cancel',m);if(c)c.onclick=()=>m.remove();
 const fp=$('#form-parcel',m);if(fp)fp.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(fp));state.parcels.unshift({id:uid('KSV-P'),quartier:d.quartier,avenue:d.avenue,usage:d.usage,occupant:d.occupant||'—',area:d.area||'—',status:'À valider'});save('parcels');audit('PARCEL_DIGITIZE_CREATE',`${d.quartier} · ${d.avenue}`);m.remove();go('parcels');toast('Parcelle enregistrée')};
 const fpay=$('#form-payment',m);if(fpay)fpay.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(fpay)),receipt=uid('TX-KSV');state.payments.unshift({receipt,date:now(),tax:d.tax,payer:d.payer,amount:Number(d.amount),channel:d.channel,status:'Payé'});save('payments');audit('REVENUE_PAYMENT_CREATE',`${receipt} · ${d.amount} CDF`);m.remove();go('taxes');toast(`Quittance ${receipt} générée`)};
 const fs=$('#form-stall',m);if(fs)fs.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(fs));if(state.stalls.some(x=>x.code.toLowerCase()===d.code.toLowerCase()))return alert('Ce code d’étalage existe déjà.');state.stalls.unshift({code:d.code,market:d.market,zone:d.zone,occupant:d.occupant||'—',activity:d.activity||'—',status:d.occupant?'Occupé':'Libre',payment:d.occupant?'À vérifier':'—'});save('stalls');audit('MARKET_STALL_CREATE',d.code);m.remove();go('businesses');toast('Étalage enregistré')};
 const fa=$('#form-agent',m);if(fa)fa.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(fa));state.agents.push({name:d.name,role:d.role,status:'Inactif'});save('agents');audit('AGENT_ACCOUNT_CREATE',`${d.name} · ${d.role}`);m.remove();go('agents');toast('Compte agent créé inactif')};
}

$('#btn-create-agent').onclick=()=>openModal('agent');
$('#btn-notifications').onclick=()=>alert('Notifications du Bourgmestre\n\n• 12 dossiers nécessitent arbitrage\n• 5 habilitations d’agents à revoir\n• 7 engagements budgétaires à contrôler');
$('#global-search').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();if(!q)return;const hit=nav.find(x=>x[2].toLowerCase().includes(q));if(hit&&e.inputType==='insertLineBreak')go(hit[0])});
$('#global-search').addEventListener('keydown',e=>{if(e.key!=='Enter')return;const q=e.currentTarget.value.trim().toLowerCase();const hit=nav.find(x=>x[2].toLowerCase().includes(q));if(hit){go(hit[0]);e.currentTarget.value=''}else toast('Aucun module correspondant')});
render();
