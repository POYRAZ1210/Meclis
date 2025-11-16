# Instagram Otomatik Post Çekme - Kurulum Rehberi

## 🔧 Gereksinimler

Instagram'dan otomatik post çekmek için:

1. **Instagram Business veya Creator hesabı** (kişisel hesap çalışmaz)
2. **Facebook Page'e bağlı Instagram hesabı**
3. **Meta Developer hesabı ve App**
4. **Access Token**

## 📝 Adım Adım Setup

### 1. Instagram Business Hesabı

- Instagram > Ayarlar > Hesap Türü > "Professional Account"'a geç
- "Business" veya "Creator" seç

### 2. Facebook Page Bağlantısı

- Facebook'ta bir Page oluştur (varsa kullan)
- Instagram > Ayarlar > Account > Linked Accounts > Facebook
- Page'i Instagram hesabına bağla

### 3. Meta Developer App

1. https://developers.facebook.com/ adresine git
2. "My Apps" > "Create App" > "Business" seç
3. App adı ver (örn: "Maya Meclisi Portal")
4. Instagram Graph API'yi ekle

### 4. Access Token Al

```bash
# Facebook Page ID'ni bul
https://www.facebook.com/YOUR_PAGE > About > Page ID

# Graph API Explorer'dan token al
https://developers.facebook.com/tools/explorer/

Permissions seç:
- instagram_basic
- pages_read_engagement  
- pages_show_list

"Generate Access Token" tıkla
```

### 5. Instagram Business Account ID Bul

```bash
GET https://graph.facebook.com/v20.0/{PAGE_ID}?fields=instagram_business_account&access_token={TOKEN}

Response:
{
  "instagram_business_account": {
    "id": "123456789"  # Bu ID'yi kaydet
  }
}
```

### 6. Replit Secrets Ekle

```
INSTAGRAM_BUSINESS_ACCOUNT_ID=123456789
INSTAGRAM_ACCESS_TOKEN=your_long_token_here
```

## 🚀 Otomatik Çekme Sistemi

Sistem her 15 dakikada bir yeni postları kontrol edecek ve Supabase'e kaydedecek.

## ⚙️ Manuel Alternatif

Access token alamıyorsanız:
- Admin panelden Instagram post URL'sini manuel girin
- Sistem oEmbed API ile bilgileri çekecek
- Daha basit ama manuel işlem gerektirir

## 📚 Kaynaklar

- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-platform)
- [Access Token Guide](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/)
