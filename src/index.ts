import express from "express";
import dotenv from 'dotenv';

// Rotaları import et
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Rotaları kullan
app.use("/users", userRoutes);
app.use("/", authRoutes); // login, logout, homepage
app.use("/posts", postRoutes);

const port: number = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});
