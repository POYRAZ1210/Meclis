import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";
import { CheckCircle2, XCircle, Eye, Users, Bell, BarChart3, FileText, Loader2, Image, MessageSquare, Trash2 } from "lucide-react";
import { getProfiles, updateProfile } from "@/lib/api/profiles";
import { getIdeas, updateIdeaStatus, updateCommentStatus } from "@/lib/api/ideas";
import { getAllBlutenPosts, toggleBlutenVisibility } from "@/lib/api/bluten";
import { getPendingComments, approveComment, rejectComment } from "@/lib/api/comments";
import { getAnnouncements, deleteAnnouncement } from "@/lib/api/announcements";
import { getPolls, deletePoll, togglePollStatus } from "@/lib/api/polls";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";
import AnnouncementForm from "@/components/admin/AnnouncementForm";
import PollForm from "@/components/admin/PollForm";
import BlutenForm from "@/components/admin/BlutenForm";
import UserForm from "@/components/admin/UserForm";
import PollStatsDialog from "@/components/admin/PollStatsDialog";

dayjs.extend(relativeTime);
dayjs.locale("tr");

export default function Admin() {
  const { toast } = useToast();

  const { data: profiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["/api/profiles"],
    queryFn: () => getProfiles(),
  });

  const { data: pendingIdeas, isLoading: loadingIdeas } = useQuery({
    queryKey: ["/api/ideas", "pending"],
    queryFn: () => getIdeas("pending"),
  });

  const { data: allBlutenPosts, isLoading: loadingBluten } = useQuery({
    queryKey: ["/api/bluten/all"],
    queryFn: getAllBlutenPosts,
  });

  const { data: pendingComments, isLoading: loadingComments } = useQuery({
    queryKey: ["/api/comments", "pending"],
    queryFn: getPendingComments,
  });

  const { data: announcements, isLoading: loadingAnnouncements } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: getAnnouncements,
  });

  const { data: polls, isLoading: loadingPolls } = useQuery({
    queryKey: ["/api/polls"],
    queryFn: getPolls,
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (announcementId: string) => deleteAnnouncement(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: "Başarılı",
        description: "Duyuru silindi",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Duyuru silinirken bir hata oluştu",
      });
    },
  });

  const deletePollMutation = useMutation({
    mutationFn: (pollId: string) => deletePoll(pollId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Başarılı",
        description: "Oylama silindi",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Oylama silinirken bir hata oluştu",
      });
    },
  });

  const togglePollMutation = useMutation({
    mutationFn: ({ pollId, isOpen }: { pollId: string; isOpen: boolean }) =>
      togglePollStatus(pollId, isOpen),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Başarılı",
        description: "Oylama durumu güncellendi",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Oylama durumu güncellenirken bir hata oluştu",
      });
    },
  });

  const roleUpdateMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateProfile(userId, { role: role as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Başarılı",
        description: "Kullanıcı rolü güncellendi",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Rol güncellenirken bir hata oluştu",
      });
    },
  });

  const ideaStatusMutation = useMutation({
    mutationFn: ({ ideaId, status }: { ideaId: string; status: 'approved' | 'rejected' }) =>
      updateIdeaStatus(ideaId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "Başarılı",
        description: variables.status === 'approved' ? "Fikir onaylandı" : "Fikir reddedildi",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Fikir durumu güncellenirken bir hata oluştu",
      });
    },
  });

  const commentApproveMutation = useMutation({
    mutationFn: (commentId: string) => approveComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({
        title: "Başarılı",
        description: "Yorum onaylandı",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Yorum onaylanırken bir hata oluştu",
      });
    },
  });

  const commentRejectMutation = useMutation({
    mutationFn: (commentId: string) => rejectComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({
        title: "Başarılı",
        description: "Yorum reddedildi",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Yorum reddedilirken bir hata oluştu",
      });
    },
  });

  const blutenVisibilityMutation = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      toggleBlutenVisibility(id, visible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bluten"] });
      toast({
        title: "Başarılı",
        description: "Blüten görünürlüğü güncellendi",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Görünürlük değiştirilirken bir hata oluştu",
      });
    },
  });

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Yönetici Paneli</h1>
        <p className="text-muted-foreground">Sistem yönetimi ve moderasyon işlemleri</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-auto lg:inline-grid gap-1">
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-4 w-4 mr-2" />
            Kullanıcılar
          </TabsTrigger>
          <TabsTrigger value="announcements" data-testid="tab-announcements">
            <Bell className="h-4 w-4 mr-2" />
            Duyurular
          </TabsTrigger>
          <TabsTrigger value="bluten" data-testid="tab-bluten">
            <Image className="h-4 w-4 mr-2" />
            Blüten
          </TabsTrigger>
          <TabsTrigger value="polls" data-testid="tab-polls">
            <BarChart3 className="h-4 w-4 mr-2" />
            Oylamalar
          </TabsTrigger>
          <TabsTrigger value="ideas" data-testid="tab-ideas">
            <FileText className="h-4 w-4 mr-2" />
            Fikirler
          </TabsTrigger>
          <TabsTrigger value="comments" data-testid="tab-comments">
            <MessageSquare className="h-4 w-4 mr-2" />
            Yorumlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Kullanıcı Yönetimi</CardTitle>
              <UserForm />
            </CardHeader>
            <CardContent>
              {loadingProfiles ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İsim</TableHead>
                      <TableHead>Sınıf</TableHead>
                      <TableHead>Rol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles?.map((profile) => (
                      <TableRow key={profile.id} data-testid={`row-user-${profile.id}`}>
                        <TableCell className="font-medium">
                          {profile.first_name} {profile.last_name}
                        </TableCell>
                        <TableCell>{profile.class_name || "-"}</TableCell>
                        <TableCell>
                          <Select
                            value={profile.role}
                            onValueChange={(value) => roleUpdateMutation.mutate({ userId: profile.user_id, role: value })}
                          >
                            <SelectTrigger className="w-32" data-testid={`select-role-${profile.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Duyuru Yönetimi ({announcements?.length || 0})</CardTitle>
              <AnnouncementForm />
            </CardHeader>
            <CardContent>
              {loadingAnnouncements ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : announcements && announcements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başlık</TableHead>
                      <TableHead>İçerik</TableHead>
                      <TableHead>Yazar</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((announcement) => {
                      const authorName = announcement.author
                        ? `${announcement.author.first_name || ""} ${announcement.author.last_name || ""}`.trim() || "Anonim"
                        : "Yönetici";
                      
                      return (
                        <TableRow key={announcement.id} data-testid={`row-announcement-${announcement.id}`}>
                          <TableCell className="font-medium max-w-xs">
                            <p className="truncate">{announcement.title}</p>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="truncate text-muted-foreground">{announcement.content}</p>
                          </TableCell>
                          <TableCell className="text-sm">{authorName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {dayjs(announcement.created_at).format('DD MMMM YYYY, HH:mm')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <AnnouncementForm existingAnnouncement={announcement} />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
                                    deleteAnnouncementMutation.mutate(announcement.id);
                                  }
                                }}
                                data-testid={`button-delete-announcement-${announcement.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Henüz duyuru yok</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="polls">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Oylama Yönetimi ({polls?.length || 0})</CardTitle>
              <PollForm />
            </CardHeader>
            <CardContent>
              {loadingPolls ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : polls && polls.length > 0 ? (
                <div className="space-y-4">
                  {polls.map((poll) => {
                    const totalVotes = poll.options?.reduce((sum, opt: any) => sum + (opt.vote_count || 0), 0) || 0;
                    
                    return (
                      <Card key={poll.id} data-testid={`card-poll-${poll.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2">{poll.question}</CardTitle>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{poll.is_open ? '🟢 Açık' : '🔴 Kapalı'}</span>
                                <span>👥 {totalVotes} oy</span>
                                <span>{dayjs(poll.created_at).format('DD MMMM YYYY')}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <PollStatsDialog pollId={poll.id} pollQuestion={poll.question} />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePollMutation.mutate({ 
                                  pollId: poll.id, 
                                  isOpen: !poll.is_open 
                                })}
                                data-testid={`button-toggle-poll-${poll.id}`}
                              >
                                {poll.is_open ? 'Kapat' : 'Aç'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm('Bu oylamayı silmek istediğinize emin misiniz?')) {
                                    deletePollMutation.mutate(poll.id);
                                  }
                                }}
                                data-testid={`button-delete-poll-${poll.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {poll.options?.map((option: any) => {
                              const percentage = totalVotes > 0 
                                ? Math.round((option.vote_count / totalVotes) * 100) 
                                : 0;
                              
                              return (
                                <div key={option.id} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>{option.option_text}</span>
                                    <span className="text-muted-foreground">
                                      {option.vote_count} oy ({percentage}%)
                                    </span>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary transition-all" 
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Henüz oylama yok</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bluten">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Blüten Yönetimi ({allBlutenPosts?.length || 0})</CardTitle>
              <BlutenForm />
            </CardHeader>
            <CardContent>
              {loadingBluten ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : allBlutenPosts && allBlutenPosts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Görsel</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Kaynak</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Görünür</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allBlutenPosts.map((post) => (
                      <TableRow key={post.id} data-testid={`row-bluten-${post.id}`}>
                        <TableCell>
                          <div className="w-12 h-12 rounded overflow-hidden bg-muted">
                            {post.media_url && (
                              <img src={post.media_url} alt="" className="object-cover w-full h-full" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate">{post.caption || "Açıklama yok"}</p>
                        </TableCell>
                        <TableCell className="text-xs">
                          {post.instagram_post_id ? "Instagram (Otomatik)" : "Manuel"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {post.posted_at ? dayjs(post.posted_at).format('DD.MM.YYYY') : dayjs(post.fetched_at).format('DD.MM.YYYY')}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={post.is_visible ? "approved" : "rejected"} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => blutenVisibilityMutation.mutate({ id: post.id, visible: !post.is_visible })}
                            data-testid={`button-toggle-bluten-${post.id}`}
                          >
                            {post.is_visible ? <Eye className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Henüz Blüten içeriği yok</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ideas">
          <Card>
            <CardHeader>
              <CardTitle>Bekleyen Fikirler ({pendingIdeas?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingIdeas ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pendingIdeas && pendingIdeas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Yazar</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingIdeas.map((idea) => {
                      const authorName = idea.author
                        ? `${idea.author.first_name || ""} ${idea.author.last_name || ""}`.trim()
                        : "Anonim";
                      return (
                        <TableRow key={idea.id} data-testid={`row-pending-idea-${idea.id}`}>
                          <TableCell className="font-medium">{idea.title}</TableCell>
                          <TableCell>{authorName}</TableCell>
                          <TableCell>{dayjs(idea.created_at).fromNow()}</TableCell>
                          <TableCell>
                            <StatusBadge status={idea.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" data-testid={`button-view-idea-${idea.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => ideaStatusMutation.mutate({ ideaId: idea.id, status: 'approved' })}
                                data-testid={`button-approve-idea-${idea.id}`}
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => ideaStatusMutation.mutate({ ideaId: idea.id, status: 'rejected' })}
                                data-testid={`button-reject-idea-${idea.id}`}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Bekleyen fikir yok</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Bekleyen Yorumlar ({pendingComments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingComments ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pendingComments && pendingComments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Yorum</TableHead>
                      <TableHead>Yazar</TableHead>
                      <TableHead>Fikir</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingComments.map((comment) => {
                      const authorName = comment.author
                        ? `${comment.author.first_name || ""} ${comment.author.last_name || ""}`.trim()
                        : "Anonim";
                      return (
                        <TableRow key={comment.id} data-testid={`row-pending-comment-${comment.id}`}>
                          <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                          <TableCell>{authorName}</TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">Fikir ID: {comment.idea_id.substring(0, 8)}</span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={comment.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => commentApproveMutation.mutate(comment.id)}
                                data-testid={`button-approve-comment-${comment.id}`}
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => commentRejectMutation.mutate(comment.id)}
                                data-testid={`button-reject-comment-${comment.id}`}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Bekleyen yorum yok</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
