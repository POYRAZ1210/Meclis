import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Image as ImageIcon, Loader2, Instagram, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import EmptyState from "@/components/EmptyState";
import { getBlutenPosts, type BlutenPost } from "@/lib/api/bluten";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("tr");

export default function Bluten() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/bluten"],
    queryFn: getBlutenPosts,
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
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover-elevate group">
              {post.media_url && (
                <div className="aspect-square bg-muted relative overflow-hidden">
                  <img
                    src={post.media_url}
                    alt={post.caption || "Instagram post"}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={post.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="text-sm font-medium">Instagram'da Aç</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
              {!post.media_url && (
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-primary/30" />
                </div>
              )}
              {post.caption && (
                <CardContent className="p-4">
                  <p className="text-sm line-clamp-3">{post.caption}</p>
                </CardContent>
              )}
              <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground gap-2">
                <div className="flex items-center gap-2">
                  <Instagram className="h-3 w-3" />
                  <span>{post.username || "Maya Meclisi"}</span>
                </div>
                <span>{post.posted_at ? dayjs(post.posted_at).fromNow() : dayjs(post.fetched_at).fromNow()}</span>
              </CardFooter>
            </Card>
          ))}
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
