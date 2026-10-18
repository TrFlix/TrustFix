import { pool } from '../config/db.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import {
  getProviderByUserId,
  getServiceById,
  mapServiceRow,
  serviceSelect,
} from '../utils/queries.js';
import {
  integerValue,
  likeValue,
  moneyValue,
  positiveId,
  queryText,
  requiredString,
} from '../utils/validate.js';

const sortOptions = {
  recommended: 'p.rating DESC, p.review_count DESC, s.price ASC',
  rating: 'p.rating DESC, p.review_count DESC, s.price ASC',
  'price-low': 's.price ASC',
  'price-high': 's.price DESC',
  newest: 's.created_at DESC',
};

/* ---------------------------------------------------------------- Public list */

export const listServices = asyncHandler(async (req, res) => {
  const q = queryText(req.query.q);
  const city = queryText(req.query.city, 80);
  const category = queryText(req.query.category, 60);
  const sort = sortOptions[req.query.sort] ? req.query.sort : 'recommended';
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 60, 1),
    60,
  );

  const conditions = ['s.is_active = 1'];
  const params = [];

  if (q) {
    const like = likeValue(q);
    conditions.push(`(
      s.title LIKE ? OR s.description LIKE ? OR
      u.full_name LIKE ? OR cat.name LIKE ?
    )`);
    params.push(like, like, like, like);
  }

  if (city) {
    conditions.push('u.city LIKE ?');
    params.push(likeValue(city));
  }

  if (category) {
    conditions.push('cat.slug = ?');
    params.push(category);
  }

  const [rows] = await pool.query(
    `${serviceSelect}
     WHERE ${conditions.join(' AND ')}
     ORDER BY ${sortOptions[sort]}
     LIMIT ${limit}`,
    params,
  );

  res.json({ services: rows.map(mapServiceRow) });
});

/* -------------------------------------------------------------- Public detail */

export const getService = asyncHandler(async (req, res) => {
  const serviceId = positiveId(req.params.id);
  const service = await getServiceById(serviceId, { activeOnly: true });

  if (!service) {
    throw new HttpError(404, 'We could not find that service.');
  }

  const [reviews] = await pool.query(
    `SELECT
       r.id, r.rating, r.comment, r.created_at,
       u.full_name AS customer_name, s.title AS service_title
     FROM reviews r
     JOIN customers c ON c.id = r.customer_id
     JOIN users u ON u.id = c.user_id
     JOIN services s ON s.id = r.service_id
     WHERE r.service_id = ?
     ORDER BY r.created_at DESC
     LIMIT 10`,
    [serviceId],
  );

  const [related] = await pool.query(
    `${serviceSelect}
     WHERE s.is_active = 1 AND s.category_id = ? AND s.id <> ?
     ORDER BY p.rating DESC, s.price ASC
     LIMIT 3`,
    [service.category_id, serviceId],
  );

  res.json({
    service,
    reviews: reviews.map((review) => ({
      ...review,
      id: Number(review.id),
      rating: Number(review.rating),
    })),
    related: related.map(mapServiceRow),
  });
});

/* -------------------------------------------------------------- Provider list */

export const listMyServices = asyncHandler(async (req, res) => {
  const provider = await getProviderByUserId(req.auth.userId);

  if (!provider) {
    throw new HttpError(403, 'A provider profile is required.');
  }

  const [rows] = await pool.query(
    `${serviceSelect}
     WHERE s.provider_id = ? AND s.is_active = 1
     ORDER BY s.created_at DESC`,
    [provider.id],
  );

  res.json({ services: rows.map(mapServiceRow) });
});

/* ------------------------------------------------------------------- Create */

export const createService = asyncHandler(async (req, res) => {
  const provider = await getProviderByUserId(req.auth.userId);

  if (!provider) {
    throw new HttpError(403, 'A provider profile is required.');
  }

  const title = requiredString(req.body.title, 'Service title', {
    min: 5,
    max: 120,
  });
  const description = requiredString(req.body.description, 'Description', {
    min: 20,
    max: 1000,
  });
  const price = moneyValue(req.body.price, 'Starting price', {
    min: 49,
    max: 200000,
  });
  const duration = integerValue(
    req.body.duration_minutes,
    'Duration',
    { min: 15, max: 600 },
  );

  const [result] = await pool.query(
    `INSERT INTO services
      (provider_id, category_id, title, description, price, duration_minutes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [provider.id, provider.category_id, title, description, price, duration],
  );

  const service = await getServiceById(result.insertId);
  res.status(201).json({ service });
});

/* ------------------------------------------------------------------- Update */

export const updateService = asyncHandler(async (req, res) => {
  const serviceId = positiveId(req.params.id);
  const provider = await getProviderByUserId(req.auth.userId);

  if (!provider) {
    throw new HttpError(403, 'A provider profile is required.');
  }

  const [owned] = await pool.query(
    'SELECT id FROM services WHERE id = ? AND provider_id = ? AND is_active = 1 LIMIT 1',
    [serviceId, provider.id],
  );

  if (!owned.length) {
    throw new HttpError(404, 'We could not find that service.');
  }

  const title = requiredString(req.body.title, 'Service title', {
    min: 5,
    max: 120,
  });
  const description = requiredString(req.body.description, 'Description', {
    min: 20,
    max: 1000,
  });
  const price = moneyValue(req.body.price, 'Starting price', {
    min: 49,
    max: 200000,
  });
  const duration = integerValue(
    req.body.duration_minutes,
    'Duration',
    { min: 15, max: 600 },
  );

  await pool.query(
    `UPDATE services
     SET title = ?, description = ?, price = ?, duration_minutes = ?
     WHERE id = ? AND provider_id = ?`,
    [title, description, price, duration, serviceId, provider.id],
  );

  const service = await getServiceById(serviceId);
  res.json({ service });
});

/* ------------------------------------------------------------------- Delete */

export const deleteService = asyncHandler(async (req, res) => {
  const serviceId = positiveId(req.params.id);
  const provider = await getProviderByUserId(req.auth.userId);

  if (!provider) {
    throw new HttpError(403, 'A provider profile is required.');
  }

  const [owned] = await pool.query(
    'SELECT id FROM services WHERE id = ? AND provider_id = ? AND is_active = 1 LIMIT 1',
    [serviceId, provider.id],
  );

  if (!owned.length) {
    throw new HttpError(404, 'We could not find that service.');
  }

  // Soft delete keeps past bookings and reviews intact.
  await pool.query(
    'UPDATE services SET is_active = 0 WHERE id = ? AND provider_id = ?',
    [serviceId, provider.id],
  );

  res.json({ message: 'Service deleted.' });
});
