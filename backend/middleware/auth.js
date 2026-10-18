import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { HttpError } from '../utils/http.js';

/** Requires a valid Bearer token and stores { userId, role } on req.auth. */
export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Please log in to continue.'));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId < 1) {
      throw new Error('Invalid token subject');
    }

    req.auth = { userId, role: payload.role };
    return next();
  } catch {
    return next(
      new HttpError(401, 'Your session has expired. Please log in again.'),
    );
  }
}

/** Restricts a route to one role. Must run after authRequired. */
export function roleRequired(role) {
  return (req, res, next) => {
    if (req.auth?.role !== role) {
      return next(
        new HttpError(403, 'You do not have access to this action.'),
      );
    }
    return next();
  };
}
