import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, type DesignTheme, type ColorMode } from "@/contexts/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Lock, Upload, Image as ImageIcon, Palette, Sun, Moon, Sparkles, GraduationCap } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Profile() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { designTheme, colorMode, setDesignTheme, setColorMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      toast({
        variant: "destructive",
        description: "Lütfen yeni e-posta adresinizi girin",
      });
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) throw error;

      toast({
        description: "E-posta adresi güncelleme talebi gönderildi. Lütfen yeni e-posta adresinizi doğrulayın.",
      });
      setNewEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "E-posta güncellenirken hata oluştu",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        description: "Lütfen tüm alanları doldurun",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        description: "Şifre en az 8 karakter olmalıdır",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        description: "Şifreler eşleşmiyor",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;

      toast({
        description: "Şifreniz başarıyla güncellendi",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Şifre güncellenirken hata oluştu",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow specific image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        description: "Sadece JPG, JPEG ve PNG dosyaları yüklenebilir",
      });
      return;
    }

    // Check file extension as well
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      toast({
        variant: "destructive",
        description: "Sadece .jpg, .jpeg ve .png uzantılı dosyalar yüklenebilir",
      });
      return;
    }

    // Maximum 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        description: "Dosya boyutu 2MB'dan küçük olmalıdır",
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data: { session } } = await supabase.auth.getSession();
      
      // Use dedicated profile picture endpoint with strict server-side validation
      const res = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Dosya yüklenirken hata oluştu');
      }

      toast({
        description: "Profil fotoğrafınız yönetici onayına gönderildi",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error.message || "Fotoğraf yüklenirken hata oluştu",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profil Ayarları</h1>
        <p className="text-muted-foreground">Hesap bilgilerinizi yönetin</p>
      </div>

      <div className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Profil Fotoğrafı
            </CardTitle>
            <CardDescription>
              Profil fotoğrafınızı güncelleyebilirsiniz. Yüklediğiniz fotoğraf yönetici onayından sonra yayınlanacaktır.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Profil Fotoğrafı Kuralları</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Fotoğrafınızda yalnızca kendi yüzünüz yer almalıdır</li>
                <li>Uygunsuz, rahatsız edici veya başka kişilere ait görseller kabul edilmez</li>
                <li>Fotoğraf net, düzgün ve tanınabilir olmalıdır</li>
                <li>Sadece JPG, JPEG ve PNG formatları kabul edilir</li>
                <li>Maksimum dosya boyutu 2MB</li>
              </ul>
              <p className="mt-3 text-yellow-600 dark:text-yellow-400 font-medium">
                Uygunsuz fotoğraflar silinir ve hesabınız askıya alınabilir.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 avatar-hover-ring cursor-pointer">
                <AvatarImage src={profile?.profile_picture_url || undefined} alt={profile?.first_name || undefined} />
                <AvatarFallback>{profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {profile?.profile_picture_status === 'pending' && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-3">
                    Fotoğrafınız onay beklemektedir
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  data-testid="input-profile-picture"
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  data-testid="button-upload-picture"
                >
                  {isUploadingPhoto && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Upload className="mr-2 h-4 w-4" />
                  Fotoğraf Yükle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil Bilgileri
            </CardTitle>
            <CardDescription>Genel hesap bilgileriniz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Ad Soyad</Label>
              <div className="mt-1 text-sm text-muted-foreground">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}` 
                  : "Belirtilmemiş"}
              </div>
            </div>
            <div>
              <Label>Sınıf</Label>
              <div className="mt-1 text-sm text-muted-foreground">
                {profile?.class_name || "Belirtilmemiş"}
              </div>
            </div>
            <div>
              <Label>Öğrenci No</Label>
              <div className="mt-1 text-sm text-muted-foreground">
                {profile?.student_no || "Belirtilmemiş"}
              </div>
            </div>
            <div>
              <Label>Rol</Label>
              <div className="mt-1 text-sm text-muted-foreground">
                {profile?.role === "admin" ? "Yönetici" : profile?.role === "teacher" ? "Öğretmen" : "Öğrenci"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tema Ayarları
            </CardTitle>
            <CardDescription>Görünüm tercihlerinizi özelleştirin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">Tasarım Teması</Label>
              <RadioGroup 
                value={designTheme} 
                onValueChange={(value) => setDesignTheme(value as DesignTheme)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer card-hover-scale group" onClick={() => setDesignTheme('maya')}>
                  <RadioGroupItem value="maya" id="theme-maya" data-testid="radio-theme-maya" />
                  <Label htmlFor="theme-maya" className="flex items-center gap-3 cursor-pointer flex-1">
                    <GraduationCap className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-medium">Maya Klasik</div>
                      <div className="text-xs text-muted-foreground">Mor ve beyaz okul teması</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer card-hover-scale group" onClick={() => setDesignTheme('framer')}>
                  <RadioGroupItem value="framer" id="theme-framer" data-testid="radio-theme-framer" />
                  <Label htmlFor="theme-framer" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Sparkles className="h-5 w-5 text-primary group-hover:rotate-12 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-medium">Modern</div>
                      <div className="text-xs text-muted-foreground">Cam efektli modern tasarım</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Renk Modu</Label>
              <RadioGroup 
                value={colorMode} 
                onValueChange={(value) => setColorMode(value as ColorMode)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer card-hover-scale group" onClick={() => setColorMode('light')}>
                  <RadioGroupItem value="light" id="color-light" data-testid="radio-color-light" />
                  <Label htmlFor="color-light" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Sun className="h-5 w-5 text-yellow-500 group-hover:rotate-45 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-medium">Açık Mod</div>
                      <div className="text-xs text-muted-foreground">Beyaz arka plan</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer card-hover-scale group" onClick={() => setColorMode('dark')}>
                  <RadioGroupItem value="dark" id="color-dark" data-testid="radio-color-dark" />
                  <Label htmlFor="color-dark" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Moon className="h-5 w-5 text-blue-400 group-hover:-rotate-12 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-medium">Koyu Mod</div>
                      <div className="text-xs text-muted-foreground">Koyu arka plan</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Email Update */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              E-posta Değiştir
            </CardTitle>
            <CardDescription>Mevcut e-posta: {user?.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailUpdate} className="space-y-4">
              <div>
                <Label htmlFor="new-email">Yeni E-posta</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="yeni@mayaokullari.k12.tr"
                  disabled={isUpdatingEmail}
                  data-testid="input-new-email"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isUpdatingEmail}
                data-testid="button-update-email"
              >
                {isUpdatingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                E-posta Güncelle
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Update */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Şifre Değiştir
            </CardTitle>
            <CardDescription>Hesabınızın güvenliği için güçlü bir şifre seçin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <Label htmlFor="new-password">Yeni Şifre</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 8 karakter"
                  disabled={isUpdatingPassword}
                  data-testid="input-new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Şifrenizi tekrar girin"
                  disabled={isUpdatingPassword}
                  data-testid="input-confirm-password"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isUpdatingPassword}
                data-testid="button-update-password"
              >
                {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Şifre Güncelle
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
