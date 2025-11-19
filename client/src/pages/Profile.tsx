import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
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

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profil Ayarları</h1>
        <p className="text-muted-foreground">Hesap bilgilerinizi yönetin</p>
      </div>

      <div className="space-y-6">
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
