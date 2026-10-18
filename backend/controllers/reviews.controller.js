import { pool } from '../config/db.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import {
  getCustomerByUserId,
  refreshProviderRating,
} from '../utils/queries.js';
import {
  integerValue,
  positiveId,
  requiredString,
} from '../utils/validate.js';

/* ------------------------------------------------------------------- Create */

export const createReview = asyncHandler(async (req, res) => {
  const customer = await getCustomerByUserId(req.auth.userId);

  if (!customer) {
    throw new HttpError(403, 'A customer profile is required to leave a review.');
  }

  const bookingId = positiveId(req.body.booking_id);
  const rating = integerValue(req.body.rating, 'Rating', { min: 1, max: 5 });
  const comment = requiredString(req.body.comment, 'Review', {
    min: 10,
    max: 600,
  });

  const [bookings] = await pool.query(
    `SELECT b.id, b.status, b.provider_id, b.service_id
     FROM bookings b
     JOIN customers c ON c.id = b.customer_id
     WHERE b.id = ? AND c.user_id = ?
     LIMIT 1`,
    [bookingId, req.auth.userId],
  );

  if (!bookings.length) {
    throw new HttpError(404, 'We could not find that booking.');
  }

  const booking = bookings[0];

  if (booking.status !== 'completed') {
    throw new HttpError(
      409,
      'You can review a service once the job is completed.',
    );
  }

  const [existing] = await pool.query(
    'SELECT id FROM reviews WHERE booking_id = ? LIMIT 1',
    [bookingId],
  );

  if (existing.length) {
    throw new HttpError(409, 'You have already reviewed this booking.');
  }

  const [result] = await pool.query(
    `INSERT INTO reviews
      (booking_id, customer_id, provider_id, service_id, rating, comment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      bookingId,
      customer.id,
      booking.provider_id,
      booking.service_id,
      rating,
      comment,
    ],
  );

  await refreshProviderRating(booking.provider_id);

  const [rows] = await pool.query(
    `SELECT id, booking_id, rating, comment, created_at
     FROM reviews WHERE id = ? LIMIT 1`,
    [result.insertId],
  );

  res.status(201).json({
    review: {
      ...rows[0],
      id: Number(rows[0].id),
      booking_id: Number(rows[0].booking_id),
      rating: Number(rows[0].rating),
    },
  });
});

/* ------------------------------------------------------------------- Recent */

export const recentReviews = asyncHandler(async (req, res) => {
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 3, 1),
    12,
  );

  const [rows] = await pool.query(
    `SELECT
       r.id, r.rating, r.comment, r.created_at,
       cu.full_name AS customer_name,
       cat.name AS category_name,
       pu.full_name AS provider_name,
       s.title AS service_title
     FROM reviews r
     JOIN customers c ON c.id = r.customer_id
     JOIN users cu ON cu.id = c.user_id
     JOIN service_providers p ON p.id = r.provider_id
     JOIN users pu ON pu.id = p.user_id
     JOIN services s ON s.id = r.service_id
     JOIN categories cat ON cat.id = s.category_id
     ORDER BY r.created_at DESC
     LIMIT ${limit}`,
  );

  res.json({
    reviews: rows.map((review) => ({
      ...review,
      id: Number(review.id),
      rating: Number(review.rating),
    })),
  });
});
