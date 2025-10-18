import { Response, NextFunction } from "express";
import  jwt  from "jsonwebtoken";
import { env } from "../config/env";
import { Request } from "express";

export interface AuthRequest extends Request {
    user?: { id: string, emmail: string};
}

// kimlik doğrulama middleware
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. tokeni headerdan al
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. token yoksa hata
    if (!token) {
        return res.status(401).json({ message: "Giriş yapmadınız." });
    }

    if(!env.JWT_SECRET){
        throw new Error("JWT_SECRET not found");
    }

    // 3. tokeni doğrula
    jwt.verify(token, env.JWT_SECRET, (err:any, user:any) => {
        if (err) {
            return res.status(403).json({ message: "Giriş yapmadınız." });
        }

        req.user = user;
        next();
    });
}