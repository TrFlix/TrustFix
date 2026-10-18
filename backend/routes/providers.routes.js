import { Router } from 'express';
import { listProviders, getProvider } from '../controllers/providers.controller.js';

const router = Router();

router.get('/', listProviders);
router.get('/:id', getProvider);

export default router;
