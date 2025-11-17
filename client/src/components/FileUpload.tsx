import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/api/upload";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUploadComplete: (url: string, type: 'image' | 'video') => void;
  type: 'image' | 'video';
  currentUrl?: string;
  onRemove?: () => void;
}

export default function FileUpload({ onUploadComplete, type, currentUrl, onRemove }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (type === 'image' && !isImage) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen bir resim dosyası seçin",
      });
      return;
    }

    if (type === 'video' && !isVideo) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen bir video dosyası seçin",
      });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadFile(file);
      onUploadComplete(result.url, result.type);
      toast({
        title: "Başarılı",
        description: "Dosya yüklendi",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Dosya yüklenirken bir hata oluştu",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={type === 'image' ? 'image/*' : 'video/*'}
        onChange={handleInputChange}
        className="hidden"
        data-testid={`input-file-${type}`}
      />

      {currentUrl ? (
        <div className="relative">
          {type === 'image' ? (
            <img 
              src={currentUrl} 
              alt="Preview" 
              className="w-full h-40 object-cover rounded-md"
            />
          ) : (
            <video 
              src={currentUrl} 
              controls 
              className="w-full h-40 rounded-md"
            />
          )}
          {onRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onRemove}
              data-testid={`button-remove-${type}`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          data-testid={`dropzone-${type}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Yükleniyor...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {type === 'image' ? (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              ) : (
                <Video className="h-8 w-8 text-muted-foreground" />
              )}
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">
                  {type === 'image' ? 'Resim' : 'Video'} sürükleyin veya tıklayın
                </p>
                <p className="text-xs mt-1">Maksimum 10MB</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
