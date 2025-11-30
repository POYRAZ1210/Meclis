import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail, Lock, User, Hash, GraduationCap } from "lucide-react";

const CLASS_OPTIONS = [
  "5-A", "5-B", "5-C", "5-D",
  "6-A", "6-B", "6-C", "6-D",
  "7-A", "7-B", "7-C", "7-D",
  "8-A", "8-B", "8-C", "8-D",
  "9-A", "9-B", "9-C", "9-D",
  "10-A", "10-B", "10-C", "10-D",
  "11-A", "11-B", "11-C", "11-D",
  "12-A", "12-B", "12-C", "12-D",
];

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    className: "",
    studentNo: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!formData.firstName.trim()) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ad alanı zorunludur",
      });
      return;
    }

    if (!formData.lastName.trim()) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Soyad alanı zorunludur",
      });
      return;
    }

    if (!formData.className) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Sınıf seçimi zorunludur",
      });
      return;
    }

    if (!formData.studentNo.trim()) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Öğrenci numarası zorunludur",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Geçerli bir e-posta adresi giriniz",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Şifreler eşleşmiyor",
      });
      return;
    }

    if (formData.password.length < 6) {
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
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          class_name: formData.className,
          student_no: formData.studentNo.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt sırasında bir hata oluştu');
      }

      toast({
        title: "Kayıt Başarılı!",
        description: "Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.",
      });
      setLocation("/giris");
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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <UserPlus className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            <span className="text-primary">Maya</span> Öğrenci Meclisi
          </CardTitle>
          <CardDescription className="text-center">
            Öğrenci hesabı oluşturun
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ad</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Adınız"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-register-firstname"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Soyadınız"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-register-lastname"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="className">Sınıf</Label>
                <Select 
                  value={formData.className} 
                  onValueChange={(value) => handleChange("className", value)}
                >
                  <SelectTrigger data-testid="select-register-class">
                    <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Sınıf seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_OPTIONS.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentNo">Öğrenci No</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="studentNo"
                    type="text"
                    placeholder="12345"
                    value={formData.studentNo}
                    onChange={(e) => handleChange("studentNo", e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-register-studentno"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@mayaokullari.k12.tr"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="pl-10"
                  required
                  data-testid="input-register-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                  data-testid="input-register-password"
                />
              </div>
              <p className="text-xs text-muted-foreground">En az 6 karakter</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                  data-testid="input-register-confirm-password"
                />
              </div>
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

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                <strong>Dikkat:</strong> Her öğrenci sadece <strong>bir kez</strong> kayıt olabilir. 
                Öğrenci numaranızı doğru girdiğinizden emin olun.
              </p>
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
