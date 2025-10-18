import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { User} from "@prisma/client";
import { prisma } from "../../app/app";

type LoginData = Pick<User, "email" | "password">;

export const loginService = async (data: LoginData): Promise<{accessToken: string, refreshToken: string}> => {
    // 1. kullanıcıyı veritabanından bul
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        }
    });

    // kullanıcı bulunamadıysa hata
    if (!user) {
        throw new Error("Kullanıcı bulunamadı");
    }

    // 2. veritabanındaki şifreyle heshlenmiş şifreyi karlılastır
    const isPasswordValid = await argon2.verify(user.password, data.password);

    // eposta veya sifre yanlışsa hata
    if (!isPasswordValid) {
        throw new Error("Eposta veya sifre yanlış");
    }

    // 3. JWT olustur
    const tokenPayload = {
        id: user.id,
        email: user.email,
    };

    if(!env.JWT_SECRET){
        throw new Error("JWT_SECRET not found");
    }

    // access token oluştur 
    const accessToken = jwt.sign(tokenPayload, env.JWT_SECRET,{
        expiresIn: "15m",
    });

    // refresh token oluşturma
    const refreshToken = jwt.sign(tokenPayload, env.JWT_SECRET, {
        expiresIn: "7d",
    });

    // 2 tokeni nesne içinde döndür
    return {accessToken, refreshToken};
}
