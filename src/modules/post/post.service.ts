import { prisma } from "../../app/app";
import { Post } from "@prisma/client";

export interface PostCreateData {
    title: string;
    content: string;
    authorId: number;
}

// Post oluşturma servisi
export const createPostService = async (data: PostCreateData): Promise<Post> => {
    // prisma ile post oluştur
    const newPost = await prisma.post.create({
        data: {
            title: data.title,
            content: data.content,
            authorId: data.authorId,
            published: true,
        },
    });
    return newPost;
}

// Post listeleme servisi
export const getAllPostService = async (): Promise<Post[]> => {
    const posts = await prisma.post.findMany({
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });
    return posts;
}

// id'ye göre post getirme servisi
export const getPostByIdService = async (id: number): Promise<Post | null> => {
    // 1. findUnique kullanarak postu al
    const post = await prisma.post.findUnique({
        where: {
            id: id,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });
    return post;
}

// post güncelleme servisi
export const updatedPost = async (
    postId: string,
    postDataToUpdate: { title?: string; content?: string },
    userId: string
) => {
    // gelen id leri sayıya çevir
    const numericPostId = parseInt(postId, 10);
    const numericUserId = parseInt(userId, 10);

    // id ler geçerli mi kontrol et
    if (isNaN(numericPostId) || isNaN(numericUserId)) {
        throw new Error("Geçersiz ID formatı.");
    }

    // gönderi mevcutmu ? kontrol et
    const post = await prisma.post.findUnique({
        where: {
            id: numericPostId,
        },
    });

    if (!post) {
        throw new Error("Gönderi bulunamadı.");
    }

    // gönderi sahibi mi ? kontrol et
    if (post.authorId !== numericUserId) {
        throw new Error("Bu gönderiyi güncelleme yetkiniz yok.");
    }

    // gönderiyi güncelle
    const updatedPost = await prisma.post.update({
        where: {
            id: numericPostId,
        },
        data: postDataToUpdate,
    });

    return updatedPost;
}

// post silme servisi
export const deletePostService = async (postId:string, userId:string) => {
    // gelen id leri sayıya çevir
    const numericPostId = parseInt(postId, 10);
    const numericUserId = parseInt(userId, 10);

    // id ler geçerli mi kontrol et
    if (isNaN(numericPostId) || isNaN(numericUserId)) {
        throw new Error("Geçersiz ID formatı.");
    }

    // gönderi mevcutmu ? kontrol et
    const post = await prisma.post.findUnique({
        where: {
            id: numericPostId,
        },
    });

    if (!post) {
        throw new Error("Gönderi bulunamadı.");
    }

    // gönderi sahibi mi ? kontrol et
    if (post.authorId !== numericUserId) {
        throw new Error("Bu gönderiyi silme yetkiniz yok.");
    }

    // gönderiyi sil
    await prisma.post.delete({
        where: {
            id: numericPostId,
        },
    });
}