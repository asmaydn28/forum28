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