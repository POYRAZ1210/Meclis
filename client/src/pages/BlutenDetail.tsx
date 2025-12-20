import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Instagram, ExternalLink, Play } from "lucide-react";
import { type BlutenPost } from "@/lib/api/bluten";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("tr");

export default function BlutenDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["/api/bluten", id],
    queryFn: async () => {
      const res = await fetch(`/api/bluten/${id}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'İçerik yüklenirken hata oluştu');
      }

      return res.json() as Promise<BlutenPost>;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/bluten")}
          className="mb-6"
          data-testid="button-back-to-bluten"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Bültene Dön
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">İçerik bulunamadı</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => setLocation("/bluten")}
        className="mb-6"
        data-testid="button-back-to-bluten"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Bültene Dön
      </Button>

      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          {/* Media */}
          {post.media_url && (
            <div className="w-full bg-muted">
              {post.media_type === "VIDEO" ? (
                <div className="relative bg-black aspect-video flex items-center justify-center">
                  <video
                    src={post.media_url}
                    controls
                    className="w-full h-full"
                    data-testid="video-post-media"
                  />
                </div>
              ) : (
                <img
                  src={post.media_url}
                  alt={post.caption || "Instagram post"}
                  className="w-full h-auto"
                  data-testid="img-post-media"
                />
              )}
            </div>
          )}

          {!post.media_url && (
            <div className="w-full bg-gradient-to-br from-primary/10 to-primary/5 aspect-video flex items-center justify-center">
              <div className="text-center">
                <Instagram className="h-16 w-16 text-primary/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Görsel bulunamadı</p>
              </div>
            </div>
          )}

          {/* Content */}
          <CardContent className="p-8">
            {/* Caption */}
            {post.caption && (
              <div className="mb-6">
                <p className="text-lg whitespace-pre-wrap" data-testid="text-post-caption">
                  {post.caption}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between pt-6 border-t text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                <span>{post.username || "Maya Meclisi"}</span>
              </div>
              <span data-testid="text-post-date">
                {post.posted_at
                  ? dayjs(post.posted_at).format("DD MMMM YYYY HH:mm")
                  : dayjs(post.fetched_at).format("DD MMMM YYYY HH:mm")}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                asChild
                variant="default"
                className="flex-1"
                data-testid="button-open-instagram"
              >
                <a
                  href={post.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram'da Aç
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
