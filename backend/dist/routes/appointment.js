"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const appointmentController_1 = require("../controllers/appointmentController");
const router = (0, express_1.Router)();
// Protect all appointment routes
router.use(authMiddleware_1.authenticate);
router.get('/doctors', appointmentController_1.getDoctors);
router.post('/book', appointmentController_1.bookAppointment);
router.get('/mine', appointmentController_1.getMyAppointments);
exports.default = router;
//# sourceMappingURL=appointment.js.map