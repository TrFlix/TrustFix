import { Router } from 'express';
import { updateProfile } from '../controllers/profile.controller.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.patch('/', authRequired, updateProfile);

export default router;
