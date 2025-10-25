# Forum28 - Blog API

**TypeScript ve Node.js öğrenme projesi** - Modern backend development pratiği için CRUD blog API.

## 🎯 Proje Amacı

Bu proje, **Node.js, TypeScript ve modern web teknolojilerini** öğrenmek için geliştirilmiştir. Temel backend konseptlerini pratik etmek ve **RESTful API** geliştirme becerilerini artırmak hedeflenmiştir.

## 🛠️ Teknoloji Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT Tokens + Argon2 Hashing
- **Development:** Nodemon, ts-node
- **Testing:** Postman Collection

## ⚡ Kurulum & Çalıştırma

```bash
# Projeyi klonla
git clone https://github.com/asmaydn28/forum28
cd forum28

# Bağımlılıkları yükle
npm install

# Environment variables (.env dosyası oluştur)
DATABASE_URL="postgresql://user:pass@localhost:5432/forum28"
PORT=3000
JWT_SECRET="your-secret-key"

# Veritabanı kur
npx prisma migrate dev
npx prisma generate

# Development server
npm run dev
```

## 📚 API Endpoints

### Auth
- `POST /api/auth/login` - Giriş
- `POST /api/auth/logout` - Çıkış

### Users
- `POST /api/users` - Kullanıcı oluştur
- `GET /api/users` - Kullanıcıları listele

### Posts (Blog Yazıları)
- `POST /api/posts` - Post oluştur (Auth required)
- `GET /api/posts` - Postları listele
- `GET /api/posts/:id` - Post detayı
- `PATCH /api/posts/:id` - Post güncelle (Auth required)
- `DELETE /api/posts/:id` - Post sil (Auth required)

## 🔐 Authentication

JWT token tabanlı kimlik doğrulama. Post CRUD işlemleri için giriş gerekli.

## 🧪 Test

`Forum28.postman_collection.json` dosyasını Postman'a import edip test edebilirsiniz.

## 📁 Proje Yapısı

```
src/
├── modules/
│   ├── auth/     # Giriş/Çıkış
│   ├── user/     # Kullanıcı yönetimi
│   └── post/     # Blog postları
├── middlewares/  # JWT auth, validation
├── config/       # Environment settings
└── app/         # Express app setup
```

## 🚀 Development

```bash
npm run dev    # Development server
npx prisma studio  # Database GUI
```
