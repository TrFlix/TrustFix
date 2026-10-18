import 'dotenv/config';

export const PORT = Number(process.env.PORT) || 5000;

export const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || 'http://localhost:4321';

export const JWT_SECRET =
  process.env.JWT_SECRET || 'trustfix-dev-secret-change-me';

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const isProduction = process.env.NODE_ENV === 'production';
