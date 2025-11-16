import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import IdeaCard from "@/components/IdeaCard";
import EmptyState from "@/components/EmptyState";
import { Lightbulb, Plus, Search, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { getIdeas } from "@/lib/api/ideas";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("tr");

export default function Ideas() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: ideas, isLoading } = useQuery({
    queryKey: ["/api/ideas", "approved"],
    queryFn: () => getIdeas("approved"),
  });

  const filteredIdeas = ideas?.filter((idea) =>
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.body.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredIdeas.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => {
            const authorName = idea.author
              ? `${idea.author.first_name || ""} ${idea.author.last_name || ""}`.trim()
              : "Anonim";
            const initials = authorName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            return (
              <IdeaCard
                key={idea.id}
                title={idea.title}
                excerpt={idea.body.substring(0, 150)}
                authorName={authorName}
                authorInitials={initials}
                createdAt={dayjs(idea.created_at).fromNow()}
                status={idea.status}
                commentCount={0}
                onReadMore={() => console.log("Fikir detayı:", idea.id)}
              />
            );
          })}
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
