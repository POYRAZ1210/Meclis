import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Bell, Plus, Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAnnouncements, createAnnouncement, type Announcement } from "@/lib/api/announcements";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("tr");

const announcementFormSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir").max(200, "Başlık çok uzun"),
  content: z.string().min(1, "İçerik gereklidir").max(5000, "İçerik çok uzun"),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

export default function Announcements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isNewAnnouncementOpen, setIsNewAnnouncementOpen] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["/api/announcements"],
    queryFn: getAnnouncements,
  });

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: AnnouncementFormValues) => createAnnouncement(data.title, data.content),
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
                createdAt={dayjs(announcement.created_at).fromNow()}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              {selectedAnnouncement?.author
                ? `${selectedAnnouncement.author.first_name || ""} ${selectedAnnouncement.author.last_name || ""}`.trim()
                : "Yönetici"} • {selectedAnnouncement && dayjs(selectedAnnouncement.created_at).fromNow()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm leading-relaxed">{selectedAnnouncement?.content}</p>
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
    </div>
  );
}
