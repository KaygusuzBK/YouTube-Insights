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
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
        {/* Logo ve Başlık */}
        <div className="flex items-center gap-2 md:gap-4 group">
          <div className="relative">
            <div className="p-2 md:p-3 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 rounded-xl md:rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/20">
              <Film className="h-5 w-5 md:h-7 md:w-7 text-gradient animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-ping opacity-75"></div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 md:gap-2">
              <h1 className="text-lg md:text-2xl font-bold tracking-tight font-headline text-gradient">Tube Insights</h1>
              <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20 text-xs px-1.5 md:px-2 py-0.5">
                <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                <span className="hidden sm:inline">AI</span>
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium hidden sm:block">YouTube Yorum Analizi</p>
          </div>
        </div>
        
        {/* Sağ Taraf - Butonlar */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Özellikler - Mobilde gizli, tablet ve üstünde görünür */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">Hızlı</span>
            </div>
            <div className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-accent/10 to-positive/10 rounded-full border border-accent/20">
              <Brain className="h-3 w-3 text-accent" />
              <span className="text-xs font-medium text-accent">AI</span>
            </div>
          </div>

          {/* Mobil Özellik Badge'leri */}
          <div className="flex lg:hidden items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20">
              <Zap className="h-3 w-3 text-primary" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-accent/10 to-positive/10 rounded-full border border-accent/20">
              <Brain className="h-3 w-3 text-accent" />
            </div>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            {isDark ? (
              <Sun className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
