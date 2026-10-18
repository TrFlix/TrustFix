import { Router } from 'express';
import {
  createReview,
  recentReviews,
} from '../controllers/reviews.controller.js';
import { authRequired, roleRequired } from '../middleware/auth.js';

const router = Router();

router.get('/recent', recentReviews);
router.post('/', authRequired, roleRequired('customer'), createReview);

export default router;
