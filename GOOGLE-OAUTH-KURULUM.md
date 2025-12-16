# Google OAuth Kurulumu

Google ile giriş özelliği için Google Cloud Console'dan OAuth credentials almanız gerekiyor.

## Adım 1: Google Cloud Console

1. https://console.cloud.google.com/ adresine gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin

## Adım 2: OAuth Consent Screen

1. Sol menüden **APIs & Services** → **OAuth consent screen**
2. **External** seçin, **CREATE** butonuna tıklayın
3. Formu doldurun:
   - App name: **Ugi Takip**
   - User support email: Email adresiniz
   - Developer contact: Email adresiniz
4. **SAVE AND CONTINUE**

## Adım 3: Credentials Oluşturma

1. Sol menüden **Credentials** → **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Application type: **Web application**
3. Name: **Ugi Takip Web**
4. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   ```
5. **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. **CREATE** butonuna tıklayın

## Adım 4: Credentials'ı Kopyalayın

1. Client ID ve Client secret'ı kopyalayın
2. `.env.local` dosyanıza ekleyin:

```env
# Mevcut ayarlar...
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ajans-super-secret-key-xyz789
NODE_ENV=development

# Google OAuth (YENİ)
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## Adım 5: Uygulamayı Yeniden Başlatın

```bash
# Development server'ı durdurun (Ctrl+C)
# Yeniden başlatın
npm run dev
```

## Test

1. http://localhost:3000/login adresine gidin
2. **"Google ile Giriş Yap"** butonuna tıklayın
3. Google hesabınızı seçin
4. İlk girişte otomatik olarak EMPLOYEE rolü ile hesap oluşturulur

## Üretim (Production) İçin

Production'da deploy ederken:

1. Google Cloud Console'a dönün
2. **Authorized JavaScript origins** ve **Authorized redirect URIs**'e production URL'inizi ekleyin:
   ```
   https://your-domain.com
   https://your-domain.com/api/auth/callback/google
   ```

3. Environment değişkenlerini production'da güncelleyin:
   ```env
   NEXTAUTH_URL=https://your-domain.com
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

## Notlar

- İlk Google girişinde kullanıcı otomatik olarak **EMPLOYEE** rolü ile oluşturulur
- Admin yapmak için MongoDB'de manuel olarak role'ü değiştirmeniz gerekir
- Google ile giriş yapan kullanıcılar şifre ile giriş yapamazlar (veya rastgele şifre atanır)

