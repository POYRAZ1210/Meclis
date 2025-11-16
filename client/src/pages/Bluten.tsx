import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import EmptyState from "@/components/EmptyState";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("tr");

interface BlutenPost {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  created_at: string;
  author: {
    first_name: string | null;
    last_name: string | null;
  };
}

export default function Bluten() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  // TODO: Implement API integration when backend is ready
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/bluten"],
    queryFn: async (): Promise<BlutenPost[]> => {
      // Mock data for now
      return [];
    },
  });

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <ImageIcon className="h-8 w-8 text-primary" />
              Blüten
            </h1>
            <p className="text-muted-foreground">
              Maya Meclisi görsel içerikleri ve etkinlikler
            </p>
          </div>
          {isAdmin && (
            <Button data-testid="button-new-bluten">
              <Plus className="h-4 w-4 mr-2" />
              Yeni İçerik
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const authorName = post.author
              ? `${post.author.first_name || ""} ${post.author.last_name || ""}`.trim()
              : "Maya Meclisi";

            return (
              <Card key={post.id} className="overflow-hidden hover-elevate">
                {post.image_url && (
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                {!post.image_url && (
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-primary/30" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.description}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{authorName}</span>
                  <span>{dayjs(post.created_at).fromNow()}</span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="Henüz içerik yok"
          description="İlk Blüten içeriği eklendiğinde burada görünecek."
        />
      )}

      {/* Info card for admins */}
      {isAdmin && (!posts || posts.length === 0) && (
        <Card className="mt-6 border-dashed">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Blüten Nasıl Kullanılır?</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Instagram tarzı görsel içerikler paylaşın</li>
              <li>• Etkinlik afişleri, duyuru görselleri ekleyin</li>
              <li>• Öğrenci çalışmalarını sergileyin</li>
              <li>• Kısa ve özlü açıklamalar kullanın</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">
              Not: Supabase'de "bluten_posts" tablosu oluşturup içerik eklemeye başlayabilirsiniz.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
