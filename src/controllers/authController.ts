import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import * as argon2 from "argon2";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenUtils.js";

const prisma = new PrismaClient();

// login yapma fonksiyonu
export const login = async (req: Request, res: Response) => {
    try {
        const { userName, password } = req.body;

        //kullanıcıyı bul
        const user = await prisma.user.findUnique({
            where: { userName: userName },
        });

        //kullanıcı yoksa hata döndür
        if (!user) {
            return res.status(401).json({ error: 'kullanıcı bulunamadı' });
        }

        //şifreyi doğrula argon2 ile
        const isPasswordValid = await argon2.verify(user.password, password);

        //şifre yanlışsa hata döndür
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Kullanıcı adı veya şifre yanlış.' });
        }

        //token oluştur
        const accessToken = generateAccessToken({ id: user.id }); //access token oluştur
        const refreshToken = generateRefreshToken({ id: user.id }); //refresh token oluştur

        //refresh token'ı veritabanına kaydet
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); //7 gün geçerli

        await prisma.token.create({
            data: {
                token: refreshToken,
                type: 'REFRESH',
                expiresAt: expiresAt,
                userId: user.id,
            },
        });

        //şifreyi yanıttan çıkar
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: "giriş başarılı",
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: userWithoutPassword,
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// çıkış yapma fonksiyonu
export const logout = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.body.refreshToken;

        if (!refreshToken || typeof refreshToken !== 'string') {
            return res.status(400).json({ error: "Refresh token gerekli." });
        }

        // req.user'ın varlığını kontrol et
        if (!req.user) {
            return res.status(401).json({ error: "Yetkilendirme hatası." });
        }

        //refresh token'ı veritabanından sil
        const deletedToken = await prisma.token.deleteMany({
            where: {
                token: refreshToken,
                userId: req.user.id,
            },
        });

        if (deletedToken.count === 0) {
            return res.status(400).json({ error: "Token bulunamadı veya zaten silinmiş." });
        }

        return res.json({ message: "Başarıyla çıkış yapıldı." });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// homePage(anasayfa) fonksiyonu
export const homePage = (req: Request, res: Response) => {
    // req.user'ın varlığını kontrol et
    if (!req.user) {
        return res.status(401).json({ error: "Yetkilendirme hatası." });
    }
    res.json({
        message: "Hoşgeldiniz! Ana sayfadasınız.",
        userId: req.user.id,
        timestamp: new Date().toISOString(),
    });
};
