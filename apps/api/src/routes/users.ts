import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// List all users
router.get('/', authenticate, requireRole('ROLE_ADMIN'), async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            email: true,
            is_active: true,
            created_at: true,
            entitlements: {
                include: { entitlement: true },
            },
        },
    });
    res.json(users);
});

// Get specific user
router.get('/:username', authenticate, requireRole('ROLE_ADMIN'), async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { username: req.params.username },
        include: {
            entitlements: {
                include: { entitlement: true },
            },
        },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

// Create user
router.post('/', authenticate, requireRole('ROLE_ADMIN'), async (req, res) => {
    const { username, password, first_name, last_name, email } = req.body;
    try {
        const password_hash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                password_hash,
                first_name,
                last_name,
                email,
            },
        });

        // Log audit
        await prisma.auditLog.create({
            data: {
                actor: (req as AuthRequest).user.username,
                action: 'CREATE',
                target_type: 'USER',
                target_id: user.id,
                details: JSON.stringify({ username }),
            },
        });

        res.json(user);
    } catch (e) {
        res.status(400).json({ error: 'User already exists or invalid data' });
    }
});

// Update user
router.put('/:username', authenticate, requireRole('ROLE_ADMIN'), async (req, res) => {
    const { first_name, last_name, email, is_active } = req.body;
    try {
        const user = await prisma.user.update({
            where: { username: req.params.username },
            data: { first_name, last_name, email, is_active },
        });

        await prisma.auditLog.create({
            data: {
                actor: (req as AuthRequest).user.username,
                action: 'UPDATE',
                target_type: 'USER',
                target_id: user.id,
                details: JSON.stringify(req.body),
            },
        });

        res.json(user);
    } catch (e) {
        res.status(404).json({ error: 'User not found' });
    }
});

// Delete user
router.delete('/:username', authenticate, requireRole('ROLE_ADMIN'), async (req, res) => {
    try {
        const user = await prisma.user.delete({
            where: { username: req.params.username },
        });

        await prisma.auditLog.create({
            data: {
                actor: (req as AuthRequest).user.username,
                action: 'DELETE',
                target_type: 'USER',
                target_id: user.id,
                details: JSON.stringify({ username: req.params.username }),
            },
        });

        res.json({ message: 'User deleted' });
    } catch (e) {
        res.status(404).json({ error: 'User not found' });
    }
});

// Assign entitlement
router.post('/:username/entitlements', authenticate, requireRole('ROLE_ADMIN'), async (req, res) => {
    const { entitlementId } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { username: req.params.username } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        await prisma.userEntitlement.create({
            data: {
                user_id: user.id,
                entitlement_id: entitlementId,
            },
        });

        await prisma.auditLog.create({
            data: {
                actor: (req as AuthRequest).user.username,
                action: 'UPDATE',
                target_type: 'USER',
                target_id: user.id,
                details: `Assigned entitlement ${entitlementId}`,
            },
        });

        res.json({ message: 'Entitlement assigned' });
    } catch (e) {
        res.status(400).json({ error: 'Assignment failed' });
    }
});

// Remove entitlement
router.delete('/:username/entitlements/:entitlementId', authenticate, requireRole('ROLE_ADMIN'), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { username: req.params.username } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        await prisma.userEntitlement.delete({
            where: {
                user_id_entitlement_id: {
                    user_id: user.id,
                    entitlement_id: req.params.entitlementId,
                },
            },
        });

        await prisma.auditLog.create({
            data: {
                actor: (req as AuthRequest).user.username,
                action: 'UPDATE',
                target_type: 'USER',
                target_id: user.id,
                details: `Removed entitlement ${req.params.entitlementId}`,
            },
        });

        res.json({ message: 'Entitlement removed' });
    } catch (e) {
        res.status(404).json({ error: 'Removal failed' });
    }
});

export default router;
