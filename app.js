import { ownerProfile as fallbackOwner } from './content/owner-profile.js';
import { projects as fallbackProjects } from './content/projects.js';
import { education as fallbackEducation } from './content/education.js';
import { skillGroups as fallbackSkills } from './content/skills.js';
import { achievements as fallbackAchievements } from './content/achievements.js';
import { loadRemotePortfolio, saveRemotePortfolio, signIn, signUp, signOut, getSession, currentConfigState } from './content/portfolio-store.js';

const fallbackPortfolio = {
  owner: structuredClone(fallbackOwner),
  projects: structuredClone(fallbackProjects),
  education: structuredClone(fallbackEducation),
  skills: structuredClone(fallbackSkills),
  achievements: structuredClone(fallbackAchievements),
  journey: [
    { title:'Programming foundations', detail:'C, C++, pointers, structures, files, sorting & searching' },
    { title:'Problem solving', detail:'Data structures, algorithms, and programming practice' },
    { title:'Database systems', detail:'SQL, MySQL, relational design, joins, normalization, CRUD' },
    { title:'Web development', detail:'HTML, CSS, JavaScript, PHP, backend-connected interfaces' },
    { title:'Garage Management System', detail:'Solo-developed, database-driven web application deployed for demonstration' },
    { title:'Next chapter', detail:'Keep learning, build stronger projects, and grow into a professional Software Engineer' }
  ]
};
let portfolio = structuredClone(fallbackPortfolio);
let remoteMeta = { configured:false, updatedAt:null };

const state = { z:100, windows:new Map(), theme:localStorage.getItem('tayassuk-os-theme-v1') || 'dark', adminSession:null };
const appDefinitions = [
  { id:'projects', name:'Projects', desc:'Built work & future projects', badge:'MAIN DRIVE', icon:'folder' },
  { id:'learning', name:'Learning', desc:'Current study & practice', badge:'IN PROGRESS', icon:'layers' },
  { id:'skills', name:'Skills', desc:'Technical toolkit', badge:'SKILL MAP', icon:'code' },
  { id:'education', name:'Education', desc:'Academic timeline', badge:'DIU', icon:'cap' },
  { id:'journey', name:'Journey', desc:'Software engineering growth', badge:'TIMELINE', icon:'route' },
  { id:'about', name:'About', desc:'Who I am & what I value', badge:'PROFILE', icon:'user' },
  { id:'achievements', name:'Achievements', desc:'Activities & milestones', badge:'VAULT', icon:'trophy' },
  { id:'resume', name:'Resume', desc:'Official CV', badge:'PDF', icon:'file' },
  { id:'contact', name:'Contact', desc:'Start a conversation', badge:'OPEN', icon:'mail' },
  { id:'whiteboard', name:'Whiteboard', desc:'Leave a local note', badge:'LOCAL ONLY', icon:'note' },
  { id:'founder', name:'Founder.txt', desc:'My working principles', badge:'TXT', icon:'terminal' },
  { id:'browser', name:'Browser', desc:'Approved external links', badge:'LINKS', icon:'globe' },
  { id:'control', name:'Control Center', desc:'Manage the whole portfolio', badge:'ADMIN', icon:'lock' }
];

const esc = (value='') => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const iconClass = name => `icon icon-${name}`;
document.documentElement.dataset.theme = state.theme;

function renderIdentity(){
  const o = portfolio.owner;
  const nameParts = String(o.identity.fullName || 'Tayassuk Imam').split(' ');
  const last = nameParts.pop() || '';
  const first = nameParts.join(' ');
  const h1 = document.querySelector('#identity-name'); if(h1) h1.innerHTML = `${esc(first)} <span>${esc(last)}</span>`;
  const h2 = document.querySelector('#identity-profession'); if(h2) h2.textContent = o.identity.profession;
  const tagline = document.querySelector('#identity-tagline'); if(tagline) tagline.innerHTML = `Learning <b>•</b> Building <b>•</b> Growing in <strong>Software Engineering</strong>`;
  const headline = document.querySelector('#identity-headline'); if(headline) headline.textContent = o.identity.headline;
  const p = document.querySelector('#hero-portrait'); if(p && o.identity.generatedAvatar) p.src = o.identity.generatedAvatar;
  const cv = document.querySelector('#hero-cv'); if(cv) cv.href = o.contact.cv || '#';
}

function renderAppGrid(){
  document.querySelector('#app-grid').innerHTML = appDefinitions.map(a => `
    <button class="desktop-app" data-action="open" data-app="${a.id}">
      <span class="app-icon-big"><span class="${iconClass(a.icon)}"></span></span>
      <h3>${esc(a.name)}</h3><p>${esc(a.desc)}</p><span class="badge">${esc(a.badge)}</span>
    </button>`).join('');
}

function renderSocials(){
  const c=portfolio.owner.contact; const items=[];
  if(c.github) items.push(`<a class="social-chip" href="${esc(c.github)}" target="_blank" rel="noreferrer noopener">GitHub</a>`);
  if(c.linkedin) items.push(`<a class="social-chip" href="${esc(c.linkedin)}" target="_blank" rel="noreferrer noopener">LinkedIn</a>`);
  if(c.email) items.push(`<a class="social-chip" href="mailto:${esc(c.email)}">Email</a>`);
  document.querySelector('#social-row').innerHTML=items.join('');
}
function nowLabel(){
  const d=new Date(), tz=portfolio.owner.identity.timezone || 'Asia/Dhaka';
  const date=new Intl.DateTimeFormat('en-BD',{timeZone:tz,weekday:'short',month:'short',day:'numeric'}).format(d);
  const time=new Intl.DateTimeFormat('en-BD',{timeZone:tz,hour:'numeric',minute:'2-digit'}).format(d);
  return `${date} · ${time}`;
}
function updateClock(){ const el=document.querySelector('#clock'); if(el) el.textContent=nowLabel(); }
updateClock(); setInterval(updateClock,1000);

function windowPosition(){
  const open=state.windows.size, w=Math.max(320,Math.min(innerWidth-60,860)), h=Math.max(300,Math.min(innerHeight-140,650));
  return {left:Math.max(12,(innerWidth-w)/2+(open%4)*18),top:Math.max(70,(innerHeight-h)/2+(open%3)*14)};
}
function projectMarkup(){
  const featured=portfolio.projects.filter(p=>p.featured), others=portfolio.projects.filter(p=>!p.featured);
  const card=p=>`<article class="project-card"><div class="project-head"><div><h3>${esc(p.name)}</h3><div class="muted">${esc(p.category||'Project')} · ${esc(p.role||'Solo Developer')}</div></div><span class="status">${esc(p.status||'Active')}</span></div><p>${esc(p.outcome||p.description||p.problem||'')}</p><div class="chips">${(p.stack||p.technologies||[]).map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div><div class="window-actions">${p.url?`<a class="primary-link" href="${esc(p.url)}" target="_blank" rel="noreferrer noopener">Live Demo</a>`:''}${p.repository?`<a href="${esc(p.repository)}" target="_blank" rel="noreferrer noopener">Repository</a>`:''}<button data-action="project-detail" data-project="${esc(p.id)}">View Details</button></div></article>`;
  return `<h2>Projects</h2><p class="muted">Featured work comes first. New projects are managed from the <strong>Control Center</strong> and appear here automatically.</p><h3>Featured</h3><div class="grid">${featured.map(card).join('')||'<div class="panel-card">No featured project yet.</div>'}</div>${others.length?`<h3>More Projects</h3><div class="grid">${others.map(card).join('')}</div>`:''}<div class="panel-card" style="margin-top:16px"><strong>Future-ready project registry</strong><p class="muted">Add a project in Control Center and it becomes part of the public portfolio after you publish.</p></div>`;
}

const contents={
  projects:()=>projectMarkup(),
  learning:()=>`<h2>Learning</h2><p>I am building my software-engineering foundation through consistent practice, university study, and real projects.</p><h3>Current Learning Path</h3>${(portfolio.owner.learning||[]).map(x=>`<div class="skill-row"><div class="skill-top"><span>${esc(x.name)}</span><span>${esc(x.status)}</span></div><div class="skill-bar"><span style="width:${Math.max(0,Math.min(100,Number(x.progress)||0))}%"></span></div></div>`).join('')}<h3>Next Focus</h3><div class="grid">${(portfolio.owner.focus||[]).map(x=>`<div class="panel-card"><strong>${esc(x)}</strong><p class="muted">Part of my ongoing software-engineering growth.</p></div>`).join('')}</div>`,
  skills:()=>`<h2>Skills</h2><p class="muted">A practical map of the technologies and concepts I am working with.</p>${portfolio.skills.map(g=>`<section class="panel-card" style="margin:12px 0"><h3 style="margin-top:0">${esc(g.title)}</h3><div class="chips">${g.items.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div></section>`).join('')}`,
  education:()=>`<h2>Education</h2>${portfolio.education.map(e=>`<div class="panel-card" style="margin:12px 0"><div style="display:flex;justify-content:space-between;gap:12px"><strong>${esc(e.institution)}</strong><span class="muted">${esc(e.status)}</span></div><p>${esc(e.degree)}</p><span class="muted">${esc(e.details)}</span></div>`).join('')}`,
  journey:()=>`<h2>Journey</h2><p>My path is about progress: learn a concept, apply it, build something, reflect, and improve.</p><div class="timeline">${portfolio.journey.map(j=>`<div class="timeline-item"><strong>${esc(j.title)}</strong><span>${esc(j.detail)}</span></div>`).join('')}</div>`,
  about:()=>`<h2>About Me</h2><p>${esc(portfolio.owner.identity.positioning || 'I am a Software Engineering student focused on learning, building, and growing through practical software projects.')}</p><div class="grid"><div class="panel-card"><strong>What I enjoy</strong><p>Building websites, solving programming problems, working with databases, and turning ideas into working systems.</p></div><div class="panel-card"><strong>What I am improving</strong><p>C++, SQL, data structures and algorithms, web development, software engineering practices, and project quality.</p></div><div class="panel-card"><strong>What I am looking for</strong><p>Internships, entry-level opportunities, freelance projects, and meaningful collaboration.</p></div><div class="panel-card"><strong>Location</strong><p>${esc(portfolio.owner.identity.location)}</p></div></div>`,
  achievements:()=>`<h2>Achievements & Activities</h2>${portfolio.achievements.map(a=>`<div class="panel-card" style="margin:10px 0"><strong>${esc(a)}</strong></div>`).join('')}`,
  resume:()=>`<h2>Resume</h2><p>This is the official CV provided for the portfolio.</p><div class="panel-card"><strong>${esc(portfolio.owner.identity.fullName)} — ${esc(portfolio.owner.identity.profession)}</strong><p class="muted">Download or open the PDF.</p><div class="window-actions"><a class="primary-link" href="${esc(portfolio.owner.contact.cv||'#')}" download>Download CV</a><a href="${esc(portfolio.owner.contact.cv||'#')}" target="_blank" rel="noreferrer noopener">Open CV</a></div></div>`,
  founder:()=>`<h2>Founder.txt</h2><div class="panel-card"><p><strong>Who I am:</strong> A Software Engineering student building a practical foundation.</p><p><strong>What I build:</strong> Web applications and software projects that help me turn learning into evidence.</p><p><strong>Why I care:</strong> Growth comes from shipping, debugging, and trying again.</p><p><strong>What I am exploring:</strong> Better web development, stronger databases, algorithms, and professional engineering habits.</p><p><strong>What I refuse to compromise:</strong> Learning honestly and improving consistently.</p><p><strong>Contact:</strong> ${esc(portfolio.owner.contact.email)}</p></div>`,
  contact:()=>`<h2>Contact</h2><p>For internships, entry-level opportunities, freelance work, or collaboration, email is the primary route.</p><div class="contact-box"><a class="contact-action" href="mailto:${esc(portfolio.owner.contact.email)}"><span class="icon icon-mail"></span><div><strong>Email</strong><span>${esc(portfolio.owner.contact.email)}</span></div></a>${portfolio.owner.contact.phone?`<a class="contact-action" href="tel:${esc(portfolio.owner.contact.phone)}"><span class="icon icon-user"></span><div><strong>Phone</strong><span>${esc(portfolio.owner.contact.phone)}</span></div></a>`:'<div class="contact-action"><span class="icon icon-user"></span><div><strong>Phone</strong><span>Hidden until added</span></div></div>'}${portfolio.owner.contact.github?`<a class="contact-action" href="${esc(portfolio.owner.contact.github)}" target="_blank" rel="noreferrer noopener"><span class="icon icon-code"></span><div><strong>GitHub</strong><span>Open profile</span></div></a>`:''}${portfolio.owner.contact.linkedin?`<a class="contact-action" href="${esc(portfolio.owner.contact.linkedin)}" target="_blank" rel="noreferrer noopener"><span class="icon icon-user"></span><div><strong>LinkedIn</strong><span>Open profile</span></div></a>`:''}</div>`,
  browser:()=>`<h2>Browser</h2><p>Quick links to approved public destinations.</p><div class="grid"><div class="panel-card"><strong>Garage Management System</strong><p class="muted">Live demo</p><div class="window-actions"><a class="primary-link" href="https://garage-management.infinityfree.io/garage_management/" target="_blank" rel="noreferrer noopener">Open Site</a></div></div>${portfolio.owner.contact.github?`<div class="panel-card"><strong>GitHub</strong><div class="window-actions"><a class="primary-link" href="${esc(portfolio.owner.contact.github)}" target="_blank" rel="noreferrer noopener">Open GitHub</a></div></div>`:''}</div>`,
  whiteboard:()=>whiteboardMarkup(),
  control:()=>controlMarkup()
};

function whiteboardMarkup(){
  const notes=JSON.parse(localStorage.getItem('tayassuk-os-whiteboard-v1')||'[]');
  return `<div class="whiteboard"><form class="sticky-form" id="sticky-form"><h2>Whiteboard</h2><p class="muted">Notes stay only in this browser.</p><textarea id="sticky-input" maxlength="500" placeholder="Write a quick idea…"></textarea><button type="submit">Add Sticky</button><button type="button" id="sticky-reset">Reset Board</button></form><div class="sticky-board" id="sticky-board">${notes.map((n,i)=>`<div class="sticky" style="left:${n.x||10}px;top:${n.y||10}px"><button type="button" data-sticky-delete="${i}" aria-label="Delete note">×</button><p>${esc(n.text)}</p></div>`).join('')}</div></div>`;
}

async function controlMarkup(){
  const session=state.adminSession || await getSession(); state.adminSession=session;
  if(!session) return `<div class="admin-panel"><h2>Control Center</h2><p class="muted">Securely manage the entire public portfolio from here.</p><div class="panel-card"><h3>Admin Sign In</h3><form id="admin-login-form" class="admin-form"><label>Email<input type="email" id="admin-email" autocomplete="username" required></label><label>Password<input type="password" id="admin-password" autocomplete="current-password" required></label><div class="window-actions"><button class="primary-link" type="submit">Sign In</button></div><p id="admin-login-msg" class="muted"></p></form></div><div class="panel-card"><h3>First-time setup</h3><p class="muted">Connect Supabase once, create your admin user, then all future content changes can be made from this screen.</p><code>content/supabase-config.js</code></div></div>`;
  return adminEditorMarkup();
}

function projectEditor(p, index){
  return `<div class="panel-card admin-project" data-project-index="${index}"><div class="admin-row admin-project-head"><strong>Project ${index+1}</strong><button type="button" data-admin-delete-project="${index}">Delete</button></div><div class="admin-grid">${[['id','ID'],['name','Name'],['category','Category'],['dates','Dates'],['role','Role'],['status','Status'],['url','Live URL'],['repository','GitHub URL'],['image','Image URL']].map(([k,l])=>`<label>${l}<input data-project-field="${k}" value="${esc(p[k]||'')}"></label>`).join('')}</div><label>Problem<textarea data-project-field="problem">${esc(p.problem||'')}</textarea></label><label>Build / Intervention<textarea data-project-field="intervention">${esc(p.intervention||'')}</textarea></label><label>Outcome<textarea data-project-field="outcome">${esc(p.outcome||'')}</textarea></label><label>Technologies (comma separated)<input data-project-field="stack" value="${esc((p.stack||[]).join(', '))}"></label><label class="checkbox-line"><input type="checkbox" data-project-field="featured" ${p.featured?'checked':''}> Featured project</label></div>`;
}
function adminEditorMarkup(){
  const o=portfolio.owner;
  return `<div class="admin-panel"><div class="admin-toolbar"><div><h2>Control Center</h2><p class="muted">Publish portfolio changes without editing code.</p></div><div class="window-actions"><button id="admin-refresh">Refresh</button><button id="admin-logout">Sign Out</button></div></div><div id="admin-status" class="panel-card" style="margin-bottom:14px"><strong>Backend:</strong> ${remoteMeta.configured?'Connected':'Not connected'}${remoteMeta.updatedAt?` · Last publish ${esc(new Date(remoteMeta.updatedAt).toLocaleString())}`:''}</div><div class="admin-tabs"><button data-admin-tab="profile">Profile</button><button data-admin-tab="projects">Projects</button><button data-admin-tab="learning">Learning</button><button data-admin-tab="skills">Skills</button><button data-admin-tab="education">Education</button><button data-admin-tab="achievements">Achievements</button><button data-admin-tab="journey">Journey</button></div><div id="admin-content">${adminProfileMarkup()}</div></div>`;
}
function adminProfileMarkup(){
  const o=portfolio.owner;
  return `<form id="admin-profile-form" class="admin-form"><div class="admin-grid">${[['fullName','Full name',o.identity.fullName],['shortName','Short name',o.identity.shortName],['osName','OS name',o.identity.osName],['profession','Profession',o.identity.profession],['location','Location',o.identity.location],['timezone','Timezone',o.identity.timezone],['headline','Headline',o.identity.headline],['positioning','Positioning',o.identity.positioning]].map(([k,l,v])=>`<label>${l}<input data-owner-field="${k}" value="${esc(v||'')}"></label>`).join('')}${[['email','Email',o.contact.email],['phone','Phone',o.contact.phone],['github','GitHub URL',o.contact.github],['linkedin','LinkedIn URL',o.contact.linkedin],['cv','CV URL / path',o.contact.cv]].map(([k,l,v])=>`<label>${l}<input data-contact-field="${k}" value="${esc(v||'')}"></label>`).join('')}</div><label>Focus (one per line)<textarea id="admin-focus">${esc((o.focus||[]).join('\n'))}</textarea></label><label>Strengths (one per line)<textarea id="admin-strengths">${esc((o.strengths||[]).join('\n'))}</textarea></label><div class="window-actions"><button class="primary-link" type="submit">Save & Publish Profile</button></div></form>`;
}
function adminLearningMarkup(){return `<form id="admin-learning-form" class="admin-form"><label>Learning items — one per line as <code>Name | Status | Progress</code><textarea id="admin-learning" rows="12">${esc((portfolio.owner.learning||[]).map(x=>`${x.name} | ${x.status} | ${x.progress}`).join('\n'))}</textarea></label><label>Next focus — one per line<textarea id="admin-focus-2" rows="8">${esc((portfolio.owner.focus||[]).join('\n'))}</textarea></label><div class="window-actions"><button class="primary-link" type="submit">Save & Publish Learning</button></div></form>`;}
function adminSkillsMarkup(){return `<form id="admin-skills-form" class="admin-form"><label>Skill groups — one per line as <code>Group | item, item, item</code><textarea id="admin-skills" rows="14">${esc(portfolio.skills.map(g=>`${g.title} | ${g.items.join(', ')}`).join('\n'))}</textarea></label><div class="window-actions"><button class="primary-link" type="submit">Save & Publish Skills</button></div></form>`;}
function adminEducationMarkup(){return `<form id="admin-education-form" class="admin-form"><label>Education — one per line as <code>Institution | Degree | Status | Details</code><textarea id="admin-education" rows="12">${esc(portfolio.education.map(e=>`${e.institution} | ${e.degree} | ${e.status} | ${e.details}`).join('\n'))}</textarea></label><div class="window-actions"><button class="primary-link" type="submit">Save & Publish Education</button></div></form>`;}
function adminAchievementsMarkup(){return `<form id="admin-achievements-form" class="admin-form"><label>Achievements / activities — one per line<textarea id="admin-achievements" rows="12">${esc(portfolio.achievements.join('\n'))}</textarea></label><div class="window-actions"><button class="primary-link" type="submit">Save & Publish Achievements</button></div></form>`;}
function adminJourneyMarkup(){return `<form id="admin-journey-form" class="admin-form"><label>Journey — one per line as <code>Title | Detail</code><textarea id="admin-journey" rows="14">${esc(portfolio.journey.map(j=>`${j.title} | ${j.detail}`).join('\n'))}</textarea></label><div class="window-actions"><button class="primary-link" type="submit">Save & Publish Journey</button></div></form>`;}
function adminProjectsMarkup(){return `<div class="admin-form"><div class="window-actions"><button class="primary-link" id="admin-add-project" type="button">+ Add Project</button><button id="admin-save-projects" type="button">Save & Publish Projects</button></div><div id="admin-project-list">${portfolio.projects.map(projectEditor).join('')}</div></div>`;}

function openWindow(appId){
  const app=appDefinitions.find(a=>a.id===appId); if(!app)return;
  if(state.windows.has(appId)){focusWindow(appId);return;}
  const pos=windowPosition(); const win=document.createElement('section'); win.className='app-window'; win.dataset.app=appId; win.style.left=`${pos.left}px`; win.style.top=`${pos.top}px`; win.style.zIndex=++state.z;
  win.innerHTML=`<div class="window-chrome"><span class="app-icon-big" style="width:30px;height:30px;margin:0"><span class="${iconClass(app.icon)}"></span></span><span class="window-title">${esc(app.name)}</span><span class="window-state">Tayassuk OS</span><div class="window-controls"><button data-window="minimize" aria-label="Minimize">—</button><button data-window="maximize" aria-label="Maximize">□</button><button data-window="close" aria-label="Close">×</button></div></div><div class="window-body">${typeof contents[appId]==='function'?awaitMaybe(contents[appId]):''}</div>`;
  document.querySelector('#windows').appendChild(win); state.windows.set(appId,win); wireWindow(win); focusWindow(appId);
}
function awaitMaybe(fn){try{const result=fn();return result instanceof Promise?'Loading…':result;}catch(error){console.error(error);return `<div class="panel-card"><strong>Unable to open this app.</strong><p>${esc(error.message||'Unknown error')}</p></div>`;}}
async function refreshWindow(appId){
  const win=state.windows.get(appId); if(!win)return; const body=win.querySelector('.window-body');
  if(appId==='control'){body.innerHTML=await controlMarkup(); wireAdmin(body);} else {body.innerHTML=contents[appId](); if(appId==='whiteboard')wireWhiteboard(win); if(appId==='projects')wireProjectActions(win);}
}
function focusWindow(appId){const win=state.windows.get(appId);if(win)win.style.zIndex=++state.z;}
function closeWindow(appId){const win=state.windows.get(appId);if(win){win.remove();state.windows.delete(appId);}}
function wireWindow(win){
  const appId=win.dataset.app; win.addEventListener('pointerdown',()=>focusWindow(appId));
  win.querySelector('[data-window="close"]').addEventListener('click',()=>closeWindow(appId));
  win.querySelector('[data-window="minimize"]').addEventListener('click',()=>win.classList.toggle('hidden'));
  win.querySelector('[data-window="maximize"]').addEventListener('click',()=>{win.classList.toggle('maximized');if(win.classList.contains('maximized')){win.style.left='16px';win.style.top='70px';win.style.width='calc(100vw - 32px)';win.style.height='calc(100vh - 150px)';}else{win.style.width='';win.style.height='';const p=windowPosition();win.style.left=`${p.left}px`;win.style.top=`${p.top}px`;}});
  const chrome=win.querySelector('.window-chrome'); let dragging=false,ox=0,oy=0;
  chrome.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;dragging=true;ox=e.clientX-win.offsetLeft;oy=e.clientY-win.offsetTop;chrome.setPointerCapture(e.pointerId);});
  chrome.addEventListener('pointermove',e=>{if(!dragging||innerWidth<761)return;let left=e.clientX-ox,top=e.clientY-oy;left=Math.max(8,Math.min(left,innerWidth-win.offsetWidth-8));top=Math.max(64,Math.min(top,innerHeight-80));win.style.left=`${left}px`;win.style.top=`${top}px`;});
  chrome.addEventListener('pointerup',()=>dragging=false);
  if(appId==='projects')wireProjectActions(win); if(appId==='whiteboard')wireWhiteboard(win); if(appId==='control')wireAdmin(win.querySelector('.window-body'));
}
function wireProjectActions(win){win.querySelectorAll('[data-action="project-detail"]').forEach(btn=>btn.addEventListener('click',()=>showProjectDetail(btn.dataset.project)));}
function showProjectDetail(id){
  const p=portfolio.projects.find(x=>x.id===id); const win=state.windows.get('projects'); if(!p||!win)return;
  const body=win.querySelector('.window-body'); body.innerHTML=`<h2>${esc(p.name)}</h2><p>${esc(p.intervention||p.description||'')}</p><div class="grid"><div class="panel-card"><strong>Problem</strong><p>${esc(p.problem||'')}</p></div><div class="panel-card"><strong>Outcome</strong><p>${esc(p.outcome||'')}</p></div><div class="panel-card"><strong>Role</strong><p>${esc(p.role||'')}</p></div><div class="panel-card"><strong>Stack</strong><p>${esc((p.stack||[]).join(' · '))}</p></div></div><div class="window-actions">${p.url?`<a class="primary-link" href="${esc(p.url)}" target="_blank" rel="noreferrer noopener">Open Live Demo</a>`:''}<button id="back-projects">Back to Projects</button></div>`;
  body.querySelector('#back-projects').addEventListener('click',()=>{body.innerHTML=contents.projects();wireProjectActions(win);});
}
function wireWhiteboard(win){
  const form=win.querySelector('#sticky-form'); const board=win.querySelector('#sticky-board'); if(!form||!board)return;
  const save=()=>{const data=[...board.querySelectorAll('.sticky')].map(n=>({text:n.querySelector('p')?.textContent||'',x:parseInt(n.style.left)||10,y:parseInt(n.style.top)||10}));localStorage.setItem('tayassuk-os-whiteboard-v1',JSON.stringify(data));};
  form.addEventListener('submit',e=>{e.preventDefault();const text=win.querySelector('#sticky-input').value.trim();if(!text)return;const note=document.createElement('div');note.className='sticky';note.style.left='20px';note.style.top='20px';note.innerHTML=`<button type="button">×</button><p></p>`;note.querySelector('p').textContent=text;note.querySelector('button').addEventListener('click',()=>{note.remove();save();});board.appendChild(note);win.querySelector('#sticky-input').value='';save();});
  win.querySelectorAll('[data-sticky-delete]').forEach(b=>b.addEventListener('click',()=>{b.parentElement.remove();save();})); win.querySelector('#sticky-reset')?.addEventListener('click',()=>{board.innerHTML='';save();});
}

async function loadPortfolio(){
  const res=await loadRemotePortfolio(); remoteMeta={configured:res.configured,updatedAt:res.updatedAt||null};
  if(res.data && typeof res.data==='object') portfolio=mergePortfolio(fallbackPortfolio,res.data);
  renderAll();
}
function mergePortfolio(base, remote){return {owner:{...base.owner,...remote.owner,identity:{...base.owner.identity,...(remote.owner?.identity||{})},contact:{...base.owner.contact,...(remote.owner?.contact||{})},learning:remote.owner?.learning||base.owner.learning,focus:remote.owner?.focus||base.owner.focus,strengths:remote.owner?.strengths||base.owner.strengths},projects:Array.isArray(remote.projects)?remote.projects:base.projects,education:Array.isArray(remote.education)?remote.education:base.education,skills:Array.isArray(remote.skills)?remote.skills:base.skills,achievements:Array.isArray(remote.achievements)?remote.achievements:base.achievements,journey:Array.isArray(remote.journey)?remote.journey:base.journey};}
function renderAll(){renderIdentity();renderAppGrid();renderSocials();}

async function publish(){
  const saved=await saveRemotePortfolio(portfolio); remoteMeta.updatedAt=saved?.updated_at||new Date().toISOString(); remoteMeta.configured=true; alert('Published successfully. Refresh the public portfolio to see the latest changes.'); renderAll();
}
async function wireAdmin(root){
  if(!root)return;
  root.querySelector('#admin-login-form')?.addEventListener('submit',async e=>{e.preventDefault();const msg=root.querySelector('#admin-login-msg');try{state.adminSession=await signIn(root.querySelector('#admin-email').value.trim(),root.querySelector('#admin-password').value);await refreshWindow('control');}catch(err){msg.textContent=err.message;}});
  root.querySelector('#admin-logout')?.addEventListener('click',async()=>{await signOut();state.adminSession=null;await refreshWindow('control');});
  root.querySelector('#admin-refresh')?.addEventListener('click',async()=>{await loadPortfolio();await refreshWindow('control');});
  root.querySelectorAll('[data-admin-tab]').forEach(btn=>btn.addEventListener('click',()=>{const tab=btn.dataset.adminTab;const c=root.querySelector('#admin-content');c.innerHTML=tab==='profile'?adminProfileMarkup():tab==='projects'?adminProjectsMarkup():tab==='learning'?adminLearningMarkup():tab==='skills'?adminSkillsMarkup():tab==='education'?adminEducationMarkup():tab==='achievements'?adminAchievementsMarkup():adminJourneyMarkup();wireAdminForms(c);wireAdmin(c);}));
  wireAdminForms(root); wireAdminProjects(root);
}
function wireAdminForms(root){
  root.querySelector('#admin-profile-form')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;for(const el of f.querySelectorAll('[data-owner-field]'))portfolio.owner.identity[el.dataset.ownerField]=el.value.trim();for(const el of f.querySelectorAll('[data-contact-field]'))portfolio.owner.contact[el.dataset.contactField]=el.value.trim();portfolio.owner.focus=f.querySelector('#admin-focus').value.split('\n').map(s=>s.trim()).filter(Boolean);portfolio.owner.strengths=f.querySelector('#admin-strengths').value.split('\n').map(s=>s.trim()).filter(Boolean);await publish();await refreshWindow('control');});
  root.querySelector('#admin-learning-form')?.addEventListener('submit',async e=>{e.preventDefault();portfolio.owner.learning=root.querySelector('#admin-learning').value.split('\n').map(x=>x.split('|').map(s=>s.trim())).filter(x=>x[0]).map(x=>({name:x[0],status:x[1]||'Learning',progress:Number(x[2])||0}));portfolio.owner.focus=root.querySelector('#admin-focus-2').value.split('\n').map(s=>s.trim()).filter(Boolean);await publish();await refreshWindow('control');});
  root.querySelector('#admin-skills-form')?.addEventListener('submit',async e=>{e.preventDefault();portfolio.skills=root.querySelector('#admin-skills').value.split('\n').map(x=>x.split('|')).filter(x=>x[0]?.trim()).map(x=>({title:x[0].trim(),items:(x[1]||'').split(',').map(s=>s.trim()).filter(Boolean)}));await publish();await refreshWindow('control');});
  root.querySelector('#admin-education-form')?.addEventListener('submit',async e=>{e.preventDefault();portfolio.education=root.querySelector('#admin-education').value.split('\n').map(x=>x.split('|').map(s=>s.trim())).filter(x=>x[0]).map(x=>({institution:x[0],degree:x[1]||'',status:x[2]||'',details:x[3]||''}));await publish();await refreshWindow('control');});
  root.querySelector('#admin-achievements-form')?.addEventListener('submit',async e=>{e.preventDefault();portfolio.achievements=root.querySelector('#admin-achievements').value.split('\n').map(s=>s.trim()).filter(Boolean);await publish();await refreshWindow('control');});
  root.querySelector('#admin-journey-form')?.addEventListener('submit',async e=>{e.preventDefault();portfolio.journey=root.querySelector('#admin-journey').value.split('\n').map(x=>x.split('|').map(s=>s.trim())).filter(x=>x[0]).map(x=>({title:x[0],detail:x[1]||''}));await publish();await refreshWindow('control');});
}
function wireAdminProjects(root){
  root.querySelector('#admin-add-project')?.addEventListener('click',()=>{portfolio.projects.push({id:`project-${Date.now()}`,name:'New Project',category:'Web / Software',dates:'',role:'Solo Developer',status:'In Progress',problem:'',intervention:'',outcome:'',url:'',repository:'',image:'',stack:[],featured:false});root.querySelector('#admin-project-list').innerHTML=portfolio.projects.map(projectEditor).join('');wireAdminProjects(root);});
  root.querySelectorAll('[data-admin-delete-project]').forEach(btn=>btn.addEventListener('click',()=>{portfolio.projects.splice(Number(btn.dataset.adminDeleteProject),1);root.querySelector('#admin-project-list').innerHTML=portfolio.projects.map(projectEditor).join('');wireAdminProjects(root);}));
  root.querySelector('#admin-save-projects')?.addEventListener('click',async()=>{root.querySelectorAll('.admin-project').forEach(card=>{const i=Number(card.dataset.projectIndex),p=portfolio.projects[i];card.querySelectorAll('[data-project-field]').forEach(el=>{const k=el.dataset.projectField;if(k==='featured')p.featured=el.checked;else if(k==='stack')p.stack=el.value.split(',').map(s=>s.trim()).filter(Boolean);else p[k]=el.value;});});await publish();await refreshWindow('control');});
}

async function initAdminConfigNotice(){const cfg=await currentConfigState();remoteMeta.configured=cfg.configured;}

document.addEventListener('click',async e=>{const t=e.target.closest('[data-action]');if(!t)return;const a=t.dataset.action;if(a==='open'){if(t.dataset.app==='control'){await openControlWindow();}else{openWindow(t.dataset.app);}}if(a==='search')openSearch();if(a==='theme')setTheme();});
function setTheme(){state.theme=state.theme==='dark'?'night':state.theme==='night'?'day':'dark';document.documentElement.dataset.theme=state.theme;localStorage.setItem('tayassuk-os-theme-v1',state.theme);}
function openSearch(){const overlay=document.querySelector('#command-palette');overlay.classList.remove('hidden');overlay.innerHTML=`<div class="command-palette"><input id="command-input" class="command-search" placeholder="Search apps, projects, skills…" autofocus><div id="command-list" class="command-list"></div></div>`;const all=[...appDefinitions.map(a=>({title:a.name,desc:a.desc,type:'app',action:()=>openWindow(a.id)})),...portfolio.projects.map(p=>({title:p.name,desc:'Project',type:'project',action:()=>openWindow('projects')})),...portfolio.skills.flatMap(g=>g.items.map(x=>({title:x,desc:g.title,type:'skill',action:()=>openWindow('skills')})))];const render=q=>{const f=all.filter(x=>`${x.title} ${x.desc}`.toLowerCase().includes(q.toLowerCase()));document.querySelector('#command-list').innerHTML=f.map((x,i)=>`<div class="command-item" data-i="${i}"><span>${esc(x.title)}</span><small>${esc(x.type)}</small></div>`).join('')||'<div class="command-item">No results</div>';f.forEach((x,i)=>document.querySelectorAll('.command-item')[i]?.addEventListener('click',()=>{x.action();closeSearch();}));};const input=document.querySelector('#command-input');input.addEventListener('input',()=>render(input.value));render('');}
function closeSearch(){const o=document.querySelector('#command-palette');o.classList.add('hidden');o.innerHTML='';}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}if(e.key==='Escape')closeSearch();});

function openControlWindow(){openWindow('control');setTimeout(()=>refreshWindow('control'),0);}

const companion=document.querySelector('#companion'); if(companion){try{const saved=JSON.parse(localStorage.getItem('tayassuk-os-companion-v1')||'null');if(saved){companion.style.left=saved.x+'px';companion.style.top=saved.y+'px';companion.style.bottom='auto';}}catch{}let drag=false,cx=0,cy=0;companion.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag=true;cx=e.clientX-companion.offsetLeft;cy=e.clientY-companion.offsetTop;companion.setPointerCapture(e.pointerId);});companion.addEventListener('pointermove',e=>{if(!drag||innerWidth<761)return;let x=Math.max(8,Math.min(e.clientX-cx,innerWidth-companion.offsetWidth-8));let y=Math.max(64,Math.min(e.clientY-cy,innerHeight-150));companion.style.left=x+'px';companion.style.top=y+'px';companion.style.bottom='auto';localStorage.setItem('tayassuk-os-companion-v1',JSON.stringify({x,y}));});companion.addEventListener('pointerup',()=>drag=false);document.querySelector('#companion-reset')?.addEventListener('click',()=>{companion.style.left='22px';companion.style.top='auto';companion.style.bottom='116px';localStorage.removeItem('tayassuk-os-companion-v1');});}

const boot=document.querySelector('#boot-screen');const bar=document.querySelector('#boot-progress-bar');let progress=0;const animateBoot=setInterval(()=>{progress=Math.min(100,progress+8);if(bar)bar.style.width=`${progress}%`;if(progress>=100){clearInterval(animateBoot);window.__finishTayassukBoot?.();}},110);document.querySelector('#skip-boot')?.addEventListener('click',()=>window.__finishTayassukBoot?.());

(async()=>{await initAdminConfigNotice();await loadPortfolio();})();
