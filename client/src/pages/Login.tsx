import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import mayaLogo from "@assets/maya-okullari-logo-simge_1763489344712.webp";

export default function Login() {
  const [, setLocation] = useLocation();
  const { signIn, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      await signIn(email, password);
      
      toast({
        title: "Başarılı",
        description: "Giriş yapıldı, yönlendiriliyorsunuz...",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Giriş yapılırken bir hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Subtle gradient background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-sm relative z-10">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-lg">
            <img 
              src={mayaLogo} 
              alt="Maya Okulları" 
              className="h-8 w-8 object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Maya Meclisi</h1>
          <p className="text-sm text-muted-foreground">Hesabınıza giriş yapın</p>
        </div>
        
        {/* Login Card */}
        <Card className="border-border/50 shadow-xl shadow-primary/5">
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@mayaokullari.k12.tr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/50 border-border/50 focus:border-primary/50"
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="password" className="text-sm font-medium">Şifre</Label>
                  <Link 
                    href="/sifre-sifirla" 
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Şifremi Unuttum
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted/50 border-border/50 focus:border-primary/50"
                  data-testid="input-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col pt-2 pb-6">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading} 
                data-testid="button-submit-login"
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Maya Okulları Öğrenci Portalı
        </p>
      </div>
    </div>
  );
}
