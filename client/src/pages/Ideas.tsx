import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Heart, MessageCircle, Send, Lightbulb, Image, Video } from "lucide-react";
import { getIdeas, createIdea, toggleLike } from "@/lib/api/ideas";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("tr");

export default function Ideas() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const { toast } = useToast();

  const { data: ideas, isLoading } = useQuery({
    queryKey: ['/api/ideas'],
    queryFn: getIdeas,
  });

  const createMutation = useMutation({
    mutationFn: createIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      setTitle("");
      setContent("");
      setImageUrl("");
      setVideoUrl("");
      setOpen(false);
      toast({
        title: "Fikir gönderildi!",
        description: "Fikriniz yönetici onayından sonra yayınlanacak.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Eksik bilgi",
        description: "Başlık ve içerik zorunludur.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({ title, content, image_url: imageUrl || '', video_url: videoUrl || '' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fikirler</h1>
          <p className="text-muted-foreground">Öğrenci fikirlerini keşfedin ve paylaşın</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-idea">
              <Lightbulb className="h-4 w-4 mr-2" />
              Yeni Fikir
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Fikir Paylaş</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Başlık..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-idea-title"
              />
              <Textarea
                placeholder="Fikrinizi detaylı açıklayın..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                data-testid="textarea-idea-content"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Görsel URL (opsiyonel)
                  </label>
                  <Input
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    data-testid="input-idea-image"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video URL (opsiyonel)
                  </label>
                  <Input
                    placeholder="https://..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    data-testid="input-idea-video"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-idea">
                  İptal
                </Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending} data-testid="button-submit-idea">
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Paylaş
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {ideas && ideas.length > 0 ? (
          ideas.map((idea: any) => {
            const authorName = idea.author
              ? `${idea.author.first_name || ""} ${idea.author.last_name || ""}`.trim()
              : "Anonim";
            const authorClass = idea.author?.class_name || "";
            const initials = authorName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card key={idea.id} className="p-6" data-testid={`card-idea-${idea.id}`}>
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-semibold">{authorName}</span>
                      {authorClass && (
                        <span className="text-sm text-muted-foreground">{authorClass}</span>
                      )}
                      <span className="text-sm text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground">
                        {dayjs(idea.created_at).fromNow()}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{idea.title}</h3>
                    <p className="text-foreground whitespace-pre-wrap mb-4">{idea.content}</p>
                    
                    {idea.image_url && (
                      <img 
                        src={idea.image_url} 
                        alt={idea.title}
                        className="rounded-lg mb-4 max-h-96 object-cover w-full"
                      />
                    )}
                    
                    {idea.video_url && (
                      <video 
                        src={idea.video_url}
                        controls
                        className="rounded-lg mb-4 max-h-96 w-full"
                      />
                    )}

                    <div className="flex items-center gap-6 text-muted-foreground">
                      <button
                        onClick={() => likeMutation.mutate(idea.id)}
                        className={`flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-1.5 transition-colors ${
                          idea.user_has_liked ? 'text-primary' : ''
                        }`}
                        data-testid={`button-like-${idea.id}`}
                      >
                        <Heart className={`h-5 w-5 ${idea.user_has_liked ? 'fill-current' : ''}`} />
                        <span className="text-sm font-medium">{idea.likes_count || 0}</span>
                      </button>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">{idea.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Henüz fikir yok</h3>
            <p className="text-muted-foreground mb-4">İlk fikri paylaşan sen ol!</p>
            <Button onClick={() => setOpen(true)} data-testid="button-first-idea">
              <Lightbulb className="h-4 w-4 mr-2" />
              Yeni Fikir
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
