import { Router } from 'express';
import {
  createBooking,
  listMyBookings,
  cancelBooking,
  updateBookingStatus,
} from '../controllers/bookings.controller.js';
import { authRequired, roleRequired } from '../middleware/auth.js';

const router = Router();

router.post('/', authRequired, roleRequired('customer'), createBooking);
router.get('/me', authRequired, listMyBookings);
router.patch('/:id/cancel', authRequired, roleRequired('customer'), cancelBooking);
router.patch('/:id/status', authRequired, roleRequired('provider'), updateBookingStatus);

export default router;
