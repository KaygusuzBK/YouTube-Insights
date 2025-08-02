'use client';

import { Header } from '@/components/header';
import { SentimentResults } from '@/components/sentiment-results';
import { BuyMeCoffeePopup } from '@/components/buy-me-coffee-popup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { analyzeSentiment, type AnalyzeSentimentOutput } from '@/ai/flows/analyze-sentiment';
import { Sparkles, Clapperboard, TrendingUp, Brain, Zap, BarChart3, Users, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<AnalyzeSentimentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCoffeePopup, setShowCoffeePopup] = useState(false);
  const { toast } = useToast();

  // Sayfa yüklendiğinde popup'ı göster
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCoffeePopup(true);
    }, 2000); // 2 saniye sonra popup göster

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAnalysis(null);
    
    // Basic URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/;
    if (!youtubeRegex.test(url)) {
      setError('Please enter a valid YouTube video URL.');
      toast({
        title: 'Invalid URL',
        description: 'Lütfen geçerli bir YouTube video URL\'si girin.',
        variant: 'destructive'
      })
      return;
    }

    setIsLoading(true);

    try {
      const result = await analyzeSentiment({ videoUrl: url });
      setAnalysis(result);
      if(result.comments.length === 0){
        toast({
          title: 'Yorum Bulunamadı',
          description: 'Bu video için yorum bulunamadı veya API anahtarınızda bir sorun olabilir.',
          variant: 'destructive'
        })
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An error occurred during analysis. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Analiz Başarısız',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-200/10 to-purple-200/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        <div className="container mx-auto max-w-6xl py-12 px-4 md:py-20 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-200/50 dark:border-blue-800/50">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI-Powered Analysis</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              YouTube
              <span className="block text-4xl md:text-5xl mt-2 font-medium text-slate-600 dark:text-slate-300">Yorum Analizi</span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Yapay zeka destekli duygu analizi ile YouTube yorumlarınızı analiz edin. 
              <span className="font-semibold text-slate-800 dark:text-slate-200"> 1000+ yorum</span> üzerinden detaylı içgörüler elde edin.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="group p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Hızlı Analiz</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Saniyeler içinde kapsamlı sonuçlar alın</p>
            </div>
            
            <div className="group p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">AI Destekli</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Gelişmiş yapay zeka algoritması</p>
            </div>
            
            <div className="group p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Detaylı Rapor</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Kapsamlı analiz ve görselleştirme</p>
            </div>
            
            <div className="group p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Hedef Odaklı</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">İş hedeflerinize uygun içgörüler</p>
            </div>
          </div>

          {/* Input Card */}
          <Card className="mb-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                Analiz Başlatın
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Analiz etmek istediğiniz YouTube videosunun bağlantısını sağlayın ve yapay zeka destekli analizi başlatın.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                <div className="relative flex-grow">
                  <Clapperboard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="pl-12 h-14 text-base border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isLoading}
                    required
                    aria-label="YouTube video URL"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25 rounded-xl"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {isLoading ? 'Analiz ediliyor...' : 'Analiz Et'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <SentimentResults
            isLoading={isLoading}
            analysis={analysis}
            error={error}
          />
        </div>
      </main>

      {/* Buy Me Coffee Popup */}
      <BuyMeCoffeePopup 
        isOpen={showCoffeePopup} 
        onClose={() => setShowCoffeePopup(false)} 
      />
    </div>
  );
}
