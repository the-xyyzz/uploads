import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import FileCard from "./FileCard";
import { Package, Loader2 } from "lucide-react";

interface FileMetadata {
  id: number;
  name: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
  expires_at: string | null;
}

interface FileGridProps {
  refreshTrigger: number;
}

const FileGrid = ({ refreshTrigger }: FileGridProps) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const now = new Date().toISOString();
      
      // Fetch files that are not expired
      const { data, error } = await supabase
        .from("files_metadata")
        .select("*")
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("files-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "files_metadata",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newFile = payload.new as FileMetadata;
            // Only add if not expired
            const now = new Date();
            if (!newFile.expires_at || new Date(newFile.expires_at) > now) {
              setFiles((prev) => [newFile, ...prev]);
            }
          } else if (payload.eventType === "DELETE") {
            setFiles((prev) => prev.filter((f) => f.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Periodically filter out expired files
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setFiles((prev) => 
        prev.filter((f) => !f.expires_at || new Date(f.expires_at) > now)
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 glass-card rounded-xl">
        <div className="p-6 rounded-full bg-secondary/10">
          <Package className="w-16 h-16 text-secondary" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-medium text-foreground">No files yet</h3>
          <p className="text-muted-foreground">
            Upload your first file to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Uploaded Files
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({files.length} {files.length === 1 ? "file" : "files"})
          </span>
        </h2>
        <div className="flex items-center gap-2 text-xs text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Live updates
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file, index) => (
          <div 
            key={file.id} 
            style={{ animationDelay: `${index * 0.05}s` }}
            className="animate-fade-in"
          >
            <FileCard
              id={file.id}
              name={file.name}
              url={file.url}
              size={file.size}
              type={file.type}
              createdAt={file.created_at}
              expiresAt={file.expires_at}
              onDelete={() => {}}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileGrid;
