import { pool } from '../config/db.js';

/* -------------------------------------------------------------------- Users */

const userSelect = `
  SELECT
    u.id, u.full_name, u.email, u.phone, u.city, u.role, u.created_at,
    c.id AS customer_id, c.address AS customer_address,
    p.id AS provider_id, p.category_id AS provider_category_id,
    p.experience_years, p.address AS provider_address, p.description,
    p.rating, p.review_count, p.is_featured,
    cat.name AS category_name, cat.slug AS category_slug
  FROM users u
  LEFT JOIN customers c ON c.user_id = u.id
  LEFT JOIN service_providers p ON p.user_id = u.id
  LEFT JOIN categories cat ON cat.id = p.category_id
`;

export function mapUserRow(row) {
  const isProvider = row.role === 'provider';

  return {
    id: Number(row.id),
    role: row.role,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    address: (isProvider ? row.provider_address : row.customer_address) || '',
    customerId: row.customer_id == null ? null : Number(row.customer_id),
    providerId: row.provider_id == null ? null : Number(row.provider_id),
    category: row.category_slug || null,
    categoryId:
      row.provider_category_id == null
        ? null
        : Number(row.provider_category_id),
    category_name: row.category_name || null,
    category_slug: row.category_slug || null,
    experience_years:
      row.experience_years == null ? null : Number(row.experience_years),
    description: row.description || '',
    rating: Number(row.rating) || 0,
    review_count: Number(row.review_count) || 0,
    is_featured: Boolean(row.is_featured),
    created_at: row.created_at,
  };
}

export async function getUserById(id) {
  const [rows] = await pool.query(`${userSelect} WHERE u.id = ? LIMIT 1`, [id]);
  return rows.length ? mapUserRow(rows[0]) : null;
}

export async function getCustomerByUserId(userId) {
  const [rows] = await pool.query(
    'SELECT id, address FROM customers WHERE user_id = ? LIMIT 1',
    [userId],
  );
  return rows[0] || null;
}

export async function getProviderByUserId(userId) {
  const [rows] = await pool.query(
    'SELECT id, category_id FROM service_providers WHERE user_id = ? LIMIT 1',
    [userId],
  );
  return rows[0] || null;
}

/* ----------------------------------------------------------------- Bookings */

export const bookingSelect = `
  SELECT
    b.id, b.status, b.problem_description, b.preferred_date, b.address,
    b.contact_number, b.created_at, b.updated_at,
    s.id AS service_id, s.title AS service_title, s.price, s.duration_minutes,
    p.id AS provider_id,
    pu.full_name AS provider_name, pu.phone AS provider_phone,
    pu.city AS provider_city,
    c.id AS customer_id,
    cu.full_name AS customer_name, cu.phone AS customer_phone,
    cu.email AS customer_email,
    cat.name AS category_name, cat.slug AS category_slug,
    r.id AS review_id, r.rating AS review_rating
  FROM bookings b
  JOIN services s ON s.id = b.service_id
  JOIN service_providers p ON p.id = b.provider_id
  JOIN users pu ON pu.id = p.user_id
  JOIN customers c ON c.id = b.customer_id
  JOIN users cu ON cu.id = c.user_id
  JOIN categories cat ON cat.id = s.category_id
  LEFT JOIN reviews r ON r.booking_id = b.id
`;

export function mapBookingRow(row) {
  return {
    ...row,
    id: Number(row.id),
    service_id: Number(row.service_id),
    provider_id: Number(row.provider_id),
    customer_id: Number(row.customer_id),
    price: row.price == null ? null : Number(row.price),
    duration_minutes: Number(row.duration_minutes) || 0,
    review_id: row.review_id == null ? null : Number(row.review_id),
    review_rating:
      row.review_rating == null ? null : Number(row.review_rating),
  };
}

export async function getBookingById(id) {
  const [rows] = await pool.query(`${bookingSelect} WHERE b.id = ? LIMIT 1`, [
    id,
  ]);
  return rows.length ? mapBookingRow(rows[0]) : null;
}

/* ----------------------------------------------------------------- Services */

export const serviceSelect = `
  SELECT
    s.id, s.title, s.description, s.price, s.duration_minutes, s.is_active,
    s.created_at, s.updated_at,
    s.provider_id, s.category_id,
    u.full_name AS provider_name, u.city AS provider_city,
    p.rating, p.review_count, p.experience_years,
    cat.name AS category_name, cat.slug AS category_slug
  FROM services s
  JOIN service_providers p ON p.id = s.provider_id
  JOIN users u ON u.id = p.user_id
  JOIN categories cat ON cat.id = s.category_id
`;

export function mapServiceRow(row) {
  return {
    ...row,
    id: Number(row.id),
    provider_id: Number(row.provider_id),
    category_id: Number(row.category_id),
    price: Number(row.price),
    duration_minutes: Number(row.duration_minutes) || 0,
    rating: Number(row.rating) || 0,
    review_count: Number(row.review_count) || 0,
    is_active: Boolean(row.is_active),
  };
}

export async function getServiceById(id, { activeOnly = false } = {}) {
  const clause = activeOnly ? 'AND s.is_active = 1' : '';
  const [rows] = await pool.query(
    `${serviceSelect} WHERE s.id = ? ${clause} LIMIT 1`,
    [id],
  );
  return rows.length ? mapServiceRow(rows[0]) : null;
}

/* ------------------------------------------------------------------ Reviews */

export async function refreshProviderRating(providerId) {
  const [rows] = await pool.query(
    `SELECT ROUND(AVG(rating), 2) AS rating, COUNT(*) AS review_count
     FROM reviews WHERE provider_id = ?`,
    [providerId],
  );

  const aggregate = rows[0];
  const rating = aggregate.rating == null ? 0 : Number(aggregate.rating);

  await pool.query(
    'UPDATE service_providers SET rating = ?, review_count = ? WHERE id = ?',
    [rating, Number(aggregate.review_count) || 0, providerId],
  );
}
