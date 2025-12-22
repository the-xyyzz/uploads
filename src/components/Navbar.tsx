import { Link, useLocation } from "react-router-dom";
import { Clock, Upload, Home, Code } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Clock className="w-8 h-8 text-primary transition-transform group-hover:rotate-12" />
            <span className="text-xl font-bold">
              <span className="text-primary glow-text">Uploader</span>
              <span className="text-secondary glow-text-secondary"> File</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive("/") 
                  ? "bg-primary/20 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              to="/upload-file"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive("/upload-file") 
                  ? "bg-primary/20 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
