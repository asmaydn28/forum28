import type {Request, Response} from "express"
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

// yorum oluşturma endpointi

export const createComment = async (req: Request, res: Response) => {
    try {
        const {postId} = req.params;
        const {content} = req.body;
        const userId = req.user?.id;

        if(!userId){
            return res.status(401).json({error: "Yetkilendirme hatası."})
        }

        if(!content.trim()){
            return res.status(400).json({error: "Yorum içeriği gerekli."})
        }

        if(!postId){
            return res.status(400).json({error: "Post ID gerekli."})
        }

        const postExists = await prisma.post.findUnique({
            where: { id: parseInt(postId, 10) },
        });

        if (!postExists) {
        return res.status(404).json({ error: 'Post bulunamadı.' });
        }

        const newComment = await prisma.comment.create({
            data: {
                content: content,
                postId: Number(postId),
                authorId: userId
            }
        });

        res.status(201).json({
            message: "Yorum başarıyla oluşturuldu.",
            comment: newComment
        });
    } catch (error) {
        console.error('Yorum oluşturma hatası:', error);
        res.status(500).json({error: 'Yorum oluşturulamadı.'});
    }
}

// yorum silme endpointi
export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Yetkilendirme hatası." });
        }

        if (!commentId) {
            return res.status(400).json({ error: "Yorum ID'si gerekli." });
        }

        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId, 10) },
        });

        if (!comment) {
            return res.status(404).json({ error: "Yorum bulunamadı." });
        }

        if (comment.authorId !== userId) {
            return res.status(403).json({ error: "Bu yorumu silme yetkiniz yok." });
        }

        await prisma.comment.delete({
            where: { id: parseInt(commentId, 10) },
        });

        res.status(200).json({ message: "Yorum başarıyla silindi." });
    } catch (error) {
        console.error('Yorum silme hatası:', error);
        res.status(500).json({ error: 'Yorum silinemedi.' });
    }
}