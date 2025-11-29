import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, AlertTriangle, Shield, Users, Camera, MessageCircle, Heart, Scale, BookOpen, Clock, Ban, Database, Gavel, Mail, Building } from "lucide-react";

export default function KullanimSartlari() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Kullanım Şartları</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-8">
              {/* Giriş */}
              <section>
                <p className="text-muted-foreground leading-relaxed">
                  Bu Kullanım Şartları, Maya Okulları Öğrenci Meclisi web sitesini ("Site") kullanan tüm kullanıcılar için geçerlidir. Siteye erişim sağlayarak veya siteyi kullanarak bu şartları kabul etmiş sayılırsınız. Lütfen bu şartları dikkatlice okuyunuz.
                </p>
              </section>

              {/* Madde 1 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">1. Kullanıcı Tanımları</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p><strong>Öğrenci:</strong> Maya Okulları'na kayıtlı, siteye erişim yetkisi verilen öğrencidir.</p>
                  <p><strong>Öğretmen:</strong> Maya Okulları'nda görev yapan ve siteye erişim yetkisi verilen öğretmendir.</p>
                  <p><strong>Yönetici (Admin):</strong> Sitenin içerik ve kullanıcı yönetiminden sorumlu yetkili personeldir.</p>
                  <p><strong>Veli/Vasisi:</strong> Reşit olmayan öğrencilerin yasal temsilcisidir.</p>
                </div>
              </section>

              {/* Madde 2 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-lg font-semibold">2. Reşit Olmayan Kullanıcılar</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Bu site, çoğunlukla 18 yaşından küçük öğrenciler tarafından kullanılmaktadır. Bu nedenle:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Site içeriği eğitim amaçlıdır ve okul kurallarına tabidir.</li>
                    <li>Kullanıcılar, velilerinin/vasilerinin bilgisi dahilinde siteyi kullanmalıdır.</li>
                    <li>18 yaş altı kullanıcıların kişisel verileri özel koruma altındadır.</li>
                    <li>Uygunsuz içerik paylaşımı derhal silinir ve disiplin sürecine tabidir.</li>
                  </ul>
                </div>
              </section>

              {/* Madde 3 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <h2 className="text-lg font-semibold">3. Hesap Güvenliği</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Her kullanıcı:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Hesap bilgilerini gizli tutmakla yükümlüdür.</li>
                    <li>Şifresini kimseyle paylaşmamalıdır.</li>
                    <li>Hesabında gerçekleşen tüm aktivitelerden sorumludur.</li>
                    <li>Şüpheli bir durumda derhal yöneticiye bildirimde bulunmalıdır.</li>
                  </ul>
                </div>
              </section>

              {/* Madde 4 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-semibold">4. Profil Fotoğrafı Kuralları</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Profil fotoğrafları aşağıdaki kurallara uygun olmalıdır:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Sadece kullanıcının kendi fotoğrafı kullanılabilir.</li>
                    <li>Fotoğraf okul ortamına uygun olmalıdır.</li>
                    <li>Uygunsuz, müstehcen veya rahatsız edici görseller yasaktır.</li>
                    <li>Başkalarının fotoğraflarını kullanmak yasaktır.</li>
                    <li>Telif hakkı ihlali içeren görseller yasaktır.</li>
                    <li>Şiddet, nefret veya ayrımcılık içeren görseller yasaktır.</li>
                  </ul>
                  <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <p className="text-sm flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                      <span>Uygunsuz profil fotoğrafları yönetici tarafından silinir ve hesap askıya alınabilir. Her profil fotoğrafı değişikliği kayıt altına alınır.</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Madde 5 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  <h2 className="text-lg font-semibold">5. Yorum Kuralları</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Sitede yapılan yorumlar:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Saygılı ve yapıcı olmalıdır.</li>
                    <li>Hakaret, küfür, aşağılama içermemelidir.</li>
                    <li>Kişisel saldırı ve zorbalık yasaktır.</li>
                    <li>Spam, reklam ve tanıtım içermemelidir.</li>
                    <li>Kişisel bilgi paylaşımı (telefon, adres vb.) yasaktır.</li>
                    <li>Yönetici onayından sonra yayınlanır.</li>
                  </ul>
                  <p className="mt-2">Tüm yorumlar kayıt altına alınır ve silinen yorumlar da log sisteminde saklanır.</p>
                </div>
              </section>

              {/* Madde 6 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <h2 className="text-lg font-semibold">6. Beğeni (Like) Sistemi</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Beğeni sistemi kullanımı:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Her kullanıcı bir içeriği yalnızca bir kez beğenebilir.</li>
                    <li>Beğeniler kayıt altına alınır.</li>
                    <li>Manipülasyon veya kötüye kullanım tespit edilirse hesap askıya alınabilir.</li>
                  </ul>
                </div>
              </section>

              {/* Madde 7 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold">7. İçerik Paylaşım Kuralları</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Kullanıcılar içerik paylaşırken:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Okul kurallarına ve yasalara uygun davranmalıdır.</li>
                    <li>Telif hakkı ihlali yapmamalıdır.</li>
                    <li>Yanlış veya yanıltıcı bilgi paylaşmamalıdır.</li>
                    <li>Kişisel verileri izinsiz paylaşmamalıdır.</li>
                    <li>Siyasi, dini veya ideolojik propaganda yapmamalıdır.</li>
                  </ul>
                </div>
              </section>

              {/* Madde 8 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-orange-500" />
                  <h2 className="text-lg font-semibold">8. İçerik Denetimi ve Moderasyon</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Site yönetimi:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Tüm içerikleri denetleme hakkına sahiptir.</li>
                    <li>Uygunsuz içerikleri önceden bildirim yapmadan silebilir.</li>
                    <li>Fikirler ve yorumlar yayınlanmadan önce onay sürecinden geçer.</li>
                    <li>Reddedilen içerikler hakkında kullanıcı bilgilendirilir.</li>
                  </ul>
                </div>
              </section>

              {/* Madde 9 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-cyan-500" />
                  <h2 className="text-lg font-semibold">9. Kayıt ve Log Sistemi</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Sistem güvenliği ve hukuki sorumluluk için aşağıdaki veriler kayıt altına alınır:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Kullanıcı giriş ve çıkış işlemleri</li>
                    <li>Profil fotoğrafı değişiklikleri</li>
                    <li>Yorum oluşturma ve silme işlemleri</li>
                    <li>Beğeni işlemleri</li>
                    <li>İçerik paylaşım ve düzenleme işlemleri</li>
                    <li>Yönetici tarafından yapılan moderasyon işlemleri</li>
                  </ul>
                  <p className="mt-2">Bu kayıtlar yasal süreçlerde delil olarak kullanılabilir.</p>
                </div>
              </section>

              {/* Madde 10 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-600" />
                  <h2 className="text-lg font-semibold">10. Yasaklı Davranışlar</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Aşağıdaki davranışlar kesinlikle yasaktır:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Siber zorbalık ve taciz</li>
                    <li>Nefret söylemi ve ayrımcılık</li>
                    <li>Müstehcen veya uygunsuz içerik paylaşımı</li>
                    <li>Başkalarının kimliğini taklit etme</li>
                    <li>Sisteme yetkisiz erişim girişimi</li>
                    <li>Kötü amaçlı yazılım paylaşımı</li>
                    <li>Spam ve istenmeyen mesaj gönderimi</li>
                  </ul>
                </div>
              </section>

              {/* Madde 11 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-amber-600" />
                  <h2 className="text-lg font-semibold">11. Disiplin Süreci</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Kural ihlallerinde uygulanacak yaptırımlar:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Uyarı:</strong> İlk ihlallerde yazılı uyarı verilir.</li>
                    <li><strong>Geçici Askıya Alma:</strong> Tekrarlayan ihlallerde hesap geçici olarak askıya alınır.</li>
                    <li><strong>Kalıcı Kapatma:</strong> Ciddi ihlallerde hesap kalıcı olarak kapatılır.</li>
                    <li><strong>Okul Disiplin Kurulu:</strong> Gerekli durumlarda konu okul yönetimine bildirilir.</li>
                  </ul>
                  <p className="mt-2">Tüm disiplin işlemleri kayıt altına alınır ve veliye/vasiye bildirilir.</p>
                </div>
              </section>

              {/* Madde 12 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-teal-500" />
                  <h2 className="text-lg font-semibold">12. Gizlilik ve Veri Koruma</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Kullanıcı verileri:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>6698 sayılı KVKK kapsamında korunur.</li>
                    <li>Sadece eğitim amaçlı kullanılır.</li>
                    <li>Üçüncü taraflarla izinsiz paylaşılmaz.</li>
                    <li>Güvenli ortamlarda saklanır.</li>
                  </ul>
                  <p className="mt-2">Detaylı bilgi için Gizlilik Politikası ve KVKK Aydınlatma Metni'ni inceleyiniz.</p>
                </div>
              </section>

              {/* Madde 13 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-500" />
                  <h2 className="text-lg font-semibold">13. Şartlarda Değişiklik</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Maya Okulları:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Bu kullanım şartlarını önceden bildirim yaparak değiştirme hakkını saklı tutar.</li>
                    <li>Değişiklikler sitede yayınlandığı tarihte yürürlüğe girer.</li>
                    <li>Kullanıcılar, değişikliklerden sonra siteyi kullanmaya devam etmeleri halinde yeni şartları kabul etmiş sayılır.</li>
                  </ul>
                </div>
              </section>

              {/* Madde 14 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-violet-500" />
                  <h2 className="text-lg font-semibold">14. Sorumluluk Reddi</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Maya Okulları:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Kullanıcılar tarafından paylaşılan içeriklerden sorumlu değildir.</li>
                    <li>Sitenin kesintisiz veya hatasız çalışacağını garanti etmez.</li>
                    <li>Teknik arızalardan kaynaklanan veri kayıplarından sorumlu tutulamaz.</li>
                    <li>Kullanıcıların birbirleriyle olan anlaşmazlıklarından sorumlu değildir.</li>
                  </ul>
                </div>
              </section>

              {/* Madde 15 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-rose-600" />
                  <h2 className="text-lg font-semibold">15. Uygulanacak Hukuk</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Bu kullanım şartları Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.</p>
                </div>
              </section>

              {/* Madde 16 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-sky-500" />
                  <h2 className="text-lg font-semibold">16. İletişim</h2>
                </div>
                <div className="pl-7 space-y-2 text-muted-foreground">
                  <p>Kullanım şartları hakkında sorularınız için:</p>
                  <div className="mt-3 p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>Maya Okulları Öğrenci Meclisi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>meclis@mayaokullari.k12.tr</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Sonuç */}
              <section className="pt-4 border-t">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Bu siteyi kullanarak yukarıdaki tüm kullanım şartlarını okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz. Şartları kabul etmiyorsanız, siteyi kullanmayınız.
                  </p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
