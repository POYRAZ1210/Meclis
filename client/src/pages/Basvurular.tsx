import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getEvents, getEventDetails, applyToEvent, type EventWithStatus } from "@/lib/api/events";
import type { FormField } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField as FormFieldComponent,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import { Calendar, Check, ClipboardList, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Basvurular() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<EventWithStatus | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: getEvents,
    enabled: !!user,
  });

  const openApplicationDialog = async (event: EventWithStatus) => {
    setSelectedEvent(event);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUserEmail(authUser?.email || "");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 lg:px-6 py-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  const activeEvents = events || [];

  return (
    <main className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-basvurular">
          Başvurular
        </h1>
        <p className="text-muted-foreground">
          Aktif etkinlikleri görüntüleyin ve başvurun
        </p>
      </div>

      {activeEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Aktif etkinlik bulunamadı"
          description="Şu anda başvuruya açık etkinlik bulunmuyor. Daha sonra tekrar kontrol edin."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onApply={() => openApplicationDialog(event)}
            />
          ))}
        </div>
      )}

      {selectedEvent && (
        <ApplicationDialog
          event={selectedEvent}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onClose={closeDialog}
          profile={profile}
          userEmail={userEmail}
        />
      )}
    </main>
  );
}

interface EventCardProps {
  event: EventWithStatus;
  onApply: () => void;
}

function EventCard({ event, onApply }: EventCardProps) {
  const formFields = (event.form_fields || []) as FormField[];
  
  return (
    <Card className="flex flex-col" data-testid={`card-event-${event.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg" data-testid={`text-event-name-${event.id}`}>
            {event.name}
          </CardTitle>
          {event.has_applied && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700 shrink-0" data-testid={`badge-applied-${event.id}`}>
              <Check className="h-3 w-3 mr-1" />
              Başvurdunuz
            </Badge>
          )}
        </div>
        {event.description && (
          <CardDescription className="line-clamp-3" data-testid={`text-event-description-${event.id}`}>
            {event.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span data-testid={`text-field-count-${event.id}`}>
            {formFields.length} form alanı
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onApply}
          disabled={event.has_applied}
          className="w-full"
          data-testid={`button-apply-${event.id}`}
        >
          {event.has_applied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Başvuru Yapıldı
            </>
          ) : (
            <>
              <ClipboardList className="h-4 w-4 mr-2" />
              Başvur
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ApplicationDialogProps {
  event: EventWithStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  profile: {
    first_name: string | null;
    last_name: string | null;
    class_name: string | null;
  } | null;
  userEmail: string;
}

function ApplicationDialog({ event, open, onOpenChange, onClose, profile, userEmail }: ApplicationDialogProps) {
  const { toast } = useToast();
  const formFields = (event.form_fields || []) as FormField[];

  const dynamicSchema = z.object(
    formFields.reduce((acc, field) => {
      if (field.required) {
        acc[field.id] = z.string().min(1, `${field.label} alanı zorunludur`);
      } else {
        acc[field.id] = z.string().optional();
      }
      return acc;
    }, {} as Record<string, z.ZodTypeAny>)
  );

  const form = useForm<Record<string, string>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: formFields.reduce((acc, field) => {
      acc[field.id] = "";
      return acc;
    }, {} as Record<string, string>),
  });

  const applyMutation = useMutation({
    mutationFn: (responses: Record<string, string>) => applyToEvent(event.id, responses),
    onSuccess: () => {
      toast({ description: "Başvurunuz başarıyla gönderildi!" });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        description: error.message || "Başvuru gönderilirken hata oluştu",
      });
    },
  });

  const onSubmit = (data: Record<string, string>) => {
    applyMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title-event">
            {event.name}
          </DialogTitle>
          {event.description && (
            <DialogDescription data-testid="dialog-description-event">
              {event.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-xs text-muted-foreground">Ad</Label>
              <Input
                value={profile?.first_name || ""}
                readOnly
                className="bg-background"
                data-testid="input-user-firstname"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Soyad</Label>
              <Input
                value={profile?.last_name || ""}
                readOnly
                className="bg-background"
                data-testid="input-user-lastname"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">E-posta</Label>
              <Input
                value={userEmail}
                readOnly
                className="bg-background"
                data-testid="input-user-email"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Sınıf</Label>
              <Input
                value={profile?.class_name || ""}
                readOnly
                className="bg-background"
                data-testid="input-user-class"
              />
            </div>
          </div>

          {formFields.length > 0 && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {formFields.map((field) => (
                  <FormFieldComponent
                    key={field.id}
                    control={form.control}
                    name={field.id}
                    render={({ field: formFieldProps }) => (
                      <FormItem>
                        <FormLabel data-testid={`label-field-${field.id}`}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                          {field.type === "textarea" ? (
                            <Textarea
                              {...formFieldProps}
                              placeholder={`${field.label} giriniz...`}
                              data-testid={`input-field-${field.id}`}
                            />
                          ) : field.type === "select" ? (
                            <Select
                              value={formFieldProps.value}
                              onValueChange={formFieldProps.onChange}
                            >
                              <SelectTrigger data-testid={`select-field-${field.id}`}>
                                <SelectValue placeholder="Seçiniz..." />
                              </SelectTrigger>
                              <SelectContent>
                                {(field.options || []).map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              {...formFieldProps}
                              placeholder={`${field.label} giriniz...`}
                              data-testid={`input-field-${field.id}`}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    data-testid="button-cancel-apply"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={applyMutation.isPending}
                    data-testid="button-submit-apply"
                  >
                    {applyMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      "Başvuruyu Gönder"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {formFields.length === 0 && (
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel-apply"
              >
                İptal
              </Button>
              <Button
                onClick={() => applyMutation.mutate({})}
                disabled={applyMutation.isPending}
                data-testid="button-submit-apply"
              >
                {applyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  "Başvuruyu Gönder"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
