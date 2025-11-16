import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnnouncementCard from "@/components/AnnouncementCard";
import EmptyState from "@/components/EmptyState";
import { Bell, Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

//todo: remove mock functionality
const mockAnnouncements = [
  {
    id: "1",
    title: "Yaz Dönemi Etkinlikleri",
    content: "Bu yıl yaz döneminde düzenleyeceğimiz etkinlikler için hazırlıklara başladık. Spor turnuvaları, sanat atölyeleri ve kamplar için kayıtlar yakında açılacak. Detaylı bilgi için rehberlik servisine başvurabilirsiniz.",
    authorName: "Müdür Yardımcısı",
    createdAt: "10 Mayıs 2025",
  },
  {
    id: "2",
    title: "Kütüphane Yenileme Çalışmaları",
    content: "Okulumuz kütüphanesinde yapılan yenileme çalışmaları tamamlandı. Yeni kitaplar ve çalışma alanları sizleri bekliyor!",
    authorName: "Kütüphane Sorumlusu",
    createdAt: "8 Mayıs 2025",
  },
  {
    id: "3",
    title: "Sınav Takvimi Güncellendi",
    content: "2024-2025 eğitim öğretim yılı 2. dönem sınav takvimi güncellenmiştir. Lütfen yeni tarihleri kontrol ediniz.",
    authorName: "Müdür",
    createdAt: "5 Mayıs 2025",
  },
];

export default function Announcements() {
  const [announcements] = useState(mockAnnouncements);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<typeof mockAnnouncements[0] | null>(null);

  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Duyurular</h1>
            <p className="text-muted-foreground">Tüm okul duyurularını görüntüleyin</p>
          </div>
          <Button data-testid="button-new-announcement">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Duyuru
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Duyuru ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-announcements"
          />
        </div>
      </div>

      {filteredAnnouncements.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              {...announcement}
              onReadMore={() => setSelectedAnnouncement(announcement)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title={searchQuery ? "Duyuru bulunamadı" : "Henüz duyuru yok"}
          description={searchQuery ? "Arama kriterlerinize uygun duyuru bulunamadı." : "İlk duyuruyu oluşturun."}
        />
      )}

      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              {selectedAnnouncement?.authorName} • {selectedAnnouncement?.createdAt}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm leading-relaxed">{selectedAnnouncement?.content}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
