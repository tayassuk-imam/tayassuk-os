import { ownerProfile as fallbackOwner } from './content/owner-profile.js';
import { projects as fallbackProjects } from './content/projects.js';
import { education as fallbackEducation } from './content/education.js';
import { skillGroups as fallbackSkills } from './content/skills.js';
import { achievements as fallbackAchievements } from './content/achievements.js';

import {
  loadRemotePortfolio,
  saveRemotePortfolio,
  signIn,
  signOut,
  getSession
} from './content/portfolio-store.js';


/* =========================================================
   PORTFOLIO DATA
   ========================================================= */

const fallbackPortfolio = {
  owner: structuredClone(fallbackOwner),

  projects: structuredClone(fallbackProjects),

  education: structuredClone(fallbackEducation),

  skills: structuredClone(fallbackSkills),

  achievements: structuredClone(fallbackAchievements),

  journey: [
    {
      title: 'Programming foundations',
      detail:
        'C, C++, pointers, structures, files, sorting & searching'
    },

    {
      title: 'Problem solving',
      detail:
        'Data structures, algorithms, and programming practice'
    },

    {
      title: 'Database systems',
      detail:
        'SQL, MySQL, relational design, joins, normalization, CRUD'
    },

    {
      title: 'Web development',
      detail:
        'HTML, CSS, JavaScript, PHP, backend-connected interfaces'
    },

    {
      title: 'Garage Management System',
      detail:
        'Solo-developed, database-driven web application deployed for demonstration'
    },

    {
      title: 'Next chapter',
      detail:
        'Keep learning, build stronger projects, and grow into a professional Software Engineer'
    }
  ]
};


let portfolio = structuredClone(fallbackPortfolio);


/* =========================================================
   STATE
   ========================================================= */

const state = {

  theme:
    localStorage.getItem('tayassuk-os-theme-v2') ||
    'dark',

  z: 100,

  windows: new Map(),

  adminSession: null

};


/* =========================================================
   APPS
   ========================================================= */

const apps = [

  {
    id: 'projects',
    name: 'Projects',
    desc: 'Built work & future projects',
    logo: './assets/icons/projects.png'
  },

  {
    id: 'learning',
    name: 'Learning',
    desc: 'Current study & practice',
    logo: './assets/icons/learning.png'
  },

  {
    id: 'skills',
    name: 'Skills',
    desc: 'Technical toolkit',
    logo: './assets/icons/skills.png'
  },

  {
    id: 'education',
    name: 'Education',
    desc: 'Academic timeline',
    logo: './assets/icons/education.png'
  },

  {
    id: 'journey',
    name: 'Journey',
    desc: 'Software engineering growth',
    logo: './assets/icons/journey.png'
  },

  {
    id: 'about',
    name: 'About',
    desc: 'Who I am & what I value',
    logo: './assets/icons/about.png'
  },

  {
    id: 'achievements',
    name: 'Achievements',
    desc: 'Activities & milestones',
    logo: './assets/icons/achievements.png'
  },

  {
    id: 'resume',
    name: 'Resume',
    desc: 'Official CV',
    logo: './assets/icons/resume.png'
  },

  {
    id: 'contact',
    name: 'Contact',
    desc: 'Start a conversation',
    logo: './assets/icons/contact.png'
  },

  {
    id: 'whiteboard',
    name: 'Whiteboard',
    desc: 'Leave a local note',
    logo: './assets/icons/whiteboard.png'
  },

  {
    id: 'founder',
    name: 'Founder.txt',
    desc: 'My working principles',
    logo: './assets/icons/founder.png'
  },

  {
    id: 'browser',
    name: 'Browser',
    desc: 'Approved external links',
    logo: './assets/icons/browser.png'
  },

  {
    id: 'control',
    name: 'Control Center',
    desc: 'Private portfolio management',
    logo: './assets/icons/control-center.png'
  }

];


/* =========================================================
   HELPERS
   ========================================================= */

const esc = value =>
  String(value ?? '').replace(
    /[&<>"']/g,
    char =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char]
  );


const safeUrl = value => {

  const url = String(value ?? '').trim();

  if (!url) return '#';

  return url;

};


/* =========================================================
   THEME
   ========================================================= */

document.documentElement.dataset.theme =
  state.theme;


/* =========================================================
   APP GRID
   ========================================================= */

function renderAppGrid() {

  const el =
    document.getElementById('app-grid');

  if (!el) {
    console.warn(
      'App grid #app-grid not found'
    );
    return;
  }

  el.innerHTML =
    apps
      .map(
        app => `
          <button
            type="button"
            class="launcher-app"
            data-action="open"
            data-app="${esc(app.id)}"
            title="${esc(
              app.desc || app.name
            )}"
          >

            <img
              class="app-logo"
              src="${esc(app.logo)}"
              alt="${esc(app.name)}"
              width="56"
              height="56"
              loading="lazy"
              draggable="false"
            >

            <span>
              ${esc(app.name)}
            </span>

          </button>
        `
      )
      .join('');

}


/* =========================================================
   IDENTITY
   ========================================================= */

function renderIdentity() {

  const identity =
    portfolio.owner?.identity || {};


  const parts =
    String(
      identity.fullName ||
      'Tayassuk Imam'
    )
      .trim()
      .split(/\s+/);


  const last =
    parts.pop() || '';


  const first =
    parts.join(' ');


  const name =
    document.querySelector(
      '#identity-name'
    );


  if (name) {

    name.innerHTML = `
      ${esc(first)}
      <span>
        ${esc(last)}
      </span>
    `;

  }


  const profession =
    document.querySelector(
      '#identity-profession'
    );


  if (profession) {

    profession.textContent =
      identity.profession ||
      'Software Engineering Student';

  }


  const headline =
    document.querySelector(
      '#identity-headline'
    );


  if (headline) {

    headline.textContent =
      identity.headline ||
      'Software Engineering Student Building the Future, One Project at a Time';

  }


  const image =
    document.querySelector(
      '#hero-portrait'
    );


  if (image) {

    image.src =
      identity.generatedAvatar ||
      identity.portrait ||
      './assets/avatar/tayassuk-generated-avatar.png';

  }


  const cv =
    document.querySelector(
      '#hero-cv'
    );


  if (cv) {

    cv.href =
      portfolio.owner?.contact?.cv ||
      './assets/cv/Tayassuk-Imam-CV.pdf';

  }


  const learning =
    portfolio.owner?.learning ||
    [];


  const progress =
    learning.reduce(
      (sum, item) =>
        sum +
        (Number(item.progress) || 0),
      0
    ) /
    Math.max(
      1,
      learning.length
    );


  const progressBar =
    document.querySelector(
      '#hero-progress'
    );


  if (progressBar) {

    progressBar.style.width =
      `${Math.round(progress)}%`;

  }


  renderSocials();

}


/* =========================================================
   SOCIALS
   ========================================================= */

function renderSocials() {

  const contact =
    portfolio.owner?.contact ||
    {};


  const output = [];


  if (contact.email) {

    output.push(`
      <a
        href="mailto:${esc(contact.email)}"
        class="social-chip"
      >
        Email
      </a>
    `);

  }


  if (contact.github) {

    output.push(`
      <a
        href="${esc(contact.github)}"
        target="_blank"
        rel="noreferrer noopener"
        class="social-chip"
      >
        GitHub
      </a>
    `);

  }


  if (contact.linkedin) {

    output.push(`
      <a
        href="${esc(contact.linkedin)}"
        target="_blank"
        rel="noreferrer noopener"
        class="social-chip"
      >
        LinkedIn
      </a>
    `);

  }


  const social =
    document.querySelector(
      '#social-row'
    );


  if (social) {

    social.innerHTML =
      output.join('');

  }

}


/* =========================================================
   CLOCK
   ========================================================= */

function updateClock() {

  const date =
    new Date();


  const timezone =
    portfolio.owner?.identity?.timezone ||
    'Asia/Dhaka';


  const dateText =
    new Intl.DateTimeFormat(
      'en-BD',
      {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }
    ).format(date);


  const timeText =
    new Intl.DateTimeFormat(
      'en-BD',
      {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      }
    ).format(date);


  const clock =
    document.querySelector(
      '#clock'
    );


  const clockBig =
    document.querySelector(
      '#clock-big'
    );


  const clockAmpm =
    document.querySelector(
      '#clock-ampm'
    );


  const calendarDate =
    document.querySelector(
      '#calendar-date'
    );


  const calendarMonth =
    document.querySelector(
      '#calendar-month'
    );


  if (clock) {

    clock.textContent =
      timeText;

  }


  if (clockBig) {

    clockBig.textContent =
      timeText
        .split(':')
        .slice(0, 2)
        .join(':');

  }


  if (clockAmpm) {

    clockAmpm.textContent =
      timeText.match(
        /AM|PM/
      )?.[0] || '';

  }


  if (calendarDate) {

    calendarDate.textContent =
      dateText;

  }


  if (calendarMonth) {

    calendarMonth.textContent =
      new Intl.DateTimeFormat(
        'en-BD',
        {
          timeZone: timezone,
          month: 'long',
          year: 'numeric'
        }
      ).format(date);

  }


  renderCalendar(date);

}


function renderCalendar(date) {

  const grid =
    document.querySelector(
      '#calendar-grid'
    );


  if (!grid) return;


  const year =
    date.getFullYear();


  const month =
    date.getMonth();


  const firstDay =
    new Date(
      year,
      month,
      1
    );


  const days =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  const start =
    (
      firstDay.getDay() +
      6
    ) % 7;


  let html = [

    'Mo',
    'Tu',
    'We',
    'Th',
    'Fr',
    'Sa',
    'Su'

  ]
    .map(
      day =>
        `<span class="weekday">${day}</span>`
    )
    .join('');


  for (
    let i = 0;
    i < start;
    i++
  ) {

    html +=
      '<span></span>';

  }


  for (
    let day = 1;
    day <= days;
    day++
  ) {

    html += `
      <span
        class="day ${
          day === date.getDate()
            ? 'today'
            : ''
        }"
      >
        ${day}
      </span>
    `;

  }


  grid.innerHTML =
    html;

}


updateClock();

setInterval(
  updateClock,
  1000
);
/* =========================================================
   WINDOW POSITION
   ========================================================= */

function windowPosition() {

  const width =
    Math.min(
      940,
      innerWidth - 44
    );

  const height =
    Math.min(
      700,
      innerHeight - 120
    );

  const offset =
    state.windows.size % 4;

  const vertical =
    state.windows.size % 3;

  return {

    left:
      Math.max(
        12,
        (innerWidth - width) / 2 +
          offset * 16
      ),

    top:
      Math.max(
        72,
        (innerHeight - height) / 2 +
          vertical * 12
      ),

    width,
    height

  };

}


/* =========================================================
   WINDOW FOCUS
   ========================================================= */

function focusWindow(id) {

  const win =
    state.windows.get(id);

  if (!win?.node) return;

  win.node.style.zIndex =
    ++state.z;

}


/* =========================================================
   CLOSE WINDOW
   ========================================================= */

function closeWindow(id) {

  const win =
    state.windows.get(id);

  if (!win) return;

  win.node.remove();

  state.windows.delete(id);

}


/* =========================================================
   OPEN WINDOW
   ========================================================= */

function openWindow(id) {

  if (!id) return;

  /*
   * If already open, simply bring it
   * to the front.
   */
  if (state.windows.has(id)) {

    focusWindow(id);

    return;

  }


  const layer =
    document.querySelector('#windows');


  if (!layer) {

    console.error(
      'Window layer #windows not found.'
    );

    return;

  }


  const app =
    apps.find(
      item =>
        item.id === id
    );


  /*
   * Trash is handled separately.
   */
  if (id === 'trash') {

    openTrashWindow();

    return;

  }


  const position =
    windowPosition();


  const node =
    document.createElement('section');


  node.className =
    'app-window';


  node.dataset.app =
    id;


  node.style.left =
    `${position.left}px`;


  node.style.top =
    `${position.top}px`;


  node.style.width =
    `${position.width}px`;


  node.style.height =
    `${position.height}px`;


  node.style.zIndex =
    ++state.z;


  node.innerHTML = `

    <div class="window-chrome">

      <span class="window-title">
        ${esc(app?.name || id)}
      </span>

      <span class="window-state">
        Tayassuk OS
      </span>

      <div class="window-controls">

        <button
          type="button"
          data-win-close
          aria-label="Close window"
        >
          ×
        </button>

      </div>

    </div>

    <div class="window-body"></div>

  `;


  layer.appendChild(node);


  const win = {

    node,

    body:
      node.querySelector(
        '.window-body'
      )

  };


  state.windows.set(
    id,
    win
  );


  renderWindow(id);


  wireDrag(
    node,
    id
  );


  focusWindow(id);

}


/* =========================================================
   TRASH WINDOW
   ========================================================= */

function openTrashWindow() {

  const id =
    'trash';


  if (state.windows.has(id)) {

    focusWindow(id);

    return;

  }


  const layer =
    document.querySelector('#windows');


  if (!layer) return;


  const position =
    windowPosition();


  const node =
    document.createElement('section');


  node.className =
    'app-window';


  node.dataset.app =
    id;


  node.style.left =
    `${position.left}px`;


  node.style.top =
    `${position.top}px`;


  node.style.width =
    `${Math.min(
      760,
      innerWidth - 44
    )}px`;


  node.style.height =
    `${Math.min(
      560,
      innerHeight - 120
    )}px`;


  node.style.zIndex =
    ++state.z;


  node.innerHTML = `

    <div class="window-chrome">

      <span class="window-title">
        Trash
      </span>

      <span class="window-state">
        Tayassuk OS
      </span>

      <div class="window-controls">

        <button
          type="button"
          data-win-close
          aria-label="Close window"
        >
          ×
        </button>

      </div>

    </div>

    <div class="window-body">

      <div class="empty-state">

        <div class="empty-icon">
          🗑️
        </div>

        <h2>
          Trash is Empty
        </h2>

        <p>
          There are no deleted portfolio items.
        </p>

      </div>

    </div>

  `;


  layer.appendChild(node);


  state.windows.set(
    id,
    {
      node,
      body:
        node.querySelector(
          '.window-body'
        )
    }
  );


  wireDrag(
    node,
    id
  );


  focusWindow(id);

}


/* =========================================================
   WINDOW DRAG
   ========================================================= */

function wireDrag(node, id) {

  const chrome =
    node.querySelector(
      '.window-chrome'
    );


  if (!chrome) return;


  let dragging = false;

  let startX = 0;

  let startY = 0;

  let startLeft = 0;

  let startTop = 0;


  chrome.addEventListener(
    'pointerdown',
    event => {

      if (
        event.target.closest(
          'button'
        )
      ) {
        return;
      }


      dragging = true;

      startX =
        event.clientX;

      startY =
        event.clientY;

      startLeft =
        parseFloat(
          node.style.left
        ) || 0;

      startTop =
        parseFloat(
          node.style.top
        ) || 0;


      focusWindow(id);


      chrome.setPointerCapture(
        event.pointerId
      );

    }
  );


  chrome.addEventListener(
    'pointermove',
    event => {

      if (!dragging) return;


      const dx =
        event.clientX -
        startX;


      const dy =
        event.clientY -
        startY;


      const maxLeft =
        Math.max(
          12,
          innerWidth -
            node.offsetWidth -
            12
        );


      const maxTop =
        Math.max(
          72,
          innerHeight -
            node.offsetHeight -
            12
        );


      const nextLeft =
        Math.min(
          maxLeft,
          Math.max(
            12,
            startLeft + dx
          )
        );


      const nextTop =
        Math.min(
          maxTop,
          Math.max(
            72,
            startTop + dy
          )
        );


      node.style.left =
        `${nextLeft}px`;


      node.style.top =
        `${nextTop}px`;

    }
  );


  chrome.addEventListener(
    'pointerup',
    event => {

      dragging = false;

      try {

        chrome.releasePointerCapture(
          event.pointerId
        );

      } catch {}

    }
  );

}


/* =========================================================
   PROJECT CARD
   ========================================================= */

function projectCard(project) {

  const name =
    project.name ||
    project.title ||
    'Untitled Project';


  const description =
    project.description ||
    project.desc ||
    'Project details coming soon.';


  const technologies =
    project.technologies ||
    project.stack ||
    [];


  const tech =
    Array.isArray(technologies)
      ? technologies
      : String(technologies)
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);


  const image =
    project.image ||
    './assets/projects/garage-management-system.jpg';


  return `

    <article class="project-card">

      <div class="project-image-wrap">

        <img
          class="project-image"
          src="${esc(image)}"
          alt="${esc(name)}"
          loading="lazy"
        >

      </div>

      <div class="project-card-content">

        <div class="project-card-top">

          <h3>
            ${esc(name)}
          </h3>

          <span class="project-status">
            ${esc(
              project.status ||
              'Working'
            )}
          </span>

        </div>


        <p>
          ${esc(description)}
        </p>


        <div class="project-tech">

          ${
            tech
              .map(
                item =>
                  `<span>${esc(item)}</span>`
              )
              .join('')
          }

        </div>


        <button
          type="button"
          class="project-open"
          data-action="project-detail"
          data-project="${esc(
            project.id ||
            name
          )}"
        >
          Open Project
        </button>

      </div>

    </article>

  `;

}


/* =========================================================
   PROJECT DETAIL
   ========================================================= */

function renderProjectDetail(project) {

  const technologies =
    project.technologies ||
    project.stack ||
    [];


  const tech =
    Array.isArray(technologies)
      ? technologies
      : String(technologies)
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);


  const image =
    project.image ||
    './assets/projects/garage-management-system.jpg';


  const liveUrl =
    project.liveUrl ||
    project.url ||
    '';


  const githubUrl =
    project.githubUrl ||
    project.repository ||
    '';


  return `

    <div class="project-detail">

      <div class="project-detail-image">

        <img
          src="${esc(image)}"
          alt="${esc(
            project.name ||
            project.title ||
            'Project'
          )}"
        >

      </div>


      <div class="project-detail-content">

        <div class="project-detail-heading">

          <span class="eyebrow">
            ${esc(
              project.category ||
              'Project'
            )}
          </span>

          <h1>
            ${esc(
              project.name ||
              project.title ||
              'Untitled Project'
            )}
          </h1>

        </div>


        <p class="project-detail-description">
          ${esc(
            project.description ||
            project.desc ||
            'No description available.'
          )}
        </p>


        <div class="project-meta-grid">

          <div>
            <small>Role</small>
            <strong>
              ${esc(
                project.role ||
                'Solo Developer'
              )}
            </strong>
          </div>

          <div>
            <small>Status</small>
            <strong>
              ${esc(
                project.status ||
                'Working'
              )}
            </strong>
          </div>

          <div>
            <small>Dates</small>
            <strong>
              ${esc(
                project.dates ||
                '—'
              )}
            </strong>
          </div>

        </div>


        <div class="project-tech">

          ${
            tech
              .map(
                item =>
                  `<span>${esc(item)}</span>`
              )
              .join('')
          }

        </div>


        <div class="project-actions">

          ${
            liveUrl
              ? `
                <a
                  href="${esc(
                    safeUrl(liveUrl)
                  )}"
                  target="_blank"
                  rel="noreferrer noopener"
                  class="primary-action"
                >
                  Live Project
                </a>
              `
              : ''
          }


          ${
            githubUrl
              ? `
                <a
                  href="${esc(
                    safeUrl(githubUrl)
                  )}"
                  target="_blank"
                  rel="noreferrer noopener"
                  class="secondary-action"
                >
                  GitHub
                </a>
              `
              : ''
          }

        </div>

      </div>

    </div>

  `;

}


/* =========================================================
   WINDOW RENDERER
   ========================================================= */

function renderWindow(id) {

  const win =
    state.windows.get(id);


  if (!win?.body) return;


  switch (id) {

    case 'projects':

      win.body.innerHTML =
        `
          <div class="window-page">

            <div class="window-page-heading">

              <span class="eyebrow">
                Portfolio
              </span>

              <h1>
                Projects
              </h1>

              <p>
                Built work and future projects.
              </p>

            </div>


            <div class="project-grid">

              ${
                (portfolio.projects || [])
                  .map(projectCard)
                  .join('')
              }

            </div>

          </div>
        `;

      break;


    case 'learning':

      win.body.innerHTML =
        renderLearningWindow();

      break;


    case 'skills':

      win.body.innerHTML =
        renderSkillsWindow();

      break;


    case 'education':

      win.body.innerHTML =
        renderEducationWindow();

      break;


    case 'journey':

      win.body.innerHTML =
        renderJourneyWindow();

      break;


    case 'about':

      win.body.innerHTML =
        renderAboutWindow();

      break;


    case 'achievements':

      win.body.innerHTML =
        renderAchievementsWindow();

      break;


    case 'resume':

      win.body.innerHTML =
        renderResumeWindow();

      break;


    case 'contact':

      win.body.innerHTML =
        renderContactWindow();

      break;


    case 'whiteboard':

      win.body.innerHTML =
        renderWhiteboardWindow();

      break;


    case 'founder':

      win.body.innerHTML =
        renderFounderWindow();

      break;


    case 'browser':

      win.body.innerHTML =
        renderBrowserWindow();

      break;


    case 'control':

      win.body.innerHTML =
        renderControlCenter();

      wireControlCenter(
        win.body
      );

      break;


    default:

      win.body.innerHTML = `
        <div class="window-page">

          <h1>
            ${esc(id)}
          </h1>

          <p>
            This app is ready.
          </p>

        </div>
      `;

  }


  wireWindowActions(
    win.body
  );

}


/* =========================================================
   LEARNING WINDOW
   ========================================================= */

function renderLearningWindow() {

  const items =
    portfolio.owner?.learning ||
    [];


  return `

    <div class="window-page">

      <div class="window-page-heading">

        <span class="eyebrow">
          Current Focus
        </span>

        <h1>
          Learning
        </h1>

        <p>
          Things I am currently studying and practicing.
        </p>

      </div>


      <div class="learning-list">

        ${
          items.length
            ? items
                .map(
                  item => `

                    <article class="learning-item">

                      <div>

                        <h3>
                          ${esc(
                            item.title ||
                            item.name ||
                            'Learning'
                          )}
                        </h3>

                        <p>
                          ${esc(
                            item.detail ||
                            item.description ||
                            ''
                          )}
                        </p>

                      </div>


                      <strong>
                        ${esc(
                          `${Number(
                            item.progress
                          ) || 0}%`
                        )}
                      </strong>

                    </article>

                  `
                )
                .join('')
            : `
                <div class="empty-state">

                  <h2>
                    No learning items yet
                  </h2>

                </div>
              `
        }

      </div>

    </div>

  `;

}


/* =========================================================
   SKILLS WINDOW
   ========================================================= */

function renderSkillsWindow() {

  const groups =
    portfolio.skills ||
    [];


  return `

    <div class="window-page">

      <div class="window-page-heading">

        <span class="eyebrow">
          Toolkit
        </span>

        <h1>
          Skills
        </h1>

      </div>


      <div class="skills-window-grid">

        ${
          groups
            .map(
              group => `

                <article class="skill-group">

                  <h3>
                    ${esc(
                      group.name ||
                      group.title ||
                      'Skills'
                    )}
                  </h3>

                  <div class="skill-tags">

                    ${
                      (
                        group.skills ||
                        group.items ||
                        []
                      )
                        .map(
                          skill =>
                            `<span>${esc(
                              typeof skill === 'string'
                                ? skill
                                : skill.name
                            )}</span>`
                        )
                        .join('')
                    }

                  </div>

                </article>

              `
            )
            .join('')
        }

      </div>

    </div>

  `;

}


/* =========================================================
   EDUCATION WINDOW
   ========================================================= */

function renderEducationWindow() {

  const items =
    portfolio.education ||
    [];


  return `

    <div class="window-page">

      <div class="window-page-heading">

        <span class="eyebrow">
          Academic Timeline
        </span>

        <h1>
          Education
        </h1>

      </div>


      <div class="timeline">

        ${
          items
            .map(
              item => `

                <article class="timeline-item">

                  <div class="timeline-dot"></div>

                  <div>

                    <h3>
                      ${esc(
                        item.degree ||
                        item.title ||
                        item.name ||
                        ''
                      )}
                    </h3>

                    <p>
                      ${esc(
                        item.institution ||
                        item.school ||
                        ''
                      )}
                    </p>

                    <small>
                      ${esc(
                        item.year ||
                        item.date ||
                        ''
                      )}
                    </small>

                  </div>

                </article>

              `
            )
            .join('')
        }

      </div>

    </div>

  `;

}


/* =========================================================
   JOURNEY WINDOW
   ========================================================= */

function renderJourneyWindow() {

  const items =
    portfolio.journey ||
    [];


  return `

    <div class="window-page">

      <div class="window-page-heading">

        <span class="eyebrow">
          Growth
        </span>

        <h1>
          Journey
        </h1>

        <p>
          My software engineering journey.
        </p>

      </div>


      <div class="timeline">

        ${
          items
            .map(
              item => `

                <article class="timeline-item">

                  <div class="timeline-dot"></div>

                  <div>

                    <h3>
                      ${esc(
                        item.title ||
                        ''
                      )}
                    </h3>

                    <p>
                      ${esc(
                        item.detail ||
                        ''
                      )}
                    </p>

                  </div>

                </article>

              `
            )
            .join('')
        }

      </div>

    </div>

  `;

}


/* =========================================================
   ABOUT WINDOW
   ========================================================= */

function renderAboutWindow() {

  const identity =
    portfolio.owner?.identity ||
    {};


  return `

    <div class="window-page">

      <div class="window-page-heading">

        <span class="eyebrow">
          About Me
        </span>

        <h1>
          ${esc(
            identity.fullName ||
            'Tayassuk Imam'
          )}
        </h1>

        <p>
          ${esc(
            identity.headline ||
            'Software Engineering Student Building the Future, One Project at a Time'
          )}
        </p>

      </div>


      <div class="about-content">

        <p>
          ${esc(
            portfolio.owner?.about ||
            'I am a Software Engineering student focused on learning, building, and growing through practical projects.'
          )}
        </p>

      </div>

    </div>

  `;

}


/* =========================================================
   ACHIEVEMENTS WINDOW
   ========================================================= */

function renderAchievementsWindow() {

  const items =
    portfolio.achievements ||
    [];


  return `

    <div class="window-page">

      <div class="window-page-heading">

        <span class="eyebrow">
          Milestones
        </span>

        <h1>
          Achievements
        </h1>

      </div>


      <div class="achievement-grid">

        ${
          items
            .map(
              item => `

                <article class="achievement-card">

                  <h3>
                    ${esc(
                      item.title ||
                      item.name ||
                      ''
                    )}
                  </h3>

                  <p>
                    ${esc(
                      item.description ||
                      item.detail ||
                      ''
                    )}
                  </p>

                </article>

              `
            )
            .join('')
        }

      </div>

    </div>

  `;

}


/* =========================================================
   RESUME WINDOW
   ========================================================= */

function renderResumeWindow() {

  const cv =
    portfolio.owner?.contact?.cv ||
    './assets/cv/Tayassuk-Imam-CV.pdf';


  return `

    <div class="window-page resume-page">

      <div class="window-page-heading">

        <span class="eyebrow">
          Curriculum Vitae
        </span>

        <h1>
          Resume
        </h1>

        <p>
          View or open my latest CV.
        </p>

      </div>


      <div class="resume-actions">

        <a
          href="${esc(cv)}"
          target="_blank"
          rel="noreferrer noopener"
          class="primary-action"
        >
          Open CV
        </a>


        <a
          href="${esc(cv)}"
          download
          class="secondary-action"
        >
          Download CV
        </a>

      </div>

    </div>

  `;

}


/* =========================================================
   CONTACT WINDOW
   ========================================================= */

function renderContactWindow() {

  const contact =
    portfolio.owner?.contact ||
    {};


  return `

    <div class="window-page">

      <div class="window-page-heading">

        <span class="eyebrow">
          Contact
        </span>

        <h1>
          Start a Conversation
        </h1>

      </div>


      <div class="contact-list">

        ${
          contact.email
            ? `
              <a
                href="mailto:${esc(
                  contact.email
                )}"
                class="contact-item"
              >
                <span>Email</span>
                <strong>
                  ${esc(contact.email)}
                </strong>
              </a>
            `
            : ''
        }


        ${
          contact.github
            ? `
              <a
                href="${esc(
                  safeUrl(contact.github)
                )}"
                target="_blank"
                rel="noreferrer noopener"
                class="contact-item"
              >
                <span>GitHub</span>
                <strong>
                  Open Profile
                </strong>
              </a>
            `
            : ''
        }


        ${
          contact.linkedin
            ? `
              <a
                href="${esc(
                  safeUrl(contact.linkedin)
                )}"
                target="_blank"
                rel="noreferrer noopener"
                class="contact-item"
              >
                <span>LinkedIn</span>
                <strong>
                  Open Profile
                </strong>
              </a>
            `
            : ''
        }

      </div>

    </div>

  `;

}


/* =========================================================
   WHITEBOARD WINDOW
   ========================================================= */

function renderWhiteboardWindow() {

  const saved =
    localStorage.getItem(
      'tayassuk-os-whiteboard'
    ) || '';


  return `

    <div class="window-page">

      <div class="window-page-heading">

        <span class="eyebrow">
          Local Notes
        </span>

        <h1>
          Whiteboard
        </h1>

      </div>


      <textarea
        id="whiteboard-input"
        class="whiteboard-input"
        placeholder="Write a note..."
      >${esc(saved)}</textarea>


      <button
        type="button"
        class="primary-action"
        data-action="save-whiteboard"
      >
        Save Note
      </button>


      <p
        id="whiteboard-status"
        class="form-status"
      ></p>

    </div>

  `;

}


/* =========================================================
   FOUNDER WINDOW
   ========================================================= */

function renderFounderWindow() {

  const founder =
    portfolio.owner?.founder ||
    {};


  return `

    <div class="window-page">

      <div class="window-page-heading">

        <span class="eyebrow">
          Founder.txt
        </span>

        <h1>
          Working Principles
        </h1>

      </div>


      <div class="founder-content">

        ${
          founder.principles
            ? `
              <p>
                ${esc(
                  founder.principles
                )}
              </p>
            `
            : `
              <p>
                Learn continuously. Build practically.
                Stay curious. Keep improving.
              </p>
            `
        }

      </div>

    </div>

  `;

}


/* =========================================================
   BROWSER WINDOW
   ========================================================= */

function renderBrowserWindow() {

  const contact =
    portfolio.owner?.contact ||
    {};


  return `

    <div class="window-page">

      <div class="window-page-heading">

        <span class="eyebrow">
          External Links
        </span>

        <h1>
          Browser
        </h1>

      </div>


      <div class="browser-links">

        ${
          contact.github
            ? `
              <a
                href="${esc(
                  safeUrl(contact.github)
                )}"
                target="_blank"
                rel="noreferrer noopener"
              >
                GitHub
              </a>
            `
            : ''
        }


        ${
          contact.linkedin
            ? `
              <a
                href="${esc(
                  safeUrl(contact.linkedin)
                )}"
                target="_blank"
                rel="noreferrer noopener"
              >
                LinkedIn
              </a>
            `
            : ''
        }


        ${
          portfolio.projects?.[0]?.liveUrl
            ? `
              <a
                href="${esc(
                  safeUrl(
                    portfolio.projects[0].liveUrl
                  )
                )}"
                target="_blank"
                rel="noreferrer noopener"
              >
                Featured Project
              </a>
            `
            : ''
        }

      </div>

    </div>

  `;

}
/* =========================================================
   CONTROL CENTER
   ========================================================= */

function renderControlCenter() {

  const owner =
    portfolio.owner || {};

  const identity =
    owner.identity || {};

  const contact =
    owner.contact || {};

  return `

    <div class="window-page control-center-page">

      <div class="window-page-heading">

        <span class="eyebrow">
          Private Workspace
        </span>

        <h1>
          Control Center
        </h1>

        <p>
          Manage your portfolio content.
        </p>

      </div>


      <div class="admin-status">

        <span class="status-dot"></span>

        <span>
          ${
            state.adminSession
              ? 'Admin authenticated'
              : 'Visitor mode'
          }
        </span>

      </div>


      ${
        state.adminSession
          ? `

            <div class="control-grid">

              <section class="control-card">

                <h3>
                  Profile
                </h3>

                <p>
                  ${esc(
                    identity.fullName ||
                    'Tayassuk Imam'
                  )}
                </p>

                <p>
                  ${esc(
                    identity.profession ||
                    'Software Engineering Student'
                  )}
                </p>

              </section>


              <section class="control-card">

                <h3>
                  Projects
                </h3>

                <p>
                  ${
                    (portfolio.projects || [])
                      .length
                  }
                  project(s)
                </p>

              </section>


              <section class="control-card">

                <h3>
                  Learning
                </h3>

                <p>
                  ${
                    (
                      owner.learning ||
                      []
                    ).length
                  }
                  learning item(s)
                </p>

              </section>


              <section class="control-card">

                <h3>
                  Contact
                </h3>

                <p>
                  ${esc(
                    contact.email ||
                    'No email configured'
                  )}
                </p>

              </section>

            </div>


            <div class="control-actions">

              <button
                type="button"
                class="secondary-action"
                data-action="admin-refresh"
              >
                Refresh Data
              </button>


              <button
                type="button"
                class="primary-action"
                data-action="admin-logout"
              >
                Sign Out
              </button>

            </div>

          `
          : `

            <form
              class="admin-login-form"
              id="admin-login-form"
            >

              <label>
                Email

                <input
                  type="email"
                  name="email"
                  autocomplete="email"
                  required
                >

              </label>


              <label>
                Password

                <input
                  type="password"
                  name="password"
                  autocomplete="current-password"
                  required
                >

              </label>


              <button
                type="submit"
                class="primary-action"
              >
                Sign In
              </button>


              <p
                class="form-status"
                id="admin-login-status"
              ></p>

            </form>

          `
      }

    </div>

  `;

}


/* =========================================================
   CONTROL CENTER EVENTS
   ========================================================= */

function wireControlCenter(body) {

  if (!body) return;


  const form =
    body.querySelector(
      '#admin-login-form'
    );


  if (form) {

    form.addEventListener(
      'submit',
      async event => {

        event.preventDefault();


        const status =
          form.querySelector(
            '#admin-login-status'
          );


        const email =
          form.email?.value?.trim() ||
          '';


        const password =
          form.password?.value ||
          '';


        if (!email || !password) {

          if (status) {

            status.textContent =
              'Please enter email and password.';

          }

          return;

        }


        if (status) {

          status.textContent =
            'Signing in...';

        }


        try {

          const result =
            await signIn(
              email,
              password
            );


          state.adminSession =
            result?.session ||
            result ||
            null;


          if (status) {

            status.textContent =
              'Signed in successfully.';

          }


          body.innerHTML =
            renderControlCenter();


          wireControlCenter(
            body
          );

        } catch (error) {

          console.error(
            'Admin sign-in failed:',
            error
          );


          if (status) {

            status.textContent =
              error?.message ||
              'Sign in failed.';

          }

        }

      }
    );

  }

}


/* =========================================================
   WINDOW ACTIONS
   ========================================================= */

function wireWindowActions(body) {

  if (!body) return;


  body.addEventListener(
    'click',
    event => {

      const closeButton =
        event.target.closest(
          '[data-win-close]'
        );


      if (closeButton) {

        const windowNode =
          closeButton.closest(
            '.app-window'
          );


        if (windowNode) {

          closeWindow(
            windowNode.dataset.app
          );

        }

        return;

      }


      const projectButton =
        event.target.closest(
          '[data-action="project-detail"]'
        );


      if (projectButton) {

        const projectId =
          projectButton.dataset.project;


        const project =
          (portfolio.projects || [])
            .find(
              item =>
                String(
                  item.id ||
                  item.name ||
                  item.title
                ) ===
                String(projectId)
            );


        if (!project) return;


        const current =
          state.windows.get(
            'projects'
          );


        if (current?.body) {

          current.body.innerHTML =
            renderProjectDetail(
              project
            );

          wireWindowActions(
            current.body
          );

        }

      }


      const saveWhiteboard =
        event.target.closest(
          '[data-action="save-whiteboard"]'
        );


      if (saveWhiteboard) {

        const input =
          body.querySelector(
            '#whiteboard-input'
          );


        const status =
          body.querySelector(
            '#whiteboard-status'
          );


        localStorage.setItem(
          'tayassuk-os-whiteboard',
          input?.value || ''
        );


        if (status) {

          status.textContent =
            'Note saved locally.';

        }

      }


      const adminLogout =
        event.target.closest(
          '[data-action="admin-logout"]'
        );


      if (adminLogout) {

        handleAdminLogout(
          body
        );

      }


      const adminRefresh =
        event.target.closest(
          '[data-action="admin-refresh"]'
        );


      if (adminRefresh) {

        refreshPortfolio()
          .then(
            () => {

              body.innerHTML =
                renderControlCenter();

              wireControlCenter(
                body
              );

            }
          )
          .catch(
            error =>
              console.error(
                error
              )
          );

      }

    }
  );

}


/* =========================================================
   ADMIN LOGOUT
   ========================================================= */

async function handleAdminLogout(body) {

  try {

    await signOut();

  } catch (error) {

    console.error(
      'Sign out failed:',
      error
    );

  }


  state.adminSession =
    null;


  if (body) {

    body.innerHTML =
      renderControlCenter();

    wireControlCenter(
      body
    );

  }

}


/* =========================================================
   SEARCH
   ========================================================= */

function searchPortfolio(query) {

  const term =
    String(query || '')
      .trim()
      .toLowerCase();


  if (!term) {

    return [];

  }


  const results = [];


  apps.forEach(
    app => {

      const text =
        `${app.name} ${app.desc}`
          .toLowerCase();


      if (text.includes(term)) {

        results.push({
          type: 'app',
          id: app.id,
          title: app.name,
          description: app.desc
        });

      }

    }
  );


  (portfolio.projects || [])
    .forEach(
      project => {

        const text =
          JSON.stringify(
            project
          ).toLowerCase();


        if (text.includes(term)) {

          results.push({

            type: 'project',

            id:
              project.id ||
              project.name ||
              project.title,

            title:
              project.name ||
              project.title ||
              'Project',

            description:
              project.description ||
              project.desc ||
              ''

          });

        }

      }
    );


  return results;

}


/* =========================================================
   SEARCH UI
   ========================================================= */

function renderSearchResults(query) {

  const results =
    searchPortfolio(query);


  const output =
    results
      .map(
        result => `

          <button
            type="button"
            class="search-result"
            data-action="${
              result.type === 'project'
                ? 'project-detail'
                : 'open'
            }"
            data-app="${
              result.type === 'app'
                ? esc(result.id)
                : ''
            }"
            data-project="${
              result.type === 'project'
                ? esc(result.id)
                : ''
            }"
          >

            <strong>
              ${esc(result.title)}
            </strong>

            <span>
              ${esc(result.description)}
            </span>

          </button>

        `
      )
      .join('');


  return output ||
    `
      <div class="empty-state">

        <h3>
          No results found
        </h3>

        <p>
          Try another search term.
        </p>

      </div>
    `;

}


/* =========================================================
   REFRESH PORTFOLIO
   ========================================================= */

async function refreshPortfolio() {

  try {

    const remote =
      await loadRemotePortfolio();


    if (
      remote &&
      typeof remote === 'object'
    ) {

      portfolio = {

        ...portfolio,

        ...remote,

        owner: {
          ...portfolio.owner,
          ...(remote.owner || {})
        }

      };

    }

  } catch (error) {

    console.warn(
      'Remote portfolio load failed:',
      error
    );

  }


  renderAll();

}


/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {

  /*
   * IMPORTANT:
   * Always render the launcher.
   * This fixes the empty #app-grid issue.
   */
  renderAppGrid();


  renderIdentity();


  updateClock();


  renderDashboard();


  renderDock();


  renderCompanion();

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

  const featured =
    (portfolio.projects || [])
      .find(
        project =>
          project.featured
      ) ||
    portfolio.projects?.[0];


  const featuredName =
    featured?.name ||
    featured?.title ||
    'Garage Management System';


  const featuredDescription =
    featured?.description ||
    featured?.desc ||
    'A database-driven garage management web application.';


  const featuredImage =
    featured?.image ||
    './assets/projects/garage-management-system.jpg';


  const featuredTitle =
    document.querySelector(
      '#featured-project-title'
    );


  if (featuredTitle) {

    featuredTitle.textContent =
      featuredName;

  }


  const featuredDesc =
    document.querySelector(
      '#featured-project-description'
    );


  if (featuredDesc) {

    featuredDesc.textContent =
      featuredDescription;

  }


  const featuredImageElement =
    document.querySelector(
      '#featured-project-image'
    );


  if (featuredImageElement) {

    featuredImageElement.src =
      featuredImage;

  }


  const projectButton =
    document.querySelector(
      '#featured-project-open'
    );


  if (projectButton) {

    projectButton.dataset.project =
      featured?.id ||
      featuredName;

  }


  const learning =
    portfolio.owner?.learning ||
    [];


  const learningContainer =
    document.querySelector(
      '#learning-list'
    );


  if (learningContainer) {

    learningContainer.innerHTML =
      learning
        .slice(0, 4)
        .map(
          item => `

            <div class="learning-row">

              <span>
                ${esc(
                  item.title ||
                  item.name ||
                  ''
                )}
              </span>

              <strong>
                ${Number(
                  item.progress
                ) || 0}%
              </strong>

            </div>

          `
        )
        .join('');

  }


  const skillsContainer =
    document.querySelector(
      '#skills-list'
    );


  if (skillsContainer) {

    const flatSkills =
      (portfolio.skills || [])
        .flatMap(
          group =>
            group.skills ||
            group.items ||
            []
        )
        .slice(0, 8);


    skillsContainer.innerHTML =
      flatSkills
        .map(
          skill =>
            `<span>${esc(
              typeof skill === 'string'
                ? skill
                : skill.name
            )}</span>`
        )
        .join('');

  }

}


/* =========================================================
   DOCK
   ========================================================= */

function renderDock() {

  const dock =
    document.querySelector(
      '#dock'
    );


  if (!dock) return;


  const dockApps =
    apps.slice(
      0,
      7
    );


  dock.innerHTML =
    dockApps
      .map(
        app => `

          <button
            type="button"
            class="dock-item"
            data-action="open"
            data-app="${esc(app.id)}"
            title="${esc(app.name)}"
          >

            <img
              src="${esc(app.logo)}"
              alt="${esc(app.name)}"
              class="dock-logo"
              width="42"
              height="42"
              draggable="false"
            >

          </button>

        `
      )
      .join('');

}


/* =========================================================
   COMPANION
   ========================================================= */

function renderCompanion() {

  const image =
    document.querySelector(
      '#companion-avatar'
    );


  if (!image) return;


  const avatar =
    portfolio.owner?.identity
      ?.generatedAvatar ||
    portfolio.owner?.identity
      ?.portrait ||
    './assets/avatar/tayassuk-generated-avatar.png';


  image.src =
    avatar;

}


/* =========================================================
   GLOBAL CLICK HANDLER
   ========================================================= */

function wireGlobalEvents() {

  if (
    document.documentElement
      .dataset
      .tayassukEvents
  ) {
    return;
  }


  document.documentElement.dataset
    .tayassukEvents =
    'true';


  document.addEventListener(
    'click',
    event => {

      const closeButton =
        event.target.closest(
          '[data-win-close]'
        );


      if (closeButton) {

        const node =
          closeButton.closest(
            '.app-window'
          );


        if (node) {

          closeWindow(
            node.dataset.app
          );

        }

        return;

      }


      const openButton =
        event.target.closest(
          '[data-action="open"]'
        );


      if (openButton) {

        const id =
          openButton.dataset.app;


        if (id) {

          openWindow(id);

        }

        return;

      }


      const projectButton =
        event.target.closest(
          '[data-action="project-detail"]'
        );


      if (projectButton) {

        const projectId =
          projectButton.dataset.project;


        const project =
          (portfolio.projects || [])
            .find(
              item =>
                String(
                  item.id ||
                  item.name ||
                  item.title
                ) ===
                String(projectId)
            );


        if (project) {

          openProjectDetailWindow(
            project
          );

        }

        return;

      }


      const themeButton =
        event.target.closest(
          '[data-action="theme"]'
        );


      if (themeButton) {

        toggleTheme();

        return;

      }


      const searchButton =
        event.target.closest(
          '[data-action="search"]'
        );


      if (searchButton) {

        openSearch();

        return;

      }

    }
  );


  document.addEventListener(
    'pointerdown',
    event => {

      const node =
        event.target.closest(
          '.app-window'
        );


      if (node) {

        focusWindow(
          node.dataset.app
        );

      }

    }
  );

}


/* =========================================================
   PROJECT DETAIL WINDOW
   ========================================================= */

function openProjectDetailWindow(project) {

  const id =
    `project-detail-${String(
      project.id ||
      project.name ||
      'project'
    )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        '-'
      )}`;


  if (state.windows.has(id)) {

    focusWindow(id);

    return;

  }


  const layer =
    document.querySelector(
      '#windows'
    );


  if (!layer) return;


  const position =
    windowPosition();


  const node =
    document.createElement(
      'section'
    );


  node.className =
    'app-window';


  node.dataset.app =
    id;


  node.style.left =
    `${position.left}px`;


  node.style.top =
    `${position.top}px`;


  node.style.width =
    `${position.width}px`;


  node.style.height =
    `${position.height}px`;


  node.style.zIndex =
    ++state.z;


  node.innerHTML = `

    <div class="window-chrome">

      <span class="window-title">
        ${esc(
          project.name ||
          project.title ||
          'Project'
        )}
      </span>

      <span class="window-state">
        Project
      </span>

      <div class="window-controls">

        <button
          type="button"
          data-win-close
          aria-label="Close window"
        >
          ×
        </button>

      </div>

    </div>

    <div class="window-body">

      ${renderProjectDetail(project)}

    </div>

  `;


  layer.appendChild(node);


  state.windows.set(
    id,
    {
      node,
      body:
        node.querySelector(
          '.window-body'
        )
    }
  );


  wireWindowActions(
    node.querySelector(
      '.window-body'
    )
  );


  wireDrag(
    node,
    id
  );


  focusWindow(id);

}


/* =========================================================
   THEME
   ========================================================= */

function toggleTheme() {

  state.theme =
    state.theme === 'dark'
      ? 'light'
      : 'dark';


  localStorage.setItem(
    'tayassuk-os-theme-v2',
    state.theme
  );


  document.documentElement.dataset.theme =
    state.theme;

}


/* =========================================================
   SEARCH WINDOW
   ========================================================= */

function openSearch() {

  const id =
    'search';


  if (state.windows.has(id)) {

    focusWindow(id);

    return;

  }


  const layer =
    document.querySelector(
      '#windows'
    );


  if (!layer) return;


  const position =
    windowPosition();


  const node =
    document.createElement(
      'section'
    );


  node.className =
    'app-window search-window';


  node.dataset.app =
    id;


  node.style.left =
    `${position.left}px`;


  node.style.top =
    `${position.top}px`;


  node.style.width =
    `${Math.min(
      720,
      innerWidth - 44
    )}px`;


  node.style.height =
    `${Math.min(
      560,
      innerHeight - 120
    )}px`;


  node.style.zIndex =
    ++state.z;


  node.innerHTML = `

    <div class="window-chrome">

      <span class="window-title">
        Search
      </span>

      <span class="window-state">
        Tayassuk OS
      </span>

      <div class="window-controls">

        <button
          type="button"
          data-win-close
          aria-label="Close window"
        >
          ×
        </button>

      </div>

    </div>


    <div class="window-body">

      <div class="search-page">

        <input
          id="portfolio-search-input"
          type="search"
          placeholder="Search portfolio..."
          autocomplete="off"
        >


        <div
          id="portfolio-search-results"
          class="search-results"
        >
          <div class="empty-state">
            <p>
              Type something to search.
            </p>
          </div>
        </div>

      </div>

    </div>

  `;


  layer.appendChild(node);


  state.windows.set(
    id,
    {
      node,
      body:
        node.querySelector(
          '.window-body'
        )
    }
  );


  const input =
    node.querySelector(
      '#portfolio-search-input'
    );


  const results =
    node.querySelector(
      '#portfolio-search-results'
    );


  input?.addEventListener(
    'input',
    () => {

      results.innerHTML =
        renderSearchResults(
          input.value
        );

    }
  );


  wireWindowActions(
    node.querySelector(
      '.window-body'
    )
  );


  wireDrag(
    node,
    id
  );


  focusWindow(id);


  setTimeout(
    () => input?.focus(),
    50
  );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function wireKeyboard() {

  document.addEventListener(
    'keydown',
    event => {

      if (
        event.key === 'Escape'
      ) {

        const ids =
          [...state.windows.keys()];


        const last =
          ids.at(-1);


        if (last) {

          closeWindow(
            last
          );

        }

        return;

      }


      if (
        event.ctrlKey &&
        event.key.toLowerCase() === 'k'
      ) {

        event.preventDefault();

        openSearch();

      }

    }
  );

}


/* =========================================================
   AUTH + REMOTE DATA
   ========================================================= */

async function initRemoteData() {

  try {

    state.adminSession =
      await getSession();

  } catch (error) {

    console.warn(
      'Could not get auth session:',
      error
    );

    state.adminSession =
      null;

  }


  try {

    const remote =
      await loadRemotePortfolio();


    if (
      remote &&
      typeof remote === 'object'
    ) {

      portfolio = {

        ...portfolio,

        ...remote,

        owner: {

          ...portfolio.owner,

          ...(remote.owner || {})

        }

      };

    }

  } catch (error) {

    console.warn(
      'Remote portfolio unavailable. Using fallback data.',
      error
    );

  }


  renderAll();

}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initialize() {

  /*
   * These are deliberately called BEFORE
   * the async Supabase request.
   * So the public portfolio remains interactive
   * even when Supabase is slow/unavailable.
   */

  wireGlobalEvents();

  wireKeyboard();

  renderAll();


  /*
   * Then load CMS data.
   */
  initRemoteData();

}


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState ===
  'loading'
) {

  document.addEventListener(
    'DOMContentLoaded',
    initialize,
    {
      once: true
    }
  );

} else {

  initialize();

}
/* =========================================================
   CUSTOM DOCK APP LOGOS
   ========================================================= */

function replaceDockIcons() {
  const dockItems = document.querySelectorAll(
    '.dock .dock-item'
  );

  const dockLogos = [
    './assets/icons/about.png',
    './assets/icons/projects.png',
    './assets/icons/learning.png',
    './assets/icons/skills.png',
    './assets/icons/education.png',
    './assets/icons/journey.png',
    './assets/icons/achievements.png',
    './assets/icons/resume.png',
    './assets/icons/contact.png',
    './assets/icons/whiteboard.png',
    './assets/icons/founder.png',
    './assets/icons/control-center.png'
  ];

  dockItems.forEach((item, index) => {
    const logo = dockLogos[index];

    if (!logo) return;

    item.innerHTML = `
      <img
        src="${logo}"
        alt="Dock App"
        class="dock-app-logo"
      />
    `;
  });
}


/* Run after page loads */
if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    replaceDockIcons
  );
} else {
  replaceDockIcons();
}
/* =========================================================
   WINDOW CONTROLS
   ========================================================= */

document.addEventListener("click", function (event) {

  const button =
    event.target.closest("[data-window-action]");

  if (!button) return;

  const windowNode =
    button.closest(".app-window");

  if (!windowNode) return;

  const action =
    button.dataset.windowAction;


  /* ---------- CLOSE ---------- */

  if (action === "close") {

    windowNode.remove();

    return;
  }


  /* ---------- MINIMIZE ---------- */

  if (action === "minimize") {

    windowNode.classList.toggle(
      "window-minimized"
    );

    return;
  }


  /* ---------- MAXIMIZE ---------- */

  if (action === "maximize") {

    windowNode.classList.toggle(
      "window-maximized"
    );

    return;
  }

});
