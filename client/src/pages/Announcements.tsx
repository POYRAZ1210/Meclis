import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import AnnouncementCard from "@/components/AnnouncementCard";
import EmptyState from "@/components/EmptyState";
import { Bell, Plus, Search, Loader2, FileText, Download, MoreVertical, Pencil, Trash2, Reply, X, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getAnnouncements, createAnnouncement, getAnnouncementComments, addAnnouncementComment, editAnnouncementComment, deleteAnnouncementComment, type Announcement } from "@/lib/api/announcements";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { MessageSquare, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("tr");

const announcementFormSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir").max(200, "Başlık çok uzun"),
  content: z.string().min(1, "İçerik gereklidir").max(5000, "İçerik çok uzun"),
  targetAudience: z.enum(['all', 'class_presidents']).default('all'),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

export default function Announcements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isNewAnnouncementOpen, setIsNewAnnouncementOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommentAnonymous, setIsCommentAnonymous] = useState(false);
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; authorName: string } | null>(null);
  const { toast} = useToast();
  const { user, profile } = useAuth();
  const [, setLocation] = useLocation();
  const isAdmin = profile?.role === "admin";

  const { data: comments, isLoading: loadingComments } = useQuery({
    queryKey: ['/api/announcements', selectedAnnouncement?.id, 'comments'],
    queryFn: () => selectedAnnouncement ? getAnnouncementComments(selectedAnnouncement.id) : Promise.resolve([]),
    enabled: !!selectedAnnouncement,
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ content, parentId, isAnonymous }: { content: string; parentId?: string; isAnonymous?: boolean }) => {
      if (!user) {
        toast({
          title: "Giriş Gerekli",
          description: "Yorum yapmak için giriş yapmanız gerekiyor",
        });
        setTimeout(() => setLocation("/giris"), 1500);
        throw new Error("Giriş yapmanız gerekiyor");
      }
      return addAnnouncementComment(selectedAnnouncement!.id, content, parentId, isAnonymous);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements', selectedAnnouncement?.id, 'comments'] });
      setNewComment("");
      setIsCommentAnonymous(false);
      setReplyingTo(null);
      toast({
        title: "Başarılı",
        description: variables.parentId ? "Yanıtınız moderatör onayına gönderildi" : "Yorumunuz moderatör onayına gönderildi",
      });
    },
    onError: (error: any) => {
      if (error.message !== "Giriş yapmanız gerekiyor") {
        toast({
          variant: "destructive",
          title: "Hata",
          description: error.message || "Yorum eklenirken bir hata oluştu",
        });
      }
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) => {
      return editAnnouncementComment(commentId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements', selectedAnnouncement?.id, 'comments'] });
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
      return deleteAnnouncementComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements', selectedAnnouncement?.id, 'comments'] });
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

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: getAnnouncements,
  });

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      content: "",
      targetAudience: 'all',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: AnnouncementFormValues) => createAnnouncement(data.title, data.content, data.targetAudience),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setIsNewAnnouncementOpen(false);
      form.reset();
      toast({
        title: "Başarılı",
        description: "Duyuru başarıyla oluşturuldu",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Duyuru oluşturulurken bir hata oluştu",
      });
    },
  });

  const onSubmit = (data: AnnouncementFormValues) => {
    createMutation.mutate(data);
  };

  const filteredAnnouncements = announcements?.filter((announcement) =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Duyurular</h1>
            <p className="text-muted-foreground">Tüm okul duyurularını görüntüleyin</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsNewAnnouncementOpen(true)} data-testid="button-new-announcement">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Duyuru
            </Button>
          )}
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAnnouncements.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredAnnouncements.map((announcement) => {
            const authorName = announcement.author
              ? `${announcement.author.first_name || ""} ${announcement.author.last_name || ""}`.trim()
              : "Yönetici";
            return (
              <AnnouncementCard
                key={announcement.id}
                title={announcement.title}
                content={announcement.content}
                authorName={authorName}
                createdAt={dayjs.utc(announcement.created_at).local().fromNow()}
                attachmentUrl={announcement.attachment_url}
                attachmentType={announcement.attachment_type}
                onReadMore={() => setSelectedAnnouncement(announcement)}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title={searchQuery ? "Duyuru bulunamadı" : "Henüz duyuru yok"}
          description={searchQuery ? "Arama kriterlerinize uygun duyuru bulunamadı." : "İlk duyuruyu oluşturun."}
        />
      )}

      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              {selectedAnnouncement?.author
                ? `${selectedAnnouncement.author.first_name || ""} ${selectedAnnouncement.author.last_name || ""}`.trim()
                : "Yönetici"} • {selectedAnnouncement && dayjs.utc(selectedAnnouncement.created_at).local().fromNow()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="py-4">
              <p className="text-sm leading-relaxed">{selectedAnnouncement?.content}</p>
              
              {/* Attachment Download */}
              {selectedAnnouncement?.attachment_url && 
               (selectedAnnouncement?.attachment_type === 'pdf' || selectedAnnouncement?.attachment_type === 'document') && (
                <a 
                  href={selectedAnnouncement.attachment_url} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                  data-testid="link-download-attachment-modal"
                >
                  <FileText className="h-4 w-4" />
                  {selectedAnnouncement.attachment_type === 'pdf' ? 'PDF Dosyası' : 'Doküman'} İndir
                  <Download className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Comments Section */}
            <div className="border-t pt-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-semibold">Yorumlar ({comments?.length || 0})</h3>
              </div>

              {/* Comment Form */}
              <div className="mb-6 space-y-2">
                {replyingTo && (
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
                  <Input
                    placeholder={replyingTo ? `${replyingTo.authorName} adlı kişiye yanıt yaz...` : "Yorum yaz..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && newComment.trim()) {
                        e.preventDefault();
                        addCommentMutation.mutate({ content: newComment, parentId: replyingTo?.commentId, isAnonymous: isCommentAnonymous });
                      }
                    }}
                    disabled={addCommentMutation.isPending}
                    data-testid="input-announcement-comment"
                  />
                  <Button
                    size="icon"
                    onClick={() => newComment.trim() && addCommentMutation.mutate({ content: newComment, parentId: replyingTo?.commentId, isAnonymous: isCommentAnonymous })}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    data-testid="button-submit-comment"
                  >
                    {addCommentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="comment-anonymous"
                    checked={isCommentAnonymous}
                    onCheckedChange={(checked) => setIsCommentAnonymous(checked === true)}
                    data-testid="checkbox-comment-anonymous"
                  />
                  <Label htmlFor="comment-anonymous" className="flex items-center gap-1 cursor-pointer text-xs text-muted-foreground">
                    <EyeOff className="h-3 w-3" />
                    Anonim yorum
                  </Label>
                </div>
              </div>

              {/* Comments List */}
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment: any) => {
                    const isCommentAnon = comment.is_anonymous && !comment.author;
                    const authorName = comment.author
                      ? `${comment.author.first_name || ""} ${comment.author.last_name || ""}`.trim()
                      : "Anonim";
                    const showAnonBadge = comment.is_anonymous && comment.author && profile?.role === 'admin';
                    const isOwnComment = profile?.id === comment.author_id;
                    const isAdmin = profile?.role === 'admin';
                    const canModify = isOwnComment || isAdmin;
                    return (
                      <Card key={comment.id} className="p-4" data-testid={`comment-${comment.id}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">
                              {isCommentAnon ? (
                                <span className="inline-flex items-center gap-1">
                                  <EyeOff className="h-4 w-4" />
                                  Anonim
                                </span>
                              ) : (
                                <>
                                  {authorName}
                                  {showAnonBadge && (
                                    <span className="ml-2 text-xs text-muted-foreground font-normal inline-flex items-center gap-1">
                                      <EyeOff className="h-3 w-3" />
                                      Anonim
                                    </span>
                                  )}
                                </>
                              )}
                            </p>
                            {comment.author && (comment.author.class_name || comment.author.student_no) && (
                              <p className="text-xs text-muted-foreground">
                                {comment.author.class_name || ""} {comment.author.student_no ? `• ${comment.author.student_no}` : ""}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {dayjs.utc(comment.created_at).local().fromNow()}
                            </p>
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
                        <p className="text-sm mb-2">
                          {comment.parent_id && (
                            <span className="text-primary font-medium">
                              @{comment.parent_comment?.is_anonymous 
                                ? "anoimkişi" 
                                : comment.parent_comment?.author 
                                  ? `${comment.parent_comment.author.first_name || ""} ${comment.parent_comment.author.last_name || ""}`.trim() || "anoimkişi"
                                  : "anoimkişi"}{" "}
                            </span>
                          )}
                          {comment.content}
                        </p>
                        {user && (
                          <button
                            onClick={() => setReplyingTo({ 
                              commentId: comment.id, 
                              authorName 
                            })}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                            data-testid={`button-reply-${comment.id}`}
                          >
                            <Reply className="h-3 w-3" />
                            Yanıtla
                          </button>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Henüz yorum yok. İlk yorumu siz yapın!
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewAnnouncementOpen} onOpenChange={setIsNewAnnouncementOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Duyuru</DialogTitle>
            <DialogDescription>
              Okul genelinde paylaşılacak yeni bir duyuru oluşturun
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlık</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Duyuru başlığını girin"
                        {...field}
                        data-testid="input-announcement-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İçerik</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Duyuru içeriğini girin"
                        rows={6}
                        {...field}
                        data-testid="textarea-announcement-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hedef Kitle</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        data-testid="radio-target-audience"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="all" data-testid="radio-audience-all" />
                          <Label htmlFor="all" className="cursor-pointer">Herkes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="class_presidents" id="class_presidents" data-testid="radio-audience-presidents" />
                          <Label htmlFor="class_presidents" className="cursor-pointer">Sadece Sınıf Başkanları</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewAnnouncementOpen(false)}
                  disabled={createMutation.isPending}
                  data-testid="button-cancel-announcement"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-submit-announcement"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Oluştur
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
              data-testid="input-edit-announcement-comment"
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
                data-testid="button-save-edit-announcement-comment"
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
              data-testid="button-confirm-delete-announcement-comment"
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
