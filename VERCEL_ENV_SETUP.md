# 🔧 Vercel Environment Variables Kurulumu

## ❗ Hata: "Unexpected token 'A'..."

Bu hata Vercel'de environment variables eksik olduğu için API'lerin çalışmadığını gösterir.

---

## ✅ Çözüm: Environment Variables Ekleyin

### 1️⃣ Vercel Dashboard'a Gidin
https://vercel.com/dashboard → Projenizi seçin → **Settings** → **Environment Variables**

### 2️⃣ Şu Değişkenleri Ekleyin

#### Frontend (Public - `VITE_` prefix)
```bash
VITE_SUPABASE_URL=https://zpohslofrljuepuuwpjf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Backend (Server-side - NO prefix)
```bash
SUPABASE_URL=https://zpohslofrljuepuuwpjf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SESSION_SECRET=your-random-secret-min-32-chars
```

#### Instagram (Opsiyonel)
```bash
INSTAGRAM_ACCESS_TOKEN=your-instagram-token
INSTAGRAM_ACCOUNT_ID=your-instagram-account-id
```

---

## 🔍 Environment Variable Değerleri Nereden Bulunur?

### Supabase Keys
1. https://supabase.com/dashboard → Projenizi seçin
2. **Settings** → **API**
3. Şu değerleri kopyalayın:
   - **Project URL** → `SUPABASE_URL` ve `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (🔒 GİZLİ!)

### Session Secret
Rastgele bir string oluşturun (en az 32 karakter):
```bash
# Node.js ile oluşturun:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📝 Vercel'de Nasıl Eklerim?

### Yöntem 1: Dashboard (Önerilen)
1. Vercel Dashboard → Projeniz → Settings → Environment Variables
2. **Add New** butonuna tıklayın
3. Her bir variable için:
   - **Key**: Değişken adı (örn: `VITE_SUPABASE_URL`)
   - **Value**: Değer (örn: `https://zpohslofrljuepuuwpjf...`)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development (hepsini seçin)
4. **Save** butonuna tıklayın
5. Tüm değişkenler için tekrarlayın

### Yöntem 2: CLI
```bash
# Her variable için:
vercel env add VITE_SUPABASE_URL

# Sorulacak sorular:
# - What's the value? → Değeri girin
# - Environments? → Production, Preview, Development (hepsini seçin)
```

---

## 🔄 Environment Variables Eklendikten Sonra

### 1. Redeploy Yapın
Environment variables ekledikten sonra **yeniden deploy** etmelisiniz:

```bash
# CLI ile:
vercel --prod --force

# Ya da Vercel Dashboard'dan:
# Deployments → Latest → ... → Redeploy
```

### 2. Kontrol Edin
Deploy tamamlandıktan sonra:
- https://your-app.vercel.app → Ana sayfa açılmalı
- Duyurular bölümü çalışmalı
- Fikirler bölümü çalışmalı
- Oylamalar çalışmalı

---

## 🚨 Önemli Notlar

### Security
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` **asla frontend'de kullanılmamalı**
- ⚠️ `VITE_` prefix'li değişkenler **public'tir** (herkes görebilir)
- ⚠️ Service role key'i **kimseyle paylaşmayın**

### Debugging
Eğer hala çalışmıyorsa:

1. **Vercel Logs Kontrol**:
   ```bash
   vercel logs --follow
   ```

2. **Browser Console Kontrol**:
   - F12 → Console → Hataları kontrol edin
   - Network → API isteklerini kontrol edin

3. **Environment Variables Kontrol**:
   - Vercel Dashboard → Settings → Environment Variables
   - Tüm değerlerin doğru girildiğinden emin olun

---

## ✅ Checklist

Vercel'de çalışması için:

- [ ] `VITE_SUPABASE_URL` eklendi
- [ ] `VITE_SUPABASE_ANON_KEY` eklendi
- [ ] `SUPABASE_URL` eklendi (backend için)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` eklendi (backend için)
- [ ] `SESSION_SECRET` eklendi
- [ ] Tüm environment'lar seçildi (Production, Preview, Development)
- [ ] Redeploy yapıldı
- [ ] Site test edildi

---

## 🎯 Hızlı Referans

| Variable | Nereden? | Kullanım |
|----------|----------|----------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL | Frontend auth |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public | Frontend auth |
| `SUPABASE_URL` | Aynı (Project URL) | Backend API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role | Backend admin |
| `SESSION_SECRET` | `node -e "console.log(...)"` | Express session |

---

**🔗 Faydalı Linkler:**
- Vercel Env Vars: https://vercel.com/docs/environment-variables
- Supabase Dashboard: https://supabase.com/dashboard
- Vercel Logs: https://vercel.com/docs/observability/runtime-logs
