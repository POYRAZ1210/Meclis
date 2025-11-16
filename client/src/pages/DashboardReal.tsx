import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import AnnouncementCard from "@/components/AnnouncementCard";
import PollCard from "@/components/PollCard";
import IdeaCard from "@/components/IdeaCard";
import EmptyState from "@/components/EmptyState";
import { Bell, Plus, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { getAnnouncements } from "@/lib/api/announcements";
import { getPolls, getPollVotes, getUserVote, votePoll } from "@/lib/api/polls";
import { getIdeas } from "@/lib/api/ideas";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("tr");

export default function Dashboard() {
  const { toast } = useToast();

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ana Sayfa</h1>
        <p className="text-muted-foreground">Okul meclisi portalına hoş geldiniz</p>
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
                      createdAt={dayjs(announcement.created_at).fromNow()}
                      onReadMore={() => console.log("Duyuru detayı:", announcement.id)}
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
            <Link href="/fikirler/yeni">
              <Button className="w-full" data-testid="button-new-idea">
                <Plus className="h-4 w-4 mr-2" />
                Fikir Paylaş
              </Button>
            </Link>
          </div>
        </div>
      </div>
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
    ...opt,
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
      onVote={(optionId) => onVote({ pollId: poll.id, optionId })}
    />
  );
}
