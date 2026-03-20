import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getDoctors, bookAppointment, getMyAppointments } from '../controllers/appointmentController';

const router = Router();

// Protect all appointment routes
router.use(authenticate);

router.get('/doctors', getDoctors);
router.post('/book', bookAppointment);
router.get('/mine', getMyAppointments);

export default router;
