import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import mayaLogo from "@assets/maya-okullari-logo-simge_1763489344712.webp";
import { CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Check for recovery token in URL (query params or hash)
  useEffect(() => {
    const handleRecoveryToken = async () => {
      // Try query parameters first (Supabase sends here)
      const searchParams = new URLSearchParams(window.location.search);
      let accessToken = searchParams.get('access_token');
      let type = searchParams.get('type');
      
      // Fallback to hash fragment
      if (!accessToken) {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        accessToken = hashParams.get('access_token');
        type = hashParams.get('type');
      }
      
      if (type === 'recovery' && accessToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: '',
          });
          
          if (!error) {
            setValidToken(true);
            window.history.replaceState({}, document.title, "/auth/reset");
          } else {
            toast({
              variant: "destructive",
              title: "Hata",
              description: "Geçersiz veya süresi dolmuş bağlantı",
            });
            setTimeout(() => setLocation("/giris"), 3000);
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Hata",
            description: "Token doğrulanamadı",
          });
          setTimeout(() => setLocation("/giris"), 3000);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Şifre sıfırlama bağlantısı bulunamadı",
        });
        setTimeout(() => setLocation("/giris"), 3000);
      }
      setCheckingToken(false);
    };
    
    handleRecoveryToken();
  }, [toast, setLocation]);

  const handlePasswordReset = async (e: React.FormEvent) => {
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

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setResetSuccess(true);
      
      toast({
        title: "Başarılı",
        description: "Şifreniz güncellendi",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation("/giris");
      }, 3000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Şifre güncellenirken bir hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Bağlantı doğrulanıyor...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!validToken) {
    return null; // Will redirect to login
  }

  if (resetSuccess) {
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
            <CardTitle className="text-2xl font-bold text-center">
              Şifre Güncellendi
            </CardTitle>
            <CardDescription className="text-center">
              Yeni şifrenizle giriş yapabilirsiniz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-center text-muted-foreground">
                Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          </CardContent>
        </Card>
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
          <CardTitle className="text-2xl font-bold text-center">
            Yeni Şifre Belirle
          </CardTitle>
          <CardDescription className="text-center">
            Hesabınız için yeni bir şifre oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Yeni Şifre</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="En az 8 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                data-testid="input-new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Şifrenizi tekrar girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                data-testid="input-confirm-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              data-testid="button-reset-password"
            >
              {loading ? "Güncelleniyor..." : "Şifremi Güncelle"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
