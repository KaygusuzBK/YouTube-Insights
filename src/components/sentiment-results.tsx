import { type AnalyzeSentimentOutput } from "@/ai/flows/analyze-sentiment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Frown, Meh, Smile, ThumbsDown, ThumbsUp, TrendingUp, TrendingDown, Minus, Search, Filter, X } from "lucide-react";
import { useState, useMemo } from "react";
import { Virtuoso } from 'virtua';

interface SentimentResultsProps {
  isLoading: boolean;
  analysis: AnalyzeSentimentOutput | null;
  error: string | null;
}

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
  if (sentiment.toLowerCase().includes('positive')) {
    return <div className="p-3 bg-positive/10 rounded-full">
      <Smile className="h-8 w-8 text-positive" />
    </div>;
  }
  if (sentiment.toLowerCase().includes('negative')) {
    return <div className="p-3 bg-destructive/10 rounded-full">
      <Frown className="h-8 w-8 text-destructive" />
    </div>;
  }
  return <div className="p-3 bg-yellow-500/10 rounded-full">
    <Meh className="h-8 w-8 text-yellow-500" />
  </div>;
};

const SentimentTrendIcon = ({ sentiment }: { sentiment: string }) => {
  if (sentiment.toLowerCase().includes('positive')) {
    return <TrendingUp className="h-5 w-5 text-positive" />;
  }
  if (sentiment.toLowerCase().includes('negative')) {
    return <TrendingDown className="h-5 w-5 text-destructive" />;
  }
  return <Minus className="h-5 w-5 text-yellow-500" />;
};

export function SentimentResults({ isLoading, analysis, error }: SentimentResultsProps) {
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [keywordFilter, setKeywordFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtreleme mantığı - hooks'ları en üstte çağırıyoruz
  const filteredComments = useMemo(() => {
    if (!analysis?.comments) return [];
    
    return analysis.comments.filter(comment => {
      // Sentiment filtresi
      if (sentimentFilter !== 'all' && comment.sentiment.toLowerCase() !== sentimentFilter.toLowerCase()) {
        return false;
      }
      
      // Keyword filtresi
      if (keywordFilter) {
        const hasKeyword = comment.text.toLowerCase().includes(keywordFilter.toLowerCase()) ||
                          analysis.positiveKeywords.some(kw => comment.text.toLowerCase().includes(kw.toLowerCase())) ||
                          analysis.negativeKeywords.some(kw => comment.text.toLowerCase().includes(kw.toLowerCase()));
        if (!hasKeyword) return false;
      }
      
      // Arama filtresi
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = comment.text.toLowerCase().includes(searchLower) ||
                             comment.author.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [analysis, sentimentFilter, keywordFilter, searchQuery]);

  const clearFilters = () => {
    setSentimentFilter('all');
    setKeywordFilter('');
    setSearchQuery('');
  };

  const hasActiveFilters = sentimentFilter !== 'all' || keywordFilter || searchQuery;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error && !analysis) {
    return (
      <Alert variant="destructive" className="animate-in fade-in-0 duration-500">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Analysis Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysis) {
    return null;
  }
  
  const { overallSentiment, positiveKeywords, negativeKeywords, comments } = analysis;

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Overall Sentiment Card */}
      <Card className="card-hover glass-effect border-border/50 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-headline text-gradient">Genel Duygu Analizi</CardTitle>
          <CardDescription className="text-base">
            Yapay zeka algoritmasının yorumları analiz etmesi sonucu elde edilen genel duygu durumu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            <SentimentIcon sentiment={overallSentiment} />
            <div className="text-center">
              <div className="text-3xl font-bold font-headline mb-2">{overallSentiment}</div>
              <p className="text-muted-foreground">Yorumların yapay zeka analizine göre</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SentimentTrendIcon sentiment={overallSentiment} />
              <span>Trend: {overallSentiment.toLowerCase().includes('positive') ? 'Yükseliş' : overallSentiment.toLowerCase().includes('negative') ? 'Düşüş' : 'Stabil'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keywords Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-hover glass-effect border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-headline">Pozitif Anahtar Kelimeler</CardTitle>
            <div className="p-2 bg-positive/10 rounded-lg">
              <ThumbsUp className="h-5 w-5 text-positive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {positiveKeywords.length > 0 ? positiveKeywords.map((keyword, index) => (
                <Badge 
                  key={keyword} 
                  variant="secondary" 
                  className="bg-positive/10 text-positive border-positive/20 hover:bg-positive/20 transition-colors animate-in fade-in-0 duration-300 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setKeywordFilter(keyword)}
                >
                  {keyword}
                </Badge>
              )) : (
                <p className="text-sm text-muted-foreground italic">Pozitif anahtar kelime bulunamadı</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover glass-effect border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-headline">Negatif Anahtar Kelimeler</CardTitle>
            <div className="p-2 bg-destructive/10 rounded-lg">
              <ThumbsDown className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {negativeKeywords.length > 0 ? negativeKeywords.map((keyword, index) => (
                <Badge 
                  key={keyword} 
                  variant="secondary" 
                  className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 transition-colors animate-in fade-in-0 duration-300 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setKeywordFilter(keyword)}
                >
                  {keyword}
                </Badge>
              )) : (
                <p className="text-sm text-muted-foreground italic">Negatif anahtar kelime bulunamadı</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtering Section */}
      <Card className="card-hover glass-effect border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-headline">Filtreleme Seçenekleri</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Filtreleri Temizle
              </Button>
            )}
          </div>
          <CardDescription>
            Yorumları duygu durumu, anahtar kelimeler ve arama terimlerine göre filtreleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Sentiment Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Duygu Durumu</label>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm duygular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Duygular</SelectItem>
                  <SelectItem value="positive">Pozitif</SelectItem>
                  <SelectItem value="negative">Negatif</SelectItem>
                  <SelectItem value="neutral">Nötr</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Keyword Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Anahtar Kelime</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Anahtar kelime ara..."
                  value={keywordFilter}
                  onChange={(e) => setKeywordFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Search Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Genel Arama</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Yorum veya yazar ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Toplam: <span className="font-semibold text-foreground">{comments.length}</span> yorum
              </span>
              {hasActiveFilters && (
                <span className="text-sm text-muted-foreground">
                  Filtrelenmiş: <span className="font-semibold text-foreground">{filteredComments.length}</span> yorum
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {Math.round((filteredComments.length / comments.length) * 100)}% eşleşme
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments Analysis */}
      <Card className="card-hover glass-effect border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-gradient">Yorum Analizi Dökümü</CardTitle>
          <CardDescription className="text-base">
            {hasActiveFilters 
              ? `Filtrelenmiş yorumlar (${filteredComments.length}/${comments.length})`
              : `Videonun tüm yorumlarının detaylı duygu analizi ve içerik değerlendirmesi. (${comments.length} yorum)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredComments.length > 0 ? (
            <div className="h-[600px] border border-border/30 rounded-lg">
              <Virtuoso
                data={filteredComments}
                itemContent={(index, comment) => (
                  <div className="p-4 border-b border-border/30 last:border-b-0 hover:bg-card/30 transition-colors">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-md flex-shrink-0">
                        <AvatarImage src={`https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=48&h=48&fit=crop&crop=face`} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                          {comment.author.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-sm truncate">{comment.author}</p>
                          <div className="flex items-center gap-2">
                            {comment.sentiment === 'Positive' && (
                              <Badge variant="secondary" className="bg-positive/10 text-positive border-positive/20 text-xs">
                                <Smile className="h-3 w-3 mr-1" />
                                Pozitif
                              </Badge>
                            )}
                            {comment.sentiment === 'Negative' && (
                              <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                                <Frown className="h-3 w-3 mr-1" />
                                Negatif
                              </Badge>
                            )}
                            {comment.sentiment === 'Neutral' && (
                              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">
                                <Meh className="h-3 w-3 mr-1" />
                                Nötr
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                )}
                components={{
                  Footer: () => (
                    <div className="p-4 text-center text-sm text-muted-foreground border-t border-border/30">
                      {filteredComments.length} yorum gösteriliyor
                    </div>
                  )
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {hasActiveFilters 
                  ? 'Seçilen filtrelere uygun yorum bulunamadı. Filtreleri değiştirmeyi deneyin.'
                  : 'Bu video için analiz edilecek yorum bulunamadı.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-8 animate-in fade-in-0 duration-500">
    {/* Overall Sentiment Skeleton */}
    <Card className="glass-effect border-border/50">
      <CardHeader className="text-center pb-6">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="text-center">
            <Skeleton className="h-10 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Keywords Skeleton */}
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="glass-effect border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-18" />
        </CardContent>
      </Card>
      <Card className="glass-effect border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-12" />
        </CardContent>
      </Card>
    </div>

    {/* Filtering Skeleton */}
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Comments Skeleton */}
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 items-start">
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);
