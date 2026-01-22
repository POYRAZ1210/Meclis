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
      className="cursor-pointer group border-border/50 hover-elevate" 
      data-testid="card-announcement"
      onClick={onReadMore}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/50">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-base leading-tight mb-1.5">{title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{authorName}</span>
              <span className="text-border">•</span>
              <span>{createdAt}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{truncatedContent}</p>
        {attachmentUrl && (attachmentType === 'pdf' || attachmentType === 'document') && (
          <a 
            href={attachmentUrl} 
            download 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-foreground hover:underline"
            data-testid="link-download-attachment"
          >
            <FileText className="h-3.5 w-3.5" />
            {getAttachmentLabel()}
            <Download className="h-3 w-3" />
          </a>
        )}
      </CardContent>
      {content.length > 200 && (
        <CardFooter className="pt-0">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs"
            data-testid="button-read-more"
          >
            Detayları Gör
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
