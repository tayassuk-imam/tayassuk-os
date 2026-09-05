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
   PROJECTS
   ========================================================= */

function renderProjects() {

  const projects =
    portfolio.projects || [];

  if (!projects.length) {

    return `
      <div class="empty-state">
        No projects available yet.
      </div>
    `;

  }

  return projects
    .map(
      project => {

        const technologies =
          project.technologies ||
          project.tech ||
          [];

        return `

          <article
            class="project-item"
            data-project-id="${esc(
              project.id || ''
            )}"
          >

            <div class="project-item-header">

              <div>

                <span class="project-status">
                  ${esc(
                    project.status ||
                    'Working'
                  )}
                </span>

                <h3>
                  ${esc(
                    project.title ||
                    project.name ||
                    'Untitled Project'
                  )}
                </h3>

              </div>

            </div>


            <p>
              ${esc(
                project.description ||
                ''
              )}
            </p>


            ${
              technologies.length
                ? `
                  <div class="chip-row">

                    ${
                      technologies
                        .map(
                          tech =>
                            `<span>
                              ${esc(tech)}
                            </span>`
                        )
                        .join('')
                    }

                  </div>
                `
                : ''
            }


            <div class="project-actions">

              ${
                project.liveUrl
                  ? `
                    <a
                      href="${esc(
                        safeUrl(
                          project.liveUrl
                        )
                      )}"
                      target="_blank"
                      rel="noreferrer noopener"
                      class="primary mini-btn"
                    >
                      Live Demo
                    </a>
                  `
                  : ''
              }

              <button
                type="button"
                class="secondary mini-btn"
                data-action="project-detail"
                data-project="${
                  esc(
                    project.id ||
                    project.slug ||
                    ''
                  )
                }"
              >
                View Details
              </button>

            </div>

          </article>

        `;

      }
    )
    .join('');

}


/* =========================================================
   EDUCATION
   ========================================================= */

function renderEducation() {

  const education =
    portfolio.education || [];

  if (!education.length) {

    return `
      <div class="empty-state">
        No education information available.
      </div>
    `;

  }

  return education
    .map(
      item => `

        <article class="timeline-item">

          <div class="timeline-dot"></div>

          <div class="timeline-content">

            <span class="timeline-date">
              ${esc(
                item.year ||
                item.date ||
                ''
              )}
            </span>

            <h3>
              ${esc(
                item.degree ||
                item.title ||
                ''
              )}
            </h3>

            <strong>
              ${esc(
                item.institution ||
                item.school ||
                ''
              )}
            </strong>

            ${
              item.description
                ? `
                  <p>
                    ${esc(
                      item.description
                    )}
                  </p>
                `
                : ''
            }

          </div>

        </article>

      `
    )
    .join('');

}


/* =========================================================
   SKILLS
   ========================================================= */

function renderSkills() {

  const groups =
    portfolio.skills || [];

  if (!groups.length) {

    return `
      <div class="empty-state">
        No skills available.
      </div>
    `;

  }

  return groups
    .map(
      group => {

        const skills =
          group.skills ||
          group.items ||
          [];

        return `

          <section class="skill-group">

            <h3>
              ${esc(
                group.title ||
                group.name ||
                ''
              )}
            </h3>

            <div class="skill-list">

              ${
                skills
                  .map(
                    skill => {

                      const name =
                        typeof skill ===
                        'string'
                          ? skill
                          : skill.name ||
                            '';

                      const level =
                        typeof skill ===
                        'object'
                          ? Number(
                              skill.progress ||
                              skill.level ||
                              0
                            )
                          : 0;

                      return `

                        <div class="skill-row">

                          <div class="skill-row-top">

                            <span>
                              ${esc(name)}
                            </span>

                            ${
                              level
                                ? `
                                  <span>
                                    ${level}%
                                  </span>
                                `
                                : ''
                            }

                          </div>

                          ${
                            level
                              ? `
                                <div class="progress-track">
                                  <span
                                    style="width:${Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        level
                                      )
                                    )}%"
                                  ></span>
                                </div>
                              `
                              : ''
                          }

                        </div>

                      `;

                    }
                  )
                  .join('')
              }

            </div>

          </section>

        `;

      }
    )
    .join('');

}


/* =========================================================
   ACHIEVEMENTS
   ========================================================= */

function renderAchievements() {

  const achievements =
    portfolio.achievements || [];

  if (!achievements.length) {

    return `
      <div class="empty-state">
        No achievements available yet.
      </div>
    `;

  }

  return achievements
    .map(
      item => `

        <article class="achievement-item">

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

            ${
              item.date ||
              item.year
                ? `
                  <span class="achievement-date">
                    ${esc(
                      item.date ||
                      item.year ||
                      ''
                    )}
                  </span>
                `
                : ''
            }

            ${
              item.description
                ? `
                  <p>
                    ${esc(
                      item.description
                    )}
                  </p>
                `
                : ''
            }

          </div>

        </article>

      `
    )
    .join('');

}


/* =========================================================
   ABOUT
   ========================================================= */

function renderAbout() {

  const owner =
    portfolio.owner || {};

  const identity =
    owner.identity || {};

  const about =
    owner.about || {};


  return `

    <div class="about-layout">

      <div class="about-avatar">

        <img
          src="${esc(
            identity.generatedAvatar ||
            identity.portrait ||
            './assets/avatar/tayassuk-generated-avatar.png'
          )}"
          alt="Tayassuk Imam"
          draggable="false"
        >

      </div>


      <div class="about-content">

        <div class="window-eyebrow">
          ABOUT ME
        </div>

        <h2>
          ${esc(
            identity.fullName ||
            'Tayassuk Imam'
          )}
        </h2>

        <h3>
          ${esc(
            identity.profession ||
            'Software Engineering Student'
          )}
        </h3>


        ${
          about.bio
            ? `
              <p>
                ${esc(about.bio)}
              </p>
            `
            : ''
        }


        ${
          about.description
            ? `
              <p>
                ${esc(
                  about.description
                )}
              </p>
            `
            : ''
        }


        <div class="about-meta">

          <span>
            📍
            ${esc(
              identity.location ||
              'Dhaka, Bangladesh'
            )}
          </span>

          <span>
            💻
            Software Engineering
          </span>

        </div>

      </div>

    </div>

  `;

}


/* =========================================================
   JOURNEY
   ========================================================= */

function renderJourney() {

  const journey =
    portfolio.journey || [];

  if (!journey.length) {

    return `
      <div class="empty-state">
        Journey information is not available.
      </div>
    `;

  }

  return `

    <div class="journey-timeline">

      ${
        journey
          .map(
            (item, index) => `

              <article
                class="journey-item"
              >

                <div class="journey-number">
                  ${index + 1}
                </div>

                <div class="journey-content">

                  <h3>
                    ${esc(
                      item.title ||
                      ''
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

              </article>

            `
          )
          .join('')
      }

    </div>

  `;

}


/* =========================================================
   CONTACT
   ========================================================= */

function renderContact() {

  const contact =
    portfolio.owner?.contact ||
    {};


  return `

    <div class="contact-layout">

      <div class="contact-intro">

        <div class="window-eyebrow">
          CONTACT
        </div>

        <h2>
          Let's build something useful.
        </h2>

        <p>
          Interested in software, projects,
          collaboration, or just want to say hello?
        </p>

      </div>


      <div class="contact-list">

        ${
          contact.email
            ? `
              <a
                class="contact-item"
                href="mailto:${esc(
                  contact.email
                )}"
              >

                <span class="contact-icon">
                  ✉
                </span>

                <span>

                  <small>
                    Email
                  </small>

                  <strong>
                    ${esc(
                      contact.email
                    )}
                  </strong>

                </span>

              </a>
            `
            : ''
        }


        ${
          contact.github
            ? `
              <a
                class="contact-item"
                href="${esc(
                  safeUrl(
                    contact.github
                  )
                )}"
                target="_blank"
                rel="noreferrer noopener"
              >

                <span class="contact-icon">
                  ◉
                </span>

                <span>

                  <small>
                    GitHub
                  </small>

                  <strong>
                    GitHub Profile
                  </strong>

                </span>

              </a>
            `
            : ''
        }


        ${
          contact.linkedin
            ? `
              <a
                class="contact-item"
                href="${esc(
                  safeUrl(
                    contact.linkedin
                  )
                )}"
                target="_blank"
                rel="noreferrer noopener"
              >

                <span class="contact-icon">
                  in
                </span>

                <span>

                  <small>
                    LinkedIn
                  </small>

                  <strong>
                    LinkedIn Profile
                  </strong>

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
   FOUNDER.TXT
   ========================================================= */

function renderFounder() {

  return `

    <div class="terminal-document">

      <div class="terminal-line">
        $ cat Founder.txt
      </div>

      <br>

      <div class="terminal-line">
        # Working Principles
      </div>

      <br>

      <div class="terminal-line">
        01. Keep learning.
      </div>

      <div class="terminal-line">
        02. Build practical projects.
      </div>

      <div class="terminal-line">
        03. Solve problems step by step.
      </div>

      <div class="terminal-line">
        04. Stay consistent.
      </div>

      <div class="terminal-line">
        05. Improve every day.
      </div>

      <br>

      <div class="terminal-line">
        # Goal
      </div>

      <div class="terminal-line">
        Become a strong and professional
        Software Engineer.
      </div>

    </div>

  `;

}


/* =========================================================
   LEARNING
   ========================================================= */

function renderLearning() {

  const learning =
    portfolio.owner?.learning ||
    [];

  if (!learning.length) {

    return `
      <div class="empty-state">
        No learning data available.
      </div>
    `;

  }

  return `

    <div class="learning-list">

      ${
        learning
          .map(
            item => {

              const progress =
                Math.min(
                  100,
                  Math.max(
                    0,
                    Number(
                      item.progress
                    ) || 0
                  )
                );


              return `

                <article
                  class="learning-item"
                >

                  <div class="learning-header">

                    <strong>
                      ${esc(
                        item.title ||
                        item.name ||
                        ''
                      )}
                    </strong>

                    <span>
                      ${progress}%
                    </span>

                  </div>


                  <div class="progress-track">

                    <span
                      style="width:${progress}%"
                    ></span>

                  </div>


                  ${
                    item.description
                      ? `
                        <p>
                          ${esc(
                            item.description
                          )}
                        </p>
                      `
                      : ''
                  }

                </article>

              `;

            }
          )
          .join('')
      }

    </div>

  `;

}


/* =========================================================
   TRASH
   ========================================================= */

function renderTrash() {

  return `

    <div class="trash-view">

      <div class="trash-icon-large">
        🗑
      </div>

      <h2>
        Trash
      </h2>

      <p>
        Deleted portfolio items would
        appear here.
      </p>

      <span class="muted">
        Nothing to restore.
      </span>

    </div>

  `;

}
/* =========================================================
   SETTINGS
   ========================================================= */

function renderSettings() {

  return `

    <div class="settings-layout">

      <section class="settings-section">

        <div class="window-eyebrow">
          APPEARANCE
        </div>

        <h2>
          Tayassuk OS
        </h2>

        <p>
          Personal portfolio operating system.
        </p>

        <div class="settings-actions">

          <button
            type="button"
            class="secondary"
            data-action="toggle-theme"
          >
            Toggle Theme
          </button>

        </div>

      </section>


      <section class="settings-section">

        <div class="window-eyebrow">
          SYSTEM
        </div>

        <div class="settings-row">

          <span>
            System
          </span>

          <strong>
            Tayassuk OS
          </strong>

        </div>


        <div class="settings-row">

          <span>
            Mode
          </span>

          <strong>
            Portfolio
          </strong>

        </div>


        <div class="settings-row">

          <span>
            Status
          </span>

          <strong class="status-online">
            Online
          </strong>

        </div>

      </section>


      <section class="settings-section">

        <div class="window-eyebrow">
          DATA
        </div>

        <p>
          Portfolio content is connected to
          the portfolio data store.
        </p>

        <button
          type="button"
          class="secondary"
          data-action="reload-portfolio"
        >
          Reload Portfolio
        </button>

      </section>

    </div>

  `;

}


/* =========================================================
   BROWSER
   ========================================================= */

function renderBrowser() {

  const contact =
    portfolio.owner?.contact ||
    {};


  const links = [];


  if (contact.github) {

    links.push({
      name: 'GitHub',
      url: contact.github,
      icon: '◉'
    });

  }


  if (contact.linkedin) {

    links.push({
      name: 'LinkedIn',
      url: contact.linkedin,
      icon: 'in'
    });

  }


  if (portfolio.projects?.length) {

    portfolio.projects
      .filter(
        project =>
          project.liveUrl
      )
      .forEach(
        project => {

          links.push({
            name:
              project.title ||
              project.name ||
              'Project',
            url:
              project.liveUrl,
            icon: '↗'
          });

        }
      );

  }


  return `

    <div class="browser-view">

      <div class="browser-toolbar">

        <div class="browser-address">
          tayassuk-os://approved-links
        </div>

      </div>


      <div class="browser-content">

        <div class="window-eyebrow">
          APPROVED LINKS
        </div>

        <h2>
          External Links
        </h2>

        <p>
          Open selected profiles and project
          links from Tayassuk OS.
        </p>


        <div class="browser-links">

          ${
            links.length
              ? links
                  .map(
                    link => `

                      <a
                        href="${esc(
                          safeUrl(
                            link.url
                          )
                        )}"
                        target="_blank"
                        rel="noreferrer noopener"
                        class="browser-link"
                      >

                        <span
                          class="browser-link-icon"
                        >
                          ${esc(
                            link.icon
                          )}
                        </span>

                        <span>
                          ${esc(
                            link.name
                          )}
                        </span>

                        <span>
                          ↗
                        </span>

                      </a>

                    `
                  )
                  .join('')
              : `
                <div class="empty-state">
                  No external links available.
                </div>
              `
          }

        </div>

      </div>

    </div>

  `;

}


/* =========================================================
   WHITEBOARD
   ========================================================= */

function renderWhiteboard() {

  const savedNote =
    localStorage.getItem(
      'tayassuk-os-whiteboard'
    ) || '';


  return `

    <div class="whiteboard-view">

      <div class="window-eyebrow">
        WHITEBOARD
      </div>

      <h2>
        Quick Note
      </h2>

      <p>
        Write a temporary local note.
      </p>


      <textarea
        id="whiteboard-input"
        class="whiteboard-input"
        placeholder="Write something..."
      >${esc(savedNote)}</textarea>


      <div class="whiteboard-actions">

        <button
          type="button"
          class="primary"
          data-action="save-whiteboard"
        >
          Save Note
        </button>

        <button
          type="button"
          class="secondary"
          data-action="clear-whiteboard"
        >
          Clear
        </button>

      </div>


      <div
        id="whiteboard-status"
        class="muted"
      ></div>

    </div>

  `;

}


/* =========================================================
   CONTROL CENTER
   ========================================================= */

function renderControlCenter() {

  const session =
    state.adminSession;


  return `

    <div class="control-center">

      <div class="window-eyebrow">
        CONTROL CENTER
      </div>


      <h2>
        Portfolio Management
      </h2>


      <p>
        Private area for managing portfolio
        content through the connected data store.
      </p>


      ${
        session
          ? `

            <div class="admin-status">

              <span class="status-dot"></span>

              <div>

                <strong>
                  Admin session active
                </strong>

                <small>
                  Authenticated access enabled
                </small>

              </div>

            </div>


            <div class="control-actions">

              <button
                type="button"
                class="primary"
                data-action="reload-portfolio"
              >
                Sync Portfolio
              </button>


              <button
                type="button"
                class="secondary"
                data-action="sign-out"
              >
                Sign Out
              </button>

            </div>

          `
          : `

            <form
              id="admin-login-form"
              class="admin-login-form"
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
                class="primary"
              >
                Sign In
              </button>


              <div
                id="admin-login-status"
                class="muted"
              ></div>

            </form>

          `
      }

    </div>

  `;

}


/* =========================================================
   PROJECT DETAIL
   ========================================================= */

function getProjectById(id) {

  return (
    portfolio.projects || []
  ).find(
    project =>
      String(
        project.id ||
        project.slug ||
        ''
      ) === String(id)
  );

}


function renderProjectDetail(id) {

  const project =
    getProjectById(id);


  if (!project) {

    return `

      <div class="empty-state">

        Project not found.

      </div>

    `;

  }


  const technologies =
    project.technologies ||
    project.tech ||
    [];


  return `

    <div class="project-detail">

      <div class="window-eyebrow">
        FEATURED PROJECT
      </div>


      <h2>
        ${esc(
          project.title ||
          project.name ||
          ''
        )}
      </h2>


      ${
        project.role
          ? `
            <div class="project-role">
              Role:
              <strong>
                ${esc(
                  project.role
                )}
              </strong>
            </div>
          `
          : ''
      }


      ${
        project.status
          ? `
            <div class="project-status-large">
              ${esc(
                project.status
              )}
            </div>
          `
          : ''
      }


      ${
        project.description
          ? `
            <p class="project-description">
              ${esc(
                project.description
              )}
            </p>
          `
          : ''
      }


      ${
        technologies.length
          ? `

            <div class="window-eyebrow">
              TECHNOLOGIES
            </div>

            <div class="chip-row">

              ${
                technologies
                  .map(
                    tech =>
                      `<span>
                        ${esc(tech)}
                      </span>`
                  )
                  .join('')
              }

            </div>

          `
          : ''
      }


      <div class="project-detail-actions">

        ${
          project.liveUrl
            ? `
              <a
                href="${esc(
                  safeUrl(
                    project.liveUrl
                  )
                )}"
                target="_blank"
                rel="noreferrer noopener"
                class="primary"
              >
                Open Live Project
              </a>
            `
            : ''
        }

      </div>

    </div>

  `;

}


/* =========================================================
   DASHBOARD DATA
   ========================================================= */

function getFeaturedProject() {

  const projects =
    portfolio.projects || [];


  return (
    projects.find(
      project =>
        project.featured === true
    ) ||
    projects[0] ||
    null
  );

}


function renderFeaturedProject() {

  const project =
    getFeaturedProject();


  const title =
    document.querySelector(
      '#featured-project-title'
    );


  const description =
    document.querySelector(
      '#featured-project-description'
    );


  const status =
    document.querySelector(
      '#featured-project-status'
    );


  const role =
    document.querySelector(
      '#featured-project-role'
    );


  const link =
    document.querySelector(
      '#featured-project-link'
    );


  if (!project) {

    if (title)
      title.textContent =
        'No project yet.';

    if (description)
      description.textContent =
        'Projects will appear here.';

    return;

  }


  if (title) {

    title.textContent =
      project.title ||
      project.name ||
      'Garage Management System';

  }


  if (description) {

    description.textContent =
      project.description ||
      '';

  }


  if (status) {

    status.textContent =
      project.status ||
      'Working';

  }


  if (role) {

    role.textContent =
      project.role ||
      'Solo Developer';

  }


  if (link) {

    link.href =
      safeUrl(
        project.liveUrl ||
        '#'
      );

  }

}


/* =========================================================
   SKILLS SUMMARY
   ========================================================= */

function renderSkillsSummary() {

  const container =
    document.querySelector(
      '#skills-summary'
    );


  if (!container) return;


  const groups =
    portfolio.skills || [];


  const skills = [];


  groups.forEach(
    group => {

      const items =
        group.skills ||
        group.items ||
        [];


      items.forEach(
        skill => {

          const name =
            typeof skill ===
            'string'
              ? skill
              : skill.name ||
                '';


          if (name) {

            skills.push(name);

          }

        }
      );

    }
  );


  container.innerHTML =
    skills
      .slice(0, 12)
      .map(
        skill =>
          `<span>
            ${esc(skill)}
          </span>`
      )
      .join('');

}


/* =========================================================
   CURRENTLY LEARNING
   ========================================================= */

function renderCurrentlyLearning() {

  const container =
    document.querySelector(
      '#currently-learning'
    );


  if (!container) return;


  const learning =
    portfolio.owner?.learning ||
    [];


  container.innerHTML =
    learning
      .slice(0, 5)
      .map(
        item => `

          <div class="learning-mini">

            <div class="learning-mini-top">

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

        `
      )
      .join('');

}


/* =========================================================
   QUICK NOTES
   ========================================================= */

function renderQuickNotes() {

  const container =
    document.querySelector(
      '#quick-notes'
    );


  if (!container) return;


  const notes =
    portfolio.owner?.quickNotes ||
    portfolio.owner?.notes ||
    [];


  if (!Array.isArray(notes) ||
      !notes.length) {

    container.innerHTML = `

      <div class="quick-note empty-state">
        No quick notes yet.
      </div>

    `;

    return;

  }


  container.innerHTML =
    notes
      .slice(0, 4)
      .map(
        note => `

          <div class="quick-note">

            <span class="quick-note-dot">
              •
            </span>

            <span>
              ${esc(
                typeof note ===
                'string'
                  ? note
                  : note.text ||
                    note.title ||
                    ''
              )}
            </span>

          </div>

        `
      )
      .join('');

}


/* =========================================================
   NEXT GOALS
   ========================================================= */

function renderNextGoals() {

  const container =
    document.querySelector(
      '#next-goals'
    );


  if (!container) return;


  const goals =
    portfolio.owner?.goals ||
    portfolio.owner?.nextGoals ||
    [];


  if (!Array.isArray(goals) ||
      !goals.length) {

    container.innerHTML = `

      <div class="empty-state">
        Keep learning and building.
      </div>

    `;

    return;

  }


  container.innerHTML =
    goals
      .slice(0, 5)
      .map(
        goal => `

          <div class="goal-item">

            <span class="goal-check">
              ○
            </span>

            <span>
              ${esc(
                typeof goal ===
                'string'
                  ? goal
                  : goal.title ||
                    goal.text ||
                    ''
              )}
            </span>

          </div>

        `
      )
      .join('');

}


/* =========================================================
   SYSTEM STATUS
   ========================================================= */

function renderSystemStatus() {

  const status =
    document.querySelector(
      '#system-status'
    );


  if (!status) return;


  status.innerHTML = `

    <span class="status-indicator"></span>

    <div>

      <strong>
        System Operational
      </strong>

      <small>
        All portfolio modules online
      </small>

    </div>

  `;

}


/* =========================================================
   ACTIVITY
   ========================================================= */

function renderRecentActivity() {

  const container =
    document.querySelector(
      '#recent-activity'
    );


  if (!container) return;


  const activities = [

    'Portfolio system loaded',

    'Garage Management System available',

    'Skills and learning data synced',

    'Tayassuk OS is ready'

  ];


  container.innerHTML =
    activities
      .map(
        (activity, index) => `

          <div class="activity-item">

            <span class="activity-dot">
              ${index + 1}
            </span>

            <span>
              ${esc(activity)}
            </span>

          </div>

        `
      )
      .join('');

}
/* =========================================================
   WINDOW CONTENT
   ========================================================= */

function getWindowContent(appId, extraData = null) {

  switch (appId) {

    case 'about':
      return renderAbout();

    case 'projects':
      return renderProjects();

    case 'learning':
      return renderLearning();

    case 'skills':
      return renderSkills();

    case 'education':
      return renderEducation();

    case 'journey':
      return renderJourney();

    case 'achievements':
      return renderAchievements();

    case 'contact':
      return renderContact();

    case 'founder':
      return renderFounder();

    case 'trash':
      return renderTrash();

    case 'settings':
      return renderSettings();

    case 'browser':
      return renderBrowser();

    case 'whiteboard':
      return renderWhiteboard();

    case 'control':
      return renderControlCenter();

    case 'project-detail':
      return renderProjectDetail(
        extraData
      );

    default:

      return `

        <div class="empty-state">

          <h2>
            Application not found
          </h2>

          <p>
            This application is not
            available in Tayassuk OS.
          </p>

        </div>

      `;

  }

}


/* =========================================================
   WINDOW TITLE
   ========================================================= */

function getAppName(appId) {

  const app =
    apps.find(
      item =>
        item.id === appId
    );


  if (app) {

    return app.name;

  }


  if (
    appId ===
    'project-detail'
  ) {

    return 'Project Details';

  }


  return 'Tayassuk OS';

}


/* =========================================================
   CREATE WINDOW
   ========================================================= */

function createWindow(
  appId,
  extraData = null
) {

  const windows =
    document.querySelector(
      '#windows'
    );


  if (!windows) {

    console.warn(
      '#windows container not found'
    );

    return null;

  }


  const existing =
    state.windows.get(
      appId
    );


  if (existing) {

    const element =
      existing.element;


    if (element) {

      element.classList.remove(
        'is-minimized'
      );


      element.classList.add(
        'is-active'
      );


      element.style.zIndex =
        ++state.z;


      state.minimizedWindows.delete(
        appId
      );

      return element;

    }

  }


  const windowElement =
    document.createElement(
      'section'
    );


  windowElement.className =
    'os-window is-active';


  windowElement.dataset.window =
    appId;


  windowElement.style.zIndex =
    ++state.z;


  const title =
    getAppName(
      appId
    );


  windowElement.innerHTML = `

    <div
      class="window-header"
      data-window-drag
    >

      <div class="window-title">

        <span class="window-title-dot"></span>

        <span>
          ${esc(title)}
        </span>

      </div>


      <div class="window-controls">

        <button
          type="button"
          class="window-control minimize"
          data-action="minimize-window"
          data-window="${esc(appId)}"
          aria-label="Minimize"
          title="Minimize"
        >
          −
        </button>


        <button
          type="button"
          class="window-control maximize"
          data-action="maximize-window"
          data-window="${esc(appId)}"
          aria-label="Maximize"
          title="Maximize"
        >
          □
        </button>


        <button
          type="button"
          class="window-control close"
          data-action="close-window"
          data-window="${esc(appId)}"
          aria-label="Close"
          title="Close"
        >
          ×
        </button>

      </div>

    </div>


    <div class="window-body">

      ${getWindowContent(
        appId,
        extraData
      )}

    </div>

  `;


  windows.appendChild(
    windowElement
  );


  state.windows.set(
    appId,
    {
      element:
        windowElement,

      appId,

      extraData

    }
  );


  attachWindowDrag(
    windowElement
  );


  bringToFront(
    windowElement
  );


  return windowElement;

}


/* =========================================================
   OPEN WINDOW
   ========================================================= */

function openWindow(
  appId,
  extraData = null
) {

  if (!appId) return;


  const existing =
    state.windows.get(
      appId
    );


  if (existing?.element) {

    const element =
      existing.element;


    element.classList.remove(
      'is-minimized'
    );


    element.classList.add(
      'is-active'
    );


    state.minimizedWindows.delete(
      appId
    );


    bringToFront(
      element
    );


    return element;

  }


  return createWindow(
    appId,
    extraData
  );

}


/* =========================================================
   CLOSE WINDOW
   ========================================================= */

function closeWindow(
  appId
) {

  const record =
    state.windows.get(
      appId
    );


  if (!record) return;


  const element =
    record.element;


  if (element) {

    element.remove();

  }


  state.windows.delete(
    appId
  );


  state.minimizedWindows.delete(
    appId
  );


  state.maximizedWindows.delete(
    appId
  );


  state.windowRestoreState.delete(
    appId
  );

}


/* =========================================================
   MINIMIZE WINDOW
   ========================================================= */

function minimizeWindow(
  appId
) {

  const record =
    state.windows.get(
      appId
    );


  if (!record?.element) return;


  const element =
    record.element;


  element.classList.remove(
    'is-active'
  );


  element.classList.add(
    'is-minimized'
  );


  state.minimizedWindows.add(
    appId
  );

}


/* =========================================================
   MAXIMIZE WINDOW
   ========================================================= */

function maximizeWindow(
  appId
) {

  const record =
    state.windows.get(
      appId
    );


  if (!record?.element) return;


  const element =
    record.element;


  if (
    state.maximizedWindows.has(
      appId
    )
  ) {

    restoreWindow(
      appId
    );

    return;

  }


  state.windowRestoreState.set(
    appId,
    {
      left:
        element.style.left,

      top:
        element.style.top,

      width:
        element.style.width,

      height:
        element.style.height
    }
  );


  element.classList.add(
    'is-maximized'
  );


  element.style.left =
    '0px';


  element.style.top =
    '0px';


  element.style.width =
    '100%';


  element.style.height =
    '100%';


  state.maximizedWindows.add(
    appId
  );


  bringToFront(
    element
  );

}


/* =========================================================
   RESTORE WINDOW
   ========================================================= */

function restoreWindow(
  appId
) {

  const record =
    state.windows.get(
      appId
    );


  if (!record?.element) return;


  const element =
    record.element;


  const previous =
    state.windowRestoreState.get(
      appId
    );


  element.classList.remove(
    'is-maximized'
  );


  if (previous) {

    element.style.left =
      previous.left;

    element.style.top =
      previous.top;

    element.style.width =
      previous.width;

    element.style.height =
      previous.height;

  }


  state.maximizedWindows.delete(
    appId
  );


  state.windowRestoreState.delete(
    appId
  );


  bringToFront(
    element
  );

}


/* =========================================================
   BRING WINDOW TO FRONT
   ========================================================= */

function bringToFront(
  element
) {

  if (!element) return;


  element.style.zIndex =
    ++state.z;


  document
    .querySelectorAll(
      '.os-window'
    )
    .forEach(
      item =>
        item.classList.remove(
          'is-active'
        )
    );


  element.classList.add(
    'is-active'
  );

}


/* =========================================================
   WINDOW DRAG
   ========================================================= */

function attachWindowDrag(
  windowElement
) {

  const header =
    windowElement.querySelector(
      '[data-window-drag]'
    );


  if (!header) return;


  let dragging = false;

  let offsetX = 0;

  let offsetY = 0;


  header.addEventListener(
    'pointerdown',
    event => {

      if (
        event.target.closest(
          '.window-controls'
        )
      ) {

        return;

      }


      if (
        windowElement.classList.contains(
          'is-maximized'
        )
      ) {

        return;

      }


      dragging = true;


      const rect =
        windowElement.getBoundingClientRect();


      offsetX =
        event.clientX -
        rect.left;


      offsetY =
        event.clientY -
        rect.top;


      header.setPointerCapture(
        event.pointerId
      );


      bringToFront(
        windowElement
      );

    }
  );


  header.addEventListener(
    'pointermove',
    event => {

      if (!dragging) return;


      const desktop =
        document.querySelector(
          '.desktop'
        );


      const desktopRect =
        desktop
          ? desktop.getBoundingClientRect()
          : {
              left: 0,
              top: 0,
              width:
                window.innerWidth,
              height:
                window.innerHeight
            };


      const rect =
        windowElement.getBoundingClientRect();


      let left =
        event.clientX -
        desktopRect.left -
        offsetX;


      let top =
        event.clientY -
        desktopRect.top -
        offsetY;


      const maxLeft =
        Math.max(
          0,
          desktopRect.width -
          rect.width
        );


      const maxTop =
        Math.max(
          0,
          desktopRect.height -
          rect.height
        );


      left =
        Math.max(
          0,
          Math.min(
            left,
            maxLeft
          )
        );


      top =
        Math.max(
          0,
          Math.min(
            top,
            maxTop
          )
        );


      windowElement.style.left =
        `${left}px`;


      windowElement.style.top =
        `${top}px`;

    }
  );


  header.addEventListener(
    'pointerup',
    event => {

      dragging = false;


      try {

        header.releasePointerCapture(
          event.pointerId
        );

      } catch {

        /* Ignore */

      }

    }
  );


  header.addEventListener(
    'pointercancel',
    () => {

      dragging = false;

    }
  );

}


/* =========================================================
   CENTER WINDOW
   ========================================================= */

function centerWindow(
  element
) {

  if (!element) return;


  if (
    element.classList.contains(
      'is-maximized'
    )
  ) {

    return;

  }


  const desktop =
    document.querySelector(
      '.desktop'
    );


  const desktopRect =
    desktop
      ? desktop.getBoundingClientRect()
      : {
          width:
            window.innerWidth,
          height:
            window.innerHeight
        };


  const rect =
    element.getBoundingClientRect();


  const left =
    Math.max(
      12,
      (
        desktopRect.width -
        rect.width
      ) / 2
    );


  const top =
    Math.max(
      12,
      (
        desktopRect.height -
        rect.height
      ) / 2
    );


  element.style.left =
    `${left}px`;


  element.style.top =
    `${top}px`;

}


/* =========================================================
   CENTER ALL WINDOWS
   ========================================================= */

function centerAllWindows() {

  document
    .querySelectorAll(
      '.os-window'
    )
    .forEach(
      element =>
        centerWindow(
          element
        )
    );

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


  const dockApps = [

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
                class="dock-app-logo"
                width="42"
                height="42"
                draggable="false"
              >

            </button>

          `;

        }
      )
      .join('');

}


/* =========================================================
   DOCK ACTIVE STATE
   ========================================================= */

function updateDockState() {

  document
    .querySelectorAll(
      '#dock .dock-item'
    )
    .forEach(
      item => {

        const appId =
          item.dataset.app;


        const active =
          state.windows.has(
            appId
          ) &&
          !state.minimizedWindows.has(
            appId
          );


        item.classList.toggle(
          'is-active',
          active
        );

      }
    );

}


/* =========================================================
   OPEN PROJECT FROM DASHBOARD
   ========================================================= */

function openProject(
  projectId
) {

  const project =
    getProjectById(
      projectId
    );


  if (!project) return;


  const appId =
    `project-detail-${projectId}`;


  const existing =
    state.windows.get(
      appId
    );


  if (existing?.element) {

    existing.element.classList.remove(
      'is-minimized'
    );

    bringToFront(
      existing.element
    );

    return;

  }


  const windows =
    document.querySelector(
      '#windows'
    );


  if (!windows) return;


  const element =
    document.createElement(
      'section'
    );


  element.className =
    'os-window is-active';


  element.dataset.window =
    appId;


  element.style.zIndex =
    ++state.z;


  element.innerHTML = `

    <div
      class="window-header"
      data-window-drag
    >

      <div class="window-title">

        <span class="window-title-dot"></span>

        <span>
          ${esc(
            project.title ||
            project.name ||
            'Project Details'
          )}
        </span>

      </div>


      <div class="window-controls">

        <button
          type="button"
          class="window-control minimize"
          data-action="minimize-window"
          data-window="${esc(appId)}"
        >
          −
        </button>


        <button
          type="button"
          class="window-control maximize"
          data-action="maximize-window"
          data-window="${esc(appId)}"
        >
          □
        </button>


        <button
          type="button"
          class="window-control close"
          data-action="close-window"
          data-window="${esc(appId)}"
        >
          ×
        </button>

      </div>

    </div>


    <div class="window-body">

      ${renderProjectDetail(
        projectId
      )}

    </div>

  `;


  windows.appendChild(
    element
  );


  state.windows.set(
    appId,
    {
      element,
      appId,
      extraData:
        projectId
    }
  );


  attachWindowDrag(
    element
  );


  requestAnimationFrame(
    () => {

      centerWindow(
        element
      );

    }
  );


  bringToFront(
    element
  );


  updateDockState();

}
/* =========================================================
   EVENT HANDLING
   ========================================================= */

document.addEventListener(
  'click',
  event => {

    const actionElement =
      event.target.closest(
        '[data-action]'
      );


    if (!actionElement) return;


    const action =
      actionElement.dataset.action;


    /* -----------------------------------------------------
       OPEN APP
       ----------------------------------------------------- */

    if (action === 'open') {

      const appId =
        actionElement.dataset.app;


      if (appId) {

        openWindow(
          appId
        );

      }


      updateDockState();

      return;

    }


    /* -----------------------------------------------------
       CLOSE WINDOW
       ----------------------------------------------------- */

    if (
      action ===
      'close-window'
    ) {

      const windowId =
        actionElement.dataset.window;


      if (windowId) {

        closeWindow(
          windowId
        );

      }


      updateDockState();

      return;

    }


    /* -----------------------------------------------------
       MINIMIZE WINDOW
       ----------------------------------------------------- */

    if (
      action ===
      'minimize-window'
    ) {

      const windowId =
        actionElement.dataset.window;


      if (windowId) {

        minimizeWindow(
          windowId
        );

      }


      updateDockState();

      return;

    }


    /* -----------------------------------------------------
       MAXIMIZE WINDOW
       ----------------------------------------------------- */

    if (
      action ===
      'maximize-window'
    ) {

      const windowId =
        actionElement.dataset.window;


      if (windowId) {

        maximizeWindow(
          windowId
        );

      }


      return;

    }


    /* -----------------------------------------------------
       PROJECT DETAIL
       ----------------------------------------------------- */

    if (
      action ===
      'project-detail'
    ) {

      const projectId =
        actionElement.dataset.project;


      if (projectId) {

        openProject(
          projectId
        );

      }


      return;

    }


    /* -----------------------------------------------------
       TOGGLE THEME
       ----------------------------------------------------- */

    if (
      action ===
      'toggle-theme'
    ) {

      toggleTheme();

      return;

    }


    /* -----------------------------------------------------
       RELOAD PORTFOLIO
       ----------------------------------------------------- */

    if (
      action ===
      'reload-portfolio'
    ) {

      reloadPortfolio();

      return;

    }


    /* -----------------------------------------------------
       SIGN OUT
       ----------------------------------------------------- */

    if (
      action ===
      'sign-out'
    ) {

      handleSignOut();

      return;

    }


    /* -----------------------------------------------------
       SAVE WHITEBOARD
       ----------------------------------------------------- */

    if (
      action ===
      'save-whiteboard'
    ) {

      saveWhiteboard();

      return;

    }


    /* -----------------------------------------------------
       CLEAR WHITEBOARD
       ----------------------------------------------------- */

    if (
      action ===
      'clear-whiteboard'
    ) {

      clearWhiteboard();

      return;

    }

  }
);


/* =========================================================
   WINDOW CLICK
   ========================================================= */

document.addEventListener(
  'pointerdown',
  event => {

    const windowElement =
      event.target.closest(
        '.os-window'
      );


    if (!windowElement) return;


    bringToFront(
      windowElement
    );

  }
);


/* =========================================================
   THEME
   ========================================================= */

function toggleTheme() {

  state.theme =
    state.theme ===
    'dark'
      ? 'light'
      : 'dark';


  document.documentElement.dataset.theme =
    state.theme;


  localStorage.setItem(
    'tayassuk-os-theme-v2',
    state.theme
  );

}


/* =========================================================
   WHITEBOARD
   ========================================================= */

function saveWhiteboard() {

  const input =
    document.querySelector(
      '#whiteboard-input'
    );


  if (!input) return;


  const value =
    input.value;


  localStorage.setItem(
    'tayassuk-os-whiteboard',
    value
  );


  const status =
    document.querySelector(
      '#whiteboard-status'
    );


  if (status) {

    status.textContent =
      'Note saved locally.';

  }

}


function clearWhiteboard() {

  const input =
    document.querySelector(
      '#whiteboard-input'
    );


  if (input) {

    input.value =
      '';

  }


  localStorage.removeItem(
    'tayassuk-os-whiteboard'
  );


  const status =
    document.querySelector(
      '#whiteboard-status'
    );


  if (status) {

    status.textContent =
      'Note cleared.';

  }

}


/* =========================================================
   ADMIN LOGIN
   ========================================================= */

async function handleAdminLogin(
  event
) {

  event.preventDefault();


  const form =
    event.currentTarget;


  const email =
    form.elements.email?.value
      ?.trim();


  const password =
    form.elements.password?.value ||
    '';


  const status =
    document.querySelector(
      '#admin-login-status'
    );


  if (status) {

    status.textContent =
      'Signing in...';

  }


  try {

    const session =
      await signIn(
        email,
        password
      );


    state.adminSession =
      session;


    if (status) {

      status.textContent =
        'Signed in successfully.';

    }


    refreshControlCenter();

  } catch (error) {

    console.error(
      'Admin login failed:',
      error
    );


    if (status) {

      status.textContent =
        error?.message ||
        'Unable to sign in.';

    }

  }

}


/* =========================================================
   ADMIN SIGN OUT
   ========================================================= */

async function handleSignOut() {

  try {

    await signOut();

    state.adminSession =
      null;

    refreshControlCenter();

  } catch (error) {

    console.error(
      'Sign out failed:',
      error
    );

  }

}


/* =========================================================
   CONTROL CENTER REFRESH
   ========================================================= */

function refreshControlCenter() {

  const record =
    state.windows.get(
      'control'
    );


  if (!record?.element) return;


  const body =
    record.element.querySelector(
      '.window-body'
    );


  if (!body) return;


  body.innerHTML =
    renderControlCenter();


  updateDockState();

}


/* =========================================================
   ADMIN FORM LISTENER
   ========================================================= */

document.addEventListener(
  'submit',
  event => {

    if (
      event.target?.id ===
      'admin-login-form'
    ) {

      handleAdminLogin(
        event
      );

    }

  }
);


/* =========================================================
   PORTFOLIO RELOAD
   ========================================================= */

async function reloadPortfolio() {

  try {

    const remote =
      await loadRemotePortfolio();


    if (remote) {

      portfolio = {

        ...portfolio,

        ...remote

      };

    }


    renderAll();

  } catch (error) {

    console.error(
      'Portfolio reload failed:',
      error
    );

  }

}


/* =========================================================
   SESSION
   ========================================================= */

async function restoreSession() {

  try {

    const session =
      await getSession();


    state.adminSession =
      session || null;


    refreshControlCenter();

  } catch (error) {

    console.warn(
      'Session restore failed:',
      error
    );

  }

}


/* =========================================================
   RESPONSIVE WINDOW SAFETY
   ========================================================= */

function keepWindowsInsideViewport() {

  const desktop =
    document.querySelector(
      '.desktop'
    );


  if (!desktop) return;


  const desktopRect =
    desktop.getBoundingClientRect();


  document
    .querySelectorAll(
      '.os-window'
    )
    .forEach(
      element => {

        if (
          element.classList.contains(
            'is-maximized'
          )
        ) {

          return;

        }


        const rect =
          element.getBoundingClientRect();


        let left =
          parseFloat(
            element.style.left
          );


        let top =
          parseFloat(
            element.style.top
          );


        if (
          Number.isNaN(left)
        ) {

          left =
            rect.left -
            desktopRect.left;

        }


        if (
          Number.isNaN(top)
        ) {

          top =
            rect.top -
            desktopRect.top;

        }


        const maxLeft =
          Math.max(
            12,
            desktopRect.width -
            rect.width -
            12
          );


        const maxTop =
          Math.max(
            12,
            desktopRect.height -
            rect.height -
            12
          );


        left =
          Math.max(
            12,
            Math.min(
              left,
              maxLeft
            )
          );


        top =
          Math.max(
            12,
            Math.min(
              top,
              maxTop
            )
          );


        element.style.left =
          `${left}px`;


        element.style.top =
          `${top}px`;

      }
    );

}


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
  'resize',
  () => {

    keepWindowsInsideViewport();

  }
);


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
  'keydown',
  event => {

    if (
      event.key !==
      'Escape'
    ) {

      return;

    }


    const activeWindow =
      document.querySelector(
        '.os-window.is-active'
      );


    if (!activeWindow) return;


    const windowId =
      activeWindow.dataset.window;


    if (windowId) {

      closeWindow(
        windowId
      );

    }


    updateDockState();

  }
);


/* =========================================================
   COMMAND PALETTE
   ========================================================= */

function openCommandPalette() {

  const palette =
    document.querySelector(
      '#command-palette'
    );


  if (!palette) return;


  palette.classList.add(
    'is-open'
  );


  const input =
    palette.querySelector(
      'input'
    );


  if (input) {

    input.focus();

  }

}


function closeCommandPalette() {

  const palette =
    document.querySelector(
      '#command-palette'
    );


  if (!palette) return;


  palette.classList.remove(
    'is-open'
  );

}


/* =========================================================
   COMMAND PALETTE KEYBOARD
   ========================================================= */

document.addEventListener(
  'keydown',
  event => {

    if (
      (event.ctrlKey ||
       event.metaKey) &&
      event.key.toLowerCase() ===
      'k'
    ) {

      event.preventDefault();

      openCommandPalette();

      return;

    }


    if (
      event.key ===
      'Escape'
    ) {

      closeCommandPalette();

    }

  }
);


/* =========================================================
   COMMAND SEARCH
   ========================================================= */

function renderCommandResults(
  query = ''
) {

  const container =
    document.querySelector(
      '#command-results'
    );


  if (!container) return;


  const normalized =
    query
      .trim()
      .toLowerCase();


  const results =
    apps.filter(
      app => {

        if (!normalized)
          return true;


        return (
          app.name
            .toLowerCase()
            .includes(
              normalized
            ) ||

          app.desc
            .toLowerCase()
            .includes(
              normalized
            )
        );

      }
    );


  container.innerHTML =
    results
      .map(
        app => `

          <button
            type="button"
            class="command-result"
            data-action="open"
            data-app="${esc(
              app.id
            )}"
          >

            <img
              src="${esc(
                app.logo
              )}"
              alt=""
              class="command-result-icon"
              draggable="false"
            >

            <span>

              <strong>
                ${esc(
                  app.name
                )}
              </strong>

              <small>
                ${esc(
                  app.desc
                )}
              </small>

            </span>

          </button>

        `
      )
      .join('');

}


/* =========================================================
   COMMAND INPUT
   ========================================================= */

document.addEventListener(
  'input',
  event => {

    if (
      event.target?.id ===
      'command-input'
    ) {

      renderCommandResults(
        event.target.value
      );

    }

  }
);


/* =========================================================
   COMMAND RESULT CLICK
   ========================================================= */

document.addEventListener(
  'click',
  event => {

    const result =
      event.target.closest(
        '.command-result'
      );


    if (!result) return;


    closeCommandPalette();

  }
);


/* =========================================================
   INITIAL COMMAND RESULTS
   ========================================================= */

renderCommandResults();
/* =========================================================
   DASHBOARD INITIALIZATION
   ========================================================= */

function renderDashboard() {

  renderIdentity();

  renderFeaturedProject();

  renderSkillsSummary();

  renderCurrentlyLearning();

  renderQuickNotes();

  renderNextGoals();

  renderSystemStatus();

  renderRecentActivity();

}


/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {

  renderAppGrid();

  renderIdentity();

  renderDashboard();

  renderDock();

  updateDockState();

}


/* =========================================================
   LOAD REMOTE DATA
   ========================================================= */

async function loadPortfolioData() {

  try {

    const remote =
      await loadRemotePortfolio();


    if (
      remote &&
      typeof remote ===
      'object'
    ) {

      portfolio = {

        ...portfolio,

        ...remote

      };

    }

  } catch (error) {

    console.warn(
      'Using local portfolio data:',
      error
    );

  }

}


/* =========================================================
   BOOT
   ========================================================= */

async function boot() {

  try {

    await loadPortfolioData();

  } catch (error) {

    console.warn(
      'Portfolio boot data failed:',
      error
    );

  }


  renderAll();


  await restoreSession();


  requestAnimationFrame(
    () => {

      keepWindowsInsideViewport();

    }
  );


  const bootScreen =
    document.querySelector(
      '#boot-screen'
    );


  if (bootScreen) {

    setTimeout(
      () => {

        bootScreen.classList.add(
          'is-hidden'
        );

      },
      500
    );

  }

}


/* =========================================================
   DOM READY
   ========================================================= */

if (
  document.readyState ===
  'loading'
) {

  document.addEventListener(
    'DOMContentLoaded',
    boot,
    {
      once: true
    }
  );

} else {

  boot();

}


/* =========================================================
   GLOBAL ACCESS
   ========================================================= */

window.TayassukOS = {

  openWindow,

  closeWindow,

  minimizeWindow,

  maximizeWindow,

  restoreWindow,

  toggleTheme,

  renderAll,

  reloadPortfolio

};


/* =========================================================
   FINAL DOCK PNG ICON FIX
   ========================================================= */

(function () {

  function forceDockPNGIcons() {

    const dock =
      document.querySelector(
        '#dock'
      );


    if (!dock) return;


    const iconMap = {

      projects:
        './assets/icons/projects.png',

      learning:
        './assets/icons/learning.png',

      skills:
        './assets/icons/skills.png',

      education:
        './assets/icons/education.png',

      journey:
        './assets/icons/journey.png',

      about:
        './assets/icons/about.png',

      achievements:
        './assets/icons/achievements.png',

      contact:
        './assets/icons/contact.png',

      whiteboard:
        './assets/icons/whiteboard.png',

      browser:
        './assets/icons/browser.png',

      control:
        './assets/icons/control-center.png'

    };


    dock
      .querySelectorAll(
        '.dock-item'
      )
      .forEach(
        function (item) {

          const appId =
            item.getAttribute(
              'data-app'
            );


          const logo =
            iconMap[appId];


          if (!logo) return;


          if (
            item.querySelector(
              'img'
            )
          ) {

            return;

          }


          const img =
            document.createElement(
              'img'
            );


          img.src =
            logo;


          img.alt =
            appId;


          img.className =
            'dock-logo';


          img.setAttribute(
            'draggable',
            'false'
          );


          img.style.setProperty(
            'width',
            '42px',
            'important'
          );


          img.style.setProperty(
            'height',
            '42px',
            'important'
          );


          img.style.setProperty(
            'object-fit',
            'contain',
            'important'
          );


          img.style.setProperty(
            'display',
            'block',
            'important'
          );


          img.style.setProperty(
            'visibility',
            'visible',
            'important'
          );


          item.appendChild(
            img
          );

        }
      );

  }


  window.addEventListener(
    'load',
    forceDockPNGIcons
  );


  document.addEventListener(
    'DOMContentLoaded',
    forceDockPNGIcons
  );


})();
/* =========================================================
   FINAL SAFETY / CLEANUP
   ========================================================= */

(function () {

  /* -------------------------------------------------------
     Remove duplicate bottom dock Trash if any old markup
     exists. Keep the launcher Trash untouched.
     ------------------------------------------------------- */

  function removeDuplicateDockTrash() {

    const dock =
      document.querySelector('#dock');

    if (!dock) return;

    dock
      .querySelectorAll(
        '[data-app="trash"]'
      )
      .forEach(
        item => item.remove()
      );

  }


  /* -------------------------------------------------------
     Keep opened windows inside the visible screen
     ------------------------------------------------------- */

  function safeWindowPosition() {

    const desktop =
      document.querySelector('.desktop');

    if (!desktop) return;

    const desktopRect =
      desktop.getBoundingClientRect();

    document
      .querySelectorAll('.os-window')
      .forEach(windowElement => {

        if (
          windowElement.classList.contains(
            'is-maximized'
          )
        ) {
          return;
        }

        const rect =
          windowElement.getBoundingClientRect();

        let left =
          parseFloat(
            windowElement.style.left
          );

        let top =
          parseFloat(
            windowElement.style.top
          );

        if (Number.isNaN(left)) {
          left =
            rect.left -
            desktopRect.left;
        }

        if (Number.isNaN(top)) {
          top =
            rect.top -
            desktopRect.top;
        }

        const maxLeft =
          Math.max(
            12,
            desktopRect.width -
            rect.width -
            12
          );

        const maxTop =
          Math.max(
            12,
            desktopRect.height -
            rect.height -
            12
          );

        left =
          Math.max(
            12,
            Math.min(
              left,
              maxLeft
            )
          );

        top =
          Math.max(
            12,
            Math.min(
              top,
              maxTop
            )
          );

        windowElement.style.left =
          `${left}px`;

        windowElement.style.top =
          `${top}px`;

      });

  }


  /* -------------------------------------------------------
     Run cleanup after DOM is ready
     ------------------------------------------------------- */

  function cleanup() {

    removeDuplicateDockTrash();

    safeWindowPosition();

  }


  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      cleanup,
      {
        once: true
      }
    );

  } else {

    cleanup();

  }


  window.addEventListener(
    'resize',
    safeWindowPosition
  );

})();
/* =========================================================
   END OF APP.JS
   ========================================================= */

/*
   Tayassuk OS
   Portfolio Application
   Final JavaScript Section
*/


/* ---------------------------------------------------------
   Final state synchronization
   --------------------------------------------------------- */

function syncUI() {

  try {

    renderDock();

    updateDockState();

    keepWindowsInsideViewport();

  } catch (error) {

    console.warn(
      'UI synchronization warning:',
      error
    );

  }

}


/* ---------------------------------------------------------
   Final load synchronization
   --------------------------------------------------------- */

window.addEventListener(
  'load',
  () => {

    setTimeout(
      syncUI,
      100
    );

  },
  {
    once: true
  }
);


/* ---------------------------------------------------------
   Final closing wrapper
   --------------------------------------------------------- */
