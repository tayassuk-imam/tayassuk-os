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
      detail: 'C, C++, pointers, structures, files, sorting & searching'
    },
    {
      title: 'Problem solving',
      detail: 'Data structures, algorithms, and programming practice'
    },
    {
      title: 'Database systems',
      detail: 'SQL, MySQL, relational design, joins, normalization, CRUD'
    },
    {
      title: 'Web development',
      detail: 'HTML, CSS, JavaScript, PHP, backend-connected interfaces'
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

const state = {
  theme: localStorage.getItem('tayassuk-os-theme-v2') || 'dark',
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
    icon: 'folder'
  },
  {
    id: 'learning',
    name: 'Learning',
    desc: 'Current study & practice',
    icon: 'layers'
  },
  {
    id: 'skills',
    name: 'Skills',
    desc: 'Technical toolkit',
    icon: 'code'
  },
  {
    id: 'education',
    name: 'Education',
    desc: 'Academic timeline',
    icon: 'cap'
  },
  {
    id: 'journey',
    name: 'Journey',
    desc: 'Software engineering growth',
    icon: 'route'
  },
  {
    id: 'about',
    name: 'About',
    desc: 'Who I am & what I value',
    icon: 'user'
  },
  {
    id: 'achievements',
    name: 'Achievements',
    desc: 'Activities & milestones',
    icon: 'trophy'
  },
  {
    id: 'resume',
    name: 'Resume',
    desc: 'Official CV',
    icon: 'file'
  },
  {
    id: 'contact',
    name: 'Contact',
    desc: 'Start a conversation',
    icon: 'mail'
  },
  {
    id: 'whiteboard',
    name: 'Whiteboard',
    desc: 'Leave a local note',
    icon: 'note'
  },
  {
    id: 'founder',
    name: 'Founder.txt',
    desc: 'My working principles',
    icon: 'terminal'
  },
  {
    id: 'browser',
    name: 'Browser',
    desc: 'Approved external links',
    icon: 'globe'
  }
];

/* =========================================================
   HELPERS
   ========================================================= */

const esc = value =>
  String(value ?? '').replace(
    /[&<>"']/g,
    char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char])
  );

const icon = name => `icon icon-${name}`;

document.documentElement.dataset.theme = state.theme;

/* =========================================================
   MAIN RENDER
   ========================================================= */

function renderAppGrid() {
  const el = document.querySelector('#app-grid');

  if (!el) return;

  el.innerHTML = apps
    .map(
      app => `
        <button
          type="button"
          class="launcher-app"
          data-action="open"
          data-app="${esc(app.id)}"
          title="${esc(app.desc)}"
        >
          <span class="app-icon ${icon(app.icon)}"></span>
          <span>${esc(app.name)}</span>
        </button>
      `
    )
    .join('');
}

function renderIdentity() {
  const identity = portfolio.owner?.identity || {};

  const parts = String(
    identity.fullName || 'Tayassuk Imam'
  )
    .trim()
    .split(/\s+/);

  const last = parts.pop() || '';
  const first = parts.join(' ');

  const name = document.querySelector('#identity-name');

  if (name) {
    name.innerHTML = `
      ${esc(first)}
      <span>${esc(last)}</span>
    `;
  }

  const profession =
    document.querySelector('#identity-profession');

  if (profession) {
    profession.textContent =
      identity.profession ||
      'Software Engineering Student';
  }

  const headline =
    document.querySelector('#identity-headline');

  if (headline) {
    headline.textContent =
      identity.headline ||
      'Software Engineering Student Building the Future, One Project at a Time';
  }

  const image =
    document.querySelector('#hero-portrait');

  if (image) {
    image.src =
      identity.generatedAvatar ||
      identity.portrait ||
      './assets/avatar/tayassuk-generated-avatar.png';
  }

  const cv =
    document.querySelector('#hero-cv');

  if (cv) {
    cv.href =
      portfolio.owner?.contact?.cv ||
      './assets/cv/Tayassuk-Imam-CV.pdf';
  }

  const learning =
    portfolio.owner?.learning || [];

  const progress =
    learning.reduce(
      (sum, item) =>
        sum + (Number(item.progress) || 0),
      0
    ) / Math.max(1, learning.length);

  const progressBar =
    document.querySelector('#hero-progress');

  if (progressBar) {
    progressBar.style.width =
      `${Math.round(progress)}%`;
  }

  renderSocials();
}

function renderSocials() {
  const contact =
    portfolio.owner?.contact || {};

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
    document.querySelector('#social-row');

  if (social) {
    social.innerHTML = output.join('');
  }
}

/* =========================================================
   CLOCK
   ========================================================= */

function updateClock() {
  const date = new Date();

  const timezone =
    portfolio.owner?.identity?.timezone ||
    'Asia/Dhaka';

  const dateText =
    new Intl.DateTimeFormat('en-BD', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);

  const timeText =
    new Intl.DateTimeFormat('en-BD', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);

  const clock =
    document.querySelector('#clock');

  const clockBig =
    document.querySelector('#clock-big');

  const clockAmpm =
    document.querySelector('#clock-ampm');

  const calendarDate =
    document.querySelector('#calendar-date');

  const calendarMonth =
    document.querySelector('#calendar-month');

  if (clock) {
    clock.textContent = timeText;
  }

  if (clockBig) {
    clockBig.textContent =
      timeText.split(':').slice(0, 2).join(':');
  }

  if (clockAmpm) {
    clockAmpm.textContent =
      timeText.match(/AM|PM/)?.[0] || '';
  }

  if (calendarDate) {
    calendarDate.textContent = dateText;
  }

  if (calendarMonth) {
    calendarMonth.textContent =
      new Intl.DateTimeFormat('en-BD', {
        timeZone: timezone,
        month: 'long',
        year: 'numeric'
      }).format(date);
  }

  renderCalendar(date);
}

function renderCalendar(date) {
  const grid =
    document.querySelector('#calendar-grid');

  if (!grid) return;

  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay =
    new Date(year, month, 1);

  const days =
    new Date(year, month + 1, 0).getDate();

  const start =
    (firstDay.getDay() + 6) % 7;

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

  for (let i = 0; i < start; i++) {
    html += '<span></span>';
  }

  for (let day = 1; day <= days; day++) {
    html += `
      <span class="day ${
        day === date.getDate()
          ? 'today'
          : ''
      }">
        ${day}
      </span>
    `;
  }

  grid.innerHTML = html;
}

updateClock();
setInterval(updateClock, 1000);

renderAppGrid();

/* =========================================================
   WINDOW SYSTEM
   ========================================================= */

function windowPosition() {
  const width =
    Math.min(940, innerWidth - 44);

  const height =
    Math.min(700, innerHeight - 120);

  const offset =
    state.windows.size % 4;

  const vertical =
    state.windows.size % 3;

  return {
    left: Math.max(
      12,
      (innerWidth - width) / 2 +
        offset * 16
    ),

    top: Math.max(
      72,
      (innerHeight - height) / 2 +
        vertical * 12
    ),

    width,
    height
  };
}

function openWindow(id) {
  if (!id) return;

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

  node.className = 'app-window';

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

  const app =
    apps.find(item => item.id === id);

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
    body: node.querySelector('.window-body')
  };

  state.windows.set(id, win);

  renderWindow(id);
  wireDrag(node, id);
  focusWindow(id);
}

function focusWindow(id) {
  const windowData =
    state.windows.get(id);

  if (!windowData) return;

  windowData.node.style.zIndex =
    ++state.z;
}

function closeWindow(id) {
  const windowData =
    state.windows.get(id);

  if (!windowData) return;

  windowData.node.remove();

  state.windows.delete(id);
}

/* =========================================================
   WINDOW CONTENT
   ========================================================= */

function renderWindow(id) {
  const win =
    state.windows.get(id);

  if (!win) return;

  if (id === 'control') {
    win.body.innerHTML =
      controlMarkup();

    wireWindow(win.body, id);
    wireAdmin(win.body);

    return;
  }

  if (contents[id]) {
    win.body.innerHTML =
      contents[id]();
  } else {
    win.body.innerHTML =
      '<h2>App</h2>';
  }

  wireWindow(win.body, id);
}

/* =========================================================
   DRAG
   ========================================================= */

function wireDrag(node, id) {
  const chrome =
    node.querySelector('.window-chrome');

  if (!chrome) return;

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  chrome.addEventListener(
    'pointerdown',
    event => {
      if (
        event.target.closest(
          '[data-win-close]'
        )
      ) {
        return;
      }

      dragging = true;

      offsetX =
        event.clientX -
        node.offsetLeft;

      offsetY =
        event.clientY -
        node.offsetTop;

      try {
        node.setPointerCapture(
          event.pointerId
        );
      } catch (_) {}

      focusWindow(id);
    }
  );

  chrome.addEventListener(
    'pointermove',
    event => {
      if (!dragging) return;

      const maxLeft =
        innerWidth -
        node.offsetWidth -
        8;

      const maxTop =
        innerHeight -
        node.offsetHeight -
        8;

      node.style.left =
        `${Math.max(
          8,
          Math.min(
            event.clientX - offsetX,
            maxLeft
          )
        )}px`;

      node.style.top =
        `${Math.max(
          50,
          Math.min(
            event.clientY - offsetY,
            maxTop
          )
        )}px`;
    }
  );

  const stopDrag = () => {
    dragging = false;
  };

  chrome.addEventListener(
    'pointerup',
    stopDrag
  );

  chrome.addEventListener(
    'pointercancel',
    stopDrag
  );

  const closeButton =
    node.querySelector(
      '[data-win-close]'
    );

  closeButton?.addEventListener(
    'click',
    event => {
      event.stopPropagation();
      closeWindow(id);
    }
  );
}

/* =========================================================
   PROJECTS
   ========================================================= */

function projectCard(project) {
  const live =
    project.liveUrl ||
    project.url ||
    '';

  const repo =
    project.githubUrl ||
    project.repository ||
    '';

  const technologies =
    project.technologies ||
    project.stack ||
    [];

  return `
    <article class="project-window-card">

      <div class="project-window-top">
        <div>
          <h3>
            ${esc(project.name)}
          </h3>

          <div class="muted">
            ${esc(project.category || 'Project')}
            ·
            ${esc(project.role || 'Solo Developer')}
          </div>
        </div>

        <span class="status">
          ${esc(project.status || 'Active')}
        </span>
      </div>

      <p>
        ${esc(
          project.description ||
          project.outcome ||
          project.problem ||
          ''
        )}
      </p>

      <div class="chips">
        ${technologies
          .map(
            technology =>
              `<span class="chip">
                ${esc(technology)}
              </span>`
          )
          .join('')}
      </div>

      <div class="window-actions">

        ${
          live
            ? `
              <a
                class="primary-link"
                href="${esc(live)}"
                target="_blank"
                rel="noreferrer noopener"
              >
                Live Demo
              </a>
            `
            : ''
        }

        ${
          repo
            ? `
              <a
                href="${esc(repo)}"
                target="_blank"
                rel="noreferrer noopener"
              >
                Repository
              </a>
            `
            : ''
        }

        <button
          type="button"
          data-action="project-detail"
          data-project="${esc(project.id)}"
        >
          View Details
        </button>

      </div>
    </article>
  `;
}

/* =========================================================
   APP CONTENT
   ========================================================= */

const contents = {

  projects: () => `
    <h2>Project Drive</h2>

    <p class="muted">
      Real work first. New projects can be added
      from Control Center and appear here automatically.
    </p>

    <h3>Featured</h3>

    <div class="window-grid">
      ${
        portfolio.projects
          .filter(project => project.featured)
          .map(projectCard)
          .join('') ||
        '<div class="panel-card">No featured project.</div>'
      }
    </div>

    <h3>More Projects</h3>

    <div class="window-grid">
      ${
        portfolio.projects
          .filter(project => !project.featured)
          .map(projectCard)
          .join('') ||
        `
          <div class="panel-card">
            Future-ready slots are ready for your next builds.
          </div>
        `
      }
    </div>
  `,

  learning: () => `
    <h2>Learning</h2>

    <p>
      I am focusing on learning, applying,
      and improving through practical work.
    </p>

    ${
      (portfolio.owner.learning || [])
        .map(
          item => `
            <div class="skill-row">

              <div class="skill-top">
                <span>${esc(item.name)}</span>
                <strong>${esc(item.status)}</strong>
              </div>

              <div class="skill-bar">
                <span
                  style="
                    width:${Math.max(
                      0,
                      Math.min(
                        100,
                        Number(item.progress) || 0
                      )
                    )}%
                  "
                ></span>
              </div>

            </div>
          `
        )
        .join('')
    }
  `,

  skills: () => `
    <h2>Skills</h2>

    ${
      portfolio.skills
        .map(
          group => `
            <section class="panel-card">

              <h3>
                ${esc(group.title)}
              </h3>

              <div class="chips">
                ${group.items
                  .map(
                    item =>
                      `<span class="chip">
                        ${esc(item)}
                      </span>`
                  )
                  .join('')}
              </div>

            </section>
          `
        )
        .join('')
    }
  `,

  education: () => `
    <h2>Education</h2>

    ${
      portfolio.education
        .map(
          education => `
            <div class="panel-card">

              <div class="panel-row">
                <strong>
                  ${esc(education.institution)}
                </strong>

                <span class="muted">
                  ${esc(education.status)}
                </span>
              </div>

              <p>
                ${esc(education.degree)}
              </p>

              <span class="muted">
                ${esc(education.details)}
              </span>

            </div>
          `
        )
        .join('')
    }
  `,

  journey: () => `
    <h2>Journey</h2>

    <div class="timeline">

      ${
        portfolio.journey
          .map(
            item => `
              <div class="timeline-item">
                <strong>
                  ${esc(item.title)}
                </strong>

                <span>
                  ${esc(item.detail)}
                </span>
              </div>
            `
          )
          .join('')
      }

    </div>
  `,

  about: () => `
    <h2>About Me</h2>

    <p>
      ${esc(
        portfolio.owner.identity.positioning
      )}
    </p>

    <div class="window-grid">

      <div class="panel-card">
        <strong>What I enjoy</strong>
        <p>
          Building websites, solving problems,
          databases, and turning ideas into working systems.
        </p>
      </div>

      <div class="panel-card">
        <strong>What I am improving</strong>
        <p>
          ${esc(
            (portfolio.owner.focus || []).join(', ')
          )}
        </p>
      </div>

      <div class="panel-card">
        <strong>What I am looking for</strong>
        <p>
          Internships, entry-level opportunities,
          freelance projects, and meaningful collaboration.
        </p>
      </div>

      <div class="panel-card">
        <strong>Location</strong>
        <p>
          ${esc(
            portfolio.owner.identity.location
          )}
        </p>
      </div>

    </div>
  `,

  achievements: () => `
    <h2>Achievements & Activities</h2>

    ${
      portfolio.achievements
        .map(
          achievement => `
            <div class="panel-card achievement-card">
              ${esc(achievement)}
            </div>
          `
        )
        .join('')
    }
  `,

  resume: () => `
    <h2>Resume</h2>

    <div class="panel-card">

      <strong>
        ${esc(
          portfolio.owner.identity.fullName
        )}
      </strong>

      <p class="muted">
        Official CV
      </p>

      <div class="window-actions">

        <a
          class="primary-link"
          href="${esc(
            portfolio.owner.contact.cv ||
            './assets/cv/Tayassuk-Imam-CV.pdf'
          )}"
          download
        >
          Download CV
        </a>

        <a
          href="${esc(
            portfolio.owner.contact.cv ||
            './assets/cv/Tayassuk-Imam-CV.pdf'
          )}"
          target="_blank"
          rel="noreferrer noopener"
        >
          Open CV
        </a>

      </div>
    </div>
  `,

  contact: () => `
    <h2>Contact</h2>

    <div class="contact-grid">

      ${
        portfolio.owner.contact.email
          ? `
            <a
              class="contact-action"
              href="mailto:${esc(
                portfolio.owner.contact.email
              )}"
            >
              <strong>Email</strong>
              <span>
                ${esc(
                  portfolio.owner.contact.email
                )}
              </span>
            </a>
          `
          : ''
      }

      ${
        portfolio.owner.contact.phone
          ? `
            <a
              class="contact-action"
              href="tel:${esc(
                portfolio.owner.contact.phone
              )}"
            >
              <strong>Phone</strong>
              <span>
                ${esc(
                  portfolio.owner.contact.phone
                )}
              </span>
            </a>
          `
          : ''
      }

      ${
        portfolio.owner.contact.github
          ? `
            <a
              class="contact-action"
              href="${esc(
                portfolio.owner.contact.github
              )}"
              target="_blank"
              rel="noreferrer noopener"
            >
              <strong>GitHub</strong>
              <span>
                ${esc(
                  portfolio.owner.contact.github
                )}
              </span>
            </a>
          `
          : ''
      }

      ${
        portfolio.owner.contact.linkedin
          ? `
            <a
              class="contact-action"
              href="${esc(
                portfolio.owner.contact.linkedin
              )}"
              target="_blank"
              rel="noreferrer noopener"
            >
              <strong>LinkedIn</strong>
              <span>
                ${esc(
                  portfolio.owner.contact.linkedin
                )}
              </span>
            </a>
          `
          : ''
      }

    </div>
  `,

  founder: () => `
    <h2>Founder.txt</h2>

    <div class="panel-card">

      <p>
        <strong>Who I am:</strong>
        A Software Engineering student building
        a practical foundation.
      </p>

      <p>
        <strong>What I build:</strong>
        Web applications and software projects
        that turn learning into evidence.
      </p>

      <p>
        <strong>Why I care:</strong>
        Growth comes from shipping,
        debugging, and trying again.
      </p>

      <p>
        <strong>What I am exploring:</strong>
        Better web development, stronger databases,
        algorithms, and professional engineering habits.
      </p>

    </div>
  `,

  browser: () => `
    <h2>Browser</h2>

    <div class="panel-card">

      <p>
        Approved external destinations:
      </p>

      <div class="window-actions">

        <a
          class="primary-link"
          href="https://garage-management.infinityfree.io/garage_management/"
          target="_blank"
          rel="noreferrer noopener"
        >
          Garage Management System
        </a>

      </div>

    </div>
  `,

  whiteboard: () => `
    <h2>Whiteboard</h2>

    <div class="whiteboard">

      <form
        id="sticky-form"
        class="sticky-form"
      >

        <textarea
          id="sticky-input"
          maxlength="280"
          placeholder="Write a note…"
        ></textarea>

        <button type="submit">
          Add Sticky
        </button>

        <button
          type="button"
          id="sticky-reset"
        >
          Reset Board
        </button>

      </form>

      <div
        id="sticky-board"
        class="sticky-board"
      ></div>

    </div>
  `
};

/* =========================================================
   PROJECT DETAIL
   ========================================================= */

function projectDetail(id) {
  const project =
    portfolio.projects.find(
      item => String(item.id) === String(id)
    );

  if (!project) return;

  const win =
    state.windows.get('projects');

  if (!win) return;

  const live =
    project.liveUrl ||
    project.url ||
    '';

  const repo =
    project.githubUrl ||
    project.repository ||
    '';

  win.body.innerHTML = `
    <h2>
      ${esc(project.name)}
    </h2>

    <p class="muted">
      ${esc(project.category || 'Project')}
      ·
      ${esc(project.role || 'Solo Developer')}
      ·
      ${esc(project.dates || '')}
    </p>

    <div class="panel-card">

      <h3>Description</h3>
      <p>
        ${esc(project.description || '')}
      </p>

      <h3>Problem</h3>
      <p>
        ${esc(project.problem || '')}
      </p>

      <h3>What I built</h3>
      <p>
        ${esc(project.intervention || '')}
      </p>

      <h3>Outcome</h3>
      <p>
        ${esc(project.outcome || '')}
      </p>

      <div class="window-actions">

        ${
          live
            ? `
              <a
                class="primary-link"
                href="${esc(live)}"
                target="_blank"
                rel="noreferrer noopener"
              >
                Live Demo
              </a>
            `
            : ''
        }

        ${
          repo
            ? `
              <a
                href="${esc(repo)}"
                target="_blank"
                rel="noreferrer noopener"
              >
                GitHub
              </a>
            `
            : ''
        }

        <button
          type="button"
          data-action="back-projects"
        >
          Back to Projects
        </button>

      </div>

    </div>
  `;

  win.body
    .querySelector(
      '[data-action="back-projects"]'
    )
    ?.addEventListener(
      'click',
      () => renderWindow('projects')
    );
}

/* =========================================================
   WHITEBOARD
   ========================================================= */

function renderSticky(body) {
  const board =
    body?.querySelector('#sticky-board');

  if (!board) return;

  const notes =
    JSON.parse(
      localStorage.getItem(
        'tayassuk-os-notes-v1'
      ) || '[]'
    );

  board.innerHTML = notes
    .map(
      (note, index) => `
        <div
          class="sticky"
          style="
            left:${Number(note.x) || 18}px;
            top:${Number(note.y) || 18}px;
          "
        >

          <button
            type="button"
            data-note-del="${index}"
          >
            ×
          </button>

          <p>
            ${esc(note.text)}
          </p>

        </div>
      `
    )
    .join('');

  board
    .querySelectorAll('[data-note-del]')
    .forEach(button => {
      button.addEventListener(
        'click',
        () => {
          const current =
            JSON.parse(
              localStorage.getItem(
                'tayassuk-os-notes-v1'
              ) || '[]'
            );

          current.splice(
            Number(button.dataset.noteDel),
            1
          );

          localStorage.setItem(
            'tayassuk-os-notes-v1',
            JSON.stringify(current)
          );

          renderSticky(body);
        }
      );
    });
}

/* =========================================================
   WINDOW EVENTS
   ========================================================= */

function wireWindow(body, id) {
  if (!body) return;

  body
    .querySelectorAll('[data-action]')
    .forEach(element => {
      element.addEventListener(
        'click',
        event => {
          event.preventDefault();

          const action =
            element.dataset.action;

          if (action === 'project-detail') {
            projectDetail(
              element.dataset.project
            );
          }

          if (action === 'back-projects') {
            renderWindow('projects');
          }
        }
      );
    });

  if (id !== 'whiteboard') {
    return;
  }

  renderSticky(body);

  const form =
    body.querySelector('#sticky-form');

  form?.addEventListener(
    'submit',
    event => {
      event.preventDefault();

      const input =
        body.querySelector('#sticky-input');

      const text =
        input?.value.trim();

      if (!text) return;

      const notes =
        JSON.parse(
          localStorage.getItem(
            'tayassuk-os-notes-v1'
          ) || '[]'
        );

      notes.push({
        text,
        x: 18 + ((notes.length * 18) % 220),
        y: 18 + ((notes.length * 22) % 180)
      });

      localStorage.setItem(
        'tayassuk-os-notes-v1',
        JSON.stringify(notes)
      );

      input.value = '';

      renderSticky(body);
    }
  );

  body
    .querySelector('#sticky-reset')
    ?.addEventListener(
      'click',
      () => {
        localStorage.removeItem(
          'tayassuk-os-notes-v1'
        );

        renderSticky(body);
      }
    );
}

/* =========================================================
   CONTROL CENTER
   ========================================================= */

function controlMarkup() {
  if (!state.adminSession) {
    return `
      <h2>Control Center</h2>

      <p class="muted">
        Private portfolio management.
        Only your authenticated account can publish changes.
      </p>

      <form
        id="admin-login"
        class="admin-form"
      >

        <label>
          Email

          <input
            id="admin-email"
            type="email"
            required
            value="${esc(
              portfolio.owner.contact.email || ''
            )}"
          />
        </label>

        <label>
          Password

          <input
            id="admin-password"
            type="password"
            required
          />
        </label>

        <div class="window-actions">

          <button
            class="primary-link"
            type="submit"
          >
            Sign in
          </button>

        </div>

        <div
          id="admin-msg"
          class="muted"
        ></div>

      </form>
    `;
  }

  return `
    <h2>Control Center</h2>

    <div class="admin-toolbar">

      <div>
        <strong>Signed in</strong>

        <div class="muted">
          Publish updates to the public portfolio.
        </div>
      </div>

      <button
        type="button"
        id="admin-logout"
      >
        Log out
      </button>

    </div>

    <div class="admin-tabs">

      ${
        [
          'profile',
          'projects',
          'learning',
          'skills',
          'education',
          'achievements',
          'journey'
        ]
          .map(
            tab => `
              <button
                type="button"
                data-admin-tab="${tab}"
              >
                ${
                  tab.charAt(0).toUpperCase() +
                  tab.slice(1)
                }
              </button>
            `
          )
          .join('')
      }

    </div>

    <div id="admin-content">
      ${adminProfile()}
    </div>
  `;
}

function adminProfile() {
  const owner = portfolio.owner;

  return `
    <form
      id="admin-profile"
      class="admin-form"
    >

      <div class="admin-grid">

        <label>
          Full name
          <input
            data-field="fullName"
            value="${esc(
              owner.identity.fullName
            )}"
          />
        </label>

        <label>
          Profession
          <input
            data-field="profession"
            value="${esc(
              owner.identity.profession
            )}"
          />
        </label>

        <label>
          Headline
          <input
            data-field="headline"
            value="${esc(
              owner.identity.headline
            )}"
          />
        </label>

        <label>
          Location
          <input
            data-field="location"
            value="${esc(
              owner.identity.location
            )}"
          />
        </label>

        <label>
          Email
          <input
            data-contact="email"
            value="${esc(
              owner.contact.email
            )}"
          />
        </label>

        <label>
          Phone
          <input
            data-contact="phone"
            value="${esc(
              owner.contact.phone || ''
            )}"
          />
        </label>

        <label>
          GitHub
          <input
            data-contact="github"
            value="${esc(
              owner.contact.github || ''
            )}"
          />
        </label>

        <label>
          LinkedIn
          <input
            data-contact="linkedin"
            value="${esc(
              owner.contact.linkedin || ''
            )}"
          />
        </label>

      </div>

      <label>
        Positioning

        <textarea id="admin-positioning">${esc(
          owner.identity.positioning
        )}</textarea>
      </label>

      <label>
        CV path or URL

        <input
          data-contact="cv"
          value="${esc(
            owner.contact.cv ||
            './assets/cv/Tayassuk-Imam-CV.pdf'
          )}"
        />
      </label>

      <div class="window-actions">

        <button
          class="primary-link"
          type="submit"
        >
          Save & Publish Profile
        </button>

      </div>

    </form>
  `;
}

function adminProjects() {
  return `
    <div class="window-actions">

      <button
        type="button"
        class="primary-link"
        id="add-project"
      >
        + Add Project
      </button>

      <button
        type="button"
        id="save-projects"
      >
        Save & Publish Projects
      </button>

    </div>

    <div id="admin-project-list">

      ${
        portfolio.projects
          .map(
            (project, index) => `
              <section
                class="admin-project panel-card"
                data-i="${index}"
              >

                <div class="admin-project-head">

                  <strong>
                    ${esc(
                      project.name ||
                      'Project'
                    )}
                  </strong>

                  <button
                    type="button"
                    data-del-project="${index}"
                  >
                    Delete
                  </button>

                </div>

                <div class="admin-grid">

                  <label>
                    Name
                    <input
                      data-project="name"
                      value="${esc(
                        project.name || ''
                      )}"
                    />
                  </label>

                  <label>
                    Category
                    <input
                      data-project="category"
                      value="${esc(
                        project.category || ''
                      )}"
                    />
                  </label>

                  <label>
                    Dates
                    <input
                      data-project="dates"
                      value="${esc(
                        project.dates || ''
                      )}"
                    />
                  </label>

                  <label>
                    Role
                    <input
                      data-project="role"
                      value="${esc(
                        project.role ||
                        'Solo Developer'
                      )}"
                    />
                  </label>

                  <label>
                    Status
                    <input
                      data-project="status"
                      value="${esc(
                        project.status ||
                        'In Progress'
                      )}"
                    />
                  </label>

                  <label>
                    Live URL
                    <input
                      data-project="liveUrl"
                      value="${esc(
                        project.liveUrl ||
                        project.url ||
                        ''
                      )}"
                    />
                  </label>

                  <label>
                    GitHub URL
                    <input
                      data-project="githubUrl"
                      value="${esc(
                        project.githubUrl ||
                        project.repository ||
                        ''
                      )}"
                    />
                  </label>

                  <label>
                    Image
                    <input
                      data-project="image"
                      value="${esc(
                        project.image || ''
                      )}"
                    />
                  </label>

                  <label>
                    Technologies
                    <input
                      data-project="technologies"
                      value="${esc(
                        (
                          project.technologies ||
                          project.stack ||
                          []
                        ).join(', ')
                      )}"
                    />
                  </label>

                  <label class="checkbox-line">

                    <input
                      type="checkbox"
                      data-project="featured"
                      ${
                        project.featured
                          ? 'checked'
                          : ''
                      }
                    />

                    Featured project

                  </label>

                </div>

                <label>
                  Description

                  <textarea
                    data-project="description"
                  >${esc(
                    project.description ||
                    project.outcome ||
                    ''
                  )}</textarea>
                </label>

              </section>
            `
          )
          .join('')
      }

    </div>
  `;
}

function adminLearning() {
  return `
    <form
      id="admin-learning"
      class="admin-form"
    >

      <label>
        Learning rows — one per line:
        Name | Status | Progress

        <textarea id="admin-learning-text">${esc(
          (portfolio.owner.learning || [])
            .map(
              item =>
                `${item.name} | ${item.status} | ${item.progress}`
            )
            .join('\n')
        )}</textarea>
      </label>

      <label>
        Next focus — one per line

        <textarea id="admin-focus">${esc(
          (portfolio.owner.focus || []).join('\n')
        )}</textarea>
      </label>

      <div class="window-actions">

        <button
          class="primary-link"
          type="submit"
        >
          Save & Publish Learning
        </button>

      </div>

    </form>
  `;
}

function adminSkills() {
  return `
    <form
      id="admin-skills"
      class="admin-form"
    >

      <label>
        Skill groups —
        Group | item, item…

        <textarea id="admin-skills-text">${esc(
          portfolio.skills
            .map(
              group =>
                `${group.title} | ${group.items.join(', ')}`
            )
            .join('\n')
        )}</textarea>
      </label>

      <div class="window-actions">

        <button
          class="primary-link"
          type="submit"
        >
          Save & Publish Skills
        </button>

      </div>

    </form>
  `;
}

function adminEducation() {
  return `
    <form
      id="admin-education"
      class="admin-form"
    >

      <label>
        Education —
        Institution | Degree | Status | Details

        <textarea id="admin-education-text">${esc(
          portfolio.education
            .map(
              item =>
                `${item.institution} | ${item.degree} | ${item.status} | ${item.details}`
            )
            .join('\n')
        )}</textarea>
      </label>

      <div class="window-actions">

        <button
          class="primary-link"
          type="submit"
        >
          Save & Publish Education
        </button>

      </div>

    </form>
  `;
}

function adminAchievements() {
  return `
    <form
      id="admin-achievements"
      class="admin-form"
    >

      <label>
        Achievements — one per line

        <textarea id="admin-achievements-text">${esc(
          portfolio.achievements.join('\n')
        )}</textarea>
      </label>

      <div class="window-actions">

        <button
          class="primary-link"
          type="submit"
        >
          Save & Publish Achievements
        </button>

      </div>

    </form>
  `;
}

function adminJourney() {
  return `
    <form
      id="admin-journey"
      class="admin-form"
    >

      <label>
        Journey — Title | Detail

        <textarea id="admin-journey-text">${esc(
          portfolio.journey
            .map(
              item =>
                `${item.title} | ${item.detail}`
            )
            .join('\n')
        )}</textarea>
      </label>

      <div class="window-actions">

        <button
          class="primary-link"
          type="submit"
        >
          Save & Publish Journey
        </button>

      </div>

    </form>
  `;
}

/* =========================================================
   ADMIN EVENTS
   ========================================================= */

function wireAdmin(body) {
  if (!body) return;

  /* LOGIN */

  body
    .querySelector('#admin-login')
    ?.addEventListener(
      'submit',
      async event => {
        event.preventDefault();

        const email =
          body.querySelector(
            '#admin-email'
          )?.value.trim();

        const password =
          body.querySelector(
            '#admin-password'
          )?.value || '';

        const message =
          body.querySelector(
            '#admin-msg'
          );

        try {
          state.adminSession =
            await signIn(
              email,
              password
            );

          renderWindow('control');
        } catch (error) {
          if (message) {
            message.textContent =
              error?.message ||
              'Sign in failed.';
          }
        }
      }
    );

  /* LOGOUT */

  body
    .querySelector('#admin-logout')
    ?.addEventListener(
      'click',
      async () => {
        try {
          await signOut();
        } finally {
          state.adminSession = null;
          renderWindow('control');
        }
      }
    );

  /* TABS */

  body
    .querySelectorAll('[data-admin-tab]')
    .forEach(button => {
      button.addEventListener(
        'click',
        () => {
          const tab =
            button.dataset.adminTab;

          const content =
            body.querySelector(
              '#admin-content'
            );

          if (!content) return;

          if (tab === 'profile') {
            content.innerHTML =
              adminProfile();
          } else if (tab === 'projects') {
            content.innerHTML =
              adminProjects();
          } else if (tab === 'learning') {
            content.innerHTML =
              adminLearning();
          } else if (tab === 'skills') {
            content.innerHTML =
              adminSkills();
          } else if (tab === 'education') {
            content.innerHTML =
              adminEducation();
          } else if (
            tab === 'achievements'
          ) {
            content.innerHTML =
              adminAchievements();
          } else if (tab === 'journey') {
            content.innerHTML =
              adminJourney();
          }

          wireAdmin(content);
        }
      );
    });

  /* PROFILE */

  body
    .querySelector('#admin-profile')
    ?.addEventListener(
      'submit',
      async event => {
        event.preventDefault();

        const form =
          event.currentTarget;

        form
          .querySelectorAll('[data-field]')
          .forEach(input => {
            portfolio.owner.identity[
              input.dataset.field
            ] = input.value.trim();
          });

        form
          .querySelectorAll('[data-contact]')
          .forEach(input => {
            portfolio.owner.contact[
              input.dataset.contact
            ] = input.value.trim();
          });

        const positioning =
          form.querySelector(
            '#admin-positioning'
          );

        if (positioning) {
          portfolio.owner.identity.positioning =
            positioning.value.trim();
        }

        await publish();
      }
    );

  /* LEARNING */

  body
    .querySelector('#admin-learning')
    ?.addEventListener(
      'submit',
      async event => {
        event.preventDefault();

        const learningText =
          body.querySelector(
            '#admin-learning-text'
          )?.value || '';

        const focusText =
          body.querySelector(
            '#admin-focus'
          )?.value || '';

        portfolio.owner.learning =
          learningText
            .split('\n')
            .map(line =>
              line
                .split('|')
                .map(value =>
                  value.trim()
                )
            )
            .filter(row => row[0])
            .map(row => ({
              name: row[0],
              status:
                row[1] ||
                'Learning',
              progress:
                Number(row[2]) || 0
            }));

        portfolio.owner.focus =
          focusText
            .split('\n')
            .map(value =>
              value.trim()
            )
            .filter(Boolean);

        await publish();
      }
    );

  /* SKILLS */

  body
    .querySelector('#admin-skills')
    ?.addEventListener(
      'submit',
      async event => {
        event.preventDefault();

        const text =
          body.querySelector(
            '#admin-skills-text'
          )?.value || '';

        portfolio.skills =
          text
            .split('\n')
            .map(line =>
              line
                .split('|')
                .map(value =>
                  value.trim()
                )
            )
            .filter(row => row[0])
            .map(row => ({
              title: row[0],
              items:
                (row[1] || '')
                  .split(',')
                  .map(value =>
                    value.trim()
                  )
                  .filter(Boolean)
            }));

        await publish();
      }
    );

  /* EDUCATION */

  body
    .querySelector('#admin-education')
    ?.addEventListener(
      'submit',
      async event => {
        event.preventDefault();

        const text =
          body.querySelector(
            '#admin-education-text'
          )?.value || '';

        portfolio.education =
          text
            .split('\n')
            .map(line =>
              line
                .split('|')
                .map(value =>
                  value.trim()
                )
            )
            .filter(row => row[0])
            .map(row => ({
              institution: row[0],
              degree: row[1] || '',
              status: row[2] || '',
              details: row[3] || ''
            }));

        await publish();
      }
    );

  /* ACHIEVEMENTS */

  body
    .querySelector('#admin-achievements')
    ?.addEventListener(
      'submit',
      async event => {
        event.preventDefault();

        const text =
          body.querySelector(
            '#admin-achievements-text'
          )?.value || '';

        portfolio.achievements =
          text
            .split('\n')
            .map(value =>
              value.trim()
            )
            .filter(Boolean);

        await publish();
      }
    );

  /* JOURNEY */

  body
    .querySelector('#admin-journey')
    ?.addEventListener(
      'submit',
      async event => {
        event.preventDefault();

        const text =
          body.querySelector(
            '#admin-journey-text'
          )?.value || '';

        portfolio.journey =
          text
            .split('\n')
            .map(line =>
              line
                .split('|')
                .map(value =>
                  value.trim()
                )
            )
            .filter(row => row[0])
            .map(row => ({
              title: row[0],
              detail: row[1] || ''
            }));

        await publish();
      }
    );

  /* ADD PROJECT */

  body
    .querySelector('#add-project')
    ?.addEventListener(
      'click',
      () => {
        portfolio.projects.push({
          id: `project-${Date.now()}`,
          name: 'New Project',
          description: '',
          role: 'Solo Developer',
          status: 'In Progress',
          technologies: [],
          liveUrl: '',
          githubUrl: '',
          image: '',
          featured: false,
          category: 'Web Application',
          dates: '',
          problem: '',
          intervention: '',
          outcome: ''
        });

        renderWindow('control');
      }
    );

  /* DELETE PROJECT */

  body
    .querySelectorAll('[data-del-project]')
    .forEach(button => {
      button.addEventListener(
        'click',
        () => {
          const index =
            Number(
              button.dataset.delProject
            );

          if (
            Number.isNaN(index) ||
            !portfolio.projects[index]
          ) {
            return;
          }

          portfolio.projects.splice(
            index,
            1
          );

          renderWindow('control');
        }
      );
    });

  /* SAVE PROJECTS */

  body
    .querySelector('#save-projects')
    ?.addEventListener(
      'click',
      async () => {
        body
          .querySelectorAll('.admin-project')
          .forEach(card => {
            const index =
              Number(card.dataset.i);

            const project =
              portfolio.projects[index];

            if (!project) return;

            card
              .querySelectorAll(
                '[data-project]'
              )
              .forEach(input => {
                const key =
                  input.dataset.project;

                if (key === 'featured') {
                  project.featured =
                    input.checked;
                } else if (
                  key === 'technologies'
                ) {
                  project.technologies =
                    input.value
                      .split(',')
                      .map(value =>
                        value.trim()
                      )
                      .filter(Boolean);
                } else {
                  project[key] =
                    input.value;
                }
              });
          });

        await publish();
      }
    );
}

/* =========================================================
   PUBLISH
   ========================================================= */

async function publish() {
  try {
    await saveRemotePortfolio(
      portfolio
    );

    renderAll();

    alert(
      'Published successfully. Refresh the public portfolio to see your latest changes.'
    );
  } catch (error) {
    alert(
      error?.message ||
      'Could not publish changes.'
    );
  }
}

/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {
  renderIdentity();
  renderAppGrid();
}

/* =========================================================
   CONTROL WINDOW
   ========================================================= */

function openControlWindow() {
  openWindow('control');

  const win =
    state.windows.get('control');

  if (win) {
    wireAdmin(win.body);
  }
}

/* =========================================================
   THEME
   ========================================================= */

function setTheme() {
  if (state.theme === 'dark') {
    state.theme = 'night';
  } else if (
    state.theme === 'night'
  ) {
    state.theme = 'day';
  } else {
    state.theme = 'dark';
  }

  document.documentElement.dataset.theme =
    state.theme;

  localStorage.setItem(
    'tayassuk-os-theme-v2',
    state.theme
  );
}

/* =========================================================
   SEARCH
   ========================================================= */

function openSearch() {
  const overlay =
    document.querySelector(
      '#command-palette'
    );

  if (!overlay) return;

  overlay.classList.remove('hidden');

  overlay.innerHTML = `
    <div class="command-palette">

      <input
        id="command-input"
        class="command-search"
        placeholder="Search apps, projects, skills…"
        autocomplete="off"
      />

      <div
        id="command-list"
        class="command-list"
      ></div>

    </div>
  `;

  const all = [
    ...apps.map(app => ({
      title: app.name,
      desc: app.desc,
      type: 'app',
      action: () =>
        app.id === 'control'
          ? openControlWindow()
          : openWindow(app.id)
    })),

    ...portfolio.projects.map(project => ({
      title: project.name,
      desc: 'Project',
      type: 'project',
      action: () =>
        openWindow('projects')
    })),

    ...portfolio.skills.flatMap(
      group =>
        group.items.map(skill => ({
          title: skill,
          desc: group.title,
          type: 'skill',
          action: () =>
            openWindow('skills')
        }))
    )
  ];

  const input =
    overlay.querySelector(
      '#command-input'
    );

  const list =
    overlay.querySelector(
      '#command-list'
    );

  function renderResults() {
    const query =
      input.value
        .toLowerCase()
        .trim();

    const filtered =
      all.filter(item =>
        `${item.title} ${item.desc}`
          .toLowerCase()
          .includes(query)
      );

    list.innerHTML =
      filtered
        .map(
          (item, index) => `
            <button
              type="button"
              class="command-item"
              data-search-index="${index}"
            >
              <span>
                ${esc(item.title)}
              </span>

              <small>
                ${esc(item.type)}
              </small>
            </button>
          `
        )
        .join('') ||
      `
        <div class="command-item">
          No results
        </div>
      `;

    list
      .querySelectorAll(
        '[data-search-index]'
      )
      .forEach(button => {
        button.addEventListener(
          'click',
          () => {
            const index =
              Number(
                button.dataset.searchIndex
              );

            const selected =
              filtered[index];

            if (!selected) return;

            selected.action();

            overlay.classList.add(
              'hidden'
            );
          }
        );
      });
  }

  input.addEventListener(
    'input',
    renderResults
  );

  input.addEventListener(
    'keydown',
    event => {
      if (event.key === 'Escape') {
        overlay.classList.add(
          'hidden'
        );
      }
    }
  );

  renderResults();

  input.focus();
}

/* =========================================================
   GLOBAL CLICK EVENTS
   ========================================================= */

function wireEvents() {
  /*
    ONE global click handler.
    This avoids multiple competing document listeners.
  */

  document.addEventListener(
    'click',
    event => {
      const target =
        event.target.closest(
          '[data-action]'
        );

      if (!target) return;

      const action =
        target.dataset.action;

      if (action === 'open') {
        const app =
          target.dataset.app;

        if (!app) return;

        event.preventDefault();

        if (app === 'control') {
          openControlWindow();
        } else {
          openWindow(app);
        }

        return;
      }

      if (action === 'search') {
        event.preventDefault();
        openSearch();
        return;
      }

      if (action === 'theme') {
        event.preventDefault();
        setTheme();
      }
    }
  );

  /*
    Window focus
  */

  document.addEventListener(
    'pointerdown',
    event => {
      const windowNode =
        event.target.closest(
          '.app-window'
        );

      if (!windowNode) return;

      const found =
        [...state.windows.entries()]
          .find(
            ([, windowData]) =>
              windowData.node ===
              windowNode
          );

      if (found) {
        focusWindow(found[0]);
      }
    }
  );

  /*
    Keyboard shortcuts
  */

  document.addEventListener(
    'keydown',
    event => {
      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();
        openSearch();
      }

      if (
        event.key === 'Escape'
      ) {
        const overlay =
          document.querySelector(
            '#command-palette'
          );

        overlay?.classList.add(
          'hidden'
        );
      }
    }
  );
}

wireEvents();

/* =========================================================
   LOAD SUPABASE / REMOTE CONTENT
   ========================================================= */

(async () => {
  let session = null;

  try {
    session =
      await getSession();
  } catch (error) {
    console.warn(
      'Session check failed; continuing in public mode.',
      error
    );
  }

  state.adminSession =
    session || null;

  try {
    await loadRemote();
  } catch (error) {
    console.warn(
      'Remote portfolio load failed; using local content.',
      error
    );
  }

  renderAll();

  const bootBar =
    document.querySelector(
      '#boot-progress-bar'
    );

  let progress = 0;

  const interval =
    setInterval(() => {
      progress =
        Math.min(
          100,
          progress + 8
        );

      if (bootBar) {
        bootBar.style.width =
          `${progress}%`;
      }

      if (progress >= 100) {
        clearInterval(interval);

        window.__finishTayassukBoot?.();
      }
    }, 90);
})();

/* =========================================================
   REMOTE PORTFOLIO
   ========================================================= */

async function loadRemote() {
  try {
    const result =
      await loadRemotePortfolio();

    if (result?.data) {
      portfolio =
        mergePortfolio(
          fallbackPortfolio,
          result.data
        );
    }

    renderAll();
  } catch (error) {
    console.warn(
      'Remote load failed:',
      error
    );
  }
}

/* =========================================================
   MERGE
   ========================================================= */

function mergePortfolio(
  base,
  remote
) {
  return {
    owner: {
      ...base.owner,
      ...remote.owner,

      identity: {
        ...base.owner.identity,
        ...(remote.owner?.identity || {})
      },

      contact: {
        ...base.owner.contact,
        ...(remote.owner?.contact || {})
      },

      learning:
        remote.owner?.learning ||
        base.owner.learning,

      focus:
        remote.owner?.focus ||
        base.owner.focus
    },

    projects:
      Array.isArray(
        remote.projects
      )
        ? remote.projects
        : base.projects,

    education:
      Array.isArray(
        remote.education
      )
        ? remote.education
        : base.education,

    skills:
      Array.isArray(
        remote.skills
      )
        ? remote.skills
        : base.skills,

    achievements:
      Array.isArray(
        remote.achievements
      )
        ? remote.achievements
        : base.achievements,

    journey:
      Array.isArray(
        remote.journey
      )
        ? remote.journey
        : base.journey
  };
}
