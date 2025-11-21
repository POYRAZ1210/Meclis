import { useState } from "react";
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
import { insertBlutenPostSchema, type InsertBlutenPost } from "@shared/schema";
import { supabase } from "@/lib/supabase";

export default function BlutenForm() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertBlutenPost>({
    resolver: zodResolver(insertBlutenPostSchema),
    defaultValues: {
      instagram_url: "",
      media_url: "",
      caption: "",
      is_visible: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertBlutenPost) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch('/api/admin/bluten', {
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
        throw new Error(error.error || 'Failed to add bluten post');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bluten"] });
      toast({
        title: "Başarılı",
        description: "Bülten içeriği eklendi",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "İçerik eklenemedi",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-bluten">Manuel İçerik Ekle</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manuel Bülten İçeriği Ekle</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="instagram_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram URL</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      data-testid="input-bluten-url" 
                      placeholder="https://www.instagram.com/p/..." 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="media_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Görsel URL (Opsiyonel)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      data-testid="input-bluten-media" 
                      placeholder="https://..." 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama (Opsiyonel)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      data-testid="input-bluten-caption" 
                      placeholder="Post açıklaması" 
                      rows={4}
                    />
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
                {mutation.isPending ? "Ekleniyor..." : "Ekle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
