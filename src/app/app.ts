import express from 'express';
import { PrismaClient } from '@prisma/client';
import userRoutes from '../modules/user/user.routes';
import authRoutes from '../modules/auth/auth.routes';
import postRoutes from '../modules/post/post.routes';

const app = express();
export const prisma = new PrismaClient();

// Middleware'ler
app.use(express.json());

// Ana Route'lar
app.use('/api/users', userRoutes); // kullanıcı oluşturma
app.use('/api/auth', authRoutes); // giriş ve çıkış
app.use('/api/posts', postRoutes); // post oluşturma

app.get('/', (req, res) => {
  res.send('Forum28 API\'sine hoş geldiniz!');
});

export default app;
