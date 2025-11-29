import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, Building } from "lucide-react";

export default function GizlilikPolitikasi() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Gizlilik Politikası</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              <section className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Bu sayfa, Maya Okulları Öğrenci Meclisi web sitesinde işlenen kişisel verilerin gizliliğini ve veri güvenliği esaslarını açıklamak amacıyla oluşturulmuştur.
                </p>

                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-medium">İçerik Güncelleme Bildirimi</p>
                      <p className="text-sm text-muted-foreground">
                        Bu sayfanın detaylı içeriği okul yönetimi ve hukuki danışmanlık doğrultusunda güncellenecektir. Şu anda temel bilgiler sunulmaktadır.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <h2 className="text-lg font-semibold">Toplanan Veriler</h2>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>Kullanıcı kimlik bilgileri (ad, soyad, e-posta)</li>
                    <li>Okul ve sınıf bilgileri</li>
                    <li>Profil fotoğrafları</li>
                    <li>Site kullanım verileri ve log kayıtları</li>
                    <li>Paylaşılan içerikler (fikirler, yorumlar, beğeniler)</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Verilerin Kullanım Amacı</h2>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>Site hizmetlerinin sunulması</li>
                    <li>Kullanıcı deneyiminin iyileştirilmesi</li>
                    <li>Güvenlik ve moderasyon işlemleri</li>
                    <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Veri Güvenliği</h2>
                  <p className="text-muted-foreground">
                    Kişisel verileriniz, teknik ve idari önlemlerle korunmaktadır. Verilerinize yetkisiz erişimi önlemek için endüstri standardı güvenlik protokolleri uygulanmaktadır.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Veri Paylaşımı</h2>
                  <p className="text-muted-foreground">
                    Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmamaktadır. Okul yönetimi ve yetkili kurumlar dışında hiçbir kuruluşa veri aktarımı yapılmamaktadır.
                  </p>
                </div>
              </section>

              <section className="pt-4 border-t">
                <h2 className="text-lg font-semibold mb-3">İletişim</h2>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>Maya Okulları Öğrenci Meclisi</span>
                  </div>
                </div>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
