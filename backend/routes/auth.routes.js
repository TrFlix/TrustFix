import { Router } from 'express';
import { registerCustomer, registerProvider, login, me } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register/customer', registerCustomer);
router.post('/register/provider', registerProvider);
router.post('/login', login);
router.get('/me', me);

export default router;
