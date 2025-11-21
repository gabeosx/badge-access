import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, requireRole('ROLE_ADMIN'), async (req, res) => {
    const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 100,
    });
    res.json(logs);
});

export default router;
