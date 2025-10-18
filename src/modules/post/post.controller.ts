import { Response } from "express";
import { AuthRequest } from "src/middlewares/auth.middleware";
import { createPostService } from "./post.service";

// yeni post oluşturma controller'ı
export const createPostController = async (req: AuthRequest, res: Response) => {
    try {
        // 1. request body den title content al
        const {title,content} = req.body;

        // 2. kullanıcı isteği varmı
        if(!req.user){
            return res.status(401).json({ message: "Geçerli bir kullanıcı yok." });
        }

        // token içindeki kullanıcı id yi al
        const authorId = parseInt(req.user.id,10);

        // 3. service cagır
        const newPost = await createPostService({title,content,authorId});

        // 4. başarılı yanıt
        res.status(201).json({
            message: "Post basarıyla olusturuldu",
            post: newPost
        });
    } catch (error) {
        console.error("Post olusturma hatası:", error);
        res.status(500).json({ message: "Post olusturulurken bir hata olustu." });
    }
}