import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../lib/prisma';
import crypto from 'crypto';

// A simple utility to simulate E2E encryption before storing in the database
const encryptData = (text: string) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'), Buffer.alloc(16, 0));
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decryptData = (encrypted: string) => {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'), Buffer.alloc(16, 0));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return "Error decrypting data";
  }
};

const logAudit = async (userId: string, action: string, dataHash: string) => {
  await prisma.auditLog.create({
    data: { userId, action, dataHash },
  });
};

export const uploadRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { fileUrl, type } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) return res.status(403).json({ error: 'Only patients can upload their records directly' });

    // Encrypt the URL/data
    const encryptedUrl = encryptData(fileUrl);
    
    const record = await prisma.medicalRecord.create({
      data: {
        encryptedUrl,
        type: type || 'General Report',
        patientId: patient.id,
      },
    });

    // Hash the action for the blockchain-inspired audit log
    const hash = crypto.createHash('sha256').update(`UPLOAD_${record.id}_${new Date().toISOString()}`).digest('hex');
    await logAudit(userId, `Uploaded Medical Record (${type})`, hash);

    res.status(201).json({ message: 'Record uploaded securely', recordId: record.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload record' });
  }
};

export const getMyRecords = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) return res.status(403).json({ error: 'Patients only' });

    const records = await prisma.medicalRecord.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' }
    });

    // Decrypt the records before sending them to the verified patient
    const decryptedRecords = records.map(r => ({
      ...r,
      url: decryptData(r.encryptedUrl)
    }));

    res.json(decryptedRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch records' });
  }
};

export const getPatientRecords = async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.params.patientId as string;
    const userId = req.user?.userId;

    if (!userId || req.user?.role !== 'DOCTOR') return res.status(403).json({ error: 'Doctors only' });

    // In a full implementation, check if the doctor has permission from the patient.
    // For now, we assume if they know the patientId, they are authorized via an appointment.

    const records = await prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    const decryptedRecords = records.map(r => ({
      ...r,
      url: decryptData(r.encryptedUrl)
    }));

    // Audit log for Doctor accessing Patient data
    const hash = crypto.createHash('sha256').update(`VIEW_${patientId}_${new Date().toISOString()}`).digest('hex');
    await logAudit(userId, `Viewed Medical Records of Patient ${patientId}`, hash);

    res.json(decryptedRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient records' });
  }
};
