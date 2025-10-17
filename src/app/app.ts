import express from 'express';
import { PrismaClient } from '@prisma/client';
import userRoutes from '../modules/user/user.routes';

const app = express();
export const prisma = new PrismaClient();

// Middleware'ler
app.use(express.json()); // Gelen isteklerin body'sini JSON olarak parse eder

// Ana Route'lar
app.use('/api/users', userRoutes);
// app.use('/api/posts', postRoutes); // Gelecekte eklenecek

// Basit bir ana sayfa route'u
app.get('/', (req, res) => {
  res.send('Forum28 API\'sine hoş geldiniz!');
});

export default app;
