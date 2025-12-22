import { useState } from "react";
import Navbar from "@/components/Navbar";
import UploadBox from "@/components/UploadBox";
import FileGrid from "@/components/FileGrid";

const Uploader = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      
      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      <Navbar />

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-12 max-w-5xl">
        {/* Page Header */}
        <header className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="text-foreground">Upload</span>
            <span className="text-secondary glow-text-secondary"> Files</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Drag & drop your files or click to browse. Set expiration and share instantly.
          </p>
        </header>
        
        <section className="max-w-2xl mx-auto">
          <UploadBox onUploadComplete={handleUploadComplete} />
        </section>

        <section>
          <FileGrid refreshTrigger={refreshTrigger} />
        </section>
      </main>
    </div>
  );
};

export default Uploader;
