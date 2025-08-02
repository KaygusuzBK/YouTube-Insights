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
import { Film, Moon, Sun, Settings, User, LogOut } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b border-border/40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3 group">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
            <Film className="h-6 w-6 text-gradient" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight font-headline text-gradient">Tube Insights</h1>
            <p className="text-xs text-muted-foreground -mt-1">AI-Powered Analysis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg hover:bg-primary/10 transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-105">
                <Avatar className="h-10 w-10 border-2 border-primary/50 shadow-lg">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="User Avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">TU</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass-effect border-border/40" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Test User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    test@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-primary/10">
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-primary/10">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-destructive/10 text-destructive">
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
