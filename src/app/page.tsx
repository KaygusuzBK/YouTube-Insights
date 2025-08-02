'use client';

import { Header } from '@/components/header';
import { SentimentResults } from '@/components/sentiment-results';
import { BuyMeCoffeePopup } from '@/components/buy-me-coffee-popup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyzeSentiment, type AnalyzeSentimentOutput } from '@/ai/flows/analyze-sentiment';
import { analyzeChannelSentiment, type AnalyzeChannelSentimentOutput } from '@/ai/flows/analyze-sentiment';
import { Sparkles, Clapperboard, Brain, Zap, BarChart3, Target, Loader2, Users, Video } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoAnalysis, setVideoAnalysis] = useState<AnalyzeSentimentOutput | null>(null);
  const [channelAnalysis, setChannelAnalysis] = useState<AnalyzeChannelSentimentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCoffeePopup, setShowCoffeePopup] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [activeTab, setActiveTab] = useState('video');
  const { toast } = useToast();

  // Sayfa yüklendiğinde popup'ı göster
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCoffeePopup(true);
    }, 2000); // 2 saniye sonra popup göster

    return () => clearTimeout(timer);
  }, []);

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVideoAnalysis(null);
    setProgress(0);
    setProgressMessage('');
    
    // Basic URL validation for YouTube videos
    const youtubeVideoRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/;
    if (!youtubeVideoRegex.test(url)) {
      setError('Please enter a valid YouTube video URL.');
      toast({
        title: 'Invalid URL',
        description: 'Lütfen geçerli bir YouTube video URL\'si girin. (Örnek: youtube.com/watch?v=...)',
        variant: 'destructive'
      })
      return;
    }

    setIsLoading(true);

    try {
      // Progress simulation
      setProgressMessage('YouTube yorumları alınıyor...');
      setProgress(25);
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgressMessage('AI ile analiz yapılıyor...');
      setProgress(50);
      
      const result = await analyzeSentiment({ videoUrl: url });
      
      setProgressMessage('Sonuçlar işleniyor...');
      setProgress(75);
      
      // Small delay to show final progress
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProgressMessage('Analiz tamamlandı!');
      setProgress(100);
      
      setVideoAnalysis(result);
      
      if(result.comments.length === 0){
        toast({
          title: 'Yorum Bulunamadı',
          description: 'Bu video için yorum bulunamadı veya API anahtarınızda bir sorun olabilir.',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Video Analizi Tamamlandı!',
          description: `${result.comments.length} yorum başarıyla analiz edildi.`,
          variant: 'default'
        })
      }
    } catch (e) {
      console.error(e);
      let errorMessage = e instanceof Error ? e.message : 'An error occurred during analysis. Please try again.';
      
      // Handle specific AI overload error
      if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        errorMessage = 'AI servisi şu anda yoğun. Lütfen birkaç dakika sonra tekrar deneyin.';
      }
      
      setError(errorMessage);
      toast({
        title: 'Analiz Başarısız',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false);
      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
        setProgressMessage('');
      }, 2000);
    }
  };

  const handleChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setChannelAnalysis(null);
    setProgress(0);
    setProgressMessage('');
    
    // Basic URL validation for YouTube channels
    const youtubeChannelRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(channel\/|c\/|user\/|@)[^\/\s]+|youtu\.be\/[^\/\s]+)/;
    if (!youtubeChannelRegex.test(url)) {
      setError('Please enter a valid YouTube channel URL.');
      toast({
        title: 'Invalid URL',
        description: 'Lütfen geçerli bir YouTube kanal URL\'si girin. (Örnek: youtube.com/@channelname)',
        variant: 'destructive'
      })
      return;
    }

    setIsLoading(true);

    try {
      // Progress simulation
      setProgressMessage('Kanal bilgileri alınıyor...');
      setProgress(15);
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgressMessage('Kanal videoları taranıyor...');
      setProgress(30);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgressMessage('Video yorumları toplanıyor...');
      setProgress(50);
      
      const result = await analyzeChannelSentiment({ channelUrl: url });
      
      setProgressMessage('AI ile analiz yapılıyor...');
      setProgress(75);
      
      // Small delay to show final progress
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setProgressMessage('Analiz tamamlandı!');
      setProgress(100);
      
      setChannelAnalysis(result);
      
      if(result.totalComments === 0){
        toast({
          title: 'Yorum Bulunamadı',
          description: 'Bu kanal için yorum bulunamadı veya API anahtarınızda bir sorun olabilir.',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Kanal Analizi Tamamlandı!',
          description: `${result.totalVideos} videodan ${result.totalComments} yorum başarıyla analiz edildi.`,
          variant: 'default'
        })
      }
    } catch (e) {
      console.error(e);
      let errorMessage = e instanceof Error ? e.message : 'An error occurred during analysis. Please try again.';
      
      // Handle specific AI overload error
      if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        errorMessage = 'AI servisi şu anda yoğun. Lütfen birkaç dakika sonra tekrar deneyin.';
      }
      
      setError(errorMessage);
      toast({
        title: 'Analiz Başarısız',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false);
      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
        setProgressMessage('');
      }, 2000);
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
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI-Powered YouTube Analysis</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              YouTube
              <span className="block text-4xl md:text-5xl mt-2 font-medium text-slate-600 dark:text-slate-300">Analiz Platformu</span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Yapay zeka destekli duygu analizi ile YouTube videolarını ve kanallarını analiz edin. 
              <span className="font-semibold text-slate-800 dark:text-slate-200"> Tek video veya tüm kanal</span> analizi seçenekleri.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="group p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Video className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Video Analizi</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Tek video yorumlarını analiz eder</p>
            </div>
            
            <div className="group p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Kanal Analizi</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Tüm kanal videolarını analiz eder</p>
            </div>
            
            <div className="group p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">AI Destekli</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Gelişmiş yapay zeka algoritması</p>
            </div>
            
            <div className="group p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Detaylı Rapor</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Kapsamlı analiz ve görselleştirme</p>
            </div>
          </div>

          {/* Analysis Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-16">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Video Analizi
              </TabsTrigger>
              <TabsTrigger value="channel" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Kanal Analizi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="video" className="mt-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                    Video Analizi
                  </CardTitle>
                  <CardDescription className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    Analiz etmek istediğiniz YouTube videosunun bağlantısını sağlayın ve yapay zeka destekli analizi başlatın.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleVideoSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
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
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analiz ediliyor...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Video Analiz Et
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Progress Bar */}
                  {isLoading && (
                    <div className="mt-6 max-w-2xl mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {progressMessage}
                        </span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2 bg-slate-200 dark:bg-slate-700" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="channel" className="mt-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-purple-800 dark:from-white dark:to-purple-200 bg-clip-text text-transparent">
                    Kanal Analizi
                  </CardTitle>
                  <CardDescription className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    Analiz etmek istediğiniz YouTube kanalının bağlantısını sağlayın ve yapay zeka destekli analizi başlatın.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleChannelSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                    <div className="relative flex-grow">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="url"
                        placeholder="https://www.youtube.com/@channelname"
                        className="pl-12 h-14 text-base border-2 border-slate-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 transition-colors bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isLoading}
                        required
                        aria-label="YouTube channel URL"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/25 rounded-xl"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analiz ediliyor...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Kanal Analiz Et
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Progress Bar */}
                  {isLoading && (
                    <div className="mt-6 max-w-2xl mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {progressMessage}
                        </span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2 bg-slate-200 dark:bg-slate-700" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Results */}
          {activeTab === 'video' && (
            <SentimentResults
              isLoading={isLoading}
              analysis={videoAnalysis}
              error={error}
              type="video"
            />
          )}
          
          {activeTab === 'channel' && (
            <SentimentResults
              isLoading={isLoading}
              analysis={channelAnalysis}
              error={error}
              type="channel"
            />
          )}
        </div>
      </main>

      <BuyMeCoffeePopup 
        isOpen={showCoffeePopup} 
        onClose={() => setShowCoffeePopup(false)} 
      />
    </div>
  );
}
