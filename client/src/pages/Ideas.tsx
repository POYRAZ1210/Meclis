import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import IdeaCard from "@/components/IdeaCard";
import EmptyState from "@/components/EmptyState";
import { Lightbulb, Plus, Search } from "lucide-react";
import { Link } from "wouter";

//todo: remove mock functionality
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
    excerpt: "E-kitap okumak için dijital bir kütüphane sistemi kurulmasını öneriyorum. Öğrenciler evden de erişebilsin.",
    authorName: "Ali Demir",
    authorInitials: "AD",
    createdAt: "7 Mayıs 2025",
    status: "approved" as const,
    commentCount: 5,
  },
  {
    id: "3",
    title: "Geri Dönüşüm Projeleri",
    excerpt: "Okulumuzda geri dönüşüm bilincini artırmak için projeler düzenlenebilir. Atık toplama ve ayrıştırma sistemleri kurulabilir.",
    authorName: "Mehmet Yıldız",
    authorInitials: "MY",
    createdAt: "6 Mayıs 2025",
    status: "approved" as const,
    commentCount: 18,
  },
  {
    id: "4",
    title: "Haftalık Film Gösterimleri",
    excerpt: "Her hafta cuma günleri sinema salonunda eğitici film gösterimleri yapılabilir.",
    authorName: "Ayşe Çelik",
    authorInitials: "AÇ",
    createdAt: "5 Mayıs 2025",
    status: "pending" as const,
    commentCount: 3,
  },
];

export default function Ideas() {
  const [ideas] = useState(mockIdeas);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIdeas = ideas.filter((idea) =>
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Fikirler</h1>
            <p className="text-muted-foreground">Öğrenci fikirlerini keşfedin ve paylaşın</p>
          </div>
          <Link href="/fikirler/yeni">
            <Button data-testid="button-new-idea">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Fikir
            </Button>
          </Link>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Fikir ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-ideas"
          />
        </div>
      </div>

      {filteredIdeas.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              {...idea}
              onReadMore={() => console.log("Fikir detayı:", idea.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Lightbulb}
          title={searchQuery ? "Fikir bulunamadı" : "Henüz fikir yok"}
          description={searchQuery ? "Arama kriterlerinize uygun fikir bulunamadı." : "İlk fikri paylaşın."}
        />
      )}
    </div>
  );
}
