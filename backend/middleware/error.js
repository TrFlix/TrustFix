import { isProduction } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ message: 'API route not found.' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  let status = error.status || 500;
  let message = error.message || 'Something went wrong. Please try again.';

  if (error.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'That record already exists.';
  } else if (
    error.code === 'ECONNREFUSED' ||
    error.code === 'ER_ACCESS_DENIED_ERROR' ||
    error.code === 'ER_BAD_DB_ERROR'
  ) {
    status = 503;
    message =
      'The database is not available. Check your MySQL configuration and make sure the schema has been imported.';
  }

  if (status >= 500 && !isProduction) {
    console.error(error);
  }

  res.status(status).json({ message });
}
