import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

// Post oluşturma fonksiyonu
export const createPost = async (req: Request, res: Response) => {
    try {
        const { title, content, category } = req.body;

        if (!req.user) {
            return res.status(401).json({ error: "Yetkilendirme hatası." });
        }
        const userId = req.user.id;

        if (!title || !content || !category) {
            return res.status(400).json({ error: "Başlık, içerik ve kategori gerekli." });
        }

        const newPosts = await prisma.post.create({
            data: {
                title,
                content,
                category,
                authorId: userId,
            },
        });

        res.status(201).json({
            messsage: "Post başarıyla oluşturuldu.",
            post: newPosts,
        });

    } catch (error) {
        console.error('Post oluşturma hatası:', error);
        res.status(500).json({ error: 'Post oluşturulamadı.' });
    }
};

// postları ekrana getirme fonksiyonu
export const getAllPosts = async (req: Request, res: Response) => {
    try {

        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: { name: true, userName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(posts);
    } catch (error) {
        console.error('Post listeleme hatası:', error);
        res.status(500).json({ error: 'Postlar yüklenemedi.' });
    }
};

// post silme fonksiyonu
export const deletePost = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ error: "Geçersiz post ID." });
        }
        const postId = parseInt(req.params.id, 10);
        if (!req.user) {
            return res.status(401).json({ error: "Yetkilendirme hatası." });
        }
        const userId = req.user.id;

        if (isNaN(postId)) {
            return res.status(400).json({ error: "Geçersiz post ID." });
        }

        // Önce post'u bul ve sahibini kontrol et
        const posts = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!posts) {
            return res.status(404).json({ error: "Post bulunamadı." });
        }

        // Sahip kontrolü: post.authorId === userId ?
        if (posts.authorId !== userId) {
            return res.status(403).json({ error: "Bu postu silme yetkiniz yok." });
        }

        //sil
        await prisma.post.delete({
            where: { id: postId },
        });

        res.json({ message: "Post başarıyla silindi." });
    } catch (error) {
        console.error("post silme hatası: ", error);
        res.status(500).json({ error: "Post silinemedi." });
    }
};
