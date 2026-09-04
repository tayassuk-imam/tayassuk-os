import { ownerProfile } from './content/owner-profile.js';
import { projects, futureProjects } from './content/projects.js';
import { education } from './content/education.js';
import { skillGroups } from './content/skills.js';
import { achievements } from './content/achievements.js';

const state = {
  z: 100,
  windows: new Map(),
  theme: localStorage.getItem('tayassuk-os-theme-v1') || 'dark'
};

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
  { id:'browser', name:'Browser', desc:'Approved external links', badge:'LINKS', icon:'globe' }
];

const iconClass = (name) => `icon icon-${name}`;

document.documentElement.dataset.theme = state.theme;

function renderAppGrid(){
  document.querySelector('#app-grid').innerHTML = appDefinitions.map(a => `
    <button class="desktop-app" data-action="open" data-app="${a.id}">
      <span class="app-icon-big"><span class="${iconClass(a.icon)}"></span></span>
      <h3>${a.name}</h3><p>${a.desc}</p><span class="badge">${a.badge}</span>
    </button>`).join('');
}

function renderSocials(){
  const items=[];
  if(ownerProfile.contact.github) items.push(`<a class="social-chip" href="${ownerProfile.contact.github}" target="_blank" rel="noreferrer noopener">GitHub</a>`);
  if(ownerProfile.contact.linkedin) items.push(`<a class="social-chip" href="${ownerProfile.contact.linkedin}" target="_blank" rel="noreferrer noopener">LinkedIn</a>`);
  if(ownerProfile.contact.email) items.push(`<a class="social-chip" href="mailto:${ownerProfile.contact.email}">Email</a>`);
  document.querySelector('#social-row').innerHTML = items.join('');
}

function nowLabel(){
  const d = new Date();
  const date = new Intl.DateTimeFormat('en-BD',{timeZone:ownerProfile.identity.timezone,weekday:'short',month:'short',day:'numeric'}).format(d);
  const time = new Intl.DateTimeFormat('en-BD',{timeZone:ownerProfile.identity.timezone,hour:'numeric',minute:'2-digit'}).format(d);
  return `${date} · ${time}`;
}
function updateClock(){ document.querySelector('#clock').textContent = nowLabel(); }
updateClock(); setInterval(updateClock, 1000);

function windowPosition(){
  const open = state.windows.size;
  const w = Math.max(10, Math.min(window.innerWidth - 60, 860));
  const h = Math.max(10, Math.min(window.innerHeight - 140, 650));
  return { left: Math.max(12, (window.innerWidth - w)/2 + (open%4)*18), top: Math.max(70, (window.innerHeight - h)/2 + (open%3)*14) };
}

function projectMarkup(){
  const featured = projects.filter(p=>p.featured);
  const others = projects.filter(p=>!p.featured);
  const projectCard = p => `<article class="project-card">
    <div class="project-head"><div><h3>${p.name}</h3><div class="muted">${p.category} · ${p.role}</div></div><span class="status">${p.status}</span></div>
    <p>${p.outcome}</p>
    <div class="chips">${p.stack.map(x=>`<span class="chip">${x}</span>`).join('')}</div>
    <div class="window-actions">
      ${p.url?`<a class="primary-link" href="${p.url}" target="_blank" rel="noreferrer noopener">Live Demo</a>`:''}
      ${p.repository?`<a href="${p.repository}" target="_blank" rel="noreferrer noopener">Repository</a>`:''}
      <button data-action="project-detail" data-project="${p.id}">View Details</button>
    </div>
  </article>`;
  return `<h2>Projects</h2><p class="muted">Built work stays first. Future projects can be added through <code>content/projects.js</code> without changing the interface.</p>
    <h3>Featured</h3><div class="grid">${featured.map(projectCard).join('')}</div>
    <h3>Future Project Slots</h3><div class="grid">${futureProjects.map(f=>`<div class="panel-card"><strong>${f.label}</strong><p class="muted">${f.status} — add a new object to the project registry when you're ready.</p></div>`).join('')}</div>
    ${others.length?`<h3>More Projects</h3><div class="grid">${others.map(projectCard).join('')}</div>`:''}`;
}

const contents = {
  projects: () => projectMarkup(),
  learning: () => `<h2>Learning</h2><p>I am building my software-engineering foundation through consistent practice, university study, and real projects.</p><h3>Current Learning Path</h3>${ownerProfile.learning.map(x=>`<div class="skill-row"><div class="skill-top"><span>${x.name}</span><span>${x.status}</span></div><div class="skill-bar"><span style="width:${x.progress}%"></span></div></div>`).join('')}<h3>Next Focus</h3><div class="grid">${ownerProfile.focus.map(x=>`<div class="panel-card"><strong>${x}</strong><p class="muted">Part of my ongoing software-engineering growth.</p></div>`).join('')}</div>`,
  skills: () => `<h2>Skills</h2><p class="muted">A practical map of the technologies and concepts I am working with.</p>${skillGroups.map(g=>`<section class="panel-card" style="margin:12px 0"><h3 style="margin-top:0">${g.title}</h3><div class="chips">${g.items.map(x=>`<span class="chip">${x}</span>`).join('')}</div></section>`).join('')}`,
  education: () => `<h2>Education</h2>${education.map(e=>`<div class="panel-card" style="margin:12px 0"><div style="display:flex;justify-content:space-between;gap:12px"><strong>${e.institution}</strong><span class="muted">${e.status}</span></div><p>${e.degree}</p><span class="muted">${e.details}</span></div>`).join('')}`,
  journey: () => `<h2>Journey</h2><p>My path is about progress: learn a concept, apply it, build something, reflect, and improve.</p><div class="timeline"><div class="timeline-item"><strong>Programming foundations</strong><span>C, C++, pointers, structures, files, sorting & searching</span></div><div class="timeline-item"><strong>Problem solving</strong><span>Data structures, algorithms, and competitive programming practice</span></div><div class="timeline-item"><strong>Database systems</strong><span>SQL, MySQL, relational design, joins, normalization, CRUD</span></div><div class="timeline-item"><strong>Web development</strong><span>HTML, CSS, JavaScript, PHP, backend-connected interfaces</span></div><div class="timeline-item"><strong>Garage Management System</strong><span>Solo-developed, database-driven web application deployed for demonstration</span></div><div class="timeline-item"><strong>Next chapter</strong><span>Keep learning, build stronger projects, and grow into a professional Software Engineer</span></div></div>`,
  about: () => `<h2>About Me</h2><p>I'm Tayassuk Imam, a Software Engineering student focused on learning, building, and growing through practical software projects.</p><div class="grid"><div class="panel-card"><strong>What I enjoy</strong><p>Building websites, solving programming problems, working with databases, and turning ideas into working systems.</p></div><div class="panel-card"><strong>What I am improving</strong><p>C++, SQL, data structures and algorithms, web development, software engineering practices, and project quality.</p></div><div class="panel-card"><strong>What I am looking for</strong><p>Internships, entry-level opportunities, freelance projects, and meaningful collaboration.</p></div><div class="panel-card"><strong>Location</strong><p>${ownerProfile.identity.location}</p></div></div>`,
  achievements: () => `<h2>Achievements & Activities</h2>${achievements.map(a=>`<div class="panel-card" style="margin:10px 0"><strong>${a}</strong></div>`).join('')}`,
  resume: () => `<h2>Resume</h2><p>This is the official CV provided for the portfolio.</p><div class="panel-card"><strong>Tayassuk Imam — Software Engineering Student</strong><p class="muted">Download or open the PDF in a new tab.</p><div class="window-actions"><a class="primary-link" href="${ownerProfile.contact.cv}" download>Download CV</a><a href="${ownerProfile.contact.cv}" target="_blank" rel="noreferrer noopener">Open CV</a></div></div>`,
  founder: () => `<h2>Founder.txt</h2><div class="panel-card"><p><strong>Who I am:</strong> A Software Engineering student building a practical foundation.</p><p><strong>What I build:</strong> Web applications and software projects that help me turn learning into evidence.</p><p><strong>Why I care:</strong> Growth comes from shipping, debugging, and trying again.</p><p><strong>What I am exploring:</strong> Better web development, stronger databases, algorithms, and professional engineering habits.</p><p><strong>What I refuse to compromise:</strong> Learning honestly and improving consistently.</p><p><strong>Contact:</strong> ${ownerProfile.contact.email}</p></div>`,
  contact: () => `<h2>Contact</h2><p>For internships, entry-level opportunities, freelance work, or collaboration, email is the primary route.</p><div class="contact-box"><a class="contact-action" href="mailto:${ownerProfile.contact.email}"><span class="icon icon-mail"></span><div><strong>Email</strong><span>${ownerProfile.contact.email}</span></div></a>${ownerProfile.contact.phone?`<a class="contact-action" href="tel:${ownerProfile.contact.phone}"><span class="icon icon-user"></span><div><strong>Phone</strong><span>${ownerProfile.contact.phone}</span></div></a>`:`<div class="contact-action"><span class="icon icon-user"></span><div><strong>Phone</strong><span>Private for now</span></div></div>`}${ownerProfile.contact.github?`<a class="contact-action" href="${ownerProfile.contact.github}" target="_blank" rel="noreferrer noopener"><span class="icon icon-code"></span><div><strong>GitHub</strong><span>View repositories</span></div></a>`:''}${ownerProfile.contact.linkedin?`<a class="contact-action" href="${ownerProfile.contact.linkedin}" target="_blank" rel="noreferrer noopener"><span class="icon icon-user"></span><div><strong>LinkedIn</strong><span>Professional profile</span></div></a>`:''}</div>`,
  browser: () => `<h2>Browser</h2><p>Approved external links only. Websites that block embedding are always opened in a new tab.</p><div class="grid"><a class="panel-card" href="${projects[0].url}" target="_blank" rel="noreferrer noopener"><strong>Garage Management System</strong><p>Open live project →</p></a>${ownerProfile.contact.github?`<a class="panel-card" href="${ownerProfile.contact.github}" target="_blank" rel="noreferrer noopener"><strong>GitHub</strong><p>Open profile →</p></a>`:''}</div>`,
  whiteboard: () => `<h2>Whiteboard</h2><p class="muted">Notes stay in this browser only. They are not sent to Tayassuk.</p><div class="whiteboard"><div class="sticky-form"><textarea id="sticky-input" maxlength="180" placeholder="Write a quick note…"></textarea><button id="add-sticky">Add Sticky</button><button id="reset-whiteboard" style="background:transparent;color:#94aac0;border:1px solid rgba(255,255,255,.1)">Reset Board</button></div><div class="sticky-board" id="sticky-board"></div></div>`
};

function openWindow(appId){
  if(state.windows.has(appId)) { focusWindow(appId); return; }
  const app = appDefinitions.find(x=>x.id===appId); if(!app) return;
  const win = document.createElement('section');
  const pos = windowPosition();
  win.className='app-window'; win.dataset.app=appId; win.style.left=`${pos.left}px`; win.style.top=`${pos.top}px`; win.style.zIndex=++state.z;
  win.innerHTML = `<div class="window-chrome"><span class="app-icon-big" style="width:30px;height:30px;margin:0"><span class="${iconClass(app.icon)}"></span></span><span class="window-title">${app.name}</span><span class="window-state">Tayassuk OS</span><div class="window-controls"><button data-window="minimize" aria-label="Minimize">—</button><button data-window="maximize" aria-label="Maximize">□</button><button data-window="close" aria-label="Close">×</button></div></div><div class="window-body">${contents[appId]()}</div>`;
  document.querySelector('#windows').appendChild(win); state.windows.set(appId, win); wireWindow(win); focusWindow(appId); if(appId==='whiteboard') wireWhiteboard(win);
}
function focusWindow(appId){ const win=state.windows.get(appId); if(!win)return; win.style.zIndex=++state.z; }
function closeWindow(appId){ const win=state.windows.get(appId); if(win){win.remove();state.windows.delete(appId);} }
function wireWindow(win){
  win.addEventListener('pointerdown',()=>focusWindow(win.dataset.app));
  win.querySelector('[data-window="close"]').addEventListener('click',()=>closeWindow(win.dataset.app));
  win.querySelector('[data-window="minimize"]').addEventListener('click',()=>win.classList.toggle('hidden'));
  win.querySelector('[data-window="maximize"]').addEventListener('click',()=>{win.classList.toggle('maximized'); if(win.classList.contains('maximized')){win.style.left='16px';win.style.top='70px';win.style.width='calc(100vw - 32px)';win.style.height='calc(100vh - 150px)';} else {win.style.width='';win.style.height='';const p=windowPosition();win.style.left=`${p.left}px`;win.style.top=`${p.top}px`;}});
  const chrome=win.querySelector('.window-chrome'); let dragging=false,ox=0,oy=0;
  chrome.addEventListener('pointerdown',(e)=>{if(e.target.closest('button'))return; dragging=true;ox=e.clientX-win.offsetLeft;oy=e.clientY-win.offsetTop;chrome.setPointerCapture(e.pointerId);});
  chrome.addEventListener('pointermove',(e)=>{if(!dragging || window.innerWidth<761)return;let left=e.clientX-ox, top=e.clientY-oy;left=Math.max(8,Math.min(left,window.innerWidth-win.offsetWidth-8));top=Math.max(64,Math.min(top,window.innerHeight-80));win.style.left=`${left}px`;win.style.top=`${top}px`;});
  chrome.addEventListener('pointerup',()=>dragging=false);
  win.querySelectorAll('[data-action="project-detail"]').forEach(btn=>btn.addEventListener('click',()=>showProjectDetail(btn.dataset.project)));
}
function showProjectDetail(id){
  const p=projects.find(x=>x.id===id); if(!p)return;
  const win=state.windows.get('projects'); if(!win)return;
  const body=win.querySelector('.window-body');
  body.innerHTML=`<h2>${p.name}</h2><p>${p.intervention}</p><div class="grid"><div class="panel-card"><strong>Problem</strong><p>${p.problem}</p></div><div class="panel-card"><strong>Outcome</strong><p>${p.outcome}</p></div><div class="panel-card"><strong>Role</strong><p>${p.role}</p></div><div class="panel-card"><strong>Stack</strong><p>${p.stack.join(' · ')}</p></div></div><div class="window-actions"><a class="primary-link" href="${p.url}" target="_blank" rel="noreferrer noopener">Open Live Demo</a><button id="back-projects">Back to Projects</button></div>`;
  body.querySelector('#back-projects').addEventListener('click',()=>{body.innerHTML=contents.projects();wireWindow(win);});
}
function wireWhiteboard(win){
  const board=win.querySelector('#sticky-board'); const input=win.querySelector('#sticky-input');
  const key='tayassuk-os-whiteboard-v1';
  const get=()=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}};
  const save=(x)=>localStorage.setItem(key,JSON.stringify(x));
  const render=()=>{const items=get(); board.innerHTML=''; items.forEach((n,i)=>{const d=document.createElement('div');d.className='sticky';d.style.left=`${n.x}%`;d.style.top=`${n.y}%`;d.innerHTML=`<button aria-label="Delete note">×</button><p></p>`;d.querySelector('p').textContent=n.text;d.querySelector('button').onclick=()=>{const next=get().filter((_,idx)=>idx!==i);save(next);render();}; board.appendChild(d);});};
  win.querySelector('#add-sticky').onclick=()=>{const text=input.value.trim();if(!text)return;const items=get();items.push({text,x:10+(items.length*7)%70,y:10+(items.length*11)%60});save(items);input.value='';render();};
  win.querySelector('#reset-whiteboard').onclick=()=>{save([]);render();};
  render();
}

function openSearch(){
  const overlay=document.querySelector('#command-palette'); overlay.className='command-palette'; overlay.setAttribute('aria-hidden','false');
  overlay.innerHTML=`<input class="command-search" id="command-search" placeholder="Search apps, skills, projects…" autocomplete="off" /><div class="command-list" id="command-list"></div>`;
  const all=[...appDefinitions.map(a=>({type:'App',title:a.name,desc:a.desc,action:()=>openWindow(a.id)})),...projects.map(p=>({type:'Project',title:p.name,desc:p.category,action:()=>openWindow('projects')})),...skillGroups.flatMap(g=>g.items.map(s=>({type:'Skill',title:s,desc:g.title,action:()=>openWindow('skills')})))];
  const render=(q='')=>{const f=all.filter(x=>`${x.title} ${x.desc}`.toLowerCase().includes(q.toLowerCase()));document.querySelector('#command-list').innerHTML=f.map((x,i)=>`<div class="command-item" data-i="${i}"><span>${x.title}</span><small>${x.type}</small></div>`).join('')||'<div class="command-item">No results</div>';f.forEach((x,i)=>document.querySelectorAll('.command-item')[i]?.addEventListener('click',()=>{x.action();closeSearch();}));};
  render(); const input=document.querySelector('#command-search'); input.focus(); input.oninput=()=>render(input.value); input.onkeydown=(e)=>{if(e.key==='Escape')closeSearch();};
}
function closeSearch(){const o=document.querySelector('#command-palette');o.className='overlay hidden';o.setAttribute('aria-hidden','true');o.innerHTML='';}

function setTheme(){ state.theme=state.theme==='dark'?'light':'dark'; localStorage.setItem('tayassuk-os-theme-v1',state.theme); document.documentElement.dataset.theme=state.theme; if(state.theme==='light'){document.documentElement.style.setProperty('--bg','#eef4fb');document.documentElement.style.setProperty('--bg2','#dfe9f5');document.documentElement.style.setProperty('--panel','rgba(255,255,255,.92)');document.documentElement.style.setProperty('--text','#0a1b2e');document.documentElement.style.setProperty('--muted','#50667b');document.documentElement.style.setProperty('--border','rgba(20,80,140,.17)');}else{document.documentElement.style.removeProperty('--bg');document.documentElement.style.removeProperty('--bg2');document.documentElement.style.removeProperty('--panel');document.documentElement.style.removeProperty('--text');document.documentElement.style.removeProperty('--muted');document.documentElement.style.removeProperty('--border');}}

document.addEventListener('click',e=>{const t=e.target.closest('[data-action]');if(!t)return;const a=t.dataset.action;if(a==='open')openWindow(t.dataset.app);if(a==='search')openSearch();if(a==='theme')setTheme();});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}if(e.key==='Escape'){closeSearch();}});

const companion=document.querySelector('#companion'); const reset=()=>{companion.style.left='22px';companion.style.top='auto';companion.style.bottom='116px';localStorage.removeItem('tayassuk-os-companion-v1');};
try{const saved=JSON.parse(localStorage.getItem('tayassuk-os-companion-v1')||'null');if(saved && innerWidth>760){companion.style.left=saved.x+'px';companion.style.top=saved.y+'px';companion.style.bottom='auto';}}catch{}
document.querySelector('#companion-reset').onclick=reset;
let drag=false,cx=0,cy=0;companion.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag=true;cx=e.clientX-companion.offsetLeft;cy=e.clientY-companion.offsetTop;companion.setPointerCapture(e.pointerId);});companion.addEventListener('pointermove',e=>{if(!drag||innerWidth<761)return;let x=Math.max(8,Math.min(e.clientX-cx,innerWidth-companion.offsetWidth-8));let y=Math.max(64,Math.min(e.clientY-cy,innerHeight-150));companion.style.left=x+'px';companion.style.top=y+'px';companion.style.bottom='auto';localStorage.setItem('tayassuk-os-companion-v1',JSON.stringify({x,y}));});companion.addEventListener('pointerup',()=>drag=false);

renderAppGrid(); renderSocials();

const boot=document.querySelector('#boot-screen');const bar=document.querySelector('#boot-progress-bar');let progress=0;const finish=()=>{if(window.__finishTayassukBoot){window.__finishTayassukBoot();return;}if(!boot)return;boot.style.opacity='0';boot.style.pointerEvents='none';setTimeout(()=>boot.remove(),260);try{sessionStorage.setItem('tayassuk-os-boot-seen','1');}catch{}};const skipButton=document.querySelector('#skip-boot');if(skipButton)skipButton.onclick=finish;
if(sessionStorage.getItem('tayassuk-os-boot-seen')) finish(); else {const timer=setInterval(()=>{progress+=8;bar.style.width=progress+'%';if(progress>=100){clearInterval(timer);setTimeout(finish,180);}},70);}
