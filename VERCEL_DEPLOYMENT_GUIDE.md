# 🚀 Vercel Deployment Rehberi - Maya Meclisi

Bu proje **hem Render hem de Vercel'de** deploy edilebilir şekilde yapılandırılmıştır.

## 📁 Klasör Yapısı

```
maya-meclisi/
├── api/                      # Vercel serverless fonksiyonları
│   └── index.ts             # Express app (Vercel için entry point)
│
├── server/                   # Render/development için Express backend
│   ├── index.ts             # Ana server (Render için)
│   ├── routes.ts            # API route'ları
│   ├── vite.ts              # Vite middleware
│   └── services/            # Backend servisleri
│
├── client/                   # Vite React frontend
│   ├── src/
│   ├── public/
│   └── index.html
│
├── shared/                   # Ortak tipler ve şemalar
│   └── schema.ts
│
├── dist/                     # Build output (production)
│   ├── public/              # Frontend static files
│   └── index.js             # Backend bundle (Render için)
│
├── vercel.json              # Vercel yapılandırması
├── .vercelignore            # Vercel'e upload edilmeyecek dosyalar
└── package.json
```

---

## 🌐 İki Platform Karşılaştırması

### Render Deployment
- **Kullanılan Entry**: `server/index.ts`
- **Server Type**: Geleneksel Node.js server (Always-on)
- **Port**: 5000
- **Build**: `npm run build` → `dist/index.js`
- **Start**: `npm start` → `node dist/index.js`
- **Instagram Auto-Sync**: ✅ Aktif (sunucu sürekli çalışır)

### Vercel Deployment
- **Kullanılan Entry**: `api/index.ts`
- **Server Type**: Serverless Functions
- **Build**: `npm run build` → `dist/public/`
- **API Routes**: Otomatik olarak `/api` altında sunulur
- **Instagram Auto-Sync**: ⚠️ Sınırlı (cold start'larda çalışır)
- **Limits**: 
  - Free tier: 10s execution time
  - Pro tier: 60s execution time

---

## 🔧 Vercel'e Deploy Etme

### 1️⃣ Vercel CLI ile Deploy

```bash
# Vercel CLI'yi yükle (global)
npm i -g vercel

# Proje dizininde deploy et
vercel

# İlk deployment için sorulan sorular:
# - Set up and deploy "~/maya-meclisi"? Yes
# - Which scope? (Kendi hesabınızı seçin)
# - Link to existing project? No
# - Project name? maya-meclisi (veya istediğiniz isim)
# - In which directory is your code located? ./
# - Want to override settings? No

# Production deploy
vercel --prod
```

### 2️⃣ Vercel Dashboard ile Deploy (Önerilen)

1. **GitHub/GitLab/Bitbucket'a Push Edin**
   ```bash
   git add .
   git commit -m "Vercel deployment ready"
   git push origin main
   ```

2. **Vercel Dashboard'a Gidin**
   - https://vercel.com/dashboard
   - "Add New" → "Project"
   - Repository'nizi import edin

3. **Build Ayarları (Otomatik Algılanır)**
   - **Framework Preset**: Other
   - **Build Command**: `vite build` (sadece frontend)
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`
   
   **Not**: Backend (`api/index.ts`) Vercel tarafından otomatik build edilir!

4. **Environment Variables Ekleyin**
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SESSION_SECRET=your-session-secret
   
   # Instagram (opsiyonel)
   INSTAGRAM_ACCESS_TOKEN=your-token
   INSTAGRAM_ACCOUNT_ID=your-account-id
   ```

5. **Deploy!**
   - "Deploy" butonuna tıklayın
   - Her `main` branch'e push'ta otomatik deploy olur

---

## ⚙️ Vercel Yapılandırma Detayları

### `vercel.json` Açıklaması

```json
{
  "version": 2,
  "buildCommand": "npm run build",              // Frontend + backend build
  "outputDirectory": "dist/public",             // Static files dizini
  "framework": null,                            // Custom setup
  
  "functions": {
    "api/index.ts": {
      "memory": 1024,                           // 1GB RAM
      "maxDuration": 60                         // Max 60s (Pro plan gerekir)
    }
  },
  
  "rewrites": [
    {
      "source": "/api/:path*",                  // Tüm /api/* istekleri
      "destination": "/api"                     // api/index.ts'e yönlendir
    },
    {
      "source": "/:path*",                      // Diğer tüm istekler
      "destination": "/api"                     // SPA routing için api'ye
    }
  ]
}
```

### `.vercelignore` Açıklaması

- Development dosyaları ignore edilir
- `server/` klasörü ignore edilir (Vercel `api/` kullanır)
- SQL migration dosyaları ignore edilir
- Sadece production için gerekli dosyalar upload edilir

---

## 🎯 Build Process

### Local Test (Vercel Dev)

```bash
# Vercel dev server başlat (Vercel ortamını simüle eder)
vercel dev

# Otomatik olarak:
# - Frontend: http://localhost:3000
# - API: http://localhost:3000/api/*
```

### Production Build

```bash
# Manuel build (Vercel'in yaptığı işlem)
npm run build

# Sonuç:
# ├── dist/
# │   ├── public/              # Frontend (Vercel static hosting)
# │   │   ├── index.html
# │   │   ├── assets/
# │   │   └── ...
# │   └── index.js             # Backend (Render için, Vercel kullanmaz)
```

---

## 🔐 Environment Variables

### Frontend (.env veya Vercel Dashboard)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (Vercel Dashboard - Server-side)
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=your-random-secret
INSTAGRAM_ACCESS_TOKEN=optional
INSTAGRAM_ACCOUNT_ID=optional
```

**Not**: `VITE_` prefix'li değişkenler frontend'e inject edilir, diğerleri sadece backend'de kullanılabilir.

---

## 🚨 Önemli Notlar

### 1. Serverless Limitations
- **Cold Start**: İlk istek yavaş olabilir (~2-3s)
- **Execution Time**: Max 10s (Free) / 60s (Pro)
- **Stateless**: Her request farklı instance'da çalışabilir
- **WebSocket**: Desteklenmez (Instagram webhooks için Render tercih edilebilir)

### 2. Database Connections
- Supabase connection pooling kullanır, sorun olmaz
- Her serverless function kendi connection'ını açar

### 3. Instagram Auto-Sync
- Vercel'de sınırlıdır (serverless nature)
- Sürekli background job gerekiyorsa Render kullanın
- Vercel'de cron job eklenebilir (Vercel Cron Jobs feature)

### 4. File Uploads
- Multer memory storage kullanılır
- Vercel dosyaları `/tmp` dizinine yazar
- Kalıcı storage için Supabase Storage kullanın

---

## 📊 Platform Karşılaştırması

| Özellik | Render | Vercel |
|---------|--------|--------|
| **Server Type** | Always-on Node.js | Serverless Functions |
| **Cold Start** | Yok | Var (~2-3s) |
| **Execution Time** | Sınırsız | 10s (Free) / 60s (Pro) |
| **Background Jobs** | ✅ Full support | ⚠️ Limited (Cron Jobs) |
| **Static Files** | Express serve | CDN (çok hızlı) |
| **WebSocket** | ✅ Desteklenir | ❌ Desteklenmez |
| **Free Tier** | 750 saat/ay | Unlimited requests* |
| **Cost** | $7/mo (Hobby) | $20/mo (Pro) |
| **Build Time** | ~2-3 dakika | ~1-2 dakika |
| **Deploy Time** | ~30 saniye | ~10 saniye |

\* Fair use policy uygulanır

---

## ✅ Best Practices

### Render İçin İyi
- 📱 Instagram auto-sync (24/7 çalışmalı)
- 🔄 Background job'lar
- 🌐 WebSocket bağlantıları
- 💾 Sürekli database connections

### Vercel İçin İyi
- ⚡ Statik frontend hosting (CDN)
- 🚀 API endpoints (kısa execution time)
- 🌍 Global dağıtım (edge network)
- 📈 Auto-scaling (traffic spike'larda)

### Hibrit Yaklaşım (Önerilen)
```
Frontend → Vercel (Hızlı CDN)
API → Vercel (Serverless)
Background Jobs → Render (Always-on)
Instagram Sync → Render (Cron jobs)
Database → Supabase (Her ikisinden erişilebilir)
```

---

## 🆘 Troubleshooting

### Vercel Build Hatası
```bash
# Local'de build test et
npm run build

# Logs kontrol et
vercel logs
```

### API Routes Çalışmıyor
- `vercel.json` rewrites kontrolü
- Environment variables kontrolü
- Function logs: `vercel logs --follow`

### Cold Start Çok Yavaş
- Pro plan'e geçin (regions seçimi)
- Keep-alive istekleri gönderin (cronjob ile)

### Database Connection Error
- Supabase project ayarlarını kontrol edin
- Connection pooling aktif olmalı
- Service role key doğru mu?

---

## 📝 Deployment Checklist

- [ ] GitHub'a push edildi
- [ ] Vercel project oluşturuldu
- [ ] Environment variables eklendi
- [ ] Build başarılı
- [ ] `/` anasayfa çalışıyor
- [ ] `/api/announcements` API çalışıyor
- [ ] Login/logout çalışıyor
- [ ] Database bağlantısı OK
- [ ] Custom domain eklendi (opsiyonel)

---

## 🔗 Faydalı Linkler

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Vercel CLI Docs**: https://vercel.com/docs/cli
- **Supabase Dashboard**: https://supabase.com/dashboard

---

**🎉 Başarılar!** Her iki platformda da sorunsuz çalışacak şekilde yapılandırıldı.
