/**
 * TrustFix icon set.
 * Small, hand-written stroke icons so the whole UI shares one visual language.
 * Every icon uses currentColor and a 24x24 viewBox.
 */

const paths = {
  bolt: '<path d="M13.2 2.8 4.9 13.4h5.8l-1 7.8 8.4-10.6h-5.9l1-7.8Z"/>',
  droplet:
    '<path d="M12 3.2c3.5 3.9 5.6 6.7 5.6 9.3a5.6 5.6 0 1 1-11.2 0c0-2.6 2.1-5.4 5.6-9.3Z"/>',
  wind: '<path d="M3.5 8h9.8a3 3 0 1 0-2.9-3.8M3.5 12h13.9a3 3 0 1 1-2.9 3.8M3.5 16h6.3"/>',
  spray:
    '<path d="M8 8.5h6.5a2 2 0 0 1 2 2V20H6v-9.5a2 2 0 0 1 2-2Z"/><path d="M9.5 8.5V5.2h3.2v3.3M12.7 5.2V3h3.6M6 12h10.5M18.5 8.5h1.8M18.5 12h1.8"/>',
  hammer:
    '<path d="m13.6 4.1 6.3 6.3-2.6 2.6-6.3-6.3 2.6-2.6Z"/><path d="M11.6 7.1 3.4 15.3a1.9 1.9 0 0 0 0 2.7l2.6 2.6a1.9 1.9 0 0 0 2.7 0l8.2-8.2"/>',
  roller:
    '<rect x="4" y="4.5" width="13" height="5.5" rx="1.5"/><path d="M17 7.2h2.6a1.4 1.4 0 0 1 1.4 1.4v3.2a1.4 1.4 0 0 1-1.4 1.4H12a1.4 1.4 0 0 0-1.4 1.4v2M10.6 17.5h-2v3.3h2v-3.3Z"/>',
  appliance:
    '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="13" r="4.2"/><path d="M8 6.5h.01M11 6.5h.01"/>',
  monitor:
    '<rect x="3" y="4" width="18" height="12.5" rx="2"/><path d="M9 20.5h6M12 16.5v4"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  pin: '<path d="M19 10.2c0 5.3-7 11.3-7 11.3s-7-6-7-11.3a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.6"/>',
  star: '<path d="m12 3.2 2.7 5.5 6 .9-4.4 4.3 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.3 6-.9L12 3.2Z"/>',
  check: '<path d="m4.5 12.5 5 5 10-10.5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.7 2.7 5.5-5.9"/>',
  arrowRight: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.5 2"/>',
  phone:
    '<path d="M6.4 3.5h3l1.5 4-2 1.5a12.5 12.5 0 0 0 6.1 6.1l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.4 5.7a2 2 0 0 1 2-2.2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.6-4 3.4-6.2 7.5-6.2s6.9 2.2 7.5 6.2"/>',
  users:
    '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.8 19.8c.5-3.5 2.8-5.5 6.2-5.5s5.7 2 6.2 5.5M16 5.5a3.2 3.2 0 0 1 0 6.2M17.5 14.6c2 .5 3.3 2.2 3.7 4.9"/>',
  shield: '<path d="M12 3 20 6v5.5c0 5-3.4 8.2-8 9.5-4.6-1.3-8-4.5-8-9.5V6l8-3Z"/>',
  shieldCheck:
    '<path d="M12 3 20 6v5.5c0 5-3.4 8.2-8 9.5-4.6-1.3-8-4.5-8-9.5V6l8-3Z"/><path d="m8.5 12 2.4 2.4 4.6-5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="m14.5 4.5 5 5L8 21H3v-5L14.5 4.5Z"/><path d="m12.5 6.5 5 5"/>',
  trash:
    '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5"/>',
  logout:
    '<path d="M14 8V5.5A1.5 1.5 0 0 0 12.5 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20h7a1.5 1.5 0 0 0 1.5-1.5V16M10 12h11M17.5 8.5 21 12l-3.5 3.5"/>',
  dashboard:
    '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>',
  briefcase:
    '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18M10.5 12v2h3v-2"/>',
  message:
    '<path d="M20.5 12.2c0 4-3.8 7.2-8.5 7.2-1 0-2-.1-2.9-.4L4 21l1.2-3.6A7 7 0 0 1 3.5 12.2C3.5 8.2 7.3 5 12 5s8.5 3.2 8.5 7.2Z"/>',
  quote:
    '<path d="M9.5 6.5C6.5 8 5 10.4 5 13.5c0 2.3 1.2 4 3.2 4 1.8 0 3.1-1.3 3.1-3.1 0-1.7-1.2-3-2.8-3-.3 0-.6 0-.8.1.4-1.4 1.5-2.6 3.2-3.5M19 6.5c-3 1.5-4.5 3.9-4.5 7 0 2.3 1.2 4 3.2 4 1.8 0 3.1-1.3 3.1-3.1 0-1.7-1.2-3-2.8-3-.3 0-.6 0-.8.1.4-1.4 1.5-2.6 3.2-3.5"/>',
  wrench:
    '<path d="M14.7 6.3a4.2 4.2 0 0 0 5.3 5.3L11 20.6a2.8 2.8 0 0 1-4-4l9-9Z"/><path d="m15.5 2.8 1.7 3.4 3.7.5-2.7 2.6.6 3.7-3.3-1.8-3.3 1.8.6-3.7-2.7-2.6 3.7-.5 1.7-3.4Z"/>',
  home: '<path d="m3.5 10.5 8.5-7 8.5 7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9.5Z"/>',
  sparkles:
    '<path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3ZM18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2ZM5 15l.7 1.8 1.8.7-1.8.7L5 20l-.7-1.8-1.8-.7 1.8-.7L5 15Z"/>',
  receipt:
    '<path d="M6 3h12v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3L6 21V3Z"/><path d="M9.5 8h5M9.5 12h5"/>',
  badgeCheck:
    '<path d="M12 2.8l2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.7 2.6.7 2.6-2.3 1.4-1 2.5-2.7-.2L12 20.2l-2.2-1.6-2.7.2-1-2.5-2.3-1.4.7-2.6-.7-2.6 2.3-1.4 1-2.5 2.7.2L12 2.8Z"/><path d="m9 11.8 2 2 4-4.3"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  eye: '<path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:
    '<path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.4 3.2M6.2 6.2C3.8 7.9 2.5 12 2.5 12S6 18 12 18c1.4 0 2.6-.3 3.8-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16.2h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8h.01"/>',
  lock: '<rect x="4.5" y="10" width="15" height="10.5" rx="2"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10M12 14v3"/>',
  building:
    '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10.5 21v-3h3v3"/>',
  trend: '<path d="m3 16 5.5-5.5 4 4L21 6M15.5 6H21v5.5"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.4-5.7M20 3.5V8h-4.5"/>',
  send: '<path d="m21 3-9.5 18-2.2-7.3L2 11.5 21 3Z"/><path d="m9.3 13.7 4.9-4.9"/>',
  heart: '<path d="M12 20.5S3.5 15.6 3.5 9.8a4.7 4.7 0 0 1 8.5-2.6 4.7 4.7 0 0 1 8.5 2.6c0 5.8-8.5 10.7-8.5 10.7Z"/>',
  map: '<path d="M9 4.5 3.5 7v13L9 17.5l6 2.5 5.5-2.5v-13L15 7 9 4.5Z"/><path d="M9 4.5v13M15 7v13"/>',
};

const categoryIcons = {
  electrician: 'bolt',
  plumbing: 'droplet',
  'ac-repair': 'wind',
  'home-cleaning': 'spray',
  carpentry: 'hammer',
  painting: 'roller',
  'appliance-repair': 'appliance',
  'computer-repair': 'monitor',
};

export function icon(name, className = 'h-5 w-5') {
  const path = paths[name] || paths.wrench;
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

export function categoryIcon(slug, className) {
  return icon(categoryIcons[slug] || 'wrench', className);
}

export function starIcon(className = 'h-4 w-4') {
  return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3.2 2.7 5.5 6 .9-4.4 4.3 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.3 6-.9L12 3.2Z"/></svg>`;
}

export { paths, categoryIcons };
