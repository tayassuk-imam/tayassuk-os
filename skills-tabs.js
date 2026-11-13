/* Tayassuk OS — dashboard Skills tabs. Uses the editable source data. */
import { skillCategories } from './content/skill-categories.js';

(function () {
  'use strict';

  var categories = skillCategories;

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function initSkillsTabs() {
    var card = document.querySelector('.skills-card-mini');
    if (!card || card.dataset.skillsTabsReady === 'true') return;

    var tabs = card.querySelector('.skill-tabs');
    if (!tabs) return;
    card.dataset.skillsTabsReady = 'true';

    card.querySelectorAll('.skill-mini').forEach(function (node) { node.remove(); });

    var rows = document.createElement('div');
    rows.className = 'skill-rows';
    rows.setAttribute('aria-live', 'polite');
    tabs.insertAdjacentElement('afterend', rows);

    tabs.innerHTML = categories.map(function (category, index) {
      return '<button type="button" role="tab" class="skill-tab' + (index === 0 ? ' active' : '') + '"' +
        ' data-cat="' + category.id + '" aria-selected="' + (index === 0 ? 'true' : 'false') + '">' +
        escapeHTML(category.label) + '</button>';
    }).join('');
    tabs.setAttribute('role', 'tablist');

    function showCategory(id) {
      var category = categories.find(function (item) { return item.id === id; }) || categories[0];
      tabs.querySelectorAll('.skill-tab').forEach(function (button) {
        var active = button.dataset.cat === category.id;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      rows.innerHTML = category.items.map(function (skill) {
        var level = Math.max(0, Math.min(100, Number(skill.level) || 0));
        return '<div class="skill-mini"><span>' + escapeHTML(skill.name) +
          '</span><div class="progress-track"><span data-w="' + level + '" style="width:0%"></span></div></div>';
      }).join('');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          rows.querySelectorAll('[data-w]').forEach(function (bar) { bar.style.width = bar.dataset.w + '%'; });
        });
      });
    }

    tabs.addEventListener('click', function (event) {
      var button = event.target.closest('.skill-tab');
      if (!button || !tabs.contains(button)) return;
      event.preventDefault();
      event.stopPropagation();
      showCategory(button.dataset.cat);
    });

    showCategory(categories[0].id);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSkillsTabs, { once: true });
  } else {
    initSkillsTabs();
  }
})();
