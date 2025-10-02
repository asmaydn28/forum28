import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

// Yeni: Etiketleri işleyen yardımcı fonksiyon
const processTags = async (tagNames: string[]) => {
  if (!tagNames || tagNames.length === 0) return [];

  // Etiket isimlerini temizle ve küçük harfe çevir
  const cleanTags = tagNames
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0 && tag.length <= 20); // max 20 karakter

  // Benzersiz yap
  const uniqueTags = [...new Set(cleanTags)];

  // Her etiketi veritabanında bul veya oluştur
  const tags = await Promise.all(
    uniqueTags.map(async (name) => {
      // Önce var mı diye bak
      let tag = await prisma.tag.findUnique({ where: { name } });
      if (!tag) {
        // Yoksa oluştur (HATA DÜZELTİLDİ)
        tag = await prisma.tag.create({ data: { name } });
      }
      return tag;
    })
  );

  return tags;
};

// Post oluşturma fonksiyonu
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "Yetkilendirme hatası." });
    }
    const userId = req.user.id;

    if (!title || !content || !category) {
      return res.status(400).json({ error: "Başlık, içerik ve kategori gerekli." });
    }

    const processedTags = await processTags(tags);

    // HATA DÜZELTİLDİ: Değişken adı `newPost` (tekil) ve ilişki adı `tags` olarak güncellendi
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        category,
        authorId: userId,
        tags: {
          create: processedTags.map((tag) => ({
            tag: { connect: { id: tag.id } },
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // HATA DÜZELTİLDİ: Yanıt objesi daha temiz hale getirildi
    const responsePost = {
      ...newPost,
      tags: newPost.tags.map((pt) => pt.tag.name),
    };

    res
      .status(201)
      .json({ message: "Post başarıyla oluşturuldu!", post: responsePost });
  } catch (error) {
    console.error("Post oluşturma hatası:", error);
    res.status(500).json({ error: "Post oluşturulamadı." });
  }
};

// postları ekrana getirme fonksiyonu
export const getAllPosts = async (_: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { name: true, userName: true } },
        tags: { include: { tag: true } }, // HATA DÜZELTİLDİ: `postTags` -> `tags`
      },
      orderBy: { createdAt: "desc" },
    });

    // Etiketleri düzenle
    const postsWithTags = posts.map((post) => ({
      ...post,
      tags: post.tags.map((pt) => pt.tag.name), // HATA DÜZELTİLDİ: `postTags` -> `tags`
    }));

    res.json(postsWithTags);
  } catch (error) {
    console.error("Post listeleme hatası:", error);
    res.status(500).json({ error: "Postlar yüklenemedi." });
  }
};

// Yeni: Belirli etikete göre post'ları getir
export const getPostsByTag = async (req: Request, res: Response) => {
  try {
    const { tagName } = req.params;

    if (!tagName) {
      return res.status(400).json({ error: "Etiket adı gerekli." });
    }

    const tag = await prisma.tag.findUnique({
      where: { name: tagName.toLowerCase() },
      include: {
        posts: {
          include: {
            post: {
              include: {
                author: { select: { name: true, userName: true } },
                tags: { include: { tag: true } }, // HATA DÜZELTİLDİ: `postTags` -> `tags`
              },
            },
          },
        },
      },
    });

    if (!tag) {
      return res.status(404).json({ error: "Etiket bulunamadı." });
    }

    const postsWithTags = tag.posts.map((pt) => ({
      ...pt.post,
      tags: pt.post.tags.map((p) => p.tag.name), // HATA DÜZELTİLDİ: `postTags` -> `tags`
    }));

    res.json(postsWithTags);
  } catch (error) {
    console.error("Etiketli post listeleme hatası:", error);
    res.status(500).json({ error: "Postlar yüklenemedi." });
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
    // HATA DÜZELTİLDİ: `posts` -> `post`
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: "Post bulunamadı." });
    }

    // Sahip kontrolü: post.authorId === userId ?
    if (post.authorId !== userId) {
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