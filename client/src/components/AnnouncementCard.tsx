import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, User } from "lucide-react";

interface AnnouncementCardProps {
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  onReadMore?: () => void;
}

export default function AnnouncementCard({
  title,
  content,
  authorName,
  createdAt,
  onReadMore,
}: AnnouncementCardProps) {
  const truncatedContent = content.length > 200 
    ? content.substring(0, 200) + "..." 
    : content;

  return (
    <Card className="hover-elevate transition-all" data-testid="card-announcement">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight mb-1">{title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {authorName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {createdAt}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{truncatedContent}</p>
      </CardContent>
      {content.length > 200 && (
        <CardFooter>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReadMore}
            data-testid="button-read-more"
          >
            Devamını Oku
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
