'use client';

import { Header } from '@/components/header';
import { SentimentResults } from '@/components/sentiment-results';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { analyzeSentiment, type AnalyzeSentimentOutput } from '@/ai/flows/analyze-sentiment';
import { Sparkles, Clapperboard } from 'lucide-react';
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
        description: 'Please enter a valid YouTube video URL.',
        variant: 'destructive'
      })
      return;
    }

    setIsLoading(true);

    try {
      const result = await analyzeSentiment({ videoUrl: url });
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setError('An error occurred during analysis. Please try again.');
      toast({
        title: 'Analysis Failed',
        description: 'An error occurred while analyzing the video comments.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl py-8 px-4 md:py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">Analyze YouTube Comment Sentiment</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Paste a YouTube video URL below to get an AI-powered sentiment analysis of the comments.
            </p>
          </div>

          <Card className="mb-8 shadow-lg border-2 border-transparent focus-within:border-primary transition-colors duration-300">
            <CardHeader>
              <CardTitle className="font-headline">Enter Video URL</CardTitle>
              <CardDescription>Provide the link to the YouTube video you want to analyze.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Clapperboard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="pl-10 h-11"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isLoading}
                    required
                    aria-label="YouTube video URL"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-11 text-base">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isLoading ? 'Analyzing...' : 'Analyze'}
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
