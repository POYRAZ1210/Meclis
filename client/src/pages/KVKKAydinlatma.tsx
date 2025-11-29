import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, AlertTriangle, Mail, Building } from "lucide-react";

export default function KVKKAydinlatma() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">KVKK Aydınlatma Metni</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                6698 Sayılı Kişisel Verilerin Korunması Kanunu
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              <section className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verilerin işlenmesine ilişkin kullanıcıları bilgilendirmek amacıyla hazırlanmıştır.
                </p>

                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-medium">İçerik Güncelleme Bildirimi</p>
                      <p className="text-sm text-muted-foreground">
                        Detaylı aydınlatma metni içeriği okul yönetimi tarafından hukuki danışmanlık doğrultusunda eklenecektir. Şu anda özet bilgiler sunulmaktadır.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <h2 className="text-lg font-semibold">Veri Sorumlusu</h2>
                  <p className="text-muted-foreground">
                    Maya Okulları, kişisel verilerinizin işlenmesi bakımından "Veri Sorumlusu" sıfatını taşımaktadır.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">İşlenen Kişisel Veriler</h2>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li><strong>Kimlik Verileri:</strong> Ad, soyad, öğrenci numarası</li>
                    <li><strong>İletişim Verileri:</strong> E-posta adresi</li>
                    <li><strong>Görsel Veriler:</strong> Profil fotoğrafı</li>
                    <li><strong>Eğitim Verileri:</strong> Sınıf bilgisi, okul bilgisi</li>
                    <li><strong>İşlem Güvenliği:</strong> Log kayıtları, IP adresi</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Veri İşleme Amaçları</h2>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>Öğrenci meclisi platformunun işletilmesi</li>
                    <li>Kullanıcı kimlik doğrulaması</li>
                    <li>İçerik moderasyonu ve denetimi</li>
                    <li>Güvenlik önlemlerinin alınması</li>
                    <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Hukuki Sebepler</h2>
                  <p className="text-muted-foreground">
                    Kişisel verileriniz, KVKK'nın 5. ve 6. maddelerinde belirtilen:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>Açık rızanızın bulunması</li>
                    <li>Kanunlarda açıkça öngörülmesi</li>
                    <li>Meşru menfaat için zorunlu olması</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">
                    hukuki sebeplerine dayanılarak işlenmektedir.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">KVKK Kapsamındaki Haklarınız</h2>
                  <p className="text-muted-foreground">
                    KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                    <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                    <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                    <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                    <li>Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
                    <li>Silinmesini veya yok edilmesini isteme</li>
                    <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                    <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Özel Nitelikli Kişisel Veriler</h2>
                  <p className="text-muted-foreground">
                    Reşit olmayan öğrencilere ait kişisel veriler özel koruma altındadır. Bu verilerin işlenmesinde ek güvenlik önlemleri alınmakta ve veli/vasi bilgilendirmesi yapılmaktadır.
                  </p>
                </div>
              </section>

              <section className="pt-4 border-t">
                <h2 className="text-lg font-semibold mb-3">Başvuru ve İletişim</h2>
                <p className="text-muted-foreground mb-3">
                  KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki iletişim bilgilerinden bize ulaşabilirsiniz:
                </p>
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>Maya Okulları Öğrenci Meclisi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>kvkk@mayaokullari.k12.tr</span>
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
