import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnnouncementCard from "@/components/AnnouncementCard";
import PollCard from "@/components/PollCard";
import IdeaCard from "@/components/IdeaCard";
import EmptyState from "@/components/EmptyState";
import { Bell, Plus, Loader2, MessageSquare, Send } from "lucide-react";
import { Link } from "wouter";
import { getAnnouncements, getAnnouncementComments, addAnnouncementComment, type Announcement } from "@/lib/api/announcements";
import { getPolls, getPollVotes, getUserVote, votePoll } from "@/lib/api/polls";
import { getIdeas } from "@/lib/api/ideas";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [newComment, setNewComment] = useState("");

  const { data: announcements, isLoading: loadingAnnouncements } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: getAnnouncements,
  });

  const { data: polls, isLoading: loadingPolls } = useQuery({
    queryKey: ["/api/polls"],
    queryFn: getPolls,
  });

  const { data: ideas, isLoading: loadingIdeas } = useQuery({
    queryKey: ["/api/ideas", "approved"],
    queryFn: () => getIdeas("approved"),
  });

  const { data: comments, isLoading: loadingComments } = useQuery({
    queryKey: ['/api/announcements', selectedAnnouncement?.id, 'comments'],
    queryFn: () => selectedAnnouncement ? getAnnouncementComments(selectedAnnouncement.id) : Promise.resolve([]),
    enabled: !!selectedAnnouncement,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => addAnnouncementComment(selectedAnnouncement!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements', selectedAnnouncement?.id, 'comments'] });
      setNewComment("");
      toast({
        title: "Başarılı",
        description: "Yorumunuz moderatör onayına gönderildi",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Yorum eklenirken bir hata oluştu",
      });
    },
  });

  const voteMutation = useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) =>
      votePoll(pollId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Başarılı",
        description: "Oyunuz kaydedildi",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Oy verilirken bir hata oluştu",
      });
    },
  });

  const activePoll = polls?.[0];
  const recentAnnouncements = announcements?.slice(0, 2);
  const recentIdeas = ideas?.slice(0, 5);

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <span className="text-primary">Maya Meclisi</span> Portalı'na Hoş Geldiniz
        </h1>
        <p className="text-muted-foreground">Öğrenci meclisi haberler, oylamalar ve fikirleriniz için</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Son Duyurular
              </h2>
              <Link href="/duyurular">
                <Button variant="ghost" size="sm" data-testid="link-all-announcements">
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
                      createdAt={dayjs(announcement.created_at).format('DD MMMM YYYY, HH:mm')}
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
              <h2 className="text-xl font-semibold">Son Fikirler</h2>
              <Link href="/fikirler">
                <Button variant="ghost" size="sm" data-testid="link-all-ideas">
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
                {recentIdeas.map((idea) => {
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
                      excerpt={idea.content?.substring(0, 150) || ''}
                      authorName={authorName}
                      authorInitials={initials}
                      createdAt={dayjs.utc(idea.created_at).local().fromNow()}
                      status={idea.status}
                      commentCount={idea.comments?.length || 0}
                      onReadMore={() => console.log("Fikir detayı:", idea.id)}
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
              <h2 className="text-xl font-semibold mb-4">Aktif Oylama</h2>
              <PollDisplay poll={activePoll} onVote={voteMutation.mutate} />
            </div>
          )}

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-3">Yeni Fikir Ekle</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Okulunuzu geliştirmek için fikirlerinizi paylaşın
            </p>
            <Link href="/fikirler">
              <Button className="w-full" data-testid="button-new-idea">
                <Plus className="h-4 w-4 mr-2" />
                Fikir Paylaş
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
                : "Yönetici"} • {selectedAnnouncement && dayjs(selectedAnnouncement.created_at).fromNow()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="py-4">
              <p className="text-sm leading-relaxed">{selectedAnnouncement?.content}</p>
            </div>

            {/* Comments Section */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Yorumlar {comments && comments.length > 0 && `(${comments.length})`}
              </h3>

              {/* Comment Form */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Yorum yaz..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && newComment.trim()) {
                        e.preventDefault();
                        addCommentMutation.mutate(newComment);
                      }
                    }}
                    disabled={addCommentMutation.isPending}
                    data-testid="input-announcement-comment"
                  />
                  <Button
                    size="icon"
                    onClick={() => newComment.trim() && addCommentMutation.mutate(newComment)}
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
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : comments && comments.length > 0 ? (
                  comments.map((comment: any) => (
                    <Card key={comment.id} className="p-3" data-testid={`comment-${comment.id}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {comment.author
                                ? `${comment.author.first_name || ""} ${comment.author.last_name || ""}`.trim()
                                : "Anonim"}
                            </span>
                            {comment.author?.class_name && (
                              <span className="text-xs text-muted-foreground">• {comment.author.class_name}</span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              • {dayjs(comment.created_at).fromNow()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Henüz yorum yok. İlk yorumu siz yapın!</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PollDisplay({ poll, onVote }: { poll: any; onVote: any }) {
  const { data: votes } = useQuery({
    queryKey: ["/api/polls", poll.id, "votes"],
    queryFn: () => getPollVotes(poll.id),
  });

  const { data: userVote } = useQuery({
    queryKey: ["/api/polls", poll.id, "user-vote"],
    queryFn: () => getUserVote(poll.id),
  });

  const voteCounts = votes?.reduce((acc: Record<string, number>, vote) => {
    acc[vote.option_id] = (acc[vote.option_id] || 0) + 1;
    return acc;
  }, {}) || {};

  const optionsWithVotes = poll.options?.map((opt: any) => ({
    id: opt.id,
    text: opt.option_text,
    votes: voteCounts[opt.id] || 0,
  })) || [];

  const totalVotes = votes?.length || 0;

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
