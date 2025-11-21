import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// List entitlements
router.get('/', authenticate, async (req, res) => {
    const entitlements = await prisma.entitlement.findMany();
    res.json(entitlements);
});

// Create entitlement
router.post('/', authenticate, requireRole('ROLE_ADMIN'), async (req, res) => {
    const { name, description } = req.body;
    try {
        const entitlement = await prisma.entitlement.create({
            data: { name, description },
        });

        await prisma.auditLog.create({
            data: {
                actor: (req as AuthRequest).user.username,
                action: 'CREATE',
                target_type: 'ENTITLEMENT',
                target_id: entitlement.id,
                details: JSON.stringify({ name }),
            },
        });

        res.json(entitlement);
    } catch (e) {
        res.status(400).json({ error: 'Entitlement already exists' });
    }
});

// Delete entitlement
router.delete('/:id', authenticate, requireRole('ROLE_ADMIN'), async (req, res) => {
    try {
        // Check if assigned
        const assigned = await prisma.userEntitlement.findFirst({
            where: { entitlement_id: req.params.id },
        });
        if (assigned) {
            return res.status(400).json({ error: 'Cannot delete assigned entitlement' });
        }

        await prisma.entitlement.delete({
            where: { id: req.params.id },
        });

        await prisma.auditLog.create({
            data: {
                actor: (req as AuthRequest).user.username,
                action: 'DELETE',
                target_type: 'ENTITLEMENT',
                target_id: req.params.id,
                details: 'Deleted entitlement',
            },
        });

        res.json({ message: 'Entitlement deleted' });
    } catch (e) {
        res.status(404).json({ error: 'Entitlement not found' });
    }
});

export default router;
