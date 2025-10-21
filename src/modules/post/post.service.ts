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