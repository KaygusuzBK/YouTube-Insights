'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Coffee, Heart, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface BuyMeCoffeePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuyMeCoffeePopup({ isOpen, onClose }: BuyMeCoffeePopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isOpen ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup Card */}
      <Card className="relative w-full max-w-md bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-0 shadow-2xl shadow-blue-500/20 dark:shadow-blue-500/30 rounded-2xl animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 z-10"
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="text-center pb-6 pt-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
              <Coffee className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
            Buy Me a Coffee
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300 text-base">
            Bu projeyi beğendiyseniz, bir kahve ile destekleyebilirsiniz! ☕
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <div className="space-y-6">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-yellow-200 dark:border-yellow-700">
                <div className="w-48 h-48 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl flex items-center justify-center border border-yellow-200 dark:border-yellow-700">
                  {!imageError ? (
                    <div className="relative w-full h-full">
                      <Image
                        src="/buy-me-a-coffee.png"
                        alt="Buy Me a Coffee QR Code"
                        fill
                        className="object-contain rounded-lg"
                        onError={() => setImageError(true)}
                        priority
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-32 h-32 bg-yellow-400 rounded-lg flex items-center justify-center mb-3 shadow-md">
                        <div className="w-24 h-24 bg-white rounded-md flex items-center justify-center">
                          <div className="w-16 h-16 bg-black rounded-sm relative">
                            {/* QR Code Pattern Simulation */}
                            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 p-1">
                              {/* Finder Patterns */}
                              <div className="col-span-3 row-span-3 bg-black rounded-sm"></div>
                              <div className="col-span-3 row-span-3 bg-black rounded-sm col-start-6"></div>
                              <div className="col-span-3 row-span-3 bg-black rounded-sm row-start-6"></div>
                              
                              {/* Random QR dots */}
                              <div className="col-start-4 row-start-1 bg-black rounded-sm w-1 h-1"></div>
                              <div className="col-start-6 row-start-2 bg-black rounded-sm w-1 h-1"></div>
                              <div className="col-start-2 row-start-4 bg-black rounded-sm w-1 h-1"></div>
                              <div className="col-start-5 row-start-5 bg-black rounded-sm w-1 h-1"></div>
                              <div className="col-start-7 row-start-6 bg-black rounded-sm w-1 h-1"></div>
                              <div className="col-start-3 row-start-7 bg-black rounded-sm w-1 h-1"></div>
                              <div className="col-start-8 row-start-8 bg-black rounded-sm w-1 h-1"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        QR Kodu Tarayın
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Support Message */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm">Projeyi desteklemek için QR kodu tarayın</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                <Sparkles className="h-3 w-3" />
                <span className="text-xs">Her destek yeni özellikler eklememize yardımcı olur</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl"
              >
                Daha Sonra
              </Button>
              <Button
                onClick={() => {
                  // Gerçek Buy Me Coffee linkinizi açın
                  window.open('https://buymeacoffee.com/KaygusuzBK', '_blank');
                }}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl shadow-lg shadow-yellow-500/25"
              >
                <Coffee className="h-4 w-4 mr-2" />
                Destekle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 