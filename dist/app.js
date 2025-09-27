var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { PrismaClient } from "@prisma/client";
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
const authenticateToken = (req, res, next) => {
    const autHeader = req.headers['authorization'];
    const token = autHeader && autHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Erişim için giriş yapmalısınız." });
    }
    jwt.verify(token, process.env.FORUM28_ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Oturum süresi doldu, lütfen tekrar giriş yapın." });
        }
        req.user = user;
        next();
    });
};
//access token oluşturma fonksiyonu
function generateAccessToken(user) {
    return jwt.sign(user, process.env.FORUM28_ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m' });
}
//refresh token oluşturma fonksiyonu
function generateRefreshToken(user) {
    return jwt.sign(user, process.env.FORUM28_REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' });
}
// kullanıcı oluşturma endpointi
app.post("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, userName, password } = req.body;
        const hashedPassword = yield argon2.hash(password);
        const newUser = yield prisma.user.create({
            data: {
                email,
                name,
                userName,
                password: hashedPassword,
            },
        });
        const { password: _ } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// login yapma endpointi
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userName, password } = req.body;
        //kullanıcıyı bul
        const user = yield prisma.user.findUnique({
            where: { userName: userName },
        });
        //kullanıcı yoksa hata döndür
        if (!user) {
            return res.status(401).json({ error: 'kullanıcı bulunamadı' });
        }
        //şifreyi doğrula argon2 ile
        const isPasswordValid = yield argon2.verify(user.password, password);
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
        yield prisma.token.create({
            data: {
                token: refreshToken,
                type: 'REFRESH',
                expiresAt: expiresAt,
                userId: user.id,
            },
        });
        //şifreyi yanıttan çıkar
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json({
            message: "giriş başarılı",
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error(error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Bu kullanıcı adı veya email zaten kullanılıyor.' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// çıkış yapma endpointi
app.post('/logout', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken || typeof refreshToken !== 'string') {
            return res.status(400).json({ error: "Refresh token gerekli." });
        }
        //refresh token'ı veritabanından sil
        const deletedToken = yield prisma.token.deleteMany({
            where: {
                token: refreshToken,
                userId: req.user.id,
            },
        });
        if (deletedToken.count === 0) {
            return res.status(400).json({ error: "Token bulunamadı veya zaten silinmiş." });
        }
        return res.json({ message: "Başarıyla çıkış yapıldı." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// homePage(ansasayfa) endpointi
app.get('/homepage', authenticateToken, (req, res) => {
    res.json({
        message: "Hoşgeldiniz! Ana sayfadasınız.",
        userId: req.user.id,
        timestamp: new Date().toISOString(),
    });
});
/* app.get("/", (req: Request, res: Response) => {
  res.send("Taksim28'e Hoşgeldiniz");
}); */
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
app.use(express.static('public'));
//# sourceMappingURL=app.js.map