import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [, setLocation] = useLocation();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

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
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Şifreler eşleşmiyor",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Şifre en az 6 karakter olmalıdır",
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kayıt olmak için Kullanım Şartları ve Gizlilik Politikasını kabul etmelisiniz",
      });
      return;
    }

    setLoading(true);
    
    try {
      await signUp(email, password);
      toast({
        title: "Başarılı",
        description: "Kayıt tamamlandı! Giriş yapabilirsiniz.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Kayıt sırasında bir hata oluştu",
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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <span className="text-2xl">🎓</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Okul Meclisi</CardTitle>
          <CardDescription className="text-center">
            Yeni hesap oluşturun
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@okul.edu.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-register-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                data-testid="input-register-password"
              />
              <p className="text-xs text-muted-foreground">En az 6 karakter</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                data-testid="input-register-confirm-password"
              />
            </div>
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                data-testid="checkbox-accept-terms"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-tight cursor-pointer"
                >
                  <Link href="/kullanim-sartlari" className="text-primary hover:underline">
                    Kullanım Şartları
                  </Link>
                  {", "}
                  <Link href="/gizlilik-politikasi" className="text-primary hover:underline">
                    Gizlilik Politikası
                  </Link>
                  {" ve "}
                  <Link href="/kvkk-aydinlatma-metni" className="text-primary hover:underline">
                    KVKK Aydınlatma Metni
                  </Link>
                  'ni okudum, kabul ediyorum.
                </label>
                <p className="text-xs text-muted-foreground">
                  Kayıt olarak bu şartları kabul etmiş olursunuz.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading} data-testid="button-submit-register">
              {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Zaten hesabınız var mı?{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setLocation("/giris")}
                data-testid="link-login"
              >
                Giriş Yap
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
