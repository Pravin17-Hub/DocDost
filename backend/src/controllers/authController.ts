import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, name, specialization } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
    });

    if (role === 'DOCTOR') {
      await prisma.doctor.create({
        data: {
          userId: user.id,
          specialization: specialization || 'General',
        },
      });
    } else if (role === 'PATIENT') {
      await prisma.patient.create({
        data: {
          userId: user.id,
        },
      });
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, mfaCode } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (user.twoFactorEnabled) {
      if (!mfaCode) {
         return res.json({ requiresMfa: true, message: 'Please provide the MFA code' });
      }
      if (mfaCode !== user.twoFactorSecret) {
         return res.status(400).json({ error: 'Invalid MFA code' });
      }
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'my_super_secret_jwt_key',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role, mfaEnabled: user.twoFactorEnabled } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const enableMfa = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Generate a simple 6-digit mock code for demonstration
    const mockSecret = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true, twoFactorSecret: mockSecret }
    });
    res.json({ message: 'MFA Enabled', secret: mockSecret });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enable MFA' });
  }
};
