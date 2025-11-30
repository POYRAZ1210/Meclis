import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { CheckCircle2, XCircle, Eye, Users, Bell, BarChart3, FileText, Loader2, Image, MessageSquare, Trash2, Download, Camera, Check, X, Ban, UserCheck, ImageOff, Heart, GraduationCap, Plus } from "lucide-react";
import { getAdminProfiles, updateProfile, getClasses, createClass, deleteClass, type SchoolClass } from "@/lib/api/profiles";
import { getAdminIdeas, getAdminComments, updateIdeaStatus, updateCommentStatus, deleteIdea } from "@/lib/api/ideas";
import { getAdminBlutenPosts, toggleBlutenVisibility } from "@/lib/api/bluten";
import { getAdminAnnouncements, deleteAnnouncement, getAdminAnnouncementComments, updateAnnouncementCommentStatus } from "@/lib/api/announcements";
import { getAdminPolls, deletePoll, togglePollStatus, publishPollResults } from "@/lib/api/polls";
import { getPendingProfilePictures, approveProfilePicture, rejectProfilePicture, suspendUser, activateUser, resetUserProfilePicture, deleteComment, clearIdeaLikes } from "@/lib/api/admin";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AnnouncementForm from "@/components/admin/AnnouncementForm";
import PollForm from "@/components/admin/PollForm";
import BlutenForm from "@/components/admin/BlutenForm";
import UserForm from "@/components/admin/UserForm";
import PollStatsDialog from "@/components/admin/PollStatsDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("tr");

export default function Admin() {
  const { toast } = useToast();
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [newClassName, setNewClassName] = useState("");

  // Classes
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ["/api/classes"],
    queryFn: getClasses,
  });

  const createClassMutation = useMutation({
    mutationFn: (name: string) => createClass(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      setNewClassName("");
      toast({ description: "Sınıf oluşturuldu" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", description: error.message || "Sınıf oluşturulurken hata oluştu" });
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: (id: string) => deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({ description: "Sınıf silindi" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", description: error.message || "Sınıf silinirken hata oluştu" });
    },
  });

  const { data: profiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["/api/admin/profiles"],
    queryFn: () => getAdminProfiles(),
  });

  const { data: pendingPictures, isLoading: loadingPictures } = useQuery({
    queryKey: ["/api/admin/profile-pictures"],
    queryFn: getPendingProfilePictures,
  });

  const approvePictureMutation = useMutation({
    mutationFn: (profileId: string) => approveProfilePicture(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profile-pictures"] });
      toast({ description: "Profil fotoğrafı onaylandı" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", description: error.message || "Onay yapılırken hata oluştu" });
    },
  });

  const rejectPictureMutation = useMutation({
    mutationFn: (profileId: string) => rejectProfilePicture(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profile-pictures"] });
      toast({ description: "Profil fotoğrafı reddedildi" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", description: error.message || "Red işlemi yapılırken hata oluştu" });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: (profileId: string) => suspendUser(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profiles"] });
      toast({ description: "Kullanıcı askıya alındı" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", description: error.message || "Kullanıcı askıya alınırken hata oluştu" });
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: (profileId: string) => activateUser(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profiles"] });
      toast({ description: "Kullanıcı aktifleştirildi" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", description: error.message || "Kullanıcı aktifleştirilirken hata oluştu" });
    },
  });

  const resetPictureMutation = useMutation({
    mutationFn: (profileId: string) => resetUserProfilePicture(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profiles"] });
      toast({ description: "Profil fotoğrafı sıfırlandı" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", description: error.message || "Profil fotoğrafı sıfırlanırken hata oluştu" });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      toast({ description: "Yorum silindi" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", description: error.message || "Yorum silinirken hata oluştu" });
    },
  });

  const clearLikesMutation = useMutation({
    mutationFn: (ideaId: string) => clearIdeaLikes(ideaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ideas"] });
      toast({ description: "Beğeniler temizlendi" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", description: error.message || "Beğeniler temizlenirken hata oluştu" });
    },
  });

  const { data: adminIdeas, isLoading: loadingIdeas } = useQuery({
    queryKey: ["/api/admin/ideas"],
    queryFn: getAdminIdeas,
  });

  const { data: allBlutenPosts, isLoading: loadingBluten } = useQuery({
    queryKey: ["/api/admin/bluten"],
    queryFn: getAdminBlutenPosts,
  });

  const { data: adminComments, isLoading: loadingComments } = useQuery({
    queryKey: ["/api/admin/comments"],
    queryFn: getAdminComments,
  });

  const { data: announcementComments, isLoading: loadingAnnouncementComments } = useQuery({
    queryKey: ["/api/admin/announcement-comments"],
    queryFn: getAdminAnnouncementComments,
  });

  const { data: announcements, isLoading: loadingAnnouncements } = useQuery({
    queryKey: ["/api/admin/announcements"],
    queryFn: getAdminAnnouncements,
  });

  const { data: polls, isLoading: loadingPolls } = useQuery({
    queryKey: ["/api/admin/polls"],
    queryFn: getAdminPolls,
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (announcementId: string) => deleteAnnouncement(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/polls"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/polls"] });
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

  const publishResultsMutation = useMutation({
    mutationFn: (pollId: string) => publishPollResults(pollId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/polls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Başarılı",
        description: "Oylama sonuçları yayınlandı ve oylama kapatıldı",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Sonuçlar yayınlanırken bir hata oluştu",
      });
    },
  });

  const roleUpdateMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateProfile(userId, { role: role as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profiles"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ideas"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
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

  const deleteIdeaMutation = useMutation({
    mutationFn: (ideaId: string) => deleteIdea(ideaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      setSelectedIdea(null);
      toast({
        title: "Başarılı",
        description: "Fikir silindi",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Fikir silinirken bir hata oluştu",
      });
    },
  });

  const announcementCommentStatusMutation = useMutation({
    mutationFn: ({ commentId, status }: { commentId: string; status: 'approved' | 'rejected' }) =>
      updateAnnouncementCommentStatus(commentId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcement-comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
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

  const blutenVisibilityMutation = useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      toggleBlutenVisibility(id, visible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bluten"] });
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
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-8 lg:w-auto lg:inline-grid gap-1">
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
            Fikir Yorumları
          </TabsTrigger>
          <TabsTrigger value="announcement-comments" data-testid="tab-announcement-comments">
            <MessageSquare className="h-4 w-4 mr-2" />
            Duyuru Yorumları
          </TabsTrigger>
          <TabsTrigger value="profile-pictures" data-testid="tab-profile-pictures" className="relative">
            <Camera className="h-4 w-4 mr-2" />
            Profil Fotoğrafları
            {pendingPictures && pendingPictures.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingPictures.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="classes" data-testid="tab-classes">
            <GraduationCap className="h-4 w-4 mr-2" />
            Sınıflar
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
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles?.map((profile) => (
                      <TableRow key={profile.id} data-testid={`row-user-${profile.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {profile.profile_picture_url && profile.profile_picture_status === 'approved' && (
                                <AvatarImage src={profile.profile_picture_url} alt={profile.first_name || ''} />
                              )}
                              <AvatarFallback>{profile.first_name?.[0]}{profile.last_name?.[0]}</AvatarFallback>
                            </Avatar>
                            {profile.first_name} {profile.last_name}
                          </div>
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {profile.profile_picture_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm('Bu kullanıcının profil fotoğrafını sıfırlamak istediğinize emin misiniz?')) {
                                    resetPictureMutation.mutate(profile.id);
                                  }
                                }}
                                title="Profil fotoğrafını sıfırla"
                                data-testid={`button-reset-picture-${profile.id}`}
                              >
                                <ImageOff className="h-4 w-4 text-orange-500" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('Bu kullanıcıyı askıya almak istediğinize emin misiniz?')) {
                                  suspendUserMutation.mutate(profile.id);
                                }
                              }}
                              title="Kullanıcıyı askıya al"
                              data-testid={`button-suspend-${profile.id}`}
                            >
                              <Ban className="h-4 w-4 text-destructive" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                activateUserMutation.mutate(profile.id);
                              }}
                              title="Kullanıcıyı aktifleştir"
                              data-testid={`button-activate-${profile.id}`}
                            >
                              <UserCheck className="h-4 w-4 text-green-500" />
                            </Button>
                          </div>
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
                  {polls.map((poll: any) => {
                    const totalVotes = poll.options?.reduce((sum: number, opt: any) => sum + (opt.vote_count || 0), 0) || 0;
                    
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
                              {!poll.results_published && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Sonuçları yayınlamak istediğinize emin misiniz? Bu işlemden sonra kimse oy veremeyecek ve sonuçlar herkese görünür olacak.')) {
                                      publishResultsMutation.mutate(poll.id);
                                    }
                                  }}
                                  data-testid={`button-publish-results-${poll.id}`}
                                >
                                  Sonuçları Yayınla
                                </Button>
                              )}
                              {poll.results_published && (
                                <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                                  Sonuçlar Yayınlandı
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePollMutation.mutate({ 
                                  pollId: poll.id, 
                                  isOpen: !poll.is_open 
                                })}
                                data-testid={`button-toggle-poll-${poll.id}`}
                                disabled={poll.results_published}
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
              <CardTitle>Bülten Yönetimi ({allBlutenPosts?.length || 0})</CardTitle>
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
                <p className="text-sm text-muted-foreground text-center py-8">Henüz Bülten içeriği yok</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ideas">
          <Card>
            <CardHeader>
              <CardTitle>Fikirler Moderasyonu ({adminIdeas?.filter((i: any) => i.status === 'pending').length || 0} bekliyor)</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingIdeas ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : adminIdeas && adminIdeas.length > 0 ? (
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
                    {adminIdeas.map((idea: any) => {
                      const authorName = idea.author
                        ? `${idea.author.first_name || ""} ${idea.author.last_name || ""}`.trim()
                        : "Anonim";
                      // Fix timezone issue - convert UTC to local time
                      const createdDate = dayjs.utc(idea.created_at).local();
                      return (
                        <TableRow key={idea.id} data-testid={`row-idea-${idea.id}`}>
                          <TableCell className="font-medium">{idea.title}</TableCell>
                          <TableCell>{authorName}</TableCell>
                          <TableCell>{createdDate.fromNow()}</TableCell>
                          <TableCell>
                            <StatusBadge status={idea.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedIdea(idea)}
                                data-testid={`button-view-idea-${idea.id}`}
                                title="Detayları Görüntüle"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {idea.status === 'pending' && (
                                <>
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
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm('Bu fikri silmek istediğinize emin misiniz? Tüm yorumları da silinecek.')) {
                                    deleteIdeaMutation.mutate(idea.id);
                                  }
                                }}
                                data-testid={`button-delete-idea-${idea.id}`}
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
                <p className="text-sm text-muted-foreground text-center py-8">Henüz fikir yok</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Yorumlar Moderasyonu ({adminComments?.length || 0} bekliyor)</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingComments ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : adminComments && adminComments.length > 0 ? (
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
                    {adminComments.map((comment: any) => {
                      const authorName = comment.author
                        ? `${comment.author.first_name || ""} ${comment.author.last_name || ""}`.trim()
                        : "Anonim";
                      const ideaTitle = comment.idea?.title || "Bilinmiyor";
                      return (
                        <TableRow key={comment.id} data-testid={`row-comment-${comment.id}`}>
                          <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                          <TableCell>{authorName}</TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground" title={ideaTitle}>
                              {ideaTitle.substring(0, 30)}{ideaTitle.length > 30 ? '...' : ''}
                            </span>
                          </TableCell>
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

        <TabsContent value="announcement-comments">
          <Card>
            <CardHeader>
              <CardTitle>Duyuru Yorumları Moderasyonu ({announcementComments?.filter((c: any) => c.status === 'pending').length || 0} bekliyor)</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAnnouncementComments ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : announcementComments && announcementComments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Yorum</TableHead>
                      <TableHead>Yazar</TableHead>
                      <TableHead>Duyuru</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcementComments.map((comment: any) => {
                      const authorName = comment.author
                        ? `${comment.author.first_name || ""} ${comment.author.last_name || ""}`.trim()
                        : "Anonim";
                      const announcementTitle = comment.announcement?.title || "Bilinmiyor";
                      return (
                        <TableRow key={comment.id} data-testid={`row-announcement-comment-${comment.id}`}>
                          <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                          <TableCell>{authorName}</TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground" title={announcementTitle}>
                              {announcementTitle.substring(0, 30)}{announcementTitle.length > 30 ? '...' : ''}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={comment.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => announcementCommentStatusMutation.mutate({ commentId: comment.id, status: 'approved' })}
                                data-testid={`button-approve-announcement-comment-${comment.id}`}
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => announcementCommentStatusMutation.mutate({ commentId: comment.id, status: 'rejected' })}
                                data-testid={`button-reject-announcement-comment-${comment.id}`}
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
                <p className="text-sm text-muted-foreground text-center py-8">Bekleyen duyuru yorumu yok</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Pictures Tab */}
        <TabsContent value="profile-pictures">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Profil Fotoğrafları Onayı
                {pendingPictures && pendingPictures.length > 0 && (
                  <Badge variant="destructive">{pendingPictures.length} bekliyor</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPictures ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pendingPictures && pendingPictures.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingPictures.map((profile: any) => (
                    <Card key={profile.id} className="overflow-hidden" data-testid={`card-profile-picture-${profile.id}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center gap-4">
                          <Avatar className="h-32 w-32">
                            <AvatarImage src={profile.profile_picture_url || undefined} alt={profile.first_name || undefined} />
                            <AvatarFallback className="text-2xl">
                              {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-center">
                            <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                            <p className="text-sm text-muted-foreground">{profile.class_name || 'Sınıf belirtilmemiş'}</p>
                          </div>
                          <div className="flex gap-2 w-full">
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => approvePictureMutation.mutate(profile.id)}
                              disabled={approvePictureMutation.isPending || rejectPictureMutation.isPending}
                              data-testid={`button-approve-picture-${profile.id}`}
                            >
                              {approvePictureMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Onayla
                                </>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex-1"
                              onClick={() => rejectPictureMutation.mutate(profile.id)}
                              disabled={approvePictureMutation.isPending || rejectPictureMutation.isPending}
                              data-testid={`button-reject-picture-${profile.id}`}
                            >
                              {rejectPictureMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <X className="h-4 w-4 mr-1" />
                                  Reddet
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Onay bekleyen profil fotoğrafı yok</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Sınıf Yönetimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Yeni sınıf adı (örn: 9-A)"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="max-w-xs"
                    data-testid="input-new-class"
                  />
                  <Button
                    onClick={() => {
                      if (newClassName.trim()) {
                        createClassMutation.mutate(newClassName.trim());
                      }
                    }}
                    disabled={!newClassName.trim() || createClassMutation.isPending}
                    data-testid="button-create-class"
                  >
                    {createClassMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Sınıf Ekle
                      </>
                    )}
                  </Button>
                </div>

                {loadingClasses ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : classes && classes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sınıf Adı</TableHead>
                        <TableHead>Oluşturulma Tarihi</TableHead>
                        <TableHead className="w-[100px]">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes.map((cls) => (
                        <TableRow key={cls.id} data-testid={`row-class-${cls.id}`}>
                          <TableCell className="font-medium">{cls.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {dayjs(cls.created_at).format("DD MMM YYYY")}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm(`"${cls.name}" sınıfını silmek istediğinize emin misiniz?`)) {
                                  deleteClassMutation.mutate(cls.id);
                                }
                              }}
                              disabled={deleteClassMutation.isPending}
                              data-testid={`button-delete-class-${cls.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Henüz sınıf eklenmemiş. Kayıt formunda görünmesi için sınıf ekleyin.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Idea Detail Dialog */}
      <Dialog open={!!selectedIdea} onOpenChange={(open) => !open && setSelectedIdea(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedIdea?.title}</DialogTitle>
          </DialogHeader>
          {selectedIdea && (
            <div className="space-y-4">
              {/* Author and Date */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {selectedIdea.author
                    ? `${selectedIdea.author.first_name || ""} ${selectedIdea.author.last_name || ""}`.trim()
                    : "Anonim"}
                  {selectedIdea.author?.class_name && ` • ${selectedIdea.author.class_name}`}
                </span>
                <span>{dayjs.utc(selectedIdea.created_at).local().format('DD.MM.YYYY HH:mm')}</span>
              </div>

              {/* Content */}
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{selectedIdea.content}</p>
              </div>

              {/* Image */}
              {selectedIdea.image_url && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Görsel:</p>
                  <img
                    src={selectedIdea.image_url}
                    alt="Fikir görseli"
                    className="w-full rounded-lg border"
                  />
                </div>
              )}

              {/* Video */}
              {selectedIdea.video_url && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Video:</p>
                  <video
                    src={selectedIdea.video_url}
                    controls
                    className="w-full rounded-lg border"
                  />
                </div>
              )}

              {/* PDF/Document Attachment */}
              {selectedIdea.attachment_url && (selectedIdea.attachment_type === 'pdf' || selectedIdea.attachment_type === 'document') && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Ek Dosya:</p>
                  <a 
                    href={selectedIdea.attachment_url} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                    data-testid="link-download-attachment-admin-idea"
                  >
                    <FileText className="h-4 w-4" />
                    {selectedIdea.attachment_type === 'pdf' ? 'PDF Dosyası' : 'Doküman'} İndir
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              )}

              {/* Status and Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Durum:</span>
                  <StatusBadge status={selectedIdea.status} />
                </div>
                {selectedIdea.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        ideaStatusMutation.mutate({ ideaId: selectedIdea.id, status: 'approved' });
                        setSelectedIdea(null);
                      }}
                      data-testid="button-approve-in-dialog"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Onayla
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        ideaStatusMutation.mutate({ ideaId: selectedIdea.id, status: 'rejected' });
                        setSelectedIdea(null);
                      }}
                      data-testid="button-reject-in-dialog"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reddet
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
