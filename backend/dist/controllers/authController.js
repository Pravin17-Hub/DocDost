"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableMfa = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const register = async (req, res) => {
    try {
        const { email, password, role, name, specialization } = req.body;
        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // 🔥 FIX ROLE FORMAT
        const formattedRole = role.toUpperCase();
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: formattedRole, // ✅ FIXED
            },
        });
        if (formattedRole === 'DOCTOR') {
            await prisma_1.default.doctor.create({
                data: {
                    userId: user.id,
                    specialization: specialization || 'General',
                },
            });
        }
        else if (formattedRole === 'PATIENT') {
            await prisma_1.default.patient.create({
                data: {
                    userId: user.id,
                },
            });
        }
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({ error: 'Registration failed' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password, mfaCode } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
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
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'my_super_secret_jwt_key', { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role, mfaEnabled: user.twoFactorEnabled } });
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
const enableMfa = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        // Generate a simple 6-digit mock code for demonstration
        const mockSecret = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true, twoFactorSecret: mockSecret }
        });
        res.json({ message: 'MFA Enabled', secret: mockSecret });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to enable MFA' });
    }
};
exports.enableMfa = enableMfa;
//# sourceMappingURL=authController.js.map