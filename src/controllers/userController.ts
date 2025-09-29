import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

// kullanıcı oluşturma fonksiyonu
export const createUser = async (req: Request, res: Response) => {
    try {
        const { email, name, userName, password } = req.body;

        const hashedPassword = await argon2.hash(password);
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                userName,
                password: hashedPassword,
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json(userWithoutPassword);
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Bu kullanıcı adı veya email zaten kullanılıyor.' });
        }
        res.status(500).json({ error: "Internal server error" });
    }
};
