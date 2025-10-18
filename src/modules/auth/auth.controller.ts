import { Request, Response } from "express";
import { loginService } from "./auth.service";

// login(giris) controller endpoint
export const loginController = async (req: Request, res: Response) => {
    try {
        // 1. eposta ve sifreyi body den al
        const { email, password } = req.body;

        // email veya sifre gönderilmemisse
        if (!email || !password) {
            return res.status(400).json({ message: "Eposta ve sifre gereklidir." });
        }

        // servisten gelen tokenleri ayrıştırarak tokenleri al
        const { accessToken, refreshToken } = await loginService({email,password});

        // 2.kullanıcıya mesaj göster
        res.status(200).json({
            message: "Giriş başarılı",
            accessToken,
            refreshToken
        });
    } catch (error) {
        if(error instanceof Error && error.message === "Eposta veya sifre yanlış"){
            return res.status(401).json({ message: error.message });
        }
        console.error("Giris hatası:", error);
        res.status(500).json({ message: "Giris yapılırken bir hata oluştu." });
    }
}

// logout(cıkıs) controller enpointi
export const logoutController = async (req: Request, res: Response) => {
    res.status(200).json({message: "Çıkış basarılı"});
}