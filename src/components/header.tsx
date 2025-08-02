'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun, Coffee } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BuyMeCoffeePopup } from './buy-me-coffee-popup';

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [showCoffeePopup, setShowCoffeePopup] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 md:h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg hover:scale-110 transition-transform cursor-pointer">
              <div className="w-5 h-5 md:w-7 md:h-7 bg-white rounded-lg flex items-center justify-center">
                <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">YT</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                YouTube Insights
              </h1>
              <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
                AI-Powered Analysis
              </p>
            </div>
          </div>

          {/* Center - Feature Badges */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 py-1 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-full border border-emerald-200/50 dark:border-emerald-700/50">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Hızlı</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 py-1 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-full border border-blue-200/50 dark:border-blue-700/50">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">AI</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 px-1.5 md:px-2 py-1 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-full border border-purple-200/50 dark:border-purple-700/50">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-purple-500 rounded-full"></div>
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Detaylı</span>
            </div>
          </div>

          {/* Mobile Feature Icons */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2">
            {/* Support Button */}
            <Button
              onClick={() => setShowCoffeePopup(true)}
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-xl transition-all duration-300"
            >
              <Coffee className="h-4 w-4" />
              <span className="text-sm font-medium">Destekle</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="p-2 h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Buy Me Coffee Popup */}
      <BuyMeCoffeePopup 
        isOpen={showCoffeePopup} 
        onClose={() => setShowCoffeePopup(false)} 
      />
    </>
  );
}
