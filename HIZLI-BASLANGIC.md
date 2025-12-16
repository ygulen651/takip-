# Hızlı Başlangıç Kılavuzu

## Kurulum Adımları

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. MongoDB'nin çalıştığından emin olun
# Windows'ta MongoDB servis olarak çalışır
# Veya MongoDB Atlas (ücretsiz cloud) kullanın

# 3. .env.local dosyası oluştur
# MONGODB_URI=mongodb://localhost:27017/ajans-tracker
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=super-secret-xyz123
# NODE_ENV=development

# 4. Seed data'yı yükle
npm run seed

# 5. Development server'ı başlat
npm run dev

# 6. Tarayıcıda aç: http://localhost:3000
```

## Önemli Notlar

### Roller ve Yetkiler

**ADMIN:**
- Tüm müşteri, proje, görev işlemleri
- Görev atama ve ödeme yönetimi
- Raporları görüntüleme
- Tüm görevleri görür

**EMPLOYEE:**
- Sadece kendi görevlerini görür
- Görev durumu güncelleme
- Teslim linki ekleme
- Yorum ekleme
- Ödeme bilgilerini GÖREMEZ

### Ödeme Kuralları

- **PAID:** paidAmount === price && paidAt dolu
- **PARTIAL:** 0 < paidAmount < price
- **PENDING:** paidAmount === 0

### Geciken Görevler

- dueDate < bugün && status !== "DONE"
- Dashboard'da otomatik görünür

## Sayfa Yapısı

```
/login          → Giriş sayfası
/dashboard      → Ana dashboard (herkes)
/clients        → Müşteriler (sadece admin)
/projects       → Projeler (sadece admin)
/tasks          → Tüm görevler (sadece admin)
/my-tasks       → Görevlerim (herkes kendi görevleri)
/reports        → Raporlar (sadece admin)
```

## Seed Data İçeriği

- 1 Admin + 2 Çalışan
- 2 Müşteri
- 2 Aktif Proje
- 10 Görev (farklı durum ve ödeme kombinasyonları)
- 6 Yorum

## MongoDB Kurulumu

### Windows için Local MongoDB

1. İndirin: https://www.mongodb.com/try/download/community
2. Kurulum sırasında "Install as Service" seçeneğini işaretleyin
3. MongoDB otomatik olarak başlayacaktır

### MongoDB Atlas (Ücretsiz Cloud)

1. https://www.mongodb.com/cloud/atlas/register
2. Ücretsiz M0 cluster oluşturun
3. Database User oluşturun
4. IP whitelist'e 0.0.0.0/0 ekleyin (geliştirme için)
5. Connection string'i alın ve `.env.local`'e ekleyin

## Sorun Giderme

### Port 3000 kullanımda
```bash
# Farklı port kullan
PORT=3001 npm run dev
```

### MongoDB bağlantı hatası
```bash
# MongoDB'nin çalıştığını kontrol et
docker-compose ps mongo

# Veya manuel
mongod --version
```

### Seed hatası
```bash
# MongoDB'de veritabanını temizleyin ve tekrar seed çalıştırın
npm run seed
```

## Özellikler

✅ Rol tabanlı yetkilendirme (RBAC)
✅ Görev bazlı ödeme takibi
✅ Kanban board görünümü
✅ Gerçek zamanlı dashboard
✅ Detaylı raporlama
✅ Yorum sistemi
✅ Responsive tasarım
✅ TypeScript
✅ ESLint + Prettier

## Teknolojiler

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- MongoDB + Mongoose
- NextAuth

## İletişim

Sorularınız için issue açabilirsiniz.

---

**Not:** Production'da `NEXTAUTH_SECRET` ve MongoDB şifresini mutlaka değiştirin!

