import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import { getUserById } from '../utils/queries.js';
import {
  emailValue,
  integerValue,
  phoneValue,
  requiredString,
} from '../utils/validate.js';

const signToken = (user) =>
  jwt.sign({ sub: String(user.id), role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const passwordRule = (value) =>
  requiredString(value, 'Password', { min: 8, max: 72 });

/* ---------------------------------------------------------- Register customer */

export const registerCustomer = asyncHandler(async (req, res) => {
  const fullName = requiredString(req.body.full_name, 'Full name', {
    min: 2,
    max: 100,
  });
  const email = emailValue(req.body.email);
  const phone = phoneValue(req.body.phone);
  const city = requiredString(req.body.city, 'City', { max: 80 });
  const address = requiredString(req.body.address, 'Address', {
    min: 10,
    max: 255,
  });
  const password = passwordRule(req.body.password);

  const [existing] = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email],
  );

  if (existing.length) {
    throw new HttpError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO users (full_name, email, phone, city, role, password_hash)
       VALUES (?, ?, ?, ?, 'customer', ?)`,
      [fullName, email, phone, city, passwordHash],
    );

    await connection.query(
      'INSERT INTO customers (user_id, address) VALUES (?, ?)',
      [result.insertId, address],
    );

    await connection.commit();

    const user = await getUserById(result.insertId);
    res.status(201).json({ token: signToken(user), user });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

/* ---------------------------------------------------------- Register provider */

export const registerProvider = asyncHandler(async (req, res) => {
  const fullName = requiredString(req.body.full_name, 'Full name', {
    min: 2,
    max: 100,
  });
  const email = emailValue(req.body.email);
  const phone = phoneValue(req.body.phone);
  const city = requiredString(req.body.city, 'City', { max: 80 });
  const categorySlug = requiredString(req.body.category, 'Service category', {
    max: 60,
  });
  const experienceYears = integerValue(
    req.body.experience_years,
    'Years of experience',
    { min: 0, max: 60 },
  );
  const address = requiredString(req.body.address, 'Address', {
    min: 10,
    max: 255,
  });
  const description = requiredString(
    req.body.description,
    'Professional description',
    { min: 40, max: 600 },
  );
  const password = passwordRule(req.body.password);

  const [categories] = await pool.query(
    'SELECT id FROM categories WHERE slug = ? LIMIT 1',
    [categorySlug],
  );

  if (!categories.length) {
    throw new HttpError(422, 'Choose a valid service category.');
  }

  const [existing] = await pool.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email],
  );

  if (existing.length) {
    throw new HttpError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO users (full_name, email, phone, city, role, password_hash)
       VALUES (?, ?, ?, ?, 'provider', ?)`,
      [fullName, email, phone, city, passwordHash],
    );

    await connection.query(
      `INSERT INTO service_providers
        (user_id, category_id, experience_years, address, description,
         rating, review_count, is_featured)
       VALUES (?, ?, ?, ?, ?, 0, 0, 0)`,
      [
        result.insertId,
        categories[0].id,
        experienceYears,
        address,
        description,
      ],
    );

    await connection.commit();

    const user = await getUserById(result.insertId);
    res.status(201).json({ token: signToken(user), user });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

/* --------------------------------------------------------------------- Login */

export const login = asyncHandler(async (req, res) => {
  const email = emailValue(req.body.email);
  const password = passwordRule(req.body.password);

  const [rows] = await pool.query(
    'SELECT id, password_hash FROM users WHERE email = ? LIMIT 1',
    [email],
  );

  if (!rows.length) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }

  const matches = await bcrypt.compare(password, rows[0].password_hash);

  if (!matches) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }

  const user = await getUserById(rows[0].id);

  if (!user) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }

  res.json({ token: signToken(user), user });
});

/* ------------------------------------------------------------------------ Me */

export const me = asyncHandler(async (req, res) => {
  const user = await getUserById(req.auth.userId);

  if (!user) {
    throw new HttpError(401, 'Your account could not be found. Please log in again.');
  }

  res.json({ user });
});
