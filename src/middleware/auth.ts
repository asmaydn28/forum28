import type { Request, Response } from "express";
import jwt from 'jsonwebtoken';

// Express'in Request tipini genişleterek 'user' özelliğini ekliyoruz
declare global {
    namespace Express {
        interface Request {
            user?: { id: number };
        }
    }
}

// middleware: token doğrulama
export const authenticateToken = (req: Request, res: Response, next: Function) => {
    const autHeader = req.headers['authorization'];
    const token = autHeader && autHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Erişim için giriş yapmalısınız." });
    }

    const secret = process.env.FORUM28_ACCESS_TOKEN_SECRET;
    if (!secret) {
        console.error("FORUM28_ACCESS_TOKEN_SECRET ortam değişkeni ayarlanmamış.");
        return res.status(500).json({ error: "Sunucu yapılandırma hatası." });
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Oturum süresi doldu, lütfen tekrar giriş yapın." });
        }

        // 'decoded' payload'ının beklenen yapıda olduğunu doğruluyoruz.
        if (typeof decoded === 'object' && decoded && 'id' in decoded) {
            req.user = { id: (decoded as any).id };
            next();
        } else {
            return res.status(403).json({ error: "Geçersiz token." });
        }
    });
}
