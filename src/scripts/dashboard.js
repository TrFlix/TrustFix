/**
 * Shared dashboard behaviour: account hydration and tab navigation that keeps
 * the URL shareable (?tab=...) without a full page reload.
 */
import { initials } from './api.js';

export function hydrateDashboardAccount(user) {
  document.querySelectorAll('[data-dashboard-name]').forEach((element) => {
    element.textContent = user.full_name;
  });

  document.querySelectorAll('[data-dashboard-email]').forEach((element) => {
    element.textContent = user.email;
  });

  document.querySelectorAll('[data-dashboard-avatar]').forEach((element) => {
    element.textContent = initials(user.full_name);
  });
}

/** Refreshes the identity shown in the site header after a profile update. */
export function hydrateSiteUser(user) {
  document.querySelectorAll('[data-user-name]').forEach((element) => {
    element.textContent = user.full_name;
  });

  document.querySelectorAll('[data-user-first-name]').forEach((element) => {
    element.textContent = user.full_name.split(' ')[0];
  });

  document.querySelectorAll('[data-user-avatar]').forEach((element) => {
    element.textContent = initials(user.full_name);
  });
}

export function initDashboardTabs({ fallback = 'overview', onChange }) {
  const links = [...document.querySelectorAll('[data-dashboard-tab]')];
  const tabs = new Set(links.map((link) => link.dataset.dashboardTab));

  const readTab = () => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    return tabs.has(tab) ? tab : fallback;
  };

  let current = readTab();

  const activate = (tab, { push = false, render = true } = {}) => {
    if (!tabs.has(tab)) return;
    current = tab;

    links.forEach((link) => {
      if (link.dataset.dashboardTab === tab) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    const url = new URL(window.location.href);
    if (tab === fallback) url.searchParams.delete('tab');
    else url.searchParams.set('tab', tab);

    if (push) window.history.pushState({ tab }, '', url);
    else window.history.replaceState({ tab }, '', url);

    if (render) onChange(tab);
  };

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }
      event.preventDefault();
      activate(link.dataset.dashboardTab, { push: true });
    });
  });

  window.addEventListener('popstate', () => {
    activate(readTab());
  });

  return {
    start: () => activate(current, { render: false }),
    show: (tab = current) => activate(tab, { render: false }),
    go: (tab) => activate(tab, { push: true }),
    get current() {
      return current;
    },
  };
}
