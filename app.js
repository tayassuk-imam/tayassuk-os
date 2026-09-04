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


let portfolio =
  structuredClone(fallbackPortfolio);


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
    document.querySelector('#app-grid') ||
    document.querySelector('.app-launcher') ||
    document.querySelector('.system-left');

  if (!el) return;

  const html = apps
    .map(
      app => `
        <button
          type="button"
          class="launcher-app"
          data-action="open"
          data-app="${esc(app.id)}"
          title="${esc(app.desc || app.name)}"
        >
          <img
            class="app-logo"
            src="${esc(app.logo || '')}"
            alt="${esc(app.name)}"
            width="56"
            height="56"
          >
          <span>${esc(app.name)}</span>
        </button>
      `
    )
    .join('');

  el.insertAdjacentHTML('beforeend', html);
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
      <span>${esc(last)}</span>
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
    document.querySelector('#clock');


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
   OPEN WINDOW
   ========================================================= */

function openWindow(id) {

  if (!id) return;


  if (
    state.windows.has(id)
  ) {

    focusWindow(id);

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
