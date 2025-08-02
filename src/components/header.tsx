import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, Moon, Sun, Sparkles, Brain, Zap } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b border-border/40 shadow-lg">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo ve Başlık */}
        <div className="flex items-center gap-4 group">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/20">
              <Film className="h-7 w-7 text-gradient animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-ping opacity-75"></div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight font-headline text-gradient">Tube Insights</h1>
              <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20 text-xs px-2 py-0.5">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-medium">YouTube Yorum Analizi</p>
          </div>
        </div>
        
        {/* Sağ Taraf - Butonlar */}
        <div className="flex items-center gap-3">
          {/* Özellikler */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">Hızlı</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-accent/10 to-positive/10 rounded-full border border-accent/20">
              <Brain className="h-3 w-3 text-accent" />
              <span className="text-xs font-medium text-accent">AI</span>
            </div>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-blue-500" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
