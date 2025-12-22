import { Link } from "react-router-dom";
import { Upload, Zap, Trash2, Code, Copy, ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

const Home = () => {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-upload`;

  const curlExample = `curl -X POST "${apiUrl}" \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@/path/to/your/file.png" \\
  -F "expirationHours=24"`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Fast Upload",
      description: "Upload files instantly with drag & drop or via our REST API.",
    },
    {
      icon: Trash2,
      title: "Auto Delete",
      description: "Set expiration time and files will be automatically removed.",
    },
    {
      icon: Code,
      title: "Developer Friendly",
      description: "Simple REST API with multipart/form-data support.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
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

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-primary glow-text">Slowly</span>
              <span className="text-secondary glow-text-secondary"> Uploader</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Upload file cepat, bagikan dengan mudah, hapus otomatis. 
              Simple file sharing for developers and everyone.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/upload-file">
                <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground glow-box hover:glow-box-intense transition-all">
                  <Upload className="w-5 h-5 mr-2" />
                  Mulai Upload
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#api-section">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-border hover:border-primary/50 hover:bg-primary/10">
                  <Code className="w-5 h-5 mr-2" />
                  View API Docs
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="glass-card-hover rounded-xl p-6 space-y-4 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* API Section */}
        <section id="api-section" className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                <span className="text-secondary">API</span> Access
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Upload files programmatically using our simple REST API. 
                Perfect for automation, CLI tools, or integrations.
              </p>
            </div>

            {/* API Endpoint Info */}
            <div className="glass-card rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 text-sm font-mono font-bold">
                  POST
                </span>
                <code className="text-sm text-muted-foreground font-mono break-all">
                  {apiUrl}
                </code>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-secondary" />
                  Parameters
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <code className="text-primary font-mono">file</code>
                    <span className="text-muted-foreground">— The file to upload (required)</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <code className="text-primary font-mono">expirationHours</code>
                    <span className="text-muted-foreground">— Hours until deletion (optional, default: never)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terminal Block */}
            <div className="terminal-block">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-secondary/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-xs text-muted-foreground">curl example</span>
                <button 
                  onClick={() => copyToClipboard(curlExample)}
                  className="p-1 rounded hover:bg-muted/50 transition-colors"
                >
                  <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm">
                <code className="text-emerald-400">{curlExample}</code>
              </pre>
            </div>

            {/* Response Example */}
            <div className="terminal-block">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                <span className="text-xs text-muted-foreground">Response (JSON)</span>
              </div>
              <pre className="p-4 overflow-x-auto text-sm">
                <code className="text-secondary">{`{
  "success": true,
  "url": "https://...storage.../file.png",
  "delete_at": "2024-12-22T12:00:00.000Z",
  "metadata": {
    "id": 123,
    "name": "file.png",
    "size": 12345,
    "type": "image/png"
  }
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-border/30">
          <p className="text-center text-sm text-muted-foreground">
            Built with <span className="text-primary">Slowly</span> • Files are publicly accessible
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Home;
