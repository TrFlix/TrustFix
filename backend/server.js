import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PORT, CLIENT_ORIGIN } from './config/env.js';
import authRoutes from './routes/auth.js';
import providerRoutes from './routes/providers.js';
import servicesRoutes from './routes/services.js';
import bookingRoutes from './routes/bookings.js';
import reviewsRoutes from './routes/reviews.js';
import profileRoutes from './routes/profile.js';
import { errorHandler } from './utils/error.js';

dotenv.config();

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Resource not found' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`TrustFix API on port ${PORT}`);
});
