import { HttpError } from './http.js';

const asText = (value) => (typeof value === 'string' ? value.trim() : '');

export function requiredString(value, label, { min = 1, max = 255 } = {}) {
  const text = asText(value);

  if (!text) {
    throw new HttpError(422, `${label} is required.`);
  }
  if (text.length < min) {
    throw new HttpError(
      422,
      `${label} must be at least ${min} characters.`,
    );
  }
  if (text.length > max) {
    throw new HttpError(
      422,
      `${label} must be ${max} characters or fewer.`,
    );
  }

  return text;
}

export function emailValue(value) {
  const text = asText(value).toLowerCase();

  if (!text) {
    throw new HttpError(422, 'Email address is required.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(text) || text.length > 120) {
    throw new HttpError(422, 'Enter a valid email address.');
  }

  return text;
}

export function phoneValue(value) {
  const raw = asText(value);
  const compact = raw.replace(/[\s-]/g, '');

  if (!/^(?:\+91)?[6-9]\d{9}$/.test(compact)) {
    throw new HttpError(422, 'Enter a valid 10-digit Indian mobile number.');
  }

  return raw;
}

export function integerValue(value, label, { min, max }) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < min || number > max) {
    throw new HttpError(422, `${label} must be between ${min} and ${max}.`);
  }

  return number;
}

export function moneyValue(value, label, { min, max }) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < min || number > max) {
    throw new HttpError(
      422,
      `${label} must be between ${min} and ${max}.`,
    );
  }

  return Math.round(number * 100) / 100;
}

export function dateValue(value) {
  const text = asText(value);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new HttpError(422, 'Choose a valid date.');
  }

  const date = new Date(`${text}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(422, 'Choose a valid date.');
  }

  return text;
}

export function todayString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 10);
}

export function futureDate(value) {
  const text = dateValue(value);

  if (text < todayString()) {
    throw new HttpError(422, 'Choose today or a future date.');
  }

  return text;
}

export function oneOf(value, allowed, label) {
  const text = asText(value);

  if (!allowed.includes(text)) {
    throw new HttpError(422, `${label} is not valid.`);
  }

  return text;
}

export function positiveId(value) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    throw new HttpError(404, 'We could not find what you were looking for.');
  }

  return number;
}

/** Trimmed query-string value with a hard length cap. */
export function queryText(value, max = 120) {
  return asText(value).slice(0, max);
}

/** Builds a safe LIKE pattern (backslash is MySQL's default escape). */
export function likeValue(value) {
  const text = asText(value).replace(/[\\%_]/g, '\\$&');
  return `%${text}%`;
}
