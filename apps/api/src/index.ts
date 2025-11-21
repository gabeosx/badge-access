import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
import authRoutes from './routes/auth';

import userRoutes from './routes/users';
import entitlementRoutes from './routes/entitlements';
import auditLogRoutes from './routes/audit-logs';

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/entitlements', entitlementRoutes);
app.use('/api/audit-logs', auditLogRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});
