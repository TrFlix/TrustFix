import { pool } from '../config/db.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import { getUserById } from '../utils/queries.js';
import {
  integerValue,
  phoneValue,
  requiredString,
} from '../utils/validate.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  const current = await getUserById(userId);

  if (!current) {
    throw new HttpError(401, 'Your account could not be found.');
  }

  const fullName = requiredString(req.body.full_name, 'Full name', {
    min: 2,
    max: 100,
  });
  const phone = phoneValue(req.body.phone);
  const city = requiredString(req.body.city, 'City', { max: 80 });

  if (current.role === 'provider') {
    const categorySlug = requiredString(
      req.body.category,
      'Service category',
      { max: 60 },
    );
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

    const [categories] = await pool.query(
      'SELECT id FROM categories WHERE slug = ? LIMIT 1',
      [categorySlug],
    );

    if (!categories.length) {
      throw new HttpError(422, 'Choose a valid service category.');
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query(
        'UPDATE users SET full_name = ?, phone = ?, city = ? WHERE id = ?',
        [fullName, phone, city, userId],
      );

      await connection.query(
        `UPDATE service_providers
         SET category_id = ?, experience_years = ?, address = ?, description = ?
         WHERE user_id = ?`,
        [categories[0].id, experienceYears, address, description, userId],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } else {
    const address = requiredString(req.body.address, 'Address', {
      min: 10,
      max: 255,
    });

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query(
        'UPDATE users SET full_name = ?, phone = ?, city = ? WHERE id = ?',
        [fullName, phone, city, userId],
      );

      await connection.query(
        'UPDATE customers SET address = ? WHERE user_id = ?',
        [address, userId],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  const user = await getUserById(userId);
  res.json({ user });
});
