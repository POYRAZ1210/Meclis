import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lightbulb, Calendar, MessageSquare } from "lucide-react";
import StatusBadge from "./StatusBadge";

type Status = "pending" | "approved" | "rejected";

interface IdeaCardProps {
  title: string;
  excerpt: string;
  authorName: string;
  authorInitials: string;
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
      className="hover-elevate transition-all cursor-pointer" 
      data-testid="card-idea"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight mb-2">{title}</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-muted text-xs">
                    {authorInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{authorName}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {excerpt}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {createdAt}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {commentCount} yorum
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
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
