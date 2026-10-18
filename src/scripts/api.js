/**
 * TrustFix API client + shared session helpers.
 * The frontend is a static Astro build; pages talk to the Express REST API.
 */

const API_BASE = (
  import.meta.env.PUBLIC_API_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '');

const TOKEN_KEY = 'trustfix.token';
const USER_KEY = 'trustfix.user';

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/* ------------------------------------------------------------------ Session */

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getCachedUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSession = (token, user) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* storage can be unavailable in private mode */
  }
};

export const updateCachedUser = (user) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
};

export const dashboardFor = (role) =>
  role === 'provider' ? '/dashboard/provider' : '/dashboard/customer';

export const loginUrl = (next) =>
  next ? `/login?next=${encodeURIComponent(next)}` : '/login';

export const redirectToLogin = (next = window.location.pathname + window.location.search) => {
  window.location.replace(loginUrl(next));
};

/* ------------------------------------------------------------------ Request */

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let payload = body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: payload,
    });
  } catch {
    throw new ApiError(
      'We could not reach the TrustFix server. Make sure the API is running.',
      0,
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* empty or non-JSON response */
  }

  if (!response.ok) {
    const message =
      data?.message || `Request failed (${response.status}). Please try again.`;
    throw new ApiError(message, response.status, data?.errors || null);
  }

  return data;
}

/* --------------------------------------------------------------------- Auth */

export async function fetchMe() {
  const data = await apiFetch('/auth/me');
  return data.user;
}

/**
 * Confirms the session with the API and enforces a role.
 * Returns the user object, or null after redirecting.
 */
export async function requireRole(role) {
  if (!getToken()) {
    redirectToLogin();
    return null;
  }

  try {
    const user = await fetchMe();
    setSession(getToken(), user);

    if (role && user.role !== role) {
      window.location.replace(dashboardFor(user.role));
      return null;
    }

    return user;
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      clearSession();
      redirectToLogin();
      return null;
    }
    throw error;
  }
}

export async function logout() {
  clearSession();
  window.location.replace('/');
}

/* --------------------------------------------------------------- Formatters */

export const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (value) =>
  new Intl.NumberFormat('en-IN').format(Number(value) || 0);

export const formatDate = (value, options = {}) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${formatDate(date)} · ${new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)}`;
};

export const formatDuration = (minutes) => {
  const mins = Number(minutes) || 0;
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
};

export const todayInputValue = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
};

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'TF';

export const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const statusBadge = (status) =>
  `<span class="badge badge-${escapeHtml(status)}">${escapeHtml(
    statusLabels[status] || status,
  )}</span>`;

export const CATEGORIES = [
  {
    id: 1,
    name: 'Electrician',
    slug: 'electrician',
    description: 'Wiring, switches, fans and electrical fixes.',
  },
  {
    id: 2,
    name: 'Plumbing',
    slug: 'plumbing',
    description: 'Leaks, taps, drains and pipe installations.',
  },
  {
    id: 3,
    name: 'AC Repair',
    slug: 'ac-repair',
    description: 'Servicing, gas refills and cooling repairs.',
  },
  {
    id: 4,
    name: 'Home Cleaning',
    slug: 'home-cleaning',
    description: 'Deep cleaning for homes and apartments.',
  },
  {
    id: 5,
    name: 'Carpentry',
    slug: 'carpentry',
    description: 'Furniture repair, fittings and custom woodwork.',
  },
  {
    id: 6,
    name: 'Painting',
    slug: 'painting',
    description: 'Interior and exterior painting with clean finishes.',
  },
  {
    id: 7,
    name: 'Appliance Repair',
    slug: 'appliance-repair',
    description: 'Washing machines, fridges and microwaves.',
  },
  {
    id: 8,
    name: 'Computer Repair',
    slug: 'computer-repair',
    description: 'Laptop servicing, upgrades and troubleshooting.',
  },
];

export const CATEGORY_NAMES = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category.name]),
);
