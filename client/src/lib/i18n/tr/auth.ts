export const authTranslations = {
  // Login errors
  "auth.invalid_credentials": "E-posta veya şifre hatalı",
  "auth.invalid_email": "Geçersiz e-posta adresi",
  "auth.email_not_confirmed": "E-posta adresiniz onaylanmamış",
  "auth.user_not_found": "Kullanıcı bulunamadı",
  "auth.too_many_requests": "Çok fazla deneme. Lütfen daha sonra tekrar deneyin",
  
  // Registration errors
  "auth.email_already_exists": "Bu e-posta adresi zaten kayıtlı",
  "auth.weak_password": "Şifre çok zayıf. En az 6 karakter kullanın",
  "auth.password_too_short": "Şifre en az 6 karakter olmalıdır",
  
  // Profile errors
  "auth.profile_not_found": "Profil bulunamadı. Lütfen destek ekibiyle iletişime geçin",
  "auth.profile_creation_failed": "Profil oluşturulamadı. Lütfen destek ekibiyle iletişime geçin",
  
  // Generic errors
  "auth.unknown.login": "Giriş yapılırken bir hata oluştu",
  "auth.unknown.register": "Kayıt sırasında bir hata oluştu",
  "auth.unknown.profile": "Profil yüklenirken bir hata oluştu",
  "auth.network_error": "Bağlantı hatası. İnternet bağlantınızı kontrol edin",
};

export type AuthTranslationKey = keyof typeof authTranslations;
