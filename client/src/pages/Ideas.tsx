import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Heart, MessageCircle, Send, Lightbulb, Image, Video, ChevronDown, ChevronUp } from "lucide-react";
import { getIdeas, createIdea, toggleLike, addComment } from "@/lib/api/ideas";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("tr");

export default function Ideas() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
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

  const commentMutation = useMutation({
    mutationFn: ({ ideaId, content }: { ideaId: string; content: string }) => addComment(ideaId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      setCommentText({ ...commentText, [variables.ideaId]: '' });
      toast({
        title: "Yorum gönderildi!",
        description: "Yorumunuz yönetici onayından sonra yayınlanacak.",
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
              
              <Tabs defaultValue="image" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Görsel Yükle
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video Yükle
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="image" className="mt-4">
                  <FileUpload
                    type="image"
                    currentUrl={imageUrl}
                    onUploadComplete={(url) => setImageUrl(url)}
                    onRemove={() => setImageUrl("")}
                  />
                </TabsContent>
                <TabsContent value="video" className="mt-4">
                  <FileUpload
                    type="video"
                    currentUrl={videoUrl}
                    onUploadComplete={(url) => setVideoUrl(url)}
                    onRemove={() => setVideoUrl("")}
                  />
                </TabsContent>
              </Tabs>
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
                        {dayjs.utc(idea.created_at).local().fromNow()}
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
                      <button
                        onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                        className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-1.5"
                        data-testid={`button-comments-${idea.id}`}
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">{idea.comments?.length || 0}</span>
                        {expandedIdea === idea.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Comments Section */}
                    {expandedIdea === idea.id && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        {/* Comment List */}
                        {idea.comments && idea.comments.length > 0 ? (
                          <div className="space-y-3">
                            {idea.comments.map((comment: any) => {
                              const commentAuthor = comment.author
                                ? `${comment.author.first_name || ""} ${comment.author.last_name || ""}`.trim()
                                : "Anonim";
                              return (
                                <div key={comment.id} className="flex gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {commentAuthor.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-muted rounded-lg p-3">
                                      <p className="font-semibold text-sm">{commentAuthor}</p>
                                      <p className="text-sm">{comment.content}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 ml-3">
                                      {dayjs.utc(comment.created_at).local().fromNow()}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">Henüz yorum yok</p>
                        )}

                        {/* Comment Form */}
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Yorum yaz..."
                            value={commentText[idea.id] || ''}
                            onChange={(e) => setCommentText({ ...commentText, [idea.id]: e.target.value })}
                            className="min-h-[60px]"
                            data-testid={`input-comment-${idea.id}`}
                          />
                          <Button
                            onClick={() => {
                              if (!commentText[idea.id]?.trim()) {
                                toast({
                                  title: "Eksik bilgi",
                                  description: "Yorum boş olamaz.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              commentMutation.mutate({ ideaId: idea.id, content: commentText[idea.id] });
                            }}
                            disabled={commentMutation.isPending}
                            data-testid={`button-submit-comment-${idea.id}`}
                          >
                            {commentMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
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
