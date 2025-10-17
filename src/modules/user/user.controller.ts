import { Request, Response } from "express";
import { createUserService, getAllUserService } from "./user.service";

// yeni kullanıcı oluşturma controller'ı
export const createUserController = async (req: Request, res: Response) => {
    try {
        // servis şifre heshleme ve kaydetme işlemi
        const userWithoutPassword = await createUserService(req.body);
        
        // başarılı yanıt
        res.status(201).json({
            message: "Kullanıcı başarıyla oluşturuldu",
            user: userWithoutPassword,
        });
    } catch (error: any) {
        if(error.code === 'P2002'){
            return res.status(409).json({ message: "Bu email zaten kayıtlı." });
        }

        console.error("Kullanıcı oluşturma hatası:", error);
        res.status(500).json({ message: "Kullanıcı oluşturulurken bir hata oluştu." });
    }
}

// tüm kullanıcıları getirme controller'ı
export const getAllUsersController = async (req: Request, res: Response) => {
    try {
        const users = await getAllUserService();

        //yanıtta şifreleri dahil etme
        const usersWithoutPasswords = users.map( user => {
            const { password, ...rest} = user;
            return rest;
        });
        res.status(200).json(usersWithoutPasswords);
    } catch (error) {
        console.error("Kullanıcıları getirme hatası:", error);
        res.status(500).json({ message: "Kullanıcılar getirilirken bir hata oluştu." });
    }
}