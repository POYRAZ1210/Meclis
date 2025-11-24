import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import mayaLogo from "@assets/maya-okullari-logo-simge_1763489344712.webp";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check if there's a recovery token in the URL
  useEffect(() => {
    const checkRecoveryToken = async () => {
      try {
        // Parse token from URL hash
        const hash = window.location.hash.substring(1);
        console.log("URL Hash:", hash);
        
        if (hash) {
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const type = params.get('type');

          console.log("Token found:", { hasToken: !!accessToken, type });

          if (type === 'recovery' && accessToken) {
            // Set session with recovery token
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: '',
            });

            console.log("setSession result:", error);

            if (!error) {
              setHasToken(true);
              // Clean up URL hash
              window.history.replaceState({}, document.title, window.location.pathname);
              return;
            }
          }
        }

        // If there's a hash but no valid token, still show reset form
        // (user clicked the email link)
        if (hash) {
          setHasToken(true);
          return;
        }

        // Fallback: check if session already exists
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasToken(true);
        }
      } catch (error) {
        console.error("Token check error:", error);
        // On error, still show the reset form if hash exists
        if (window.location.hash) {
          setHasToken(true);
        }
      } finally {
        setCheckingToken(false);
      }
    };

    checkRecoveryToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Geçerli bir e-posta adresi giriniz",
      });
      return;
    }

    setLoading(true);

    try {
      // Get the correct domain/port from window.location
      const redirectUrl = new URL("/giris", window.location.origin);
      redirectUrl.searchParams.set("type", "recovery");
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl.toString(),
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Başarılı",
        description: "Şifre sıfırlama bağlantısı e-posta adresine gönderildi",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Şifre sıfırlama e-postası gönderilemedi",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate new password
    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Şifre en az 8 karakter olmalıdır",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Şifreler eşleşmiyor",
      });
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Şifreniz güncellendi, giriş sayfasına yönlendiriliyorsunuz...",
      });

      setTimeout(() => {
        setLocation("/giris");
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Şifre güncellenirken bir hata oluştu",
      });
    } finally {
      setResetLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={mayaLogo} 
              alt="Maya Okulları" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <CardTitle className="text-2xl text-center">
            {hasToken ? "Yeni Şifre Belirle" : "Şifre Sıfırlama"}
          </CardTitle>
          <CardDescription className="text-center">
            {hasToken
              ? "Yeni şifrenizi belirleyin"
              : submitted 
                ? "E-posta adresini kontrol et"
                : "Hesabınızın e-posta adresini giriniz"}
          </CardDescription>
        </CardHeader>

        {hasToken ? (
          // Password reset form (after token is validated)
          <form onSubmit={handleResetPassword} noValidate>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Yeni Şifre</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="En az 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Şifreyi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  data-testid="input-confirm-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={resetLoading} data-testid="button-confirm-reset">
                {resetLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
              </Button>
              <Link href="/giris">
                <Button variant="ghost" className="w-full gap-2" data-testid="button-back-to-login-reset">
                  <ChevronLeft className="h-4 w-4" />
                  Giriş Sayfasına Dön
                </Button>
              </Link>
            </CardFooter>
          </form>
        ) : !submitted ? (
          // Email form (initial state)
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="soyad-isim@mayaokullari.k12.tr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-forgot-password-email"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading} data-testid="button-send-reset-link">
                {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
              </Button>
              <Link href="/giris">
                <Button variant="ghost" className="w-full gap-2" data-testid="button-back-to-login">
                  <ChevronLeft className="h-4 w-4" />
                  Giriş Sayfasına Dön
                </Button>
              </Link>
            </CardFooter>
          </form>
        ) : (
          // Success message (after email sent)
          <CardContent className="space-y-4 py-6">
            <div className="rounded-lg bg-primary/10 p-4 text-sm">
              <p className="font-medium text-primary mb-2">✓ Başarılı!</p>
              <p className="text-muted-foreground">
                Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                E-postanızı kontrol ederek bağlantıya tıklayın ve yeni şifrenizi ayarlayın.
              </p>
            </div>
            <Link href="/giris">
              <Button variant="ghost" className="w-full gap-2" data-testid="button-back-to-login-success">
                <ChevronLeft className="h-4 w-4" />
                Giriş Sayfasına Dön
              </Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
