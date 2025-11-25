import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import mayaLogo from "@assets/maya-okullari-logo-simge_1763489344712.webp";
import { ChevronLeft } from "lucide-react";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Redirect to home if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      // Use hardcoded production URL for email redirect
      const redirectUrl = import.meta.env.PROD 
        ? 'https://meclis.onrender.com/auth/reset'
        : 'http://localhost:5000/auth/reset';
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      console.log('Password reset email sent with redirectTo:', redirectUrl);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: `E-postanızı kontrol edin. Şifre sıfırlama linki ${email} adresine gönderildi.`,
      });
      
      // Clear email for next attempt
      setEmail("");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = "/giris";
      }, 3000);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Bir hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <CardTitle className="text-2xl text-center">Şifre Sıfırlama</CardTitle>
          <CardDescription className="text-center">
            Hesabınızın e-posta adresini giriniz
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleEmailSubmit} noValidate>
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
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded text-sm">
              <p className="text-blue-700 dark:text-blue-300">
                <strong>ℹ️ Bilgi:</strong> Şifre sıfırlama linki e-postanıza gönderilecektir. 
                E-postanızı kontrol ederek linke tıklayın ve yeni şifre belirleyin.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading} data-testid="button-send-reset-link">
              {loading ? "Gönderiliyor..." : "Şifre Sıfırlama E-postası Gönder"}
            </Button>
            <Link href="/giris">
              <Button variant="ghost" className="w-full gap-2" data-testid="button-back-to-login">
                <ChevronLeft className="h-4 w-4" />
                Giriş Sayfasına Dön
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
