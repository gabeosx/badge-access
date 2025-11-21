import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_SECRET = process.env.API_SECRET || 'super-secret-key-123';

export interface AuthRequest extends Request {
    user?: any;
}

export const generateToken = (user: any) => {
    return jwt.sign(
        { id: user.id, username: user.username, roles: user.roles },
        API_SECRET,
        { expiresIn: '1h' }
    );
};

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, API_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const requireRole = (role: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.roles.includes(role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
};
