import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, User, FileText, Download } from "lucide-react";

interface AnnouncementCardProps {
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  attachmentUrl?: string;
  attachmentType?: string;
  onReadMore?: () => void;
}

export default function AnnouncementCard({
  title,
  content,
  authorName,
  createdAt,
  attachmentUrl,
  attachmentType,
  onReadMore,
}: AnnouncementCardProps) {
  const truncatedContent = content.length > 200 
    ? content.substring(0, 200) + "..." 
    : content;
  
  const getAttachmentLabel = () => {
    if (attachmentType === 'pdf') return 'PDF Dosyası';
    if (attachmentType === 'document') return 'Doküman';
    if (attachmentType === 'image') return 'Görsel';
    if (attachmentType === 'video') return 'Video';
    return 'Dosya';
  };

  return (
    <Card 
      className="hover-elevate transition-all cursor-pointer" 
      data-testid="card-announcement"
      onClick={onReadMore}
    >
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
        {attachmentUrl && (attachmentType === 'pdf' || attachmentType === 'document') && (
          <a 
            href={attachmentUrl} 
            download 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 mt-3 text-sm text-primary hover:underline"
            data-testid="link-download-attachment"
          >
            <FileText className="h-4 w-4" />
            {getAttachmentLabel()}
            <Download className="h-3 w-3" />
          </a>
        )}
      </CardContent>
      {content.length > 200 && (
        <CardFooter>
          <Button 
            variant="ghost" 
            size="sm" 
            data-testid="button-read-more"
          >
            Detayları Gör
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
