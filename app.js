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

  adminSession: null,

  /* Window state */
  minimizedWindows: new Set(),

  maximizedWindows: new Set(),

  /* Store previous window size before maximize */
  windowRestoreState: new Map()

};


/* =========================================================
   APPS
   =========================================================
   
   EXACT 14 APPS
   1. Journey
   2. Projects
   3. Learning
   4. Control Center
   5. Contact
   6. Founder.txt
   7. Skills
   8. Trash
   9. Achievements
   10. About
   11. Education
   12. Settings
   13. Browser
   14. Whiteboard
   
   ========================================================= */

const apps = [

  {
    id: 'journey',
    name: 'Journey',
    desc: 'Software engineering growth',
    logo: './assets/icons/journey.png'
  },

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
    id: 'control',
    name: 'Control Center',
    desc: 'Private portfolio management',
    logo: './assets/icons/control-center.png'
  },

  {
    id: 'contact',
    name: 'Contact',
    desc: 'Start a conversation',
    logo: './assets/icons/contact.png'
  },

  {
    id: 'founder',
    name: 'Founder.txt',
    desc: 'My working principles',
    logo: './assets/icons/founder.png'
  },

  {
    id: 'skills',
    name: 'Skills',
    desc: 'Technical toolkit',
    logo: './assets/icons/skills.png'
  },

  {
    id: 'trash',
    name: 'Trash',
    desc: 'Deleted portfolio items',
    logo: './assets/icons/trash.png'
  },

  {
    id: 'achievements',
    name: 'Achievements',
    desc: 'Activities & milestones',
    logo: './assets/icons/achievements.png'
  },

  {
    id: 'about',
    name: 'About',
    desc: 'Who I am & what I value',
    logo: './assets/icons/about.png'
  },

  {
    id: 'education',
    name: 'Education',
    desc: 'Academic timeline',
    logo: './assets/icons/education.png'
  },

  {
    id: 'settings',
    name: 'Settings',
    desc: 'Tayassuk OS preferences',
    logo: './assets/icons/settings.png'
  },

  {
    id: 'browser',
    name: 'Browser',
    desc: 'Approved external links',
    logo: './assets/icons/browser.png'
  },

  {
    id: 'whiteboard',
    name: 'Whiteboard',
    desc: 'Leave a local note',
    logo: './assets/icons/whiteboard.png'
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

  const url =
    String(value ?? '').trim();

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
        app => {

          const fallbackIcon =
            app.id === 'settings'
              ? '⚙'
              : app.id === 'trash'
                ? '🗑'
                : '◈';

          return `

            <button
              type="button"
              class="launcher-app"
              data-action="open"
              data-app="${esc(app.id)}"
              title="${esc(app.name)}"
            >

              <div class="app-icon-wrap">

                <img
                  src="${esc(app.logo)}"
                  alt="${esc(app.name)}"
                  class="app-logo"
                  draggable="false"
                  onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                  "
                >

                <span
                  class="app-icon-fallback"
                  style="display:none;"
                  aria-hidden="true"
                >
                  ${fallbackIcon}
                </span>

              </div>

              <span class="app-name">
                ${esc(app.name)}
              </span>

            </button>

          `;

        }
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

  const width = Math.min(
    940,
    window.innerWidth - 44
  );

  const height = Math.min(
    700,
    window.innerHeight - 120
  );

  const offset =
    state.windows.size % 4;

  const vertical =
    state.windows.size % 3;

  const left = Math.max(
    22,
    Math.min(
      (window.innerWidth - width) / 2 +
        offset * 16,
      window.innerWidth - width - 22
    )
  );

  const top = Math.max(
    72,
    Math.min(
      (window.innerHeight - height) / 2 +
        vertical * 12,
      window.innerHeight - height - 22
    )
  );

  return {
    left,
    top,
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
   RESTORE MINIMIZED WINDOW
   ========================================================= */

function restoreWindow(id) {

  const win =
    state.windows.get(id);

  if (!win?.node) return;

  state.minimizedWindows.delete(id);

  win.node.hidden = false;

  win.node.classList.remove(
    'window-minimized'
  );

  focusWindow(id);

}


/* =========================================================
   MINIMIZE WINDOW
   ========================================================= */

function minimizeWindow(id) {

  const win =
    state.windows.get(id);

  if (!win?.node) return;

  state.minimizedWindows.add(id);

  win.node.classList.add(
    'window-minimized'
  );

  win.node.hidden = true;

}


/* =========================================================
   MAXIMIZE WINDOW
   ========================================================= */

function maximizeWindow(id) {

  const win =
    state.windows.get(id);

  if (!win?.node) return;


  /* -----------------------------------------
     If already maximized → restore
     ----------------------------------------- */

  if (
    state.maximizedWindows.has(id)
  ) {

    restoreWindowSize(id);

    return;
  }


  /* -----------------------------------------
     Save current dimensions
     ----------------------------------------- */

  state.windowRestoreState.set(
    id,
    {
      left:
        win.node.style.left,

      top:
        win.node.style.top,

      width:
        win.node.style.width,

      height:
        win.node.style.height
    }
  );


  state.maximizedWindows.add(id);


  win.node.classList.add(
    'window-maximized'
  );


  win.node.style.left =
    '16px';

  win.node.style.top =
    '64px';

  win.node.style.width =
    'calc(100vw - 32px)';

  win.node.style.height =
    'calc(100vh - 82px)';


  const button =
    win.node.querySelector(
      '[data-window-action="maximize"]'
    );


  if (button) {

    button.setAttribute(
      'aria-label',
      'Restore window'
    );

    button.title =
      'Restore';

    button.textContent =
      '❐';

  }


  focusWindow(id);

}


/* =========================================================
   RESTORE WINDOW SIZE
   ========================================================= */

function restoreWindowSize(id) {

  const win =
    state.windows.get(id);

  if (!win?.node) return;


  const previous =
    state.windowRestoreState.get(id);


  state.maximizedWindows.delete(id);


  win.node.classList.remove(
    'window-maximized'
  );


  if (previous) {

    win.node.style.left =
      previous.left;

    win.node.style.top =
      previous.top;

    win.node.style.width =
      previous.width;

    win.node.style.height =
      previous.height;

  }


  const button =
    win.node.querySelector(
      '[data-window-action="maximize"]'
    );


  if (button) {

    button.setAttribute(
      'aria-label',
      'Maximize window'
    );

    button.title =
      'Maximize';

    button.textContent =
      '□';

  }


  focusWindow(id);

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

  state.minimizedWindows.delete(id);

  state.maximizedWindows.delete(id);

  state.windowRestoreState.delete(id);

}


/* =========================================================
   WINDOW CONTROLS
   ========================================================= */

function wireWindowControls(node, id) {

  if (!node) return;


  const controls =
    node.querySelector(
      '.window-controls'
    );


  if (!controls) return;


  controls.addEventListener(
    'click',
    event => {

      const button =
        event.target.closest(
          '[data-window-action]'
        );


      if (!button) return;


      event.preventDefault();

      event.stopPropagation();


      const action =
        button.dataset.windowAction;


      if (action === 'minimize') {

        minimizeWindow(id);

        return;

      }


      if (action === 'maximize') {

        maximizeWindow(id);

        return;

      }


      if (action === 'close') {

        closeWindow(id);

      }

    }
  );

}


/* =========================================================
   OPEN WINDOW
   ========================================================= */

function openWindow(id) {

  if (!id) return;


  /* -----------------------------------------
     Already open
     ----------------------------------------- */

  if (
    state.windows.has(id)
  ) {

    const win =
      state.windows.get(id);


    if (
      state.minimizedWindows.has(id)
    ) {

      restoreWindow(id);

    } else {

      focusWindow(id);

    }


    return;

  }


  const layer =
    document.querySelector(
      '#windows'
    );


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


  /* -----------------------------------------
     Trash
     ----------------------------------------- */

  if (id === 'trash') {

    openTrashWindow();

    return;

  }


  /* -----------------------------------------
     Settings
     ----------------------------------------- */

  if (id === 'settings') {

    openSettingsWindow();

    return;

  }


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
/* =========================================================
   FIX: KEEP APP WINDOW INSIDE VIEWPORT
   ========================================================= */

const safeWidth = Math.min(
  position.width,
  window.innerWidth - 40
);

const safeHeight = Math.min(
  position.height,
  window.innerHeight - 100
);

const safeLeft = Math.max(
  20,
  (window.innerWidth - safeWidth) / 2
);

const safeTop = Math.max(
  70,
  (window.innerHeight - safeHeight) / 2
);

node.style.setProperty(
  'position',
  'fixed',
  'important'
);

node.style.setProperty(
  'left',
  `${safeLeft}px`,
  'important'
);

node.style.setProperty(
  'top',
  `${safeTop}px`,
  'important'
);

node.style.setProperty(
  'width',
  `${safeWidth}px`,
  'important'
);

node.style.setProperty(
  'height',
  `${safeHeight}px`,
  'important'
);

node.style.setProperty(
  'margin',
  '0',
  'important'
);

node.style.setProperty(
  'transform',
  'none',
  'important'
);

node.style.setProperty(
  'z-index',
  `${++state.z}`,
  'important'
);

  node.innerHTML = `

    <div class="window-chrome">

      <div class="window-title-area">

        <span class="window-title">
          ${esc(
            app?.name ||
            id
          )}
        </span>

        <span class="window-state">
          Tayassuk OS
        </span>

      </div>


      <div class="window-controls">

        <button
          type="button"
          class="window-control window-minimize"
          data-window-action="minimize"
          aria-label="Minimize window"
          title="Minimize"
        >
          −
        </button>


        <button
          type="button"
          class="window-control window-maximize"
          data-window-action="maximize"
          aria-label="Maximize window"
          title="Maximize"
        >
          □
        </button>


        <button
          type="button"
          class="window-control window-close"
          data-window-action="close"
          aria-label="Close window"
          title="Close"
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


  wireWindowControls(
    node,
    id
  );


  wireDrag(
    node,
    id
  );


  node.addEventListener(
    'pointerdown',
    () => focusWindow(id)
  );


  focusWindow(id);

}


/* =========================================================
   TRASH WINDOW
   ========================================================= */

function openTrashWindow() {

  const id =
    'trash';


  if (
    state.windows.has(id)
  ) {

    const win =
      state.windows.get(id);


    if (
      state.minimizedWindows.has(id)
    ) {

      restoreWindow(id);

    } else {

      focusWindow(id);

    }


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

      <div class="window-title-area">

        <span class="window-title">
          Trash
        </span>

        <span class="window-state">
          Tayassuk OS
        </span>

      </div>


      <div class="window-controls">

        <button
          type="button"
          class="window-control window-minimize"
          data-window-action="minimize"
          aria-label="Minimize window"
          title="Minimize"
        >
          −
        </button>


        <button
          type="button"
          class="window-control window-maximize"
          data-window-action="maximize"
          aria-label="Maximize window"
          title="Maximize"
        >
          □
        </button>


        <button
          type="button"
          class="window-control window-close"
          data-window-action="close"
          aria-label="Close window"
          title="Close"
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


  wireWindowControls(
    node,
    id
  );


  wireDrag(
    node,
    id
  );


  node.addEventListener(
    'pointerdown',
    () => focusWindow(id)
  );


  focusWindow(id);

}


/* =========================================================
   SETTINGS WINDOW
   ========================================================= */

function openSettingsWindow() {

  const id =
    'settings';


  if (
    state.windows.has(id)
  ) {

    const win =
      state.windows.get(id);


    if (
      state.minimizedWindows.has(id)
    ) {

      restoreWindow(id);

    } else {

      focusWindow(id);

    }


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
    `${Math.min(
      760,
      innerWidth - 44
    )}px`;


  node.style.height =
    `${Math.min(
      580,
      innerHeight - 120
    )}px`;


  node.style.zIndex =
    ++state.z;


  node.innerHTML = `

    <div class="window-chrome">

      <div class="window-title-area">

        <span class="window-title">
          Settings
        </span>

        <span class="window-state">
          Tayassuk OS
        </span>

      </div>


      <div class="window-controls">

        <button
          type="button"
          class="window-control window-minimize"
          data-window-action="minimize"
          aria-label="Minimize window"
          title="Minimize"
        >
          −
        </button>


        <button
          type="button"
          class="window-control window-maximize"
          data-window-action="maximize"
          aria-label="Maximize window"
          title="Maximize"
        >
          □
        </button>


        <button
          type="button"
          class="window-control window-close"
          data-window-action="close"
          aria-label="Close window"
          title="Close"
        >
          ×
        </button>

      </div>

    </div>


    <div class="window-body">

      <div class="window-page settings-page">

        <div class="window-page-heading">

          <span class="eyebrow">
            System Preferences
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Customize your Tayassuk OS experience.
          </p>

        </div>


        <div class="settings-grid">

          <section class="control-card">

            <div class="settings-card-icon">
              ◐
            </div>

            <div>

              <h3>
                Appearance
              </h3>

              <p>
                Choose your preferred interface theme.
              </p>

            </div>


            <div class="settings-actions">

              <button
                type="button"
                class="secondary-action"
                data-settings-theme="dark"
              >
                Dark
              </button>

              <button
                type="button"
                class="secondary-action"
                data-settings-theme="light"
              >
                Light
              </button>

            </div>

          </section>


          <section class="control-card">

            <div class="settings-card-icon">
              ✦
            </div>

            <div>

              <h3>
                Interface
              </h3>

              <p>
                Tayassuk OS desktop experience.
              </p>

            </div>

            <span class="settings-status">
              v2.0
            </span>

          </section>


          <section class="control-card">

            <div class="settings-card-icon">
              ↻
            </div>

            <div>

              <h3>
                Local Storage
              </h3>

              <p>
                Whiteboard notes are stored locally on this device.
              </p>

            </div>

          </section>

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


  wireWindowControls(
    node,
    id
  );


  wireDrag(
    node,
    id
  );


  node.addEventListener(
    'pointerdown',
    () => focusWindow(id)
  );


  /* -----------------------------------------
     Theme buttons
     ----------------------------------------- */

  node.addEventListener(
    'click',
    event => {

      const button =
        event.target.closest(
          '[data-settings-theme]'
        );


      if (!button) return;


      const theme =
        button.dataset.settingsTheme;


      if (
        theme !== 'dark' &&
        theme !== 'light'
      ) {
        return;
      }


      state.theme =
        theme;


      localStorage.setItem(
        'tayassuk-os-theme-v2',
        theme
      );


      document.documentElement.dataset.theme =
        theme;

    }
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


  let dragging =
    false;

  let startX =
    0;

  let startY =
    0;

  let startLeft =
    0;

  let startTop =
    0;


  chrome.addEventListener(
    'pointerdown',
    event => {

      /* Don't drag from buttons */

      if (
        event.target.closest(
          'button'
        )
      ) {

        return;

      }


      /* Don't drag maximized window */

      if (
        state.maximizedWindows.has(id)
      ) {

        return;

      }


      dragging =
        true;


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
          64,
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
            64,
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

      dragging =
        false;


      try {

        chrome.releasePointerCapture(
          event.pointerId
        );

      } catch {}

    }
  );


  chrome.addEventListener(
    'pointercancel',
    () => {

      dragging =
        false;

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
    Array.isArray(
      technologies
    )
      ? technologies
      : String(
          technologies
        )
          .split(',')
          .map(
            item =>
              item.trim()
          )
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
    Array.isArray(
      technologies
    )
      ? technologies
      : String(
          technologies
        )
          .split(',')
          .map(
            item =>
              item.trim()
          )
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

            <small>
              Role
            </small>

            <strong>
              ${esc(
                project.role ||
                'Solo Developer'
              )}
            </strong>

          </div>


          <div>

            <small>
              Status
            </small>

            <strong>
              ${esc(
                project.status ||
                'Working'
              )}
            </strong>

          </div>


          <div>

            <small>
              Dates
            </small>

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

      win.body.innerHTML = `
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


    default:

      win.body.innerHTML = `
        <div class="window-page">

          <div class="window-page-heading">

            <span class="eyebrow">
              Tayassuk OS
            </span>

            <h1>
              ${esc(id)}
            </h1>

            <p>
              This application is ready.
            </p>

          </div>

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


                      <div class="learning-progress">

                        <strong>
                          ${esc(
                            `${Number(
                              item.progress
                            ) || 0}%`
                          )}
                        </strong>

                        <div class="progress-track">

                          <span
                            style="width:${Math.min(
                              100,
                              Math.max(
                                0,
                                Number(
                                  item.progress
                                ) || 0
                              )
                            )}%"
                          ></span>

                        </div>

                      </div>

                    </article>

                  `
                )
                .join('')

            : `

              <div class="empty-state">

                <div class="empty-icon">
                  ✦
                </div>

                <h2>
                  No learning items yet
                </h2>

                <p>
                  Add your current learning topics from the Control Center.
                </p>

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
          Technical Toolkit
        </span>

        <h1>
          Skills
        </h1>

        <p>
          Technologies and tools I use while learning and building.
        </p>

      </div>


      <div class="skills-window-grid">

        ${
          groups
            .map(
              group => `

                <article class="skill-group">

                  <div class="skill-group-heading">

                    <span class="skill-group-dot"></span>

                    <h3>
                      ${esc(
                        group.name ||
                        group.title ||
                        'Skills'
                      )}
                    </h3>

                  </div>


                  <div class="skill-tags">

                    ${
                      (
                        group.skills ||
                        group.items ||
                        []
                      )
                        .map(
                          skill => {

                            const skillName =
                              typeof skill === 'string'
                                ? skill
                                : skill?.name;

                            return `
                              <span>
                                ${esc(
                                  skillName ||
                                  'Skill'
                                )}
                              </span>
                            `;

                          }
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

        <p>
          My academic background and learning journey.
        </p>

      </div>


      <div class="timeline">

        ${
          items.length

            ? items
                .map(
                  item => `

                    <article class="timeline-item">

                      <div class="timeline-dot"></div>

                      <div class="timeline-content">

                        <small class="timeline-year">
                          ${esc(
                            item.year ||
                            item.date ||
                            ''
                          )}
                        </small>

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

                      </div>

                    </article>

                  `
                )
                .join('')

            : `

              <div class="empty-state">

                <h2>
                  No education records yet
                </h2>

              </div>

            `
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


      <div class="timeline journey-timeline">

        ${
          items
            .map(
              (item, index) => `

                <article class="timeline-item">

                  <div class="timeline-dot">
                    ${index + 1}
                  </div>

                  <div class="timeline-content">

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


  const about =
    portfolio.owner?.about ||
    'I am a Software Engineering student focused on learning, building, and growing through practical projects.';


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


      <div class="about-profile-card">

        <div class="about-avatar">

          <img
            src="${esc(
              identity.generatedAvatar ||
              identity.portrait ||
              './assets/avatar/tayassuk-generated-avatar.png'
            )}"
            alt="Tayassuk Imam"
          >

        </div>


        <div class="about-profile-content">

          <span class="eyebrow">
            ${esc(
              identity.profession ||
              'Software Engineering Student'
            )}
          </span>

          <h2>
            Learning • Building • Growing
          </h2>

          <p>
            ${esc(about)}
          </p>

        </div>

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

        <p>
          Activities, experiences and milestones.
        </p>

      </div>


      <div class="achievement-grid">

        ${
          items.length

            ? items
                .map(
                  item => `

                    <article class="achievement-card">

                      <div class="achievement-icon">
                        ✦
                      </div>

                      <div>

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

                      </div>

                    </article>

                  `
                )
                .join('')

            : `

              <div class="empty-state">

                <div class="empty-icon">
                  ✦
                </div>

                <h2>
                  No achievements yet
                </h2>

              </div>

            `
        }

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

        <p>
          Want to talk about a project, idea or opportunity?
        </p>

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

                <span class="contact-item-icon">
                  @
                </span>

                <div>

                  <span>
                    Email
                  </span>

                  <strong>
                    ${esc(
                      contact.email
                    )}
                  </strong>

                </div>

                <span class="contact-arrow">
                  →
                </span>

              </a>

            `
            : ''
        }


        ${
          contact.github
            ? `

              <a
                href="${esc(
                  safeUrl(
                    contact.github
                  )
                )}"
                target="_blank"
                rel="noreferrer noopener"
                class="contact-item"
              >

                <span class="contact-item-icon">
                  GH
                </span>

                <div>

                  <span>
                    GitHub
                  </span>

                  <strong>
                    Open Profile
                  </strong>

                </div>

                <span class="contact-arrow">
                  ↗
                </span>

              </a>

            `
            : ''
        }


        ${
          contact.linkedin
            ? `

              <a
                href="${esc(
                  safeUrl(
                    contact.linkedin
                  )
                )}"
                target="_blank"
                rel="noreferrer noopener"
                class="contact-item"
              >

                <span class="contact-item-icon">
                  in
                </span>

                <div>

                  <span>
                    LinkedIn
                  </span>

                  <strong>
                    Open Profile
                  </strong>

                </div>

                <span class="contact-arrow">
                  ↗
                </span>

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

        <p>
          Write something and keep it saved on this device.
        </p>

      </div>


      <div class="whiteboard-shell">

        <textarea
          id="whiteboard-input"
          class="whiteboard-input"
          placeholder="Write a note..."
        >${esc(saved)}</textarea>


        <div class="whiteboard-footer">

          <span class="whiteboard-hint">
            Saved locally
          </span>

          <button
            type="button"
            class="primary-action"
            data-action="save-whiteboard"
          >
            Save Note
          </button>

        </div>

      </div>


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

        <p>
          The mindset behind the work.
        </p>

      </div>


      <div class="founder-terminal">

        <div class="terminal-top">

          <span></span>
          <span></span>
          <span></span>

        </div>


        <div class="terminal-body">

          <div class="terminal-line">
            <span class="terminal-prompt">
              $
            </span>

            cat founder.txt
          </div>


          <div class="terminal-text">

            ${
              founder.principles
                ? esc(
                    founder.principles
                  )
                : `
                  Learn continuously.<br>
                  Build practically.<br>
                  Stay curious.<br>
                  Keep improving.
                `
            }

          </div>

        </div>

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


  const featured =
    portfolio.projects?.find(
      project =>
        project.featured
    ) ||
    portfolio.projects?.[0];


  return `

    <div class="window-page">

      <div class="window-page-heading">

        <span class="eyebrow">
          External Links
        </span>

        <h1>
          Browser
        </h1>

        <p>
          Quick access to selected online profiles and projects.
        </p>

      </div>


      <div class="browser-toolbar">

        <span class="browser-lock">
          🔒
        </span>

        <span>
          tayassuk-os.local
        </span>

      </div>


      <div class="browser-links">

        ${
          contact.github
            ? `

              <a
                href="${esc(
                  safeUrl(
                    contact.github
                  )
                )}"
                target="_blank"
                rel="noreferrer noopener"
              >

                <span>
                  GitHub
                </span>

                <small>
                  Developer profile
                </small>

                <strong>
                  ↗
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
                  safeUrl(
                    contact.linkedin
                  )
                )}"
                target="_blank"
                rel="noreferrer noopener"
              >

                <span>
                  LinkedIn
                </span>

                <small>
                  Professional profile
                </small>

                <strong>
                  ↗
                </strong>

              </a>

            `
            : ''
        }


        ${
          featured?.liveUrl
            ? `

              <a
                href="${esc(
                  safeUrl(
                    featured.liveUrl
                  )
                )}"
                target="_blank"
                rel="noreferrer noopener"
              >

                <span>
                  Featured Project
                </span>

                <small>
                  ${esc(
                    featured.name ||
                    featured.title ||
                    'Live project'
                  )}
                </small>

                <strong>
                  ↗
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
   WINDOW ACTIONS
   ========================================================= */

function wireWindowActions(body) {

  if (!body) return;


  body.addEventListener(
    'click',
    event => {


      /* -----------------------------------------
         Project details
         ----------------------------------------- */

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
          projectButton.closest(
            '.app-window'
          );


        if (
          current &&
          state.windows.has(
            current.dataset.app
          )
        ) {

          const win =
            state.windows.get(
              current.dataset.app
            );


          if (win?.body) {

            win.body.innerHTML =
              renderProjectDetail(
                project
              );

          }

        }

        return;

      }


      /* -----------------------------------------
         Whiteboard
         ----------------------------------------- */

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
            '✓ Note saved locally.';

        }

        return;

      }


      /* -----------------------------------------
         Admin logout
         ----------------------------------------- */

      const adminLogout =
        event.target.closest(
          '[data-action="admin-logout"]'
        );


      if (adminLogout) {

        handleAdminLogout(
          body
        );

        return;

      }


      /* -----------------------------------------
         Admin refresh
         ----------------------------------------- */

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
          Manage your portfolio content and system preferences.
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

                <div class="control-card-icon">
                  ◉
                </div>

                <div>

                  <h3>
                    Profile
                  </h3>

                  <p>
                    ${esc(
                      identity.fullName ||
                      'Tayassuk Imam'
                    )}
                  </p>

                  <small>
                    ${esc(
                      identity.profession ||
                      'Software Engineering Student'
                    )}
                  </small>

                </div>

              </section>


              <section class="control-card">

                <div class="control-card-icon">
                  ◇
                </div>

                <div>

                  <h3>
                    Projects
                  </h3>

                  <p>
                    ${
                      (
                        portfolio.projects ||
                        []
                      ).length
                    }
                    project(s)
                  </p>

                  <small>
                    Portfolio projects
                  </small>

                </div>

              </section>


              <section class="control-card">

                <div class="control-card-icon">
                  ◎
                </div>

                <div>

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

                  <small>
                    Current focus
                  </small>

                </div>

              </section>


              <section class="control-card">

                <div class="control-card-icon">
                  @
                </div>

                <div>

                  <h3>
                    Contact
                  </h3>

                  <p>
                    ${esc(
                      contact.email ||
                      'No email configured'
                    )}
                  </p>

                  <small>
                    Public contact
                  </small>

                </div>

              </section>

            </div>


            <div class="control-actions">

              <button
                type="button"
                class="secondary-action"
                data-action="admin-refresh"
              >
                ↻ Refresh Data
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

              <div class="login-intro">

                <div class="login-icon">
                  ◈
                </div>

                <div>

                  <h3>
                    Administrator Access
                  </h3>

                  <p>
                    Sign in to manage your portfolio.
                  </p>

                </div>

              </div>


              <label>

                <span>
                  Email
                </span>

                <input
                  type="email"
                  name="email"
                  autocomplete="email"
                  placeholder="admin@example.com"
                  required
                >

              </label>


              <label>

                <span>
                  Password
                </span>

                <input
                  type="password"
                  name="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
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


  if (!form) return;


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


      if (
        !email ||
        !password
      ) {

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
    String(
      query || ''
    )
      .trim()
      .toLowerCase();


  if (!term) {

    return [];

  }


  const results = [];


  /* -----------------------------------------
     Search apps
     ----------------------------------------- */

  apps.forEach(
    app => {

      const text =
        `${app.name} ${app.desc}`
          .toLowerCase();


      if (
        text.includes(term)
      ) {

        results.push({

          type: 'app',

          id: app.id,

          title: app.name,

          description: app.desc

        });

      }

    }
  );


  /* -----------------------------------------
     Search projects
     ----------------------------------------- */

  (
    portfolio.projects ||
    []
  )
    .forEach(
      project => {

        const text =
          JSON.stringify(
            project
          )
            .toLowerCase();


        if (
          text.includes(term)
        ) {

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

            <span class="search-result-icon">
              ${
                result.type === 'project'
                  ? '◆'
                  : '◈'
              }
            </span>

            <span>

              <strong>
                ${esc(
                  result.title
                )}
              </strong>

              <small>
                ${esc(
                  result.description
                )}
              </small>

            </span>

            <span>
              →
            </span>

          </button>

        `
      )
      .join('');


  return (
    output ||

    `

      <div class="empty-state">

        <div class="empty-icon">
          ⌕
        </div>

        <h3>
          No results found
        </h3>

        <p>
          Try another search term.
        </p>

      </div>

    `
  );

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
    (
      portfolio.projects ||
      []
    )
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

    featuredImageElement.alt =
      featuredName;

  }


  const featuredStatus =
    document.querySelector(
      '#featured-project-status'
    );


  if (featuredStatus) {

    featuredStatus.textContent =
      featured?.status ||
      'Working';

  }


  const featuredTech =
    document.querySelector(
      '#featured-project-tech'
    );


  if (featuredTech) {

    const technologies =
      featured?.technologies ||
      featured?.stack ||
      [];


    const tech =
      Array.isArray(
        technologies
      )
        ? technologies
        : String(
            technologies
          )
            .split(',')
            .map(
              item =>
                item.trim()
            )
            .filter(Boolean);


    featuredTech.innerHTML =
      tech
        .map(
          item =>
            `<span>${esc(item)}</span>`
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
    [
      'projects',
      'learning',
      'skills',
      'education',
      'journey',
      'about',
      'achievements',
      'contact',
      'whiteboard',
      'browser',
      'control'
    ];


  dock.innerHTML =
    dockApps
      .map(
        id => {

          const app =
            apps.find(
              item =>
                item.id === id
            );


          if (!app) return '';


          return `

            <button
              type="button"
              class="dock-item"
              data-action="open"
              data-app="${esc(id)}"
              title="${esc(
                app.name
              )}"
            >

              <img
                src="${esc(
                  app.logo
                )}"
                alt="${esc(
                  app.name
                )}"
                draggable="false"
              >

            </button>

          `;

        }
      )
      .join('');

}


/* =========================================================
   COMPANION
   ========================================================= */

function renderCompanion() {

  const companion =
    document.querySelector(
      '#companion'
    );


  if (!companion) return;


  const identity =
    portfolio.owner?.identity ||
    {};


  companion.innerHTML = `

    <div class="companion-avatar">

      <img
        src="${esc(
          identity.generatedAvatar ||
          identity.portrait ||
          './assets/avatar/tayassuk-generated-avatar.png'
        )}"
        alt="Tayassuk"
        draggable="false"
      >

    </div>


    <div class="companion-copy">

      <span>
        Currently
      </span>

      <strong>
        Learning & Building
      </strong>

    </div>

  `;

}


/* =========================================================
   GLOBAL CLICK HANDLER
   ========================================================= */

document.addEventListener(
  'click',
  event => {

    /* -----------------------------------------
       Open app
       ----------------------------------------- */

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


    /* -----------------------------------------
       Close active window
       ----------------------------------------- */

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


    /* -----------------------------------------
       Search
       ----------------------------------------- */

    const searchButton =
      event.target.closest(
        '[data-action="search"]'
      );


    if (searchButton) {

      openSearchWindow();

      return;

    }


    /* -----------------------------------------
       Theme
       ----------------------------------------- */

    const themeButton =
      event.target.closest(
        '[data-theme]'
      );


    if (themeButton) {

      const theme =
        themeButton.dataset.theme;


      if (
        theme === 'dark' ||
        theme === 'light'
      ) {

        state.theme =
          theme;


        document.documentElement.dataset.theme =
          theme;


        localStorage.setItem(
          'tayassuk-os-theme-v2',
          theme
        );

      }

    }

  }
);


/* =========================================================
   SEARCH WINDOW
   ========================================================= */

function openSearchWindow() {

  const id =
    'search';


  if (
    state.windows.has(id)
  ) {

    restoreWindow(id);

    return;

  }


  const layer =
    document.querySelector(
      '#windows'
    );


  if (!layer) return;


  const node =
    document.createElement(
      'section'
    );


  node.className =
    'app-window search-window';


  node.dataset.app =
    id;


  node.style.width =
    `${Math.min(
      680,
      innerWidth - 40
    )}px`;


  node.style.height =
    `${Math.min(
      520,
      innerHeight - 120
    )}px`;


  node.style.left =
    `${Math.max(
      20,
      (innerWidth - 680) / 2
    )}px`;


  node.style.top =
    `${Math.max(
      72,
      (innerHeight - 520) / 2
    )}px`;


  node.style.zIndex =
    ++state.z;


  node.innerHTML = `

    <div class="window-chrome">

      <div class="window-title-area">

        <span class="window-title">
          Search
        </span>

        <span class="window-state">
          Tayassuk OS
        </span>

      </div>


      <div class="window-controls">

        <button
          type="button"
          class="window-control window-minimize"
          data-window-action="minimize"
          title="Minimize"
        >
          −
        </button>


        <button
          type="button"
          class="window-control window-maximize"
          data-window-action="maximize"
          title="Maximize"
        >
          □
        </button>


        <button
          type="button"
          class="window-control window-close"
          data-window-action="close"
          title="Close"
        >
          ×
        </button>

      </div>

    </div>


    <div class="window-body">

      <div class="search-page">

        <div class="search-input-wrap">

          <span>
            ⌕
          </span>

          <input
            type="search"
            id="portfolio-search-input"
            placeholder="Search apps and projects..."
            autocomplete="off"
          >

        </div>


        <div
          class="search-results"
          id="portfolio-search-results"
        >

          <div class="empty-state">

            <div class="empty-icon">
              ⌕
            </div>

            <p>
              Start typing to search.
            </p>

          </div>

        </div>

      </div>

    </div>

  `;


  layer.appendChild(
    node
  );


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


  wireWindowControls(
    node,
    id
  );


  wireDrag(
    node,
    id
  );


  node.addEventListener(
    'pointerdown',
    () => focusWindow(id)
  );


  const input =
    node.querySelector(
      '#portfolio-search-input'
    );


  const results =
    node.querySelector(
      '#portfolio-search-results'
    );


  if (input && results) {

    input.addEventListener(
      'input',
      () => {

        results.innerHTML =
          renderSearchResults(
            input.value
          );

      }
    );

  }


  focusWindow(id);


  requestAnimationFrame(
    () => input?.focus()
  );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
  'keydown',
  event => {

    /* ESC → close focused window */

    if (
      event.key === 'Escape'
    ) {

      const openWindows =
        Array.from(
          state.windows.values()
        )
          .filter(
            win =>
              win?.node &&
              !win.node.hidden
          );


      if (
        openWindows.length
      ) {

        const active =
          openWindows
            .sort(
              (a, b) =>
                Number(
                  b.node.style.zIndex
                ) -
                Number(
                  a.node.style.zIndex
                )
            )[0];


        if (active) {

          closeWindow(
            active.node.dataset.app
          );

        }

      }

    }


    /* CTRL + K → Search */

    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.key.toLowerCase() === 'k'
    ) {

      event.preventDefault();

      openSearchWindow();

    }

  }
);


/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener(
  'resize',
  () => {

    state.windows.forEach(
      (win, id) => {

        if (!win?.node) return;


        if (
          state.maximizedWindows.has(id)
        ) {

          win.node.style.left =
            '16px';

          win.node.style.top =
            '64px';

          win.node.style.width =
            'calc(100vw - 32px)';

          win.node.style.height =
            'calc(100vh - 82px)';

          return;

        }


        const maxLeft =
          Math.max(
            12,
            innerWidth -
              win.node.offsetWidth -
              12
          );


        const maxTop =
          Math.max(
            64,
            innerHeight -
              win.node.offsetHeight -
              12
          );


        const currentLeft =
          parseFloat(
            win.node.style.left
          ) || 12;


        const currentTop =
          parseFloat(
            win.node.style.top
          ) || 64;


        win.node.style.left =
          `${Math.min(
            maxLeft,
            Math.max(
              12,
              currentLeft
            )
          )}px`;


        win.node.style.top =
          `${Math.min(
            maxTop,
            Math.max(
              64,
              currentTop
            )
          )}px`;

      }
    );

  }
);


/* =========================================================
   INITIALIZE REMOTE DATA
   ========================================================= */

async function initRemoteData() {

  try {

    const session =
      await getSession();


    state.adminSession =
      session?.session ||
      session ||
      null;

  } catch (error) {

    console.warn(
      'Session initialization failed:',
      error
    );

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
      'Remote portfolio initialization failed:',
      error
    );

  }


  renderAll();

}


/* =========================================================
   STARTUP
   ========================================================= */

function initialize() {

  document.documentElement.dataset.theme =
    state.theme;


  renderAll();


  initRemoteData()
    .catch(
      error =>
        console.error(
          'Portfolio initialization failed:',
          error
        )
    );

}


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState === 'loading'
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
/* =====================================================
   FINAL SMALL FIX
   1. Remove duplicate Trash from bottom dock
   2. Fix missing Settings + Trash launcher icons
   3. Keep newly opened windows inside/center of screen
   ===================================================== */

(function () {

  function fixTayassukOS() {

    /* ---------- 1. REMOVE DUPLICATE TRASH ---------- */

    document
      .querySelectorAll(
        '.dock [data-app="trash"],' +
        '.bottom-dock [data-app="trash"],' +
        '[data-dock] [data-app="trash"]'
      )
      .forEach(function (item) {
        item.style.display = 'none';
      });


    /* ---------- 2. FIX SETTINGS + TRASH ICON ---------- */

    const settingsSVG =
      'data:image/svg+xml;charset=UTF-8,' +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 100 100">
          <rect x="8" y="8" width="84" height="84" rx="22"
                fill="#102b43" stroke="#55cfff" stroke-width="3"/>
          <circle cx="50" cy="50" r="18"
                  fill="none" stroke="#d8f5ff" stroke-width="6"/>
          <path d="M50 20v10M50 70v10M20 50h10M70 50h10
                   M29 29l7 7M64 64l7 7M71 29l-7 7M36 64l-7 7"
                stroke="#d8f5ff"
                stroke-width="6"
                stroke-linecap="round"/>
        </svg>
      `);

    const trashSVG =
      'data:image/svg+xml;charset=UTF-8,' +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 100 100">
          <rect x="8" y="8" width="84" height="84" rx="22"
                fill="#102b43" stroke="#55cfff" stroke-width="3"/>
          <path d="M32 34h36M40 34v-7h20v7
                   M37 40v29M50 40v29M63 40v29
                   M31 34l4 40h30l4-40"
                fill="none"
                stroke="#d8f5ff"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg>
      `);


    /* ---------- 3. KEEP NEW WINDOWS INSIDE SCREEN ---------- */

    document
      .querySelectorAll('.app-window')
      .forEach(function (win) {

        if (win.dataset.safePositionFixed === 'yes') {
          return;
        }

        const rect = win.getBoundingClientRect();

        const width = Math.min(
          rect.width || 900,
          window.innerWidth - 40
        );

        const height = Math.min(
          rect.height || 650,
          window.innerHeight - 100
        );

        const left = Math.max(
          20,
          (window.innerWidth - width) / 2
        );

        const top = Math.max(
          70,
          (window.innerHeight - height) / 2
        );

        win.style.setProperty(
          'position',
          'fixed',
          'important'
        );

        win.style.setProperty(
          'left',
          left + 'px',
          'important'
        );

        win.style.setProperty(
          'top',
          top + 'px',
          'important'
        );

        win.style.setProperty(
          'width',
          width + 'px',
          'important'
        );

        win.style.setProperty(
          'height',
          height + 'px',
          'important'
        );

        win.style.setProperty(
          'margin',
          '0',
          'important'
        );

        win.style.setProperty(
          'transform',
          'none',
          'important'
        );

        win.dataset.safePositionFixed = 'yes';
      });
  }


  /* Run after page loads */
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      fixTayassukOS
    );
  } else {
    fixTayassukOS();
  }


  /* Detect newly opened windows */
  const observer = new MutationObserver(function () {
    fixTayassukOS();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
