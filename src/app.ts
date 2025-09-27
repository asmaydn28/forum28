import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import express from "express";
import * as argon2 from "argon2";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();
const app = express();
const port = 3000;
const prisma = new PrismaClient();
app.use(express.json());

// middleware: token doğrulama (anasayfa koruması için)
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const autHeader = req.headers['authorization'];
  const token = autHeader && autHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Erişim için giriş yapmalısınız." });
  }

  const secret = process.env.FORUM28_ACCESS_TOKEN_SECRET;
  if (!secret) {
    console.error("FORUM28_ACCESS_TOKEN_SECRET ortam değişkeni ayarlanmamış.");
    return res.status(500).json({ error: "Sunucu yapılandırma hatası." });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Oturum süresi doldu, lütfen tekrar giriş yapın." });
    }

    // 'decoded' payload'ının beklenen yapıda olduğunu doğruluyoruz.
    if (typeof decoded === 'object' && decoded && 'id' in decoded) {
      req.user = { id: (decoded as any).id };
      next();
    } else {
      return res.status(403).json({ error: "Geçersiz token." });
    }
  });
}

//access token oluşturma fonksiyonu
function generateAccessToken(user: { id: number }): string {
  const secret = process.env.FORUM28_ACCESS_TOKEN_SECRET as string;
  if (!secret) {
    console.error("FORUM28_ACCESS_TOKEN_SECRET ortam değişkeni ayarlanmamış.");
    process.exit(1); // Gizli anahtar yoksa uygulama başlamamalı.
  }
  return jwt.sign(
    user,
    secret,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m' } as jwt.SignOptions
  );
}

//refresh token oluşturma fonksiyonu
function generateRefreshToken(user: { id: number }): string {
  const secret = process.env.FORUM28_REFRESH_TOKEN_SECRET as string;
  if (!secret) {
    console.error("FORUM28_REFRESH_TOKEN_SECRET ortam değişkeni ayarlanmamış.");
    process.exit(1); // Gizli anahtar yoksa uygulama başlamamalı.
  }
  return jwt.sign(
    user,
    secret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' } as jwt.SignOptions
  )
}

// kullanıcı oluşturma endpointi
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { email, name, userName, password } = req.body;

    const hashedPassword = await argon2.hash(password);
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        userName,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// login yapma endpointi
app.post('/login', async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body;

    //kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { userName: userName },
    });

    //kullanıcı yoksa hata döndür
    if (!user) {
      return res.status(401).json({ error: 'kullanıcı bulunamadı' });
    }

    //şifreyi doğrula argon2 ile
    const isPasswordValid = await argon2.verify(user.password, password);

    //şifre yanlışsa hata döndür
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre yanlış.' });
    }

    //token oluştur
    const accessToken = generateAccessToken({ id: user.id }); //access token oluştur
    const refreshToken = generateRefreshToken({ id: user.id }); //refresh token oluştur

    //refresh token'ı veritabanına kaydet
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); //7 gün geçerli

    await prisma.token.create({
      data: {
        token: refreshToken,
        type: 'REFRESH',
        expiresAt: expiresAt,
        userId: user.id,
      },
    });

    //şifreyi yanıttan çıkar
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "giriş başarılı",
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Bu kullanıcı adı veya email zaten kullanılıyor.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// çıkış yapma endpointi
app.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken || typeof refreshToken !== 'string') {
      return res.status(400).json({ error: "Refresh token gerekli." });
    }

    // req.user'ın varlığını kontrol et
    if (!req.user) {
      return res.status(401).json({ error: "Yetkilendirme hatası." });
    }

    //refresh token'ı veritabanından sil
    const deletedToken = await prisma.token.deleteMany({
      where: {
        token: refreshToken,
        userId: req.user.id,
      },
    });

    if (deletedToken.count === 0) {
      return res.status(400).json({ error: "Token bulunamadı veya zaten silinmiş." });
    }

    return res.json({ message: "Başarıyla çıkış yapıldı." });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// homePage(ansasayfa) endpointi
app.get('/homepage', authenticateToken, (req: Request, res: Response) => {
  // req.user'ın varlığını kontrol et
  if (!req.user) {
    return res.status(401).json({ error: "Yetkilendirme hatası." });
  }
  res.json({
    message: "Hoşgeldiniz! Ana sayfadasınız.",
    userId: req.user.id,
    timestamp: new Date().toISOString(),
  });
});

// Post oluşturma endpointi
app.post('/posts', authenticateToken, async (req: Request, res: Response) => {
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
});

// postları ekrana getirme endpointi
app.get('/posts', async (req: Request, res: Response) => {
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
})

// post silme endpointi(postu oluşturan siler)
app.delete('/posts/:id', authenticateToken, async (req: Request, res: Response) => {
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
})

/* app.get("/", (req: Request, res: Response) => {
  res.send("Taksim28'e Hoşgeldiniz");
}); */

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use(express.static('public'));