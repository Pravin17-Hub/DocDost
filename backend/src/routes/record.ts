import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { uploadRecord, getMyRecords, getPatientRecords } from '../controllers/recordController';

const router = Router();

router.use(authenticate);

router.post('/upload', uploadRecord);
router.get('/mine', getMyRecords);
router.get('/patient/:patientId', getPatientRecords);

export default router;
