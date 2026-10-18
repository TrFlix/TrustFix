import { Router } from 'express';
import {
  listServices,
  getService,
  listMyServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/services.controller.js';
import { authRequired, roleRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', listServices);
router.get('/:id', getService);
router.get('/mine', authRequired, roleRequired('provider'), listMyServices);
router.post('/', authRequired, roleRequired('provider'), createService);
router.patch('/:id', authRequired, roleRequired('provider'), updateService);
router.delete('/:id', authRequired, roleRequired('provider'), deleteService);

export default router;
