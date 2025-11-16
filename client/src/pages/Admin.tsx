import { useState } from "react";
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
import { CheckCircle2, XCircle, Eye, Users, Bell, BarChart3, FileText } from "lucide-react";

//todo: remove mock functionality
const mockUsers = [
  { id: "1", name: "Ahmet Yılmaz", email: "ahmet@okul.edu.tr", role: "student", className: "9-A" },
  { id: "2", name: "Ayşe Demir", email: "ayse@okul.edu.tr", role: "student", className: "9-B" },
  { id: "3", name: "Mehmet Hoca", email: "mehmet@okul.edu.tr", role: "teacher", className: "-" },
];

const mockPendingIdeas = [
  { id: "1", title: "Haftalık Film Gösterimleri", author: "Ayşe Çelik", date: "5 Mayıs 2025", status: "pending" as const },
  { id: "2", title: "Öğrenci Kulübü Genişletilmesi", author: "Can Arslan", date: "4 Mayıs 2025", status: "pending" as const },
];

const mockPendingComments = [
  { id: "1", content: "Çok güzel bir fikir, destekliyorum!", author: "Zeynep K.", ideaTitle: "Okul Bahçesine...", status: "pending" as const },
];

export default function Admin() {
  const [users, setUsers] = useState(mockUsers);
  const [pendingIdeas, setPendingIdeas] = useState(mockPendingIdeas);
  const [pendingComments, setPendingComments] = useState(mockPendingComments);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    console.log("Rol değiştirildi:", userId, newRole);
  };

  const handleApproveIdea = (ideaId: string) => {
    setPendingIdeas(prev => prev.filter(i => i.id !== ideaId));
    console.log("Fikir onaylandı:", ideaId);
  };

  const handleRejectIdea = (ideaId: string) => {
    setPendingIdeas(prev => prev.filter(i => i.id !== ideaId));
    console.log("Fikir reddedildi:", ideaId);
  };

  const handleApproveComment = (commentId: string) => {
    setPendingComments(prev => prev.filter(c => c.id !== commentId));
    console.log("Yorum onaylandı:", commentId);
  };

  const handleRejectComment = (commentId: string) => {
    setPendingComments(prev => prev.filter(c => c.id !== commentId));
    console.log("Yorum reddedildi:", commentId);
  };

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>İsim</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Sınıf</TableHead>
                    <TableHead>Rol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.className}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-32" data-testid={`select-role-${user.id}`}>
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
              <CardTitle>Bekleyen Fikirler ({pendingIdeas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingIdeas.length > 0 ? (
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
                    {pendingIdeas.map((idea) => (
                      <TableRow key={idea.id} data-testid={`row-pending-idea-${idea.id}`}>
                        <TableCell className="font-medium">{idea.title}</TableCell>
                        <TableCell>{idea.author}</TableCell>
                        <TableCell>{idea.date}</TableCell>
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
                              onClick={() => handleApproveIdea(idea.id)}
                              data-testid={`button-approve-idea-${idea.id}`}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRejectIdea(idea.id)}
                              data-testid={`button-reject-idea-${idea.id}`}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Bekleyen fikir yok</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bekleyen Yorumlar ({pendingComments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingComments.length > 0 ? (
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
                    {pendingComments.map((comment) => (
                      <TableRow key={comment.id} data-testid={`row-pending-comment-${comment.id}`}>
                        <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                        <TableCell>{comment.author}</TableCell>
                        <TableCell>{comment.ideaTitle}</TableCell>
                        <TableCell>
                          <StatusBadge status={comment.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveComment(comment.id)}
                              data-testid={`button-approve-comment-${comment.id}`}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRejectComment(comment.id)}
                              data-testid={`button-reject-comment-${comment.id}`}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
