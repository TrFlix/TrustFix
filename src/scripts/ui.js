/**
 * Small UI primitives shared by every page: site chrome, toasts, dialogs,
 * password visibility toggles and button loading states.
 */
import {
  clearSession,
  dashboardFor,
  escapeHtml,
  fetchMe,
  getCachedUser,
  getToken,
} from './api.js';
import { icon } from './icons.js';

/* --------------------------------------------------------------- Site chrome */

function initMobileMenu() {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    toggle.innerHTML = open ? icon('x', 'h-5 w-5') : icon('menu', 'h-5 w-5');
  };

  toggle.addEventListener('click', () =>
    setOpen(toggle.getAttribute('aria-expanded') !== 'true'),
  );

  menu.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => setOpen(false)),
  );

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) setOpen(false);
  });
}

function initGetStartedMenu() {
  const toggle = document.querySelector('[data-getstarted-toggle]');
  const menu = document.querySelector('[data-getstarted-menu]');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('click', (event) => {
    if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
}

function applyAuthState(user) {
  const isUser = Boolean(user);

  document.querySelectorAll('[data-auth-guest]').forEach((element) => {
    element.hidden = isUser;
  });

  document.querySelectorAll('[data-auth-user]').forEach((element) => {
    element.hidden = !isUser;
  });

  if (!isUser) return;

  document.querySelectorAll('[data-user-name]').forEach((element) => {
    element.textContent = user.full_name;
  });

  document.querySelectorAll('[data-user-first-name]').forEach((element) => {
    element.textContent = user.full_name.split(' ')[0];
  });

  document.querySelectorAll('[data-user-role]').forEach((element) => {
    element.textContent =
      user.role === 'provider' ? 'Service Provider' : 'Customer';
  });

  document.querySelectorAll('[data-user-avatar]').forEach((element) => {
    element.textContent = user.full_name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
  });

  document.querySelectorAll('[data-dashboard-link]').forEach((element) => {
    element.setAttribute('href', dashboardFor(user.role));
  });
}

function initAuthState() {
  const token = getToken();
  if (!token) {
    applyAuthState(null);
    return;
  }

  const cached = getCachedUser();
  if (cached) applyAuthState(cached);

  fetchMe()
    .then((user) => {
      try {
        localStorage.setItem('trustfix.user', JSON.stringify(user));
      } catch {
        /* ignore */
      }
      applyAuthState(user);
    })
    .catch((error) => {
      if (error.status === 401 || error.status === 403) {
        clearSession();
        applyAuthState(null);
      } else if (cached) {
        applyAuthState(cached);
      } else {
        applyAuthState(null);
      }
    });
}

function initLogout() {
  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      clearSession();
      window.location.replace('/');
    });
  });
}

function initPasswordToggles() {
  document.querySelectorAll('[data-toggle-password]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.togglePassword);
      if (!target) return;
      const visible = target.type === 'text';
      target.type = visible ? 'password' : 'text';
      button.innerHTML = visible ? icon('eye', 'h-4 w-4') : icon('eyeOff', 'h-4 w-4');
      button.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
    });
  });
}

export function initSiteChrome() {
  initMobileMenu();
  initGetStartedMenu();
  initAuthState();
  initLogout();
  initPasswordToggles();
}

/* ------------------------------------------------------------------- Toasts */

function toastRegion() {
  let region = document.getElementById('trustfix-toasts');
  if (!region) {
    region = document.createElement('div');
    region.id = 'trustfix-toasts';
    region.className =
      'pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:items-end';
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }
  return region;
}

export function showToast(message, type = 'info', timeout = 4200) {
  const region = toastRegion();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate-rise`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

  const iconName = type === 'success' ? 'checkCircle' : type === 'error' ? 'alert' : 'info';
  toast.innerHTML = `
    <span class="mt-0.5 shrink-0">${icon(iconName, 'h-4.5 w-4.5')}</span>
    <p class="flex-1 text-[13px] leading-5">${escapeHtml(message)}</p>
    <button type="button" class="shrink-0 rounded p-0.5 text-mute transition hover:text-ink" aria-label="Dismiss notification">
      ${icon('x', 'h-3.5 w-3.5')}
    </button>`;

  toast.querySelector('button').addEventListener('click', () => toast.remove());
  region.append(toast);

  if (timeout) window.setTimeout(() => toast.remove(), timeout);
  return toast;
}

/* ------------------------------------------------------------------ Dialog */

export function confirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
} = {}) {
  return new Promise((resolve) => {
    const dialog = document.createElement('dialog');
    dialog.className = 'dialog';
    dialog.innerHTML = `
      <form method="dialog" class="p-6">
        <div class="flex items-start gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            danger ? 'bg-danger-soft text-danger-ink' : 'bg-teal-soft text-teal-deep'
          }">${icon(danger ? 'alert' : 'info', 'h-5 w-5')}</span>
          <div>
            <h2 class="text-base font-semibold text-ink">${escapeHtml(title)}</h2>
            <p class="mt-1.5 text-[13px] leading-5 text-body">${escapeHtml(message)}</p>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="btn btn-outline btn-sm" data-confirm-cancel>${escapeHtml(cancelLabel)}</button>
          <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'} btn-sm" data-confirm-ok>${escapeHtml(confirmLabel)}</button>
        </div>
      </form>`;

    document.body.append(dialog);
    dialog.showModal();

    const close = (result) => {
      dialog.close();
      dialog.remove();
      resolve(result);
    };

    dialog.querySelector('[data-confirm-cancel]').addEventListener('click', () => close(false));
    dialog.querySelector('[data-confirm-ok]').addEventListener('click', () => close(true));
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      close(false);
    });
  });
}

/* ------------------------------------------------------------------ Buttons */

export function setLoading(button, loading, label = 'Please wait…') {
  if (!button) return;

  if (loading) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true"></span><span>${escapeHtml(label)}</span>`;
  } else {
    button.disabled = false;
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    }
  }
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}
