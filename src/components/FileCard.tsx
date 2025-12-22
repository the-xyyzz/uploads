import { 
  File, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileText, 
  FileCode, 
  FileArchive,
  Trash2,
  Download,
  ExternalLink,
  Link,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FileCardProps {
  id: number;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
  expiresAt: string | null;
  onDelete: () => void;
}

const FileCard = ({ id, name, url, size, type, createdAt, expiresAt, onDelete }: FileCardProps) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatExpiresAt = (dateString: string | null): string => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const getFileIcon = () => {
    if (type.startsWith("image/")) return FileImage;
    if (type.startsWith("video/")) return FileVideo;
    if (type.startsWith("audio/")) return FileAudio;
    if (type.startsWith("text/")) return FileText;
    if (type.includes("javascript") || type.includes("json") || type.includes("html") || type.includes("css")) return FileCode;
    if (type.includes("zip") || type.includes("rar") || type.includes("tar") || type.includes("7z")) return FileArchive;
    return File;
  };

  const getIconColor = () => {
    if (type.startsWith("image/")) return "text-pink-400";
    if (type.startsWith("video/")) return "text-purple-400";
    if (type.startsWith("audio/")) return "text-secondary";
    if (type.startsWith("text/")) return "text-blue-400";
    if (type.includes("javascript") || type.includes("json")) return "text-emerald-400";
    if (type.includes("zip") || type.includes("rar")) return "text-primary";
    return "text-primary";
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!", {
        className: "bg-card border-primary/50",
      });
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleDelete = async () => {
    try {
      // Extract filename from URL
      const urlParts = url.split("/");
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("public-files")
        .remove([fileName]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("files_metadata")
        .delete()
        .eq("id", id);

      if (dbError) {
        throw dbError;
      }

      toast.success("File deleted successfully");
      onDelete();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete file");
    }
  };

  const IconComponent = getFileIcon();
  const isImage = type.startsWith("image/");

  return (
    <div className="glass-card-hover rounded-xl overflow-hidden animate-scale-in group">
      {/* Preview area */}
      <div className="relative h-36 bg-muted/30 flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img 
            src={url} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <IconComponent className={`w-12 h-12 ${getIconColor()}`} />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {type.split("/")[1]?.slice(0, 10) || "file"}
            </span>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button 
            onClick={handleCopyLink}
            className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
            title="Copy link"
          >
            <Link className="w-5 h-5 text-primary" />
          </button>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
          >
            <ExternalLink className="w-5 h-5 text-primary" />
          </a>
          <a 
            href={url} 
            download={name}
            className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
          >
            <Download className="w-5 h-5 text-primary" />
          </a>
          <button 
            onClick={handleDelete}
            className="p-2 rounded-full bg-destructive/20 hover:bg-destructive/30 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </button>
        </div>
      </div>

      {/* File info */}
      <div className="p-4 space-y-2">
        <h3 className="font-medium text-foreground truncate" title={name}>
          {name}
        </h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatFileSize(size)}</span>
          <span>{formatDate(createdAt)}</span>
        </div>
        {/* Expiration info */}
        <div className="flex items-center gap-1.5 text-xs text-secondary">
          <Clock className="w-3 h-3" />
          <span>{formatExpiresAt(expiresAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
