import { Response, Request } from "express";
import { AuthRequest } from "src/middlewares/auth.middleware";
import { createPostService, getAllPostService, getPostByIdService } from "./post.service";
import * as postService from './post.service';
//import { get } from "http";

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

// Post listeleme controllerı
export const gettAllPostController = async (req: Request, res: Response) => {
    try {
        // tüm postları servisden al
        const posts = await getAllPostService();
        res.status(200).json({posts});
    } catch (error) {
        console.error("Post listeleme hatası:", error);
        res.status(500).json({ message: "Postlar alınırken bir hata oluştu." });
    }
}

// id'ye göre post getirme controller'ı
export const getPostByIdController = async (req: Request, res: Response) => {
    try {
        // 1. URL parametresinden id'yi al
        const { id } = req.params;   

        // 2. Servisi çağır
        const postId = parseInt(id, 10);

        // gelen id geçerli mi kontrol et
        if(isNaN(postId)){
            return res.status(400).json({ message: "Geçersiz post ID'si." });
        }

        const post = await getPostByIdService(postId);

        // 3. servisten dönen sonuca göre yanıt ver
        if (!post) {
            return res.status(404).json({ message: "Post bulunamadı." });
        }
        
        res.status(200).json({ post });
    } catch (error) {
        console.error(" ID'ye göre Post getirme hatası:", error);
        res.status(500).json({ message: "Post alınırken bir hata oluştu." });
    }
}

// post güncelleme controller'ı
export const updatePostController = async (req:Request, res:Response) => {
    try {
        // 1. url den post id al
        const {postId} = req.params;

        // 2. request body den güncellenecek alanları al
        const postDataToUpdate = req.body;

        // 3. middleware den user id al
        // @ts-ignore
        const userId = req.user.id;

        // 4. bilgileri service e gönder
        const updatedPost = await postService.updatedPost(
            postId,
            postDataToUpdate,
            userId
        );

        // 5. başarılı yanıt
        res.status(200).json({
            message: "Post başarıyla güncellendi",
            post: updatedPost
        });
    } catch (error:any) {
        if (error.message === "Gönderi bulunamadı." || error.message === "Bu gönderiyi güncelleme yetkiniz yok.") {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: "Post güncellenirken bir hata oluştu." });
    }
}

// post silme controller'ı
export const deletePostController = async (req:Request, res:Response)=> {
    try {
        // 1. url den post id al
        const {postId} = req.params;
        
        // 2. middleware den user id al
        // @ts-ignore
        const userId = req.user.id;

        // 3. bilgileri service e gönder
        await postService.deletePostService(postId, userId);

        // 4. başarılı yanıt
        res.status(200).json({
            message: "Post basarıyla silindi"
        });
    } catch (error:any) {
        if (error.message === "Gönderi bulunamadı." || error.message === "Bu gönderiyi silme yetkiniz yok.") {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: "Post silinirken bir hata oluştu." });
    }
}