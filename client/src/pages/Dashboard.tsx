import { useState } from "react";
import { Button } from "@/components/ui/button";
import AnnouncementCard from "@/components/AnnouncementCard";
import PollCard from "@/components/PollCard";
import IdeaCard from "@/components/IdeaCard";
import EmptyState from "@/components/EmptyState";
import { Bell, Plus } from "lucide-react";
import { Link } from "wouter";

//todo: remove mock functionality
const mockAnnouncements = [
  {
    id: "1",
    title: "Yaz Dönemi Etkinlikleri",
    content: "Bu yıl yaz döneminde düzenleyeceğimiz etkinlikler için hazırlıklara başladık. Spor turnuvaları, sanat atölyeleri ve kamplar için kayıtlar yakında açılacak.",
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
];

const mockPoll = {
  id: "1",
  question: "Okul pikniği için hangi tarihi tercih edersiniz?",
  options: [
    { id: "1", text: "15 Haziran Cumartesi", votes: 34 },
    { id: "2", text: "22 Haziran Cumartesi", votes: 28 },
    { id: "3", text: "29 Haziran Cumartesi", votes: 15 },
  ],
  totalVotes: 77,
};

const mockIdeas = [
  {
    id: "1",
    title: "Okul Bahçesine Daha Fazla Oturma Alanı",
    excerpt: "Teneffüslerde oturacak yer bulamıyoruz. Bahçeye daha fazla bank ve oturma alanı eklenebilir mi?",
    authorName: "Zeynep Kaya",
    authorInitials: "ZK",
    createdAt: "8 Mayıs 2025",
    status: "approved" as const,
    commentCount: 12,
  },
  {
    id: "2",
    title: "Dijital Kütüphane Sistemi",
    excerpt: "E-kitap okumak için dijital bir kütüphane sistemi kurulmasını öneriyorum.",
    authorName: "Ali Demir",
    authorInitials: "AD",
    createdAt: "7 Mayıs 2025",
    status: "approved" as const,
    commentCount: 5,
  },
];

export default function Dashboard() {
  const [announcements] = useState(mockAnnouncements);
  const [poll] = useState(mockPoll);
  const [ideas] = useState(mockIdeas);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<string>();

  const handleVote = (optionId: string) => {
    setUserVote(optionId);
    setHasVoted(true);
    console.log("Oy verildi:", optionId);
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ana Sayfa</h1>
        <p className="text-muted-foreground">Okul meclisi portalına hoş geldiniz</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Son Duyurular
              </h2>
              <Link href="/duyurular">
                <Button variant="ghost" size="sm" data-testid="link-all-announcements">
                  Tümünü Gör
                </Button>
              </Link>
            </div>
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    {...announcement}
                    onReadMore={() => console.log("Duyuru detayı:", announcement.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title="Henüz duyuru yok"
                description="İlk duyuru eklendiğinde burada görünecek."
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Son Fikirler</h2>
              <Link href="/fikirler">
                <Button variant="ghost" size="sm" data-testid="link-all-ideas">
                  Tümünü Gör
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {ideas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  {...idea}
                  onReadMore={() => console.log("Fikir detayı:", idea.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Aktif Oylama</h2>
            <PollCard
              {...poll}
              hasVoted={hasVoted}
              userVote={userVote}
              onVote={handleVote}
            />
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">Yeni Fikir Ekle</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Okulunuzu geliştirmek için fikirlerinizi paylaşın
            </p>
            <Link href="/fikirler/yeni">
              <Button className="w-full" data-testid="button-new-idea">
                <Plus className="h-4 w-4 mr-2" />
                Fikir Paylaş
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
