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
import { CheckCircle2, XCircle, Eye, Users, Bell, BarChart3, FileText, Loader2 } from "lucide-react";
import { getProfiles, updateProfile } from "@/lib/api/profiles";
import { getIdeas, updateIdeaStatus, updateCommentStatus } from "@/lib/api/ideas";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";

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

  const { data: allComments, isLoading: loadingComments } = useQuery({
    queryKey: ["/api/comments", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas_comments')
        .select(`
          *,
          author:profiles!ideas_comments_author_id_fkey(first_name, last_name),
          idea:ideas!ideas_comments_idea_id_fkey(title)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
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

  const commentStatusMutation = useMutation({
    mutationFn: ({ commentId, status }: { commentId: string; status: 'approved' | 'rejected' }) =>
      updateCommentStatus(commentId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({
        title: "Başarılı",
        description: variables.status === 'approved' ? "Yorum onaylandı" : "Yorum reddedildi",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Yorum durumu güncellenirken bir hata oluştu",
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
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-4 w-4 mr-2" />
            Kullanıcılar
          </TabsTrigger>
          <TabsTrigger value="announcements" data-testid="tab-announcements">
            <Bell className="h-4 w-4 mr-2" />
            Duyurular
          </TabsTrigger>
          <TabsTrigger value="polls" data-testid="tab-polls">
            <BarChart3 className="h-4 w-4 mr-2" />
            Oylamalar
          </TabsTrigger>
          <TabsTrigger value="moderation" data-testid="tab-moderation">
            <FileText className="h-4 w-4 mr-2" />
            Moderasyon
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Yönetimi</CardTitle>
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
              <CardTitle>Duyuru Yönetimi</CardTitle>
              <Button data-testid="button-add-announcement">Yeni Duyuru Ekle</Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Duyuru ekleme ve düzenleme işlemleri buradan yapılır.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="polls">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Oylama Yönetimi</CardTitle>
              <Button data-testid="button-add-poll">Yeni Oylama Ekle</Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Oylama oluşturma ve yönetme işlemleri buradan yapılır.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Bekleyen Yorumlar ({allComments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingComments ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : allComments && allComments.length > 0 ? (
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
                    {allComments.map((comment: any) => {
                      const authorName = comment.author
                        ? `${comment.author.first_name || ""} ${comment.author.last_name || ""}`.trim()
                        : "Anonim";
                      return (
                        <TableRow key={comment.id} data-testid={`row-pending-comment-${comment.id}`}>
                          <TableCell className="max-w-xs truncate">{comment.body}</TableCell>
                          <TableCell>{authorName}</TableCell>
                          <TableCell>{comment.idea?.title || "-"}</TableCell>
                          <TableCell>
                            <StatusBadge status={comment.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => commentStatusMutation.mutate({ commentId: comment.id, status: 'approved' })}
                                data-testid={`button-approve-comment-${comment.id}`}
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => commentStatusMutation.mutate({ commentId: comment.id, status: 'rejected' })}
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
