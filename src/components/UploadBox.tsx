import { useState, useCallback } from "react";
import { Upload, CloudUpload, FileCheck, Loader2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UploadBoxProps {
  onUploadComplete: () => void;
}

type ExpirationOption = "1hour" | "24hours" | "never";

const UploadBox = ({ onUploadComplete }: UploadBoxProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expiration, setExpiration] = useState<ExpirationOption>("24hours");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUpload(files);
    }
  }, [expiration]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleUpload(files);
    }
  };

  const calculateExpiresAt = (): string | null => {
    if (expiration === "never") return null;
    
    const now = new Date();
    if (expiration === "1hour") {
      now.setHours(now.getHours() + 1);
    } else if (expiration === "24hours") {
      now.setHours(now.getHours() + 24);
    }
    return now.toISOString();
  };

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const expiresAt = calculateExpiresAt();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("public-files")
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("public-files")
          .getPublicUrl(fileName);

        // Insert metadata with expires_at
        const { error: insertError } = await supabase
          .from("files_metadata")
          .insert({
            name: file.name,
            url: urlData.publicUrl,
            size: file.size,
            type: file.type || "application/octet-stream",
            expires_at: expiresAt,
          });

        if (insertError) {
          throw insertError;
        }

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      toast.success(`${files.length} file(s) uploaded successfully!`);
      onUploadComplete();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Expiration selector */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 text-secondary" />
          <span className="text-sm">Expire After:</span>
        </div>
        <Select value={expiration} onValueChange={(value: ExpirationOption) => setExpiration(value)}>
          <SelectTrigger className="w-32 bg-card border-border hover:border-primary/50 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="1hour">1 Hour</SelectItem>
            <SelectItem value="24hours">24 Hours</SelectItem>
            <SelectItem value="never">Never</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative overflow-hidden rounded-xl border-2 border-dashed p-8 md:p-12
          transition-all duration-300 cursor-pointer group
          ${isDragging 
            ? "border-primary bg-primary/10 glow-box" 
            : "border-border hover:border-primary/50 hover:bg-card/50"
          }
          ${isUploading ? "pointer-events-none" : ""}
        `}
      >
        {/* Background glow effect */}
        <div className={`
          absolute inset-0 opacity-0 transition-opacity duration-300
          bg-gradient-to-br from-primary/20 via-transparent to-secondary/10
          ${isDragging ? "opacity-100" : "group-hover:opacity-50"}
        `} />

        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          {isUploading ? (
            <>
              <div className="relative">
                <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-primary animate-spin" />
                <FileCheck className="w-6 h-6 md:w-8 md:h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-2">
                <p className="text-base md:text-lg font-medium text-foreground">
                  Uploading...
                </p>
                <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={`
                p-3 md:p-4 rounded-full bg-primary/10 transition-all duration-300
                ${isDragging ? "scale-110 glow-box-intense" : "group-hover:scale-105 group-hover:glow-box"}
              `}>
                {isDragging ? (
                  <CloudUpload className="w-10 h-10 md:w-12 md:h-12 text-primary animate-float" />
                ) : (
                  <Upload className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-lg md:text-xl font-semibold text-foreground">
                  {isDragging ? "Drop files here" : "Drag & drop files"}
                </p>
                <p className="text-sm md:text-base text-muted-foreground">
                  or click to browse from your device
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                <span className="px-2 py-1 rounded bg-muted/50">Any file type</span>
                <span className="px-2 py-1 rounded bg-muted/50">Multiple files</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadBox;
