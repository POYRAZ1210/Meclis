import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertAnnouncementSchema, type InsertAnnouncement } from "@shared/schema";
import { supabase } from "@/lib/supabase";
import { Pencil } from "lucide-react";
import { updateAnnouncement } from "@/lib/api/announcements";

interface AnnouncementFormProps {
  existingAnnouncement?: {
    id: string;
    title: string;
    content: string;
  };
}

export default function AnnouncementForm({ existingAnnouncement }: AnnouncementFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!existingAnnouncement;

  const form = useForm<InsertAnnouncement>({
    resolver: zodResolver(insertAnnouncementSchema),
    defaultValues: {
      title: existingAnnouncement?.title || "",
      content: existingAnnouncement?.content || "",
    },
  });

  useEffect(() => {
    if (existingAnnouncement) {
      form.reset({
        title: existingAnnouncement.title,
        content: existingAnnouncement.content,
      });
    }
  }, [existingAnnouncement, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertAnnouncement) => {
      if (isEditMode && existingAnnouncement) {
        return updateAnnouncement(existingAnnouncement.id, data.title, data.content);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const res = await fetch('/api/admin/announcements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          credentials: 'include',
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to create announcement');
        }

        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: "Başarılı",
        description: isEditMode ? "Duyuru güncellendi" : "Duyuru oluşturuldu",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || (isEditMode ? "Duyuru güncellenemedi" : "Duyuru oluşturulamadı"),
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <Button variant="ghost" size="icon" data-testid={`button-edit-announcement-${existingAnnouncement.id}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button data-testid="button-add-announcement">Yeni Duyuru Ekle</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Duyuru Düzenle" : "Yeni Duyuru Oluştur"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Başlık</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-announcement-title" placeholder="Duyuru başlığı" />
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
                    <Textarea {...field} data-testid="input-announcement-content" placeholder="Duyuru içeriği" rows={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
                İptal
              </Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-submit">
                {mutation.isPending 
                  ? (isEditMode ? "Güncelleniyor..." : "Oluşturuluyor...") 
                  : (isEditMode ? "Güncelle" : "Oluştur")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
