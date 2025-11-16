import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PollCard from "@/components/PollCard";
import EmptyState from "@/components/EmptyState";
import { BarChart3, Plus, Loader2, X } from "lucide-react";
import { getPolls, getPollVotes, getUserVote, votePoll, createPoll, closePoll, type Poll } from "@/lib/api/polls";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const pollFormSchema = z.object({
  question: z.string().min(1, "Soru gereklidir").max(500, "Soru çok uzun"),
  options: z.array(z.object({
    text: z.string().min(1, "Seçenek boş olamaz").max(200, "Seçenek çok uzun")
  })).min(2, "En az 2 seçenek gereklidir").max(5, "En fazla 5 seçenek eklenebilir"),
});

type PollFormValues = z.infer<typeof pollFormSchema>;

export default function Polls() {
  const [isNewPollOpen, setIsNewPollOpen] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const { data: polls, isLoading } = useQuery({
    queryKey: ["/api/polls"],
    queryFn: getPolls,
  });

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      question: "",
      options: [{ text: "" }, { text: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const voteMutation = useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) =>
      votePoll(pollId, optionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/polls", variables.pollId, "votes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/polls", variables.pollId, "user-vote"] });
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

  const createMutation = useMutation({
    mutationFn: (data: PollFormValues) => createPoll(data.question, data.options.map(opt => opt.text)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      setIsNewPollOpen(false);
      form.reset();
      toast({
        title: "Başarılı",
        description: "Oylama başarıyla oluşturuldu",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Oylama oluşturulurken bir hata oluştu",
      });
    },
  });

  const closeMutation = useMutation({
    mutationFn: (pollId: string) => closePoll(pollId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Başarılı",
        description: "Oylama kapatıldı",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Oylama kapatılırken bir hata oluştu",
      });
    },
  });

  const onSubmit = (data: PollFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Oylamalar</h1>
            <p className="text-muted-foreground">Aktif ve tamamlanmış oylamaları görüntüleyin</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsNewPollOpen(true)} data-testid="button-new-poll">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Oylama
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : polls && polls.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <PollDisplay
              key={poll.id}
              poll={poll}
              onVote={(optionId) => voteMutation.mutate({ pollId: poll.id, optionId })}
              onClose={() => closeMutation.mutate(poll.id)}
              isAdmin={isAdmin}
              isClosing={closeMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="Henüz oylama yok"
          description="İlk oylamayı oluşturun ve öğrencilerin görüşlerini alın."
        />
      )}

      <Dialog open={isNewPollOpen} onOpenChange={setIsNewPollOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Oylama</DialogTitle>
            <DialogDescription>
              Öğrencilerin oy verebileceği yeni bir oylama oluşturun
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soru</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Oylama sorusunu girin"
                        {...field}
                        data-testid="input-poll-question"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-3">
                <FormLabel>Seçenekler (En az 2, en fazla 5)</FormLabel>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`options.${index}.text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder={`Seçenek ${index + 1}`}
                              {...field}
                              data-testid={`input-poll-option-${index}`}
                            />
                            {fields.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => remove(index)}
                                data-testid={`button-remove-option-${index}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                {fields.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ text: "" })}
                    className="w-full"
                    data-testid="button-add-option"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Seçenek Ekle
                  </Button>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewPollOpen(false)}
                  disabled={createMutation.isPending}
                  data-testid="button-cancel-poll"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-submit-poll"
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

function PollDisplay({ 
  poll, 
  onVote, 
  onClose,
  isAdmin,
  isClosing
}: { 
  poll: Poll; 
  onVote: (optionId: string) => void;
  onClose: () => void;
  isAdmin: boolean;
  isClosing: boolean;
}) {
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

  const optionsWithVotes = poll.options?.map((opt) => ({
    id: opt.id,
    text: opt.option_text,
    votes: voteCounts[opt.id] || 0,
  })) || [];

  const totalVotes = votes?.length || 0;

  return (
    <div className="space-y-3">
      <PollCard
        question={poll.question}
        options={optionsWithVotes}
        totalVotes={totalVotes}
        hasVoted={!!userVote}
        userVote={userVote?.option_id}
        isOpen={poll.is_open}
        onVote={onVote}
      />
      {isAdmin && poll.is_open && (
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isClosing}
          className="w-full"
          data-testid={`button-close-poll-${poll.id}`}
        >
          {isClosing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Oylamayı Kapat
        </Button>
      )}
    </div>
  );
}
