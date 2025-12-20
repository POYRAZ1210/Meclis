import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Heart, MessageCircle, Send, Lightbulb, Image, Video, ChevronDown, ChevronUp, FileText, Download, Trophy, Clock, Pencil, Trash2, MoreVertical, Reply, X, EyeOff, Search, Filter, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getIdeas, createIdea, toggleLike, addComment, editComment, deleteComment } from "@/lib/api/ideas";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import FileUpload from "@/components/FileUpload";
import { motion } from "framer-motion";
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
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentType, setAttachmentType] = useState<'image' | 'video' | 'pdf' | 'document' | undefined>();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isCommentAnonymous, setIsCommentAnonymous] = useState<Record<string, boolean>>({});
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; authorName: string; ideaId: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most_liked" | "most_commented">("newest");
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [, setLocation] = useLocation();

  const { data: ideas, isLoading } = useQuery({
    queryKey: ['/api/ideas'],
    queryFn: getIdeas,
  });

  // Filter and sort ideas
  const filteredAndSortedIdeas = ideas ? [...ideas]
    .filter((idea: any) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const authorName = idea.author 
        ? `${idea.author.first_name || ""} ${idea.author.last_name || ""}`.toLowerCase()
        : "";
      return (
        idea.title.toLowerCase().includes(query) ||
        idea.content.toLowerCase().includes(query) ||
        authorName.includes(query)
      );
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "most_liked":
          return (b.likes_count || 0) - (a.likes_count || 0);
        case "most_commented":
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        default:
          return 0;
      }
    })
  : [];

  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string; imageUrl?: string; videoUrl?: string; attachmentUrl?: string; attachmentType?: string; is_anonymous?: boolean }) => {
      if (!user) {
        toast({
          title: "Giriş Gerekli",
          description: "Fikir paylaşmak için giriş yapmanız gerekiyor",
        });
        setTimeout(() => setLocation("/giris"), 1500);
        throw new Error("Giriş yapmanız gerekiyor");
      }
      return createIdea(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      setTitle("");
      setContent("");
      setImageUrl("");
      setVideoUrl("");
      setAttachmentUrl("");
      setAttachmentType(undefined);
      setIsAnonymous(false);
      setOpen(false);
      toast({
        title: "Fikir gönderildi!",
        description: "Fikriniz yönetici onayından sonra yayınlanacak.",
      });
    },
    onError: (error: any) => {
      if (error.message !== "Giriş yapmanız gerekiyor") {
        toast({
          title: "Hata",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const likeMutation = useMutation({
    mutationFn: (ideaId: string) => {
      if (!user) {
        toast({
          title: "Giriş Gerekli",
          description: "Beğenmek için giriş yapmanız gerekiyor",
        });
        setTimeout(() => setLocation("/giris"), 1500);
        throw new Error("Giriş yapmanız gerekiyor");
      }
      return toggleLike(ideaId);
    },
    onMutate: async (ideaId) => {
      if (!user) return { previousIdeas: null };

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/ideas'] });

      // Snapshot previous value
      const previousIdeas = queryClient.getQueryData(['/api/ideas']);

      // Optimistically update
      queryClient.setQueryData(['/api/ideas'], (old: any) => {
        if (!old) return old;
        return old.map((idea: any) => {
          if (idea.id === ideaId) {
            return {
              ...idea,
              user_has_liked: !idea.user_has_liked,
              likes_count: idea.user_has_liked 
                ? (idea.likes_count || 1) - 1 
                : (idea.likes_count || 0) + 1,
            };
          }
          return idea;
        });
      });

      return { previousIdeas };
    },
    onError: (err: any, ideaId, context: any) => {
      // Rollback on error
      if (context?.previousIdeas) {
        queryClient.setQueryData(['/api/ideas'], context.previousIdeas);
      }
      if (err.message !== "Giriş yapmanız gerekiyor") {
        toast({
          title: "Hata",
          description: "Beğeni kaydedilemedi",
          variant: "destructive",
        });
      }
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ ideaId, content, parentId, isAnonymous }: { ideaId: string; content: string; parentId?: string; isAnonymous?: boolean }) => {
      if (!user) {
        toast({
          title: "Giriş Gerekli",
          description: "Yorum yapmak için giriş yapmanız gerekiyor",
        });
        setTimeout(() => setLocation("/giris"), 1500);
        throw new Error("Giriş yapmanız gerekiyor");
      }
      return addComment(ideaId, content, parentId, isAnonymous);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      setCommentText({ ...commentText, [variables.ideaId]: '' });
      setIsCommentAnonymous({ ...isCommentAnonymous, [variables.ideaId]: false });
      setReplyingTo(null);
      toast({
        title: variables.parentId ? "Yanıt gönderildi!" : "Yorum gönderildi!",
        description: "Yorumunuz yönetici onayından sonra yayınlanacak.",
      });
    },
    onError: (error: any) => {
      if (error.message !== "Giriş yapmanız gerekiyor") {
        toast({
          title: "Hata",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) => {
      return editComment(commentId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      setEditingComment(null);
      toast({
        title: "Yorum düzenlendi!",
        description: "Yorumunuz tekrar yönetici onayına gönderildi.",
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

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => {
      return deleteComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      setDeleteCommentId(null);
      toast({
        title: "Yorum silindi",
        description: "Yorumunuz başarıyla silindi.",
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

    createMutation.mutate({ 
      title, 
      content, 
      imageUrl: imageUrl || undefined, 
      videoUrl: videoUrl || undefined,
      attachmentUrl: attachmentUrl || undefined,
      attachmentType: attachmentType || undefined,
      is_anonymous: isAnonymous,
    });
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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Görsel
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="document" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF/Doküman
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
                <TabsContent value="document" className="mt-4">
                  <FileUpload
                    type="all"
                    currentUrl={attachmentUrl}
                    onUploadComplete={(url, type) => {
                      setAttachmentUrl(url);
                      setAttachmentType(type);
                    }}
                    onRemove={() => {
                      setAttachmentUrl("");
                      setAttachmentType(undefined);
                    }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  />
                </TabsContent>
              </Tabs>
              
              <div className="flex items-center space-x-2 py-2 px-3 bg-muted/50 rounded-lg">
                <Checkbox 
                  id="anonymous" 
                  checked={isAnonymous} 
                  onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                  data-testid="checkbox-anonymous"
                />
                <Label htmlFor="anonymous" className="flex items-center gap-2 cursor-pointer text-sm">
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                  Anonim olarak paylaş
                </Label>
                <span className="text-xs text-muted-foreground ml-auto">
                  (Yöneticiler kimliğinizi görebilir)
                </span>
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

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Fikir ara (başlık, içerik veya yazar)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-ideas"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-sort-ideas">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">En Yeni</SelectItem>
            <SelectItem value="oldest">En Eski</SelectItem>
            <SelectItem value="most_liked">En Çok Beğenilen</SelectItem>
            <SelectItem value="most_commented">En Çok Yorumlanan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top 3 Most Liked Ideas */}
      {ideas && ideas.length > 0 && !searchQuery && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-bold">En Popüler Fikirler</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...ideas]
              .sort((a: any, b: any) => (b.likes_count || 0) - (a.likes_count || 0))
              .slice(0, 3)
              .map((idea: any, index: number) => {
                const isIdeaAnon = idea.is_anonymous && !idea.author;
                const authorName = idea.author
                  ? `${idea.author.first_name || ""} ${idea.author.last_name || ""}`.trim()
                  : "Anonim";
                const showIdeaAnonBadge = idea.is_anonymous && idea.author && profile?.role === 'admin';
                const authorPicture = idea.author?.profile_picture_status === 'approved' ? idea.author?.profile_picture_url : null;
                const initials = isIdeaAnon ? "" : authorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
                
                return (
                  <Card key={idea.id} className="p-4 relative" data-testid={`card-top-idea-${idea.id}`}>
                    <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-background border flex items-center justify-center">
                      <span className={`font-bold ${medalColors[index]}`}>{index + 1}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        {authorPicture && <AvatarImage src={authorPicture} alt={authorName} />}
                        <AvatarFallback className="text-xs">{isIdeaAnon ? <EyeOff className="h-4 w-4" /> : initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">
                        {authorName}
                        {showIdeaAnonBadge && (
                          <span className="ml-1 text-xs text-muted-foreground font-normal inline-flex items-center gap-1">
                            <EyeOff className="h-3 w-3" />
                          </span>
                        )}
                      </span>
                    </div>
                    <h3 className="font-bold mb-2 line-clamp-2">{idea.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{idea.content}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className={`h-4 w-4 ${idea.user_has_liked ? 'fill-red-500 text-red-500' : ''}`} />
                        {idea.likes_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {idea.comments?.length || 0}
                      </span>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Ideas List */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">
            {searchQuery ? `Arama Sonuçları (${filteredAndSortedIdeas.length})` : "Tüm Fikirler"}
          </h2>
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            data-testid="button-clear-search"
          >
            <X className="h-4 w-4 mr-1" />
            Temizle
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {filteredAndSortedIdeas.length > 0 ? (
          filteredAndSortedIdeas.map((idea: any) => {
            const isIdeaAnon = idea.is_anonymous && !idea.author;
            const authorName = idea.author
              ? `${idea.author.first_name || ""} ${idea.author.last_name || ""}`.trim()
              : "Anonim";
            const showIdeaAnonBadge = idea.is_anonymous && idea.author && profile?.role === 'admin';
            const authorClass = isIdeaAnon ? "" : (idea.author?.class_name || "");
            const authorPicture = idea.author?.profile_picture_status === 'approved' ? idea.author?.profile_picture_url : null;
            const initials = isIdeaAnon ? "" : authorName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card key={idea.id} className="p-6" data-testid={`card-idea-${idea.id}`}>
                <div className="flex gap-4">
                  <Avatar>
                    {authorPicture && <AvatarImage src={authorPicture} alt={authorName} />}
                    <AvatarFallback>{isIdeaAnon ? <EyeOff className="h-5 w-5" /> : initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-semibold">
                        {authorName}
                        {showIdeaAnonBadge && (
                          <span className="ml-2 text-xs text-muted-foreground font-normal inline-flex items-center gap-1">
                            <EyeOff className="h-3 w-3" />
                            Anonim
                          </span>
                        )}
                      </span>
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
                    
                    {idea.attachment_url && (idea.attachment_type === 'pdf' || idea.attachment_type === 'document') && (
                      <a 
                        href={idea.attachment_url} 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-sm"
                        data-testid={`link-download-attachment-${idea.id}`}
                      >
                        <FileText className="h-4 w-4" />
                        {idea.attachment_type === 'pdf' ? 'PDF Dosyası' : 'Doküman'} İndir
                        <Download className="h-4 w-4" />
                      </a>
                    )}

                    <div className="flex items-center gap-6 text-muted-foreground">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => likeMutation.mutate(idea.id)}
                              className={`flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-1.5 transition-colors ${
                                idea.user_has_liked ? 'text-primary' : ''
                              }`}
                              data-testid={`button-like-${idea.id}`}
                            >
                              <motion.div
                                key={idea.user_has_liked ? 'liked' : 'unliked'}
                                initial={{ scale: 1 }}
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ 
                                  duration: 0.3,
                                  ease: "easeInOut"
                                }}
                              >
                                <Heart className={`h-5 w-5 ${idea.user_has_liked ? 'fill-current' : ''}`} />
                              </motion.div>
                              <span className="text-sm font-medium">{idea.likes_count || 0}</span>
                            </button>
                          </TooltipTrigger>
                          {!user && (
                            <TooltipContent>
                              <p>Beğenmek için giriş yapın</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
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
                              const isCommentAnon = comment.is_anonymous && !comment.author;
                              const commentAuthor = comment.author
                                ? `${comment.author.first_name || ""} ${comment.author.last_name || ""}`.trim()
                                : "Anonim";
                              const showAnonBadge = comment.is_anonymous && comment.author && profile?.role === 'admin';
                              const commentPicture = comment.author?.profile_picture_status === 'approved' ? comment.author?.profile_picture_url : null;
                              const isOwnComment = profile?.id === comment.author_id;
                              const isAdmin = profile?.role === 'admin';
                              const canModify = isOwnComment || isAdmin;
                              return (
                                <div key={comment.id} className="flex gap-3">
                                  <Avatar className="h-8 w-8">
                                    {commentPicture && <AvatarImage src={commentPicture} alt={commentAuthor} />}
                                    <AvatarFallback className="text-xs">
                                      {isCommentAnon ? <EyeOff className="h-4 w-4" /> : commentAuthor.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-muted rounded-lg p-3 relative">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <p className="font-semibold text-sm">
                                            {isCommentAnon ? (
                                              <span className="inline-flex items-center gap-1">
                                                <EyeOff className="h-4 w-4" />
                                                Anonim
                                              </span>
                                            ) : (
                                              <>
                                                {commentAuthor}
                                                {showAnonBadge && (
                                                  <span className="ml-2 text-xs text-muted-foreground font-normal inline-flex items-center gap-1">
                                                    <EyeOff className="h-3 w-3" />
                                                    Anonim
                                                  </span>
                                                )}
                                              </>
                                            )}
                                          </p>
                                          <p className="text-sm">
                                            {comment.parent_id && (() => {
                                              const parentComment = idea.comments?.find((c: any) => c.id === comment.parent_id);
                                              const parentIsAnon = parentComment?.is_anonymous && !parentComment?.author;
                                              const parentAuthorName = parentComment?.author 
                                                ? `${parentComment.author.first_name || ""} ${parentComment.author.last_name || ""}`.trim() 
                                                : null;
                                              return (
                                                <span className="text-primary font-medium">
                                                  @{parentIsAnon ? "anoimkişi" : (parentAuthorName || "anoimkişi")}{" "}
                                                </span>
                                              );
                                            })()}
                                            {comment.content}
                                          </p>
                                        </div>
                                        {canModify && (
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 shrink-0"
                                                data-testid={`button-comment-menu-${comment.id}`}
                                              >
                                                <MoreVertical className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              {isOwnComment && (
                                                <DropdownMenuItem 
                                                  onClick={() => setEditingComment({ id: comment.id, content: comment.content })}
                                                  data-testid={`button-edit-comment-${comment.id}`}
                                                >
                                                  <Pencil className="h-4 w-4 mr-2" />
                                                  Düzenle
                                                </DropdownMenuItem>
                                              )}
                                              <DropdownMenuItem 
                                                onClick={() => setDeleteCommentId(comment.id)}
                                                className="text-destructive"
                                                data-testid={`button-delete-comment-${comment.id}`}
                                              >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Sil
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 ml-3">
                                      <p className="text-xs text-muted-foreground">
                                        {dayjs.utc(comment.created_at).local().fromNow()}
                                      </p>
                                      {user && (
                                        <button
                                          onClick={() => setReplyingTo({ 
                                            commentId: comment.id, 
                                            authorName: commentAuthor, 
                                            ideaId: idea.id 
                                          })}
                                          className="text-xs text-primary hover:underline flex items-center gap-1"
                                          data-testid={`button-reply-${comment.id}`}
                                        >
                                          <Reply className="h-3 w-3" />
                                          Yanıtla
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">Henüz yorum yok</p>
                        )}

                        {/* Comment Form */}
                        {user ? (
                          <div className="space-y-2">
                            {replyingTo && replyingTo.ideaId === idea.id && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                                <Reply className="h-4 w-4" />
                                <span><strong>{replyingTo.authorName}</strong> adlı kişiye yanıt veriyorsunuz</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 ml-auto"
                                  onClick={() => setReplyingTo(null)}
                                  data-testid="button-cancel-reply"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Textarea
                                placeholder={replyingTo && replyingTo.ideaId === idea.id ? `${replyingTo.authorName} adlı kişiye yanıt yaz...` : "Yorum yaz..."}
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
                                  commentMutation.mutate({ 
                                    ideaId: idea.id, 
                                    content: commentText[idea.id],
                                    parentId: (replyingTo && replyingTo.ideaId === idea.id) ? replyingTo.commentId : undefined,
                                    isAnonymous: isCommentAnonymous[idea.id] || false
                                  });
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
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id={`comment-anonymous-${idea.id}`}
                                checked={isCommentAnonymous[idea.id] || false}
                                onCheckedChange={(checked) => setIsCommentAnonymous({ ...isCommentAnonymous, [idea.id]: checked === true })}
                                data-testid={`checkbox-comment-anonymous-${idea.id}`}
                              />
                              <Label htmlFor={`comment-anonymous-${idea.id}`} className="flex items-center gap-1 cursor-pointer text-xs text-muted-foreground">
                                <EyeOff className="h-3 w-3" />
                                Anonim yorum
                              </Label>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-2">Yorum yapmak için giriş yapın</p>
                            <Button variant="outline" size="sm" onClick={() => setLocation("/giris")} data-testid="button-login-to-comment">
                              Giriş Yap
                            </Button>
                          </div>
                        )}
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
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "Sonuç bulunamadı" : "Henüz fikir yok"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "Arama kriterlerinize uygun fikir bulunamadı." 
                : "İlk fikri paylaşan sen ol!"}
            </p>
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery("")} data-testid="button-clear-search-empty">
                <X className="h-4 w-4 mr-2" />
                Aramayı Temizle
              </Button>
            ) : (
              <Button onClick={() => setOpen(true)} data-testid="button-first-idea">
                <Lightbulb className="h-4 w-4 mr-2" />
                Yeni Fikir
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Edit Comment Dialog */}
      <Dialog open={!!editingComment} onOpenChange={(open) => !open && setEditingComment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yorumu Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editingComment?.content || ''}
              onChange={(e) => setEditingComment(editingComment ? { ...editingComment, content: e.target.value } : null)}
              placeholder="Yorumunuz..."
              className="min-h-[100px]"
              data-testid="input-edit-comment"
            />
            <p className="text-sm text-muted-foreground">
              Düzenlenen yorumlar tekrar yönetici onayına gönderilir.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingComment(null)}>
                İptal
              </Button>
              <Button
                onClick={() => {
                  if (editingComment && editingComment.content.trim()) {
                    editCommentMutation.mutate({ 
                      commentId: editingComment.id, 
                      content: editingComment.content 
                    });
                  }
                }}
                disabled={editCommentMutation.isPending}
                data-testid="button-save-edit-comment"
              >
                {editCommentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Comment Confirmation */}
      <AlertDialog open={!!deleteCommentId} onOpenChange={(open) => !open && setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yorumu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteCommentId) {
                  deleteCommentMutation.mutate(deleteCommentId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-comment"
            >
              {deleteCommentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
