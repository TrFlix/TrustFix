import { pool } from '../config/db.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import {
  bookingSelect,
  getCustomerByUserId,
  getProviderByUserId,
  mapBookingRow,
} from '../utils/queries.js';
import {
  futureDate,
  integerValue,
  oneOf,
  phoneValue,
  positiveId,
  requiredString,
} from '../utils/validate.js';

const transitions = {
  pending: ['accepted', 'rejected'],
  accepted: ['in_progress'],
  in_progress: ['completed'],
};

/* ------------------------------------------------------------------- Create */

export const createBooking = asyncHandler(async (req, res) => {
  const customer = await getCustomerByUserId(req.auth.userId);

  if (!customer) {
    throw new HttpError(403, 'A customer profile is required to book a service.');
  }

  const serviceId = integerValue(req.body.service_id, 'Service', {
    min: 1,
    max: 999999999,
  });
  const problem = requiredString(
    req.body.problem_description,
    'Problem description',
    { min: 15, max: 1000 },
  );
  const preferredDate = futureDate(req.body.preferred_date);
  const address = requiredString(req.body.address, 'Service address', {
    min: 10,
    max: 255,
  });
  const contactNumber = phoneValue(req.body.contact_number);

  const [services] = await pool.query(
    'SELECT id, provider_id, is_active FROM services WHERE id = ? LIMIT 1',
    [serviceId],
  );

  if (!services.length || !services[0].is_active) {
    throw new HttpError(404, 'That service is no longer available.');
  }

  const [result] = await pool.query(
    `INSERT INTO bookings
      (customer_id, provider_id, service_id, problem_description,
       preferred_date, address, contact_number, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      customer.id,
      services[0].provider_id,
      serviceId,
      problem,
      preferredDate,
      address,
      contactNumber,
    ],
  );

  const [rows] = await pool.query(
    `${bookingSelect} WHERE b.id = ? LIMIT 1`,
    [result.insertId],
  );

  res.status(201).json({ booking: mapBookingRow(rows[0]) });
});

/* --------------------------------------------------------------------- List */

export const listMyBookings = asyncHandler(async (req, res) => {
  let condition;
  let params;

  if (req.auth.role === 'customer') {
    const customer = await getCustomerByUserId(req.auth.userId);

    if (!customer) {
      throw new HttpError(403, 'A customer profile is required.');
    }

    condition = 'b.customer_id = ?';
    params = [customer.id];
  } else {
    const provider = await getProviderByUserId(req.auth.userId);

    if (!provider) {
      throw new HttpError(403, 'A provider profile is required.');
    }

    condition = 'b.provider_id = ?';
    params = [provider.id];
  }

  const [rows] = await pool.query(
    `${bookingSelect}
     WHERE ${condition}
     ORDER BY b.created_at DESC`,
    params,
  );

  res.json({ bookings: rows.map(mapBookingRow) });
});

/* ------------------------------------------------------------------- Cancel */

export const cancelBooking = asyncHandler(async (req, res) => {
  const bookingId = positiveId(req.params.id);

  const [rows] = await pool.query(
    `SELECT b.id, b.status
     FROM bookings b
     JOIN customers c ON c.id = b.customer_id
     WHERE b.id = ? AND c.user_id = ?
     LIMIT 1`,
    [bookingId, req.auth.userId],
  );

  if (!rows.length) {
    throw new HttpError(404, 'We could not find that booking.');
  }

  if (!['pending', 'accepted'].includes(rows[0].status)) {
    throw new HttpError(
      409,
      'Only pending or accepted requests can be cancelled.',
    );
  }

  await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [
    'cancelled',
    bookingId,
  ]);

  res.json({ booking: { id: bookingId, status: 'cancelled' } });
});

/* ------------------------------------------------------------ Provider status */

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const bookingId = positiveId(req.params.id);
  const nextStatus = oneOf(
    req.body.status,
    ['accepted', 'rejected', 'in_progress', 'completed'],
    'Booking status',
  );

  const [rows] = await pool.query(
    `SELECT b.id, b.status
     FROM bookings b
     JOIN service_providers p ON p.id = b.provider_id
     WHERE b.id = ? AND p.user_id = ?
     LIMIT 1`,
    [bookingId, req.auth.userId],
  );

  if (!rows.length) {
    throw new HttpError(404, 'We could not find that booking.');
  }

  const current = rows[0].status;
  const allowed = transitions[current] || [];

  if (!allowed.includes(nextStatus)) {
    throw new HttpError(
      409,
      'That status change is not allowed for this booking.',
    );
  }

  await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [
    nextStatus,
    bookingId,
  ]);

  res.json({ booking: { id: bookingId, status: nextStatus } });
});
