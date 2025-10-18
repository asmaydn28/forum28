import express from 'express';
import { PrismaClient } from '@prisma/client';
import userRoutes from '../modules/user/user.routes';
import authRoutes from '../modules/auth/auth.routes';

const app = express();
export const prisma = new PrismaClient();

// Middleware'ler
app.use(express.json());

// Ana Route'lar
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Basit bir ana sayfa route'u
app.get('/', (req, res) => {
  res.send('Forum28 API\'sine hoş geldiniz!');
});

export default app;
