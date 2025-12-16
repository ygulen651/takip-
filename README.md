# Ugi Takip - Görev ve Ödeme Takip Sistemi

Görev bazlı iş ve ödeme takibi yapan full-stack web uygulaması.

## Özellikler

- Müşteri, Proje ve Görev yönetimi
- Görev bazlı ödeme takibi (Pending/Partial/Paid)
- Rol tabanlı yetkilendirme (Admin/Employee)
- Kanban board görünümü
- Görev yorumlama sistemi
- Dashboard ve raporlama
- Responsive tasarım

## Teknoloji Stack

- **Framework:** Next.js 14 (App Router)
- **Dil:** TypeScript
- **UI:** Tailwind CSS
- **Veritabanı:** MongoDB
- **ODM:** Mongoose
- **Auth:** NextAuth (Credentials)

## Kurulum

### Ön Gereksinimler

- Node.js 20+
- MongoDB (local veya MongoDB Atlas)

### Kurulum Adımları

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Environment değişkenlerini ayarlayın:

`.env.local` dosyası oluşturun:
```env
MONGODB_URI=mongodb://localhost:27017/ajans-tracker
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this
NODE_ENV=development
```

3. MongoDB'nin çalıştığından emin olun

4. Seed data'yı yükleyin:
```bash
npm run seed
```

5. Development server'ı başlatın:
```bash
npm run dev
```

6. Tarayıcıda açın: http://localhost:3000

## Giriş Bilgileri

Seed işleminden sonra aşağıdaki hesapları kullanabilirsiniz:

### Admin
- **Email:** admin@example.com
- **Şifre:** password123
- **Yetkiler:** Tüm CRUD işlemleri, ödeme yönetimi, raporlar

### Çalışan 1
- **Email:** employee1@example.com
- **Şifre:** password123
- **Yetkiler:** Sadece kendi görevlerini görür ve güncelleyebilir

### Çalışan 2
- **Email:** employee2@example.com
- **Şifre:** password123
- **Yetkiler:** Sadece kendi görevlerini görür ve güncelleyebilir

## Kullanım

### Admin Kullanıcı

1. **Dashboard:** Genel özet, geciken görevler, ödeme durumu
2. **Müşteriler:** Müşteri CRUD işlemleri
3. **Projeler:** Proje oluşturma ve yönetimi
4. **Görevler:** Tüm görevleri görüntüleme, oluşturma, atama
5. **Raporlar:** Detaylı analiz ve istatistikler

### Çalışan Kullanıcı

1. **Dashboard:** Kişisel görev özeti
2. **Görevlerim:** Atanmış görevleri görüntüleme ve güncelleme
3. Görev durumu değiştirme
4. Teslim linki ekleme
5. Yorum ekleme

### Özellik Detayları

#### Görev Durumları
- **BACKLOG:** Beklemede
- **IN_PROGRESS:** Devam ediyor
- **REVIEW:** İncelemede
- **DONE:** Tamamlandı

#### Ödeme Durumları
- **PENDING:** Ödeme bekleniyor (paidAmount = 0)
- **PARTIAL:** Kısmi ödeme (0 < paidAmount < price)
- **PAID:** Tamamen ödendi (paidAmount = price)

#### Öncelik Seviyeleri
- **LOW:** Düşük
- **MEDIUM:** Orta
- **HIGH:** Yüksek

## API Endpoints

### Auth
- `POST /api/auth/signin` - Giriş

### Clients (Admin Only)
- `GET /api/clients` - Tüm müşteriler
- `POST /api/clients` - Yeni müşteri
- `PATCH /api/clients/[id]` - Müşteri güncelle
- `DELETE /api/clients/[id]` - Müşteri sil

### Projects (Admin Only)
- `GET /api/projects` - Tüm projeler
- `POST /api/projects` - Yeni proje
- `GET /api/projects/[id]` - Proje detay
- `PATCH /api/projects/[id]` - Proje güncelle

### Tasks
- `GET /api/tasks` - Görevler (filtreli)
- `POST /api/tasks` - Yeni görev (Admin)
- `GET /api/tasks/[id]` - Görev detay
- `PATCH /api/tasks/[id]` - Görev güncelle
- `PATCH /api/tasks/[id]/payment` - Ödeme güncelle (Admin)
- `GET /api/tasks/[id]/comments` - Görev yorumları
- `POST /api/tasks/[id]/comments` - Yorum ekle

### Dashboard
- `GET /api/dashboard` - Dashboard verileri

### Reports (Admin Only)
- `GET /api/reports/summary` - Rapor özeti

### Users (Admin Only)
- `GET /api/users` - Tüm kullanıcılar

## Proje Yapısı

```
ajans/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── dashboard/         # Dashboard sayfası
│   │   ├── clients/           # Müşteriler sayfası
│   │   ├── projects/          # Projeler sayfası
│   │   ├── tasks/             # Görevler sayfası
│   │   ├── my-tasks/          # Görevlerim sayfası
│   │   ├── reports/           # Raporlar sayfası
│   │   └── login/             # Login sayfası
│   ├── components/            # React componentleri
│   ├── lib/                   # Yardımcı fonksiyonlar
│   ├── models/                # Mongoose modelleri
│   └── types/                 # TypeScript tip tanımları
├── scripts/
│   └── seed.ts                # Seed script
├── docker-compose.yml         # Docker Compose config
├── Dockerfile                 # Docker image
├── package.json
├── tsconfig.json
└── README.md
```

## Geliştirme

### Kod Kalitesi

```bash
# Lint kontrolü
npm run lint

# Format kontrolü
npm run format
```

### Build

```bash
# Production build
npm run build

# Production başlat
npm start
```

## Sorun Giderme

### MongoDB Bağlantı Hatası

```bash
# MongoDB'nin çalıştığını kontrol edin
# Windows'ta Services'den MongoDB servisi kontrol edilebilir

# Veya MongoDB Atlas kullanın (ücretsiz cloud database)
```

### Port Çakışması

```bash
# Farklı port kullanın
PORT=3001 npm run dev
```

## Güvenlik Notları

- Production'da `NEXTAUTH_SECRET` değerini mutlaka değiştirin
- Güçlü şifreler kullanın
- HTTPS kullanın
- Environment değişkenlerini güvenli tutun
- MongoDB'yi internete açmayın

## Lisans

MIT

## Destek

Sorularınız için issue açabilirsiniz.

