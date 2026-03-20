import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { triageSymptoms } from '../controllers/aiController';

const router = Router();

router.use(authenticate);
router.post('/triage', triageSymptoms);

export default router;
