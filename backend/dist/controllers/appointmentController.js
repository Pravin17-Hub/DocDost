"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAppointments = exports.bookAppointment = exports.getDoctors = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getDoctors = async (req, res) => {
    try {
        const doctors = await prisma_1.default.doctor.findMany({
            include: {
                user: { select: { name: true, email: true } },
            },
        });
        res.json(doctors);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
};
exports.getDoctors = getDoctors;
const bookAppointment = async (req, res) => {
    try {
        const { doctorId, time } = req.body;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const patient = await prisma_1.default.patient.findUnique({ where: { userId } });
        if (!patient)
            return res.status(400).json({ error: 'Patient not found' });
        const appointmentTime = new Date(time);
        const thirtyMinsBefore = new Date(appointmentTime.getTime() - 30 * 60000);
        const thirtyMinsAfter = new Date(appointmentTime.getTime() + 30 * 60000);
        const existing = await prisma_1.default.appointment.findFirst({
            where: {
                doctorId,
                status: 'SCHEDULED',
                time: {
                    gt: thirtyMinsBefore,
                    lt: thirtyMinsAfter,
                }
            }
        });
        if (existing) {
            return res.status(400).json({ error: 'Doctor has a conflicting appointment at this time' });
        }
        const appointment = await prisma_1.default.appointment.create({
            data: {
                time: new Date(time),
                patientId: patient.id,
                doctorId,
            },
        });
        res.status(201).json(appointment);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to book appointment' });
    }
};
exports.bookAppointment = bookAppointment;
const getMyAppointments = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        if (role === 'DOCTOR') {
            const doctor = await prisma_1.default.doctor.findUnique({ where: { userId } });
            if (!doctor)
                return res.status(400).json({ error: 'Doctor not found' });
            const appointments = await prisma_1.default.appointment.findMany({
                where: { doctorId: doctor.id },
                include: { patient: { include: { user: { select: { name: true, email: true } } } } },
                orderBy: { time: 'asc' },
            });
            return res.json(appointments);
        }
        else {
            const patient = await prisma_1.default.patient.findUnique({ where: { userId } });
            if (!patient)
                return res.status(400).json({ error: 'Patient not found' });
            const appointments = await prisma_1.default.appointment.findMany({
                where: { patientId: patient.id },
                include: { doctor: { include: { user: { select: { name: true, email: true } } } } },
                orderBy: { time: 'asc' },
            });
            return res.json(appointments);
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
};
exports.getMyAppointments = getMyAppointments;
//# sourceMappingURL=appointmentController.js.map