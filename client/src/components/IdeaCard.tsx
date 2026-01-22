import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lightbulb, Calendar, MessageSquare } from "lucide-react";
import StatusBadge from "./StatusBadge";

type Status = "pending" | "approved" | "rejected";

interface IdeaCardProps {
  title: string;
  excerpt: string;
  authorName: string;
  authorInitials: string;
  authorPictureUrl?: string | null;
  createdAt: string;
  status: Status;
  commentCount: number;
  onReadMore?: () => void;
  onClick?: () => void;
}

export default function IdeaCard({
  title,
  excerpt,
  authorName,
  authorInitials,
  authorPictureUrl,
  createdAt,
  status,
  commentCount,
  onReadMore,
  onClick,
}: IdeaCardProps) {
  const handleClick = () => {
    if (onClick) onClick();
    else if (onReadMore) onReadMore();
  };

  return (
    <Card 
      className="cursor-pointer group border-border/50 hover-elevate" 
      data-testid="card-idea"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base leading-tight mb-1.5">{title}</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5 border border-border/40">
                  {authorPictureUrl && <AvatarImage src={authorPictureUrl} alt={authorName} />}
                  <AvatarFallback className="bg-muted text-[10px]">
                    {authorInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{authorName}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {excerpt}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{createdAt}</span>
          <span className="text-border">•</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {commentCount}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-xs"
          onClick={(e) => {
            e.stopPropagation();
            if (onReadMore) onReadMore();
            else if (onClick) onClick();
          }}
          data-testid="button-read-idea"
        >
          Görüntüle
        </Button>
      </CardFooter>
    </Card>
  );
}
