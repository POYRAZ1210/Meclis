import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Vote, 
  Heart, 
  MessageSquare, 
  ThumbsDown, 
  FileEdit, 
  UserCheck,
  Clock,
  History,
  LogIn,
  LogOut,
  Trash2,
  Lightbulb,
  Image,
  Camera,
  Key,
  Mail,
  ClipboardList,
  Star
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/tr";
import type { ActionLog as ActionLogType, ActionType } from "@shared/schema";

dayjs.extend(relativeTime);
dayjs.locale("tr");

const actionConfig: Record<ActionType, { icon: React.ElementType; label: string; color: string }> = {
  'LOGIN': { icon: LogIn, label: 'Giriş yaptı', color: 'bg-indigo-500' },
  'LOGOUT': { icon: LogOut, label: 'Çıkış yaptı', color: 'bg-gray-500' },
  'VOTE_CAST': { icon: Vote, label: 'Oy kullandı', color: 'bg-blue-500' },
  'VOTE_CHANGED': { icon: FileEdit, label: 'Oy değiştirdi', color: 'bg-blue-400' },
  'COMMENT_CREATED': { icon: MessageSquare, label: 'Yorum yaptı', color: 'bg-green-500' },
  'COMMENT_EDITED': { icon: FileEdit, label: 'Yorum düzenledi', color: 'bg-green-400' },
  'COMMENT_DELETED': { icon: Trash2, label: 'Yorum sildi', color: 'bg-red-400' },
  'ANNOUNCEMENT_COMMENT_CREATED': { icon: MessageSquare, label: 'Duyuruya yorum yaptı', color: 'bg-purple-500' },
  'ANNOUNCEMENT_COMMENT_EDITED': { icon: FileEdit, label: 'Duyuru yorumunu düzenledi', color: 'bg-purple-400' },
  'ANNOUNCEMENT_COMMENT_DELETED': { icon: Trash2, label: 'Duyuru yorumunu sildi', color: 'bg-red-400' },
  'LIKE_ADDED': { icon: Heart, label: 'Beğendi', color: 'bg-pink-500' },
  'LIKE_REMOVED': { icon: ThumbsDown, label: 'Beğeni kaldırdı', color: 'bg-gray-400' },
  'IDEA_CREATED': { icon: Lightbulb, label: 'Fikir paylaştı', color: 'bg-yellow-500' },
  'IDEA_DELETED': { icon: Trash2, label: 'Fikir sildi', color: 'bg-red-400' },
  'PROFILE_UPDATED': { icon: UserCheck, label: 'Profil güncelledi', color: 'bg-orange-500' },
  'PROFILE_PHOTO_UPLOADED': { icon: Camera, label: 'Profil fotoğrafı yükledi', color: 'bg-teal-500' },
  'PROFILE_PHOTO_RESET': { icon: Image, label: 'Profil fotoğrafı sıfırladı', color: 'bg-gray-400' },
  'PASSWORD_CHANGED': { icon: Key, label: 'Şifre değiştirdi', color: 'bg-amber-500' },
  'EMAIL_CHANGED': { icon: Mail, label: 'E-posta değiştirdi', color: 'bg-cyan-500' },
  'EVENT_APPLICATION_SUBMITTED': { icon: ClipboardList, label: 'Etkinliğe başvurdu', color: 'bg-emerald-500' },
  'USER_SUSPENDED': { icon: UserCheck, label: 'Kullanıcı askıya alındı', color: 'bg-red-500' },
  'USER_ACTIVATED': { icon: UserCheck, label: 'Kullanıcı aktifleştirildi', color: 'bg-green-600' },
  'TERMS_ACCEPTED': { icon: ClipboardList, label: 'Şartları kabul etti', color: 'bg-blue-600' },
};

function ActivityItem({ activity }: { activity: ActionLogType }) {
  const config = actionConfig[activity.action_type] || { 
    icon: Clock, 
    label: activity.action_type, 
    color: 'bg-gray-500' 
  };
  const Icon = config.icon;

  return (
    <div 
      className="flex items-start gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
      data-testid={`activity-item-${activity.id}`}
    >
      <div className={`p-2 rounded-full ${config.color} text-white shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground">{config.label}</span>
          {activity.target_type && (
            <Badge variant="secondary" className="text-xs">
              {activity.target_type === 'poll' && 'Oylama'}
              {activity.target_type === 'idea' && 'Fikir'}
              {activity.target_type === 'announcement' && 'Duyuru'}
              {!['poll', 'idea', 'announcement'].includes(activity.target_type) && activity.target_type}
            </Badge>
          )}
        </div>
        {activity.details && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {activity.details}
          </p>
        )}
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{dayjs(activity.created_at).fromNow()}</span>
          <span className="mx-1">-</span>
          <span>{dayjs(activity.created_at).format('D MMMM YYYY, HH:mm')}</span>
        </div>
      </div>
    </div>
  );
}

export default function ActivityLog() {
  const { user } = useAuth();

  const { data: activities, isLoading, error } = useQuery<ActionLogType[]>({
    queryKey: ['/api/activity-log'],
    enabled: !!user,
  });

  if (!user) {
    return (
      <main className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Aktivite geçmişini görmek için giriş yapmalısınız.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Aktivite Geçmişi</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Son 50 aktiviteniz
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-muted-foreground">
              Aktiviteler yüklenirken bir hata oluştu.
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="divide-y">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                Henüz bir aktiviteniz bulunmuyor.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Oylama yapın, fikir beğenin veya yorum yazın!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
