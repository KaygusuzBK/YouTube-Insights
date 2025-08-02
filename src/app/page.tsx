'use client';

import { Header } from '@/components/header';
import { SentimentResults } from '@/components/sentiment-results';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { analyzeSentiment, type AnalyzeSentimentOutput } from '@/ai/flows/analyze-sentiment';
import { Sparkles, Clapperboard, TrendingUp, Brain, Zap } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<AnalyzeSentimentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto max-w-4xl py-8 px-4 md:py-12 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                <Brain className="h-6 w-6 text-gradient" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">AI-Powered Analysis</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight sm:text-6xl font-headline mb-4">
              <span className="text-gradient">YouTube</span> Yorum Analizi
            </h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
              Yapay zeka destekli duygu analizi ile YouTube yorumlarınızı analiz edin. 
              Pozitif ve negatif geri bildirimleri anında görün.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Hızlı Analiz</h3>
                <p className="text-xs text-muted-foreground">Saniyeler içinde sonuç</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Brain className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Destekli</h3>
                <p className="text-xs text-muted-foreground">Gelişmiş algoritma</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="p-2 bg-positive/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-positive" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Detaylı Rapor</h3>
                <p className="text-xs text-muted-foreground">Kapsamlı analiz</p>
              </div>
            </div>
          </div>

          <Card className="mb-8 card-hover glass-effect border-border/50 shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-headline text-gradient">Video URL'sini Girin</CardTitle>
              <CardDescription className="text-base">
                Analiz etmek istediğiniz YouTube videosunun bağlantısını sağlayın ve AI analizini başlatın.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Clapperboard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="pl-10 h-12 text-base border-border/50 focus:border-primary transition-colors"
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
                  className="w-full sm:w-auto h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-105 shadow-lg"
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
    </div>
  );
}
