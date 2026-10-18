import { pool } from '../config/db.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import {
  likeValue,
  positiveId,
  queryText,
} from '../utils/validate.js';

const providerSelect = `
  SELECT
    p.id, u.full_name, u.city, p.experience_years, p.rating, p.review_count,
    p.is_featured, p.description, p.created_at,
    cat.name AS category_name, cat.slug AS category_slug,
    (SELECT MIN(s.price) FROM services s
      WHERE s.provider_id = p.id AND s.is_active = 1) AS starting_price,
    (SELECT COUNT(*) FROM services s
      WHERE s.provider_id = p.id AND s.is_active = 1) AS services_count
  FROM service_providers p
  JOIN users u ON u.id = p.user_id
  JOIN categories cat ON cat.id = p.category_id
`;

const sortOptions = {
  recommended: 'p.is_featured DESC, p.rating DESC, p.review_count DESC',
  rating: 'p.rating DESC, p.review_count DESC, u.full_name ASC',
  experience: 'p.experience_years DESC, p.rating DESC',
  'price-low': 'starting_price IS NULL, starting_price ASC, p.rating DESC',
  newest: 'p.created_at DESC',
};

function mapProvider(row) {
  return {
    ...row,
    id: Number(row.id),
    experience_years: Number(row.experience_years) || 0,
    rating: Number(row.rating) || 0,
    review_count: Number(row.review_count) || 0,
    is_featured: Boolean(row.is_featured),
    starting_price:
      row.starting_price == null ? null : Number(row.starting_price),
    services_count: Number(row.services_count) || 0,
  };
}

export const listProviders = asyncHandler(async (req, res) => {
  const q = queryText(req.query.q);
  const city = queryText(req.query.city, 80);
  const category = queryText(req.query.category, 60);
  const featured = String(req.query.featured || '') === '1';
  const sort = sortOptions[req.query.sort] ? req.query.sort : 'recommended';
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 12, 1),
    48,
  );

  const conditions = [
    `(SELECT COUNT(*) FROM services s
      WHERE s.provider_id = p.id AND s.is_active = 1) > 0`,
  ];
  const params = [];

  if (q) {
    const like = likeValue(q);
    conditions.push(`(
      u.full_name LIKE ? OR cat.name LIKE ? OR EXISTS (
        SELECT 1 FROM services s
        WHERE s.provider_id = p.id AND s.is_active = 1 AND s.title LIKE ?
      )
    )`);
    params.push(like, like, like);
  }

  if (city) {
    conditions.push('u.city LIKE ?');
    params.push(likeValue(city));
  }

  if (category) {
    conditions.push('cat.slug = ?');
    params.push(category);
  }

  if (featured) {
    conditions.push('p.is_featured = 1');
  }

  const [rows] = await pool.query(
    `${providerSelect}
     WHERE ${conditions.join(' AND ')}
     ORDER BY ${sortOptions[sort]}
     LIMIT ${limit}`,
    params,
  );

  res.json({ providers: rows.map(mapProvider) });
});

export const getProvider = asyncHandler(async (req, res) => {
  const providerId = positiveId(req.params.id);

  const [rows] = await pool.query(
    `${providerSelect} WHERE p.id = ? LIMIT 1`,
    [providerId],
  );

  if (!rows.length) {
    throw new HttpError(404, 'We could not find that professional.');
  }

  const [services] = await pool.query(
    `SELECT
       s.id, s.title, s.description, s.price, s.duration_minutes,
       cat.name AS category_name, cat.slug AS category_slug
     FROM services s
     JOIN categories cat ON cat.id = s.category_id
     WHERE s.provider_id = ? AND s.is_active = 1
     ORDER BY s.price ASC`,
    [providerId],
  );

  const [reviews] = await pool.query(
    `SELECT
       r.id, r.rating, r.comment, r.created_at,
       u.full_name AS customer_name, s.title AS service_title
     FROM reviews r
     JOIN customers c ON c.id = r.customer_id
     JOIN users u ON u.id = c.user_id
     JOIN services s ON s.id = r.service_id
     WHERE r.provider_id = ?
     ORDER BY r.created_at DESC
     LIMIT 10`,
    [providerId],
  );

  const [completedRows] = await pool.query(
    `SELECT COUNT(*) AS completed
     FROM bookings
     WHERE provider_id = ? AND status = 'completed'`,
    [providerId],
  );

  res.json({
    provider: mapProvider(rows[0]),
    services: services.map((service) => ({
      ...service,
      id: Number(service.id),
      price: Number(service.price),
      duration_minutes: Number(service.duration_minutes) || 0,
    })),
    reviews: reviews.map((review) => ({
      ...review,
      id: Number(review.id),
      rating: Number(review.rating),
    })),
    stats: {
      completed: Number(completedRows[0].completed) || 0,
      services: services.length,
      reviews: Number(rows[0].review_count) || 0,
    },
  });
});
