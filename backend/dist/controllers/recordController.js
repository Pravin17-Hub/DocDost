"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientRecords = exports.getMyRecords = exports.uploadRecord = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const crypto_1 = __importDefault(require("crypto"));
// A simple utility to simulate E2E encryption before storing in the database
const encryptData = (text) => {
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'), Buffer.alloc(16, 0));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};
const decryptData = (encrypted) => {
    try {
        const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'), Buffer.alloc(16, 0));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (err) {
        return "Error decrypting data";
    }
};
const logAudit = async (userId, action, dataHash) => {
    await prisma_1.default.auditLog.create({
        data: { userId, action, dataHash },
    });
};
const uploadRecord = async (req, res) => {
    try {
        const { fileUrl, type } = req.body;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const patient = await prisma_1.default.patient.findUnique({ where: { userId } });
        if (!patient)
            return res.status(403).json({ error: 'Only patients can upload their records directly' });
        // Encrypt the URL/data
        const encryptedUrl = encryptData(fileUrl);
        const record = await prisma_1.default.medicalRecord.create({
            data: {
                encryptedUrl,
                type: type || 'General Report',
                patientId: patient.id,
            },
        });
        // Hash the action for the blockchain-inspired audit log
        const hash = crypto_1.default.createHash('sha256').update(`UPLOAD_${record.id}_${new Date().toISOString()}`).digest('hex');
        await logAudit(userId, `Uploaded Medical Record (${type})`, hash);
        res.status(201).json({ message: 'Record uploaded securely', recordId: record.id });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to upload record' });
    }
};
exports.uploadRecord = uploadRecord;
const getMyRecords = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const patient = await prisma_1.default.patient.findUnique({ where: { userId } });
        if (!patient)
            return res.status(403).json({ error: 'Patients only' });
        const records = await prisma_1.default.medicalRecord.findMany({
            where: { patientId: patient.id },
            orderBy: { createdAt: 'desc' }
        });
        // Decrypt the records before sending them to the verified patient
        const decryptedRecords = records.map(r => ({
            ...r,
            url: decryptData(r.encryptedUrl)
        }));
        res.json(decryptedRecords);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch records' });
    }
};
exports.getMyRecords = getMyRecords;
const getPatientRecords = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const userId = req.user?.userId;
        if (!userId || req.user?.role !== 'DOCTOR')
            return res.status(403).json({ error: 'Doctors only' });
        // In a full implementation, check if the doctor has permission from the patient.
        // For now, we assume if they know the patientId, they are authorized via an appointment.
        const records = await prisma_1.default.medicalRecord.findMany({
            where: { patientId },
            orderBy: { createdAt: 'desc' },
        });
        const decryptedRecords = records.map(r => ({
            ...r,
            url: decryptData(r.encryptedUrl)
        }));
        // Audit log for Doctor accessing Patient data
        const hash = crypto_1.default.createHash('sha256').update(`VIEW_${patientId}_${new Date().toISOString()}`).digest('hex');
        await logAudit(userId, `Viewed Medical Records of Patient ${patientId}`, hash);
        res.json(decryptedRecords);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch patient records' });
    }
};
exports.getPatientRecords = getPatientRecords;
//# sourceMappingURL=recordController.js.map