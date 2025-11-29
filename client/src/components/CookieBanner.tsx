import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { Link } from "wouter";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem("cookiesAccepted");
    if (!cookiesAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t shadow-lg" data-testid="cookie-banner">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-foreground">
                Bu site, deneyiminizi iyileştirmek için çerezler kullanmaktadır.
              </p>
              <p className="text-muted-foreground mt-1">
                Sitemizi kullanmaya devam ederek{" "}
                <Link href="/gizlilik-politikasi" className="text-primary hover:underline">
                  Gizlilik Politikamızı
                </Link>{" "}
                kabul etmiş olursunuz.
              </p>
            </div>
          </div>
          <Button 
            onClick={handleAccept} 
            className="shrink-0"
            data-testid="button-accept-cookies"
          >
            Tümünü Kabul Et
          </Button>
        </div>
      </div>
    </div>
  );
}
