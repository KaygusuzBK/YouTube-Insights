import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Film, Moon, Sun, Settings, User, LogOut, Sparkles, Brain, Zap } from "lucide-react";
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
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-12 w-12 rounded-2xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-primary/20"
              >
                <Avatar className="h-10 w-10 border-2 border-primary/30 shadow-lg">
                  <AvatarImage 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
                    alt="User Avatar" 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                    TU
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 glass-effect border-border/40 shadow-2xl" 
              align="end" 
              forceMount
              sideOffset={8}
            >
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/30">
                    <AvatarImage 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
                      alt="User Avatar" 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                      TU
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">Test User</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      test@example.com
                    </p>
                    <Badge variant="secondary" className="w-fit text-xs mt-1 bg-positive/10 text-positive border-positive/20">
                      Premium
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-colors p-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Profile</p>
                  <p className="text-xs text-muted-foreground">Hesap bilgileriniz</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-colors p-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Settings className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Settings</p>
                  <p className="text-xs text-muted-foreground">Uygulama ayarları</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-destructive/10 hover:to-red-500/10 transition-colors p-3 text-destructive">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <LogOut className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Log out</p>
                  <p className="text-xs text-muted-foreground">Hesaptan çıkış yap</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
