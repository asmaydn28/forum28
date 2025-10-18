import dotenv from 'dotenv';
import path from 'path';

// .env dosyasının yolunu projenin kök dizinine göre ayarla
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
};
