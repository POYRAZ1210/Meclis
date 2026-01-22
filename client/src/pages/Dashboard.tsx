import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnnouncementCard from "@/components/AnnouncementCard";
import PollCard from "@/components/PollCard";
import IdeaCard from "@/components/IdeaCard";
import EmptyState from "@/components/EmptyState";
import { Bell, Plus, Loader2, MessageSquare, Send, FileText, Download, ArrowRight, Reply, X, MoreVertical, Pencil, Trash2, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { getAnnouncements, getAnnouncementComments, addAnnouncementComment, editAnnouncementComment, deleteAnnouncementComment, type Announcement } from "@/lib/api/announcements";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getPolls, getUserVote, votePoll } from "@/lib/api/polls";
import { getIdeas } from "@/lib/api/ideas";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("tr");

export default function Dashboard() {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; authorName: string } | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [isCommentAnonymous, setIsCommentAnonymous] = useState(false);

  const { data: announcements, isLoading: loadingAnnouncements } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: getAnnouncements,
  });

  const { data: polls, isLoading: loadingPolls } = useQuery({
    queryKey: ["/api/polls"],
    queryFn: getPolls,
  });

  const { data: ideas, isLoading: loadingIdeas } = useQuery({
    queryKey: ["/api/ideas"],
    queryFn: getIdeas,
  });

  const { data: comments, isLoading: loadingComments } = useQuery({
    queryKey: ['/api/announcements', selectedAnnouncement?.id, 'comments'],
    queryFn: () => selectedAnnouncement ? getAnnouncementComments(selectedAnnouncement.id) : Promise.resolve([]),
    enabled: !!selectedAnnouncement,
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ content, parentId, isAnonymous }: { content: string; parentId?: string; isAnonymous?: boolean }) => {
      if (!user) {
        toast({
          description: "Yorum yapmak için lütfen giriş yapın",
        });
        throw new Error("Giriş yapmanız gerekiyor");
      }
      return addAnnouncementComment(selectedAnnouncement!.id, content, parentId, isAnonymous);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements', selectedAnnouncement?.id, 'comments'] });
      setNewComment("");
      setReplyingTo(null);
      setIsCommentAnonymous(false);
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
        title: "Başarılı",
        description: "Yorumunuz düzenlendi ve tekrar onaya gönderildi",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Yorum düzenlenirken bir hata oluştu",
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
        title: "Başarılı",
        description: "Yorum silindi",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Yorum silinirken bir hata oluştu",
      });
    },
  });

  const voteMutation = useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      if (!user) {
        toast({
          description: "Oy vermek için lütfen giriş yapın",
        });
        throw new Error("Giriş yapmanız gerekiyor");
      }
      return votePoll(pollId, optionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Başarılı",
        description: "Oyunuz kaydedildi",
      });
    },
    onError: (error: any) => {
      if (error.message !== "Giriş yapmanız gerekiyor") {
        toast({
          variant: "destructive",
          title: "Hata",
          description: error.message || "Oy verilirken bir hata oluştu",
        });
      }
    },
  });

  const activePoll = polls?.[0];
  const recentAnnouncements = announcements?.slice(0, 2);
  const recentIdeas = ideas?.slice(0, 5);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
          Hoş Geldiniz
        </h1>
        <p className="text-muted-foreground text-sm">Maya Meclisi - Öğrenci haberler, oylamalar ve fikirler</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-muted-foreground uppercase tracking-wider">
                Son Duyurular
              </h2>
              <Link href="/duyurular">
                <Button variant="ghost" size="sm" className="text-xs" data-testid="link-all-announcements">
                  Tümünü Gör
                </Button>
              </Link>
            </div>
            {loadingAnnouncements ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentAnnouncements && recentAnnouncements.length > 0 ? (
              <div className="space-y-4">
                {recentAnnouncements.map((announcement) => {
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
                title="Henüz duyuru yok"
                description="İlk duyuru eklendiğinde burada görünecek."
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-muted-foreground uppercase tracking-wider">Son Fikirler</h2>
              <Link href="/fikirler">
                <Button variant="ghost" size="sm" className="text-xs" data-testid="link-all-ideas">
                  Tümünü Gör
                </Button>
              </Link>
            </div>
            {loadingIdeas ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentIdeas && recentIdeas.length > 0 ? (
              <div className="space-y-4">
                {recentIdeas.map((idea: any) => {
                  const authorName = idea.author
                    ? `${idea.author.first_name || ""} ${idea.author.last_name || ""}`.trim()
                    : "Anonim";
                  const initials = authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  const authorPicture = idea.author?.profile_picture_status === 'approved' ? idea.author?.profile_picture_url : null;
                  return (
                    <IdeaCard
                      key={idea.id}
                      title={idea.title}
                      excerpt={idea.content?.substring(0, 150) || ''}
                      authorName={authorName}
                      authorInitials={initials}
                      authorPictureUrl={authorPicture}
                      createdAt={dayjs.utc(idea.created_at).local().fromNow()}
                      status={idea.status}
                      commentCount={idea.comments?.length || 0}
                      onClick={() => setLocation("/fikirler")}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title="Henüz fikir yok"
                description="İlk fikir paylaşıldığında burada görünecek."
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          {activePoll && (
            <div>
              <h2 className="text-base font-medium text-muted-foreground uppercase tracking-wider mb-4">Aktif Oylama</h2>
              <PollDisplay poll={activePoll} onVote={voteMutation.mutate} />
            </div>
          )}

          <div className="rounded-lg border border-border/50 p-5">
            <h3 className="font-medium text-sm mb-2">Fikir Paylaş</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Okulunuzu geliştirmek için fikirlerinizi paylaşın
            </p>
            <Link href="/fikirler">
              <Button size="sm" className="w-full" data-testid="button-new-idea">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Yeni Fikir
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Announcement Detail Dialog */}
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
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedAnnouncement?.content}</p>
              
              {/* Attachment Download */}
              {selectedAnnouncement?.attachment_url && 
               (selectedAnnouncement?.attachment_type === 'pdf' || selectedAnnouncement?.attachment_type === 'document') && (
                <a 
                  href={selectedAnnouncement.attachment_url} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                  data-testid="link-download-attachment-dashboard"
                >
                  <FileText className="h-4 w-4" />
                  {selectedAnnouncement.attachment_type === 'pdf' ? 'PDF Dosyası' : 'Doküman'} İndir
                  <Download className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Comments Section */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Yorumlar {comments && comments.length > 0 && `(${comments.length})`}
              </h3>

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
                    id="dashboard-comment-anonymous"
                    checked={isCommentAnonymous}
                    onCheckedChange={(checked) => setIsCommentAnonymous(checked === true)}
                    data-testid="checkbox-comment-anonymous-dashboard"
                  />
                  <Label htmlFor="dashboard-comment-anonymous" className="flex items-center gap-1 cursor-pointer text-xs text-muted-foreground">
                    <EyeOff className="h-3 w-3" />
                    Anonim yorum
                  </Label>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : comments && comments.length > 0 ? (
                  comments.map((comment: any) => {
                    const authorName = comment.author
                      ? `${comment.author.first_name || ""} ${comment.author.last_name || ""}`.trim()
                      : "Anonim";
                    const isOwnComment = profile?.id === comment.author_id;
                    const isAdmin = profile?.role === 'admin';
                    const canModify = isOwnComment || isAdmin;
                    return (
                      <Card key={comment.id} className="p-3" data-testid={`comment-${comment.id}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{authorName}</span>
                                {comment.author?.class_name && (
                                  <span className="text-xs text-muted-foreground">• {comment.author.class_name}</span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  • {dayjs.utc(comment.created_at).local().fromNow()}
                                </span>
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
                            <p className="text-sm text-muted-foreground mb-2">
                              {comment.parent_id && (() => {
                                const parentComment = comments?.find((c: any) => c.id === comment.parent_id);
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
                          </div>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Henüz yorum yok. İlk yorumu siz yapın!</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Comment Dialog */}
      <Dialog open={!!editingComment} onOpenChange={() => setEditingComment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yorumu Düzenle</DialogTitle>
            <DialogDescription>
              Yorumunuz düzenlendikten sonra tekrar onaya gönderilecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editingComment?.content || ''}
              onChange={(e) => setEditingComment(prev => prev ? { ...prev, content: e.target.value } : null)}
              placeholder="Yorum içeriği"
              data-testid="input-edit-comment"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingComment(null)} data-testid="button-cancel-edit">
                İptal
              </Button>
              <Button
                onClick={() => {
                  if (editingComment) {
                    editCommentMutation.mutate({ commentId: editingComment.id, content: editingComment.content });
                  }
                }}
                disabled={editCommentMutation.isPending}
                data-testid="button-save-edit"
              >
                {editCommentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kaydet"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Comment Confirmation */}
      <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yorumu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu yorumu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteCommentId) {
                  deleteCommentMutation.mutate(deleteCommentId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteCommentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PollDisplay({ poll, onVote }: { poll: any; onVote: any }) {
  const { data: userVote } = useQuery({
    queryKey: ["/api/polls", poll.id, "user-vote"],
    queryFn: () => getUserVote(poll.id),
  });

  const optionsWithVotes = poll.options?.map((opt: any) => ({
    id: opt.id,
    text: opt.option_text,
    votes: opt.vote_count || 0,
  })) || [];

  const totalVotes = optionsWithVotes.reduce((sum: number, opt: any) => sum + opt.votes, 0);

  return (
    <PollCard
      question={poll.question}
      options={optionsWithVotes}
      totalVotes={totalVotes}
      hasVoted={!!userVote}
      userVote={userVote?.option_id}
      isOpen={poll.is_open}
      resultsPublished={poll.results_published}
      onVote={(optionId) => onVote({ pollId: poll.id, optionId })}
    />
  );
}
