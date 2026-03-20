import { Router } from 'express';
import { register, login, enableMfa } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/enable-mfa', authenticate, enableMfa);

export default router;
