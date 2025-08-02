import { type AnalyzeSentimentOutput } from "@/ai/flows/analyze-sentiment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Frown, Meh, Smile, ThumbsDown, ThumbsUp, TrendingUp, TrendingDown, Minus, Search, Filter, X, MessageSquare, Users } from "lucide-react";
import { useState, useMemo } from "react";

interface SentimentResultsProps {
  isLoading: boolean;
  analysis: AnalyzeSentimentOutput | null;
  error: string | null;
}

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
  if (sentiment.toLowerCase().includes('positive')) {
    return <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
      <Smile className="h-10 w-10 text-white" />
    </div>;
  }
  if (sentiment.toLowerCase().includes('negative')) {
    return <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
      <Frown className="h-10 w-10 text-white" />
    </div>;
  }
  return <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg">
    <Meh className="h-10 w-10 text-white" />
  </div>;
};

const SentimentTrendIcon = ({ sentiment }: { sentiment: string }) => {
  if (sentiment.toLowerCase().includes('positive')) {
    return <TrendingUp className="h-6 w-6 text-emerald-600" />;
  }
  if (sentiment.toLowerCase().includes('negative')) {
    return <TrendingDown className="h-6 w-6 text-red-600" />;
  }
  return <Minus className="h-6 w-6 text-yellow-600" />;
};

export function SentimentResults({ isLoading, analysis, error }: SentimentResultsProps) {
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [keywordFilter, setKeywordFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllComments, setShowAllComments] = useState<boolean>(false);

  // Filtreleme mantığı - hooks'ları en üstte çağırıyoruz
  const filteredComments = useMemo(() => {
    if (!analysis?.comments) return [];
    
    const filtered = analysis.comments.filter(comment => {
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
    
    console.log('Filtered comments:', filtered.length);
    return filtered;
  }, [analysis, sentimentFilter, keywordFilter, searchQuery]);

  // Görüntülenecek yorumları sınırla
  const displayedComments = useMemo(() => {
    if (showAllComments) return filteredComments;
    const limited = filteredComments.slice(0, 30);
    console.log('Displayed comments:', limited.length);
    return limited;
  }, [filteredComments, showAllComments]);

  const clearFilters = () => {
    setSentimentFilter('all');
    setKeywordFilter('');
    setSearchQuery('');
    setShowAllComments(false);
  };

  const hasActiveFilters = sentimentFilter !== 'all' || keywordFilter || searchQuery;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error && !analysis) {
    return (
      <Alert variant="destructive" className="animate-in fade-in-0 duration-500 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800">
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
    <div className="space-y-12 animate-in fade-in-0 duration-700">
      {/* Overall Sentiment Card */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
            Genel Duygu Analizi
          </CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
            Yapay zeka algoritmasının yorumları analiz etmesi sonucu elde edilen genel duygu durumu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-8">
            <SentimentIcon sentiment={overallSentiment} />
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-3">{overallSentiment}</div>
              <p className="text-slate-600 dark:text-slate-300 text-lg">Yorumların yapay zeka analizine göre</p>
            </div>
            <div className="flex items-center gap-3 text-lg text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 px-6 py-3 rounded-2xl">
              <SentimentTrendIcon sentiment={overallSentiment} />
              <span>Trend: {overallSentiment.toLowerCase().includes('positive') ? 'Yükseliş' : overallSentiment.toLowerCase().includes('negative') ? 'Düşüş' : 'Stabil'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keywords Cards */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl shadow-emerald-500/10 dark:shadow-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
              Pozitif Anahtar Kelimeler
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
              <ThumbsUp className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {positiveKeywords.length > 0 ? positiveKeywords.map((keyword, index) => (
                <Badge 
                  key={keyword} 
                  variant="secondary" 
                  className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-800/70 dark:hover:to-emerald-700/70 transition-all duration-300 cursor-pointer animate-in fade-in-0 duration-300 shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setKeywordFilter(keyword)}
                >
                  {keyword}
                </Badge>
              )) : (
                <p className="text-slate-500 dark:text-slate-400 italic">Pozitif anahtar kelime bulunamadı</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl shadow-red-500/10 dark:shadow-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 dark:from-red-400 dark:to-red-300 bg-clip-text text-transparent">
              Negatif Anahtar Kelimeler
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <ThumbsDown className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {negativeKeywords.length > 0 ? negativeKeywords.map((keyword, index) => (
                <Badge 
                  key={keyword} 
                  variant="secondary" 
                  className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/50 dark:to-red-800/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/70 dark:hover:to-red-700/70 transition-all duration-300 cursor-pointer animate-in fade-in-0 duration-300 shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setKeywordFilter(keyword)}
                >
                  {keyword}
                </Badge>
              )) : (
                <p className="text-slate-500 dark:text-slate-400 italic">Negatif anahtar kelime bulunamadı</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtering Section */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl shadow-blue-500/10 dark:shadow-blue-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                Filtreleme Seçenekleri
              </CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4 mr-2" />
                Filtreleri Temizle
              </Button>
            )}
          </div>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            Yorumları duygu durumu, anahtar kelimeler ve arama terimlerine göre filtreleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Sentiment Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Duygu Durumu</label>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl">
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
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Anahtar Kelime</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Anahtar kelime ara..."
                  value={keywordFilter}
                  onChange={(e) => setKeywordFilter(e.target.value)}
                  className="pl-10 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl"
                />
              </div>
            </div>

            {/* Search Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Genel Arama</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Yorum veya yazar ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Users className="h-4 w-4" />
                <span className="text-sm">
                  Toplam: <span className="font-semibold text-slate-800 dark:text-slate-200">{comments.length}</span> yorum
                </span>
              </div>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">
                    Filtrelenmiş: <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredComments.length}</span> yorum
                  </span>
                </div>
              )}
            </div>
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                {Math.round((filteredComments.length / comments.length) * 100)}% eşleşme
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments Analysis */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
            Yorum Analizi Dökümü
          </CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
            {hasActiveFilters 
              ? `Filtrelenmiş yorumlar (${filteredComments.length}/${comments.length})`
              : `Videonun tüm yorumlarının detaylı duygu analizi ve içerik değerlendirmesi. (${comments.length} yorum analiz edildi, ${displayedComments.length} yorum gösteriliyor)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredComments.length > 0 ? (
            <div className="space-y-6">
              {/* Yorumlar Listesi */}
              <div className="max-h-[600px] overflow-y-auto border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-700/50">
                {displayedComments.map((comment, index) => (
                  <div 
                    key={index} 
                    className="p-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-white/50 dark:hover:bg-slate-600/50 transition-all duration-300"
                  >
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-700 shadow-lg flex-shrink-0">
                        <AvatarImage src={`https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=48&h=48&fit=crop&crop=face`} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {comment.author.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{comment.author}</p>
                          <div className="flex items-center gap-2">
                            {comment.sentiment === 'Positive' && (
                              <Badge variant="secondary" className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 text-xs">
                                <Smile className="h-3 w-3 mr-1" />
                                Pozitif
                              </Badge>
                            )}
                            {comment.sentiment === 'Negative' && (
                              <Badge variant="secondary" className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/50 dark:to-red-800/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 text-xs">
                                <Frown className="h-3 w-3 mr-1" />
                                Negatif
                              </Badge>
                            )}
                            {comment.sentiment === 'Neutral' && (
                              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/50 dark:to-yellow-800/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700 text-xs">
                                <Meh className="h-3 w-3 mr-1" />
                                Nötr
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Devamını Gör Butonu */}
              {!showAllComments && filteredComments.length > 30 && (
                <div className="text-center">
                  <Button
                    onClick={() => setShowAllComments(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25 rounded-xl px-8 py-3"
                  >
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Devamını Gör ({filteredComments.length - 30} yorum daha)
                  </Button>
                </div>
              )}
              
              {/* Yorum Sayısı Bilgisi */}
              <div className="text-center text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 py-4 rounded-xl">
                {showAllComments 
                  ? `${filteredComments.length} yorum gösteriliyor`
                  : `${displayedComments.length} / ${filteredComments.length} yorum gösteriliyor`
                }
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-6 bg-slate-100 dark:bg-slate-700 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
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
