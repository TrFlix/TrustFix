/**
 * Client-side card renderers.
 * All database-provided strings are escaped before they reach innerHTML.
 */
import {
  escapeHtml,
  formatCurrency,
  formatDate,
  formatDuration,
  statusBadge,
  initials,
} from './api.js';
import { categoryIcon, icon, starIcon } from './icons.js';

const avatarTones = [
  'bg-navy-tint text-navy',
  'bg-teal-soft text-teal-deep',
  'bg-amber-soft text-amber-ink',
  'bg-info-soft text-info-ink',
];

export function avatarHtml(name, sizeClass = 'h-14 w-14 text-base') {
  const seed = [...(name || 'TF')].reduce((total, char) => total + char.charCodeAt(0), 0);
  const tone = avatarTones[seed % avatarTones.length];
  return `<span class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${tone} ${sizeClass}" aria-hidden="true">${escapeHtml(
    initials(name),
  )}</span>`;
}

export function starsHtml(rating, reviewCount = null, extra = '') {
  const value = Number(rating) || 0;
  const count =
    reviewCount === null || reviewCount === undefined
      ? ''
      : `<span class="text-[12px] text-mute">(${Number(reviewCount)})</span>`;
  return `<span class="inline-flex items-center gap-1.5 ${extra}">
    <span class="text-amber" aria-hidden="true">${starIcon('h-3.5 w-3.5')}</span>
    <span class="text-[13px] font-medium text-ink">${value ? value.toFixed(1) : 'New'}</span>
    ${count}
  </span>`;
}

const categoryTones = {
  electrician: 'bg-amber-soft text-amber-ink',
  plumbing: 'bg-info-soft text-info-ink',
  'ac-repair': 'bg-teal-soft text-teal-deep',
  'home-cleaning': 'bg-teal-soft text-teal-deep',
  carpentry: 'bg-amber-soft text-amber-ink',
  painting: 'bg-navy-tint text-navy',
  'appliance-repair': 'bg-surface-soft text-body',
  'computer-repair': 'bg-info-soft text-info-ink',
};

export function categoryVisual(slug, categoryName) {
  const tone = categoryTones[slug] || 'bg-navy-tint text-navy';
  return `<div class="relative flex h-36 items-center justify-center overflow-hidden border-b border-hairline bg-canvas">
    <div class="absolute inset-0 opacity-60" style="background-image: radial-gradient(circle, rgba(11,31,58,.09) 1px, transparent 1px); background-size: 14px 14px;"></div>
    <span class="absolute -right-5 -bottom-6 text-[7rem] leading-none opacity-[0.05]" aria-hidden="true">${categoryIcon(slug, 'h-28 w-28')}</span>
    <span class="relative flex h-14 w-14 items-center justify-center rounded-xl border border-white/80 shadow-whisper ${tone}" aria-hidden="true">${categoryIcon(slug, 'h-7 w-7')}</span>
    <span class="absolute top-4 left-4 rounded-full border border-hairline bg-surface/90 px-2.5 py-1 text-[10px] font-medium tracking-[0.1em] text-mute uppercase backdrop-blur">${escapeHtml(
      categoryName || slug,
    )}</span>
  </div>`;
}

export function providerCard(provider) {
  const {
    id,
    full_name,
    category_name,
    category_slug,
    experience_years,
    city,
    rating,
    review_count,
    starting_price,
    services_count,
  } = provider;

  return `<article class="card card-hover flex h-full flex-col">
    <div class="flex items-start gap-4 p-5">
      ${avatarHtml(full_name, 'h-14 w-14 text-[15px]')}
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <h3 class="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">
            <a href="/provider?id=${id}" class="hover:text-teal-deep">${escapeHtml(full_name)}</a>
          </h3>
          <span class="inline-flex text-teal" title="Verified professional" aria-label="Verified professional">${icon('badgeCheck', 'h-4.5 w-4.5')}</span>
        </div>
        <p class="mt-0.5 truncate text-[13px] text-body">${escapeHtml(category_name)} · ${escapeHtml(city)}</p>
        <div class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          ${starsHtml(rating, review_count)}
          <span class="text-[12px] text-mute">${Number(experience_years) || 0} yrs exp</span>
        </div>
      </div>
    </div>
    <div class="mt-auto flex items-center justify-between gap-3 border-t border-hairline px-5 py-3.5">
      <div>
        <p class="text-[10px] font-medium tracking-[0.1em] text-mute uppercase">Starting at</p>
        <p class="mt-0.5 text-sm font-semibold text-ink">${formatCurrency(starting_price)} <span class="text-[11px] font-normal text-mute">/ service</span></p>
      </div>
      <a href="/provider?id=${id}" class="btn btn-outline btn-sm">View Profile ${icon('chevronRight', 'h-3.5 w-3.5')}</a>
    </div>
    ${
      services_count
        ? `<span class="sr-only">${Number(services_count)} services offered</span>`
        : ''
    }
  </article>`;
}

export function serviceCard(service) {
  const {
    id,
    title,
    description,
    price,
    duration_minutes,
    category_name,
    category_slug,
    provider_id,
    provider_name,
    provider_city,
    rating,
    review_count,
  } = service;

  return `<article class="card card-hover flex h-full flex-col overflow-hidden">
    <a href="/service?id=${id}" class="block focus-visible:outline-offset-[-2px]" aria-label="View ${escapeHtml(title)}">
      ${categoryVisual(category_slug, category_name)}
    </a>
    <div class="flex flex-1 flex-col p-5">
      <h3 class="text-[15px] font-semibold tracking-[-0.01em]">
        <a href="/service?id=${id}" class="hover:text-teal-deep">${escapeHtml(title)}</a>
      </h3>
      <p class="mt-1.5 line-clamp-2 text-[13px] leading-5 text-body">${escapeHtml(description || '')}</p>
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-mute">
        <a href="/provider?id=${provider_id}" class="truncate hover:text-teal-deep">${escapeHtml(provider_name)}</a>
        <span class="h-1 w-1 rounded-full bg-hairline-strong"></span>
        <span>${escapeHtml(provider_city)}</span>
        ${starsHtml(rating, review_count, 'ml-auto')}
      </div>
      <div class="mt-auto flex items-end justify-between gap-3 pt-4">
        <div>
          <p class="text-[10px] font-medium tracking-[0.1em] text-mute uppercase">Starting at</p>
          <p class="mt-0.5 text-base font-semibold text-ink">${formatCurrency(price)}</p>
          <p class="mt-0.5 text-[11px] text-mute">${formatDuration(duration_minutes)}</p>
        </div>
        <a href="/service?id=${id}" class="btn btn-outline btn-sm">Details ${icon('arrowRight', 'h-3.5 w-3.5')}</a>
      </div>
    </div>
  </article>`;
}

function bookingMeta(label, value, iconName) {
  return `<div class="flex items-start gap-2">
    <span class="mt-0.5 text-mute" aria-hidden="true">${icon(iconName, 'h-4 w-4')}</span>
    <div class="min-w-0">
      <p class="text-[10px] font-medium tracking-[0.08em] text-mute uppercase">${label}</p>
      <p class="mt-0.5 truncate text-[13px] text-ink">${value}</p>
    </div>
  </div>`;
}

export function customerBookingCard(booking) {
  const {
    id,
    status,
    service_title,
    price,
    provider_id,
    provider_name,
    category_name,
    preferred_date,
    address,
    problem_description,
    created_at,
    review_id,
  } = booking;

  const canCancel = status === 'pending' || status === 'accepted';
  const canReview = status === 'completed' && !review_id;

  return `<article class="card p-5" data-booking-id="${id}">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          ${statusBadge(status)}
          <span class="text-[11px] text-mute">Booking #TF-${String(id).padStart(4, '0')}</span>
        </div>
        <h3 class="mt-2 text-[15px] font-semibold text-ink">${escapeHtml(service_title || 'Service request')}</h3>
        <p class="mt-0.5 text-[13px] text-body">by <a href="/provider?id=${provider_id}" class="text-teal-deep hover:underline">${escapeHtml(provider_name)}</a> · ${escapeHtml(category_name || '')}</p>
      </div>
      <p class="text-right text-sm font-semibold text-ink">${formatCurrency(price)}</p>
    </div>

    <div class="mt-4 grid gap-3 rounded-lg border border-hairline bg-canvas/70 p-3.5 sm:grid-cols-2">
      ${bookingMeta('Preferred date', formatDate(preferred_date), 'calendar')}
      ${bookingMeta('Service address', escapeHtml(address), 'pin')}
    </div>

    ${
      problem_description
        ? `<p class="mt-3 line-clamp-2 text-[13px] leading-5 text-body">${escapeHtml(problem_description)}</p>`
        : ''
    }

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3.5">
      <p class="text-[11px] text-mute">Requested ${formatDate(created_at)}</p>
      <div class="flex flex-wrap gap-2">
        <a href="/provider?id=${provider_id}" class="btn btn-ghost btn-sm">View provider</a>
        ${
          canReview
            ? `<button type="button" class="btn btn-outline btn-sm" data-review-booking="${id}" data-provider-name="${escapeHtml(provider_name)}">Leave a review</button>`
            : ''
        }
        ${
          canCancel
            ? `<button type="button" class="btn btn-danger btn-sm" data-cancel-booking="${id}">Cancel request</button>`
            : ''
        }
      </div>
    </div>
  </article>`;
}

export function providerBookingCard(booking) {
  const {
    id,
    status,
    service_title,
    price,
    customer_name,
    customer_phone,
    customer_email,
    preferred_date,
    address,
    contact_number,
    problem_description,
    created_at,
  } = booking;

  let actions = '';
  if (status === 'pending') {
    actions = `
      <button type="button" class="btn btn-primary btn-sm" data-booking-action="accepted" data-booking-id="${id}">Accept request</button>
      <button type="button" class="btn btn-danger btn-sm" data-booking-action="rejected" data-booking-id="${id}">Decline</button>`;
  } else if (status === 'accepted') {
    actions = `<button type="button" class="btn btn-accent btn-sm" data-booking-action="in_progress" data-booking-id="${id}">Start work</button>`;
  } else if (status === 'in_progress') {
    actions = `<button type="button" class="btn btn-primary btn-sm" data-booking-action="completed" data-booking-id="${id}">Mark completed</button>`;
  }

  return `<article class="card p-5" data-booking-id="${id}">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex min-w-0 items-start gap-3">
        ${avatarHtml(customer_name, 'h-11 w-11 text-sm')}
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-[15px] font-semibold text-ink">${escapeHtml(customer_name)}</h3>
            ${statusBadge(status)}
          </div>
          <p class="mt-0.5 text-[13px] text-body">${escapeHtml(service_title || 'Service request')} · ${formatCurrency(price)}</p>
          <p class="mt-0.5 text-[11px] text-mute">Booking #TF-${String(id).padStart(4, '0')} · requested ${formatDate(created_at)}</p>
        </div>
      </div>
      ${
        actions
          ? `<div class="flex flex-wrap gap-2">${actions}</div>`
          : ''
      }
    </div>

    <div class="mt-4 grid gap-3 rounded-lg border border-hairline bg-canvas/70 p-3.5 sm:grid-cols-2 lg:grid-cols-4">
      ${bookingMeta('Preferred date', formatDate(preferred_date), 'calendar')}
      ${bookingMeta('Contact', `<a href="tel:${escapeHtml(contact_number || customer_phone)}" class="hover:text-teal-deep">${escapeHtml(contact_number || customer_phone)}</a>`, 'phone')}
      ${bookingMeta('Address', escapeHtml(address), 'pin')}
      ${bookingMeta('Email', `<a href="mailto:${escapeHtml(customer_email)}" class="hover:text-teal-deep">${escapeHtml(customer_email)}</a>`, 'mail')}
    </div>

    ${
      problem_description
        ? `<div class="mt-3 rounded-lg border border-hairline bg-surface-soft/60 px-3.5 py-3">
            <p class="text-[10px] font-medium tracking-[0.08em] text-mute uppercase">Reported problem</p>
            <p class="mt-1 text-[13px] leading-5 text-body">${escapeHtml(problem_description)}</p>
          </div>`
        : ''
    }
  </article>`;
}

export function reviewCard(review) {
  const stars = Array.from({ length: 5 }, (_, index) =>
    `<span class="${index < Number(review.rating) ? 'text-amber' : 'text-hairline-strong'}" aria-hidden="true">${starIcon('h-3.5 w-3.5')}</span>`,
  ).join('');

  return `<article class="border-b border-hairline py-5 last:border-0">
    <div class="flex items-start gap-3">
      ${avatarHtml(review.customer_name, 'h-10 w-10 text-xs')}
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-[13px] font-medium text-ink">${escapeHtml(review.customer_name)}</p>
          <p class="text-[11px] text-mute">${formatDate(review.created_at)}</p>
        </div>
        <div class="mt-1 flex items-center gap-0.5" aria-label="${Number(review.rating)} out of 5 stars">${stars}</div>
        <p class="mt-2 text-[13px] leading-5 text-body">${escapeHtml(review.comment || '')}</p>
        <p class="mt-1.5 text-[11px] text-mute">${escapeHtml(review.service_title || '')}</p>
      </div>
    </div>
  </article>`;
}

export function emptyState(title, message, actionHtml = '') {
  return `<div class="empty-state">
    <span class="flex h-11 w-11 items-center justify-center rounded-full bg-surface-soft text-mute">${icon('search', 'h-5 w-5')}</span>
    <h3 class="mt-4 text-sm font-semibold text-ink">${escapeHtml(title)}</h3>
    <p class="mt-1 max-w-sm text-[13px] leading-5 text-body">${escapeHtml(message)}</p>
    ${actionHtml ? `<div class="mt-5">${actionHtml}</div>` : ''}
  </div>`;
}

export function skeletonCards(count = 3) {
  return Array.from(
    { length: count },
    () => `<div class="card overflow-hidden">
      <div class="skeleton h-36 rounded-none"></div>
      <div class="space-y-3 p-5">
        <div class="skeleton h-4 w-3/4"></div>
        <div class="skeleton h-3 w-full"></div>
        <div class="skeleton h-3 w-1/2"></div>
        <div class="flex items-center justify-between pt-2">
          <div class="skeleton h-5 w-20"></div>
          <div class="skeleton h-8 w-24 rounded-full"></div>
        </div>
      </div>
    </div>`,
  ).join('');
}

export function errorState(message) {
  return `<div class="empty-state">
    <span class="flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-danger-ink">${icon('alert', 'h-5 w-5')}</span>
    <h3 class="mt-4 text-sm font-semibold text-ink">Something went wrong</h3>
    <p class="mt-1 max-w-sm text-[13px] leading-5 text-body">${escapeHtml(message)}</p>
  </div>`;
}
