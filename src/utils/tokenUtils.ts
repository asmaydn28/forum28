import jwt from 'jsonwebtoken';

//access token oluşturma fonksiyonu
export function generateAccessToken(user: { id: number }): string {
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
export function generateRefreshToken(user: { id: number }): string {
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
