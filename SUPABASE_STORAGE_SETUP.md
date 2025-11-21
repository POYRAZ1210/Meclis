# 📦 Supabase Storage Kurulumu

File upload özelliği için Supabase Storage bucket'ı oluşturmanız gerekiyor.

---

## 🚀 Adım Adım Kurulum

### 1️⃣ Supabase Dashboard'a Gidin

1. https://supabase.com/dashboard adresine gidin
2. Projenizi seçin: **zpohslofrljuepuuwpjf**
3. Sol menüden **Storage** tıklayın

---

### 2️⃣ Bucket Oluşturun

1. **"Create a new bucket"** veya **"New bucket"** butonuna tıklayın

2. Şu bilgileri girin:
   ```
   Name: ideas-media
   Public bucket: ✅ AÇIK (Public)
   File size limit: 10 MB
   Allowed MIME types: Boş bırakın (tüm dosyalar)
   ```

3. **"Create bucket"** butonuna tıklayın

**Önemli:** Public bucket seçmelisiniz ki herkes resimleri görebilsin!

---

### 3️⃣ Storage Policies Ekleyin

Bucket oluşturduktan sonra **policies** (güvenlik kuralları) eklemeniz gerekiyor.

#### Yöntem 1: Dashboard'dan (Kolay)

1. Storage → **ideas-media** bucket'ına tıklayın
2. Üstteki **Policies** sekmesine tıklayın
3. **"New Policy"** butonuna tıklayın

#### 4 Adet Policy Oluşturun:

**Policy 1: Public View (Herkes Görebilir)**
```
Policy name: Public can view files
Allowed operation: SELECT
Target roles: public
USING expression: bucket_id = 'ideas-media'
```

**Policy 2: Authenticated Upload (Giriş Yapanlar Yükleyebilir)**
```
Policy name: Authenticated users can upload
Allowed operation: INSERT
Target roles: authenticated
WITH CHECK expression: bucket_id = 'ideas-media'
```

**Policy 3: Owner Delete (Kendi Dosyalarını Silebilir)**
```
Policy name: Users can delete own files
Allowed operation: DELETE
Target roles: authenticated
USING expression: bucket_id = 'ideas-media' AND auth.uid()::text = (storage.foldername(name))[1]
```

**Policy 4: Owner Update (Kendi Dosyalarını Güncelleyebilir)**
```
Policy name: Users can update own files
Allowed operation: UPDATE
Target roles: authenticated
USING expression: bucket_id = 'ideas-media' AND auth.uid()::text = (storage.foldername(name))[1]
```

---

#### Yöntem 2: SQL ile (Hızlı)

**SQL Editor** → **New query** açın ve şunu çalıştırın:

```sql
-- Policy 1: Herkes görebilir
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ideas-media');

-- Policy 2: Giriş yapanlar yükleyebilir
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ideas-media');

-- Policy 3: Kendi dosyalarını silebilir
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ideas-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Kendi dosyalarını güncelleyebilir
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ideas-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**"Run"** butonuna tıklayın.

---

## ✅ Kontrol Edin

Kurulum tamamlandıktan sonra kontrol edin:

### Dashboard'da Kontrol:

1. **Storage** → **ideas-media** → **Policies** sekmesi
2. 4 adet policy görmelisiniz:
   - ✅ Public can view files (SELECT)
   - ✅ Authenticated users can upload (INSERT)
   - ✅ Users can delete own files (DELETE)
   - ✅ Users can update own files (UPDATE)

---

## 🧪 Test Edin

### 1. Yeni Fikir Ekleyin

1. Maya Meclisi → **Fikirler** sayfası
2. "Yeni Fikir Paylaş" butonuna tıklayın
3. Resim veya video yükleyin
4. Fikir içeriğini yazın
5. "Paylaş" butonuna tıklayın

**Beklenen sonuç:**
- ✅ Dosya yüklenmeli
- ✅ "Fikir gönderildi!" mesajı görünmeli
- ❌ "Unexpected token 'A'" hatası almamalısınız

### 2. Yeni Duyuru Ekleyin (Admin)

1. Admin paneli → **Duyurular** → "Yeni Duyuru"
2. Resim yükleyin (opsiyonel)
3. Başlık ve içerik yazın
4. "Oluştur" butonuna tıklayın

**Beklenen sonuç:**
- ✅ Duyuru oluşturulmalı
- ✅ Resim varsa gösterilmeli

---

## 🐛 Sorun Giderme

### Hata: "Bucket not found"
- ✅ Bucket adını kontrol edin: tam olarak `ideas-media` olmalı
- ✅ Bucket'ın Public olduğundan emin olun

### Hata: "new row violates row-level security policy"
- ✅ Policies eklediğinizden emin olun
- ✅ SQL Editor'dan policy'leri kontrol edin:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'objects';
  ```

### Hata: "Dosya yüklenirken hata oluştu"
- ✅ Dosya boyutunu kontrol edin (max 10MB)
- ✅ Supabase environment variables'ları kontrol edin (SUPABASE_SERVICE_ROLE_KEY)
- ✅ Browser console'da hata loglarını kontrol edin (F12)

### Hata: "403 Forbidden"
- ✅ INSERT policy'si olduğundan emin olun
- ✅ Kullanıcı giriş yapmış olmalı

---

## 📊 Storage Kullanım İstatistikleri

Bucket'ı oluşturduktan sonra kullanım istatistiklerini görebilirsiniz:

**Storage** → **ideas-media** → **Usage**
- Toplam dosya sayısı
- Toplam boyut
- Son yüklenen dosyalar

---

## 🔐 Güvenlik Notları

1. **Public bucket**: Herkes URL ile dosyalara erişebilir
2. **Dosya adları**: UUID ile şifrelenir (güvenlik için)
3. **Yetkilendirme**: Sadece giriş yapanlar yükleyebilir
4. **Silme**: Sadece kendi dosyalarını silebilir

---

## 🎯 Özet Checklist

Kurulum için:

- [ ] Supabase Dashboard → Storage açıldı
- [ ] `ideas-media` bucket'ı oluşturuldu
- [ ] Bucket **Public** olarak işaretlendi
- [ ] 4 adet policy eklendi (SELECT, INSERT, DELETE, UPDATE)
- [ ] Policies kontrol edildi
- [ ] Yeni fikir ile test edildi
- [ ] Dosya yükleme çalışıyor ✅

---

**Faydalı Linkler:**
- Supabase Storage Docs: https://supabase.com/docs/guides/storage
- Storage Policies Guide: https://supabase.com/docs/guides/storage/security/access-control
- Maya Meclisi Local: http://localhost:5000
