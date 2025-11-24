import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import mayaLogo from "@assets/maya-okullari-logo-simge_1763489344712.webp";
import { ChevronLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/sifre-sifirla`,
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
            {submitted 
              ? "E-posta adresini kontrol et"
              : "Hesabınızın e-posta adresini giriniz"}
          </CardDescription>
        </CardHeader>

        {!submitted ? (
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
