import { type AnalyzeChannelSentimentOutput } from "@/ai/flows/analyze-sentiment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Frown, Meh, Smile, ThumbsDown, ThumbsUp, TrendingUp, TrendingDown, Minus, Search, Filter, X, MessageSquare, Users, Play, Calendar, Eye } from "lucide-react";
import { useState, useMemo } from "react";

interface SentimentResultsProps {
  isLoading: boolean;
  analysis: AnalyzeChannelSentimentOutput | null;
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
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [keywordFilter, setKeywordFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get all comments from all videos
  const allComments = useMemo(() => {
    if (!analysis?.videos) return [];
    return analysis.videos.flatMap(video => 
      video.comments.map(comment => ({
        ...comment,
        videoTitle: video.videoTitle,
        videoId: video.videoId,
      }))
    );
  }, [analysis]);

  // Filtreleme mantığı
  const filteredComments = useMemo(() => {
    if (!allComments.length) return [];
    
    let filtered = allComments;
    
    // Video filtresi
    if (selectedVideo) {
      filtered = filtered.filter(comment => comment.videoId === selectedVideo);
    }
    
    // Sentiment filtresi
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(comment => comment.sentiment.toLowerCase() === sentimentFilter.toLowerCase());
    }
    
    // Keyword filtresi
    if (keywordFilter) {
      filtered = filtered.filter(comment => {
        const hasKeyword = comment.text.toLowerCase().includes(keywordFilter.toLowerCase()) ||
                          analysis?.positiveKeywords.some(kw => comment.text.toLowerCase().includes(kw.toLowerCase())) ||
                          analysis?.negativeKeywords.some(kw => comment.text.toLowerCase().includes(kw.toLowerCase()));
        return hasKeyword;
      });
    }
    
    // Arama filtresi
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(comment => 
        comment.text.toLowerCase().includes(searchLower) ||
        comment.author.toLowerCase().includes(searchLower) ||
        comment.videoTitle.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [allComments, selectedVideo, sentimentFilter, keywordFilter, searchQuery, analysis]);

  const clearFilters = () => {
    setSelectedVideo(null);
    setSentimentFilter('all');
    setKeywordFilter('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedVideo || sentimentFilter !== 'all' || keywordFilter || searchQuery;

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
  
  const { channelTitle, subscriberCount, videoCount, overallSentiment, positiveKeywords, negativeKeywords, videos, totalComments, totalVideos } = analysis;

  return (
    <div className="space-y-12 animate-in fade-in-0 duration-700">
      {/* Channel Overview Card */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
            {channelTitle}
          </CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
            Kanal geneli duygu analizi ve performans özeti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Channel Stats */}
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
                <Users className="h-8 w-8 text-white mx-auto" />
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {parseInt(subscriberCount).toLocaleString()}
              </div>
              <p className="text-slate-600 dark:text-slate-300">Abone</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                <Play className="h-8 w-8 text-white mx-auto" />
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {totalVideos}
              </div>
              <p className="text-slate-600 dark:text-slate-300">Analiz Edilen Video</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
                <MessageSquare className="h-8 w-8 text-white mx-auto" />
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {totalComments}
              </div>
              <p className="text-slate-600 dark:text-slate-300">Analiz Edilen Yorum</p>
            </div>
            
            <div className="text-center">
              <SentimentIcon sentiment={overallSentiment} />
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-4">
                {overallSentiment}
              </div>
              <p className="text-slate-600 dark:text-slate-300">Genel Duygu</p>
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

      {/* Videos List */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
            Video Analizleri
          </CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
            Her video için ayrı duygu analizi ve performans metrikleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {videos.map((video, index) => (
              <div 
                key={video.videoId}
                className={`p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  selectedVideo === video.videoId 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
                onClick={() => setSelectedVideo(selectedVideo === video.videoId ? null : video.videoId)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      {video.videoTitle}
                    </h3>
                    <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(video.publishedAt).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        {parseInt(video.viewCount).toLocaleString()} görüntüleme
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {video.comments.length} yorum
                      </div>
                    </div>
                    
                    {/* Video Keywords */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {video.positiveKeywords.slice(0, 3).map(keyword => (
                        <Badge key={keyword} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                          {keyword}
                        </Badge>
                      ))}
                      {video.negativeKeywords.slice(0, 3).map(keyword => (
                        <Badge key={keyword} variant="secondary" className="text-xs bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <SentimentIcon sentiment={video.overallSentiment} />
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        {video.overallSentiment}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Video Duygusu
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Comments Preview (when selected) */}
                {selectedVideo === video.videoId && (
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                      Yorum Önizlemesi
                    </h4>
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {video.comments.slice(0, 5).map((comment, commentIndex) => (
                        <div key={commentIndex} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {comment.author.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {comment.author}
                              </span>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  comment.sentiment === 'Positive' 
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                    : comment.sentiment === 'Negative'
                                    ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                    : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                }`}
                              >
                                {comment.sentiment}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {comment.text.length > 100 ? comment.text.substring(0, 100) + '...' : comment.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
            Yorumları video, duygu durumu, anahtar kelimeler ve arama terimlerine göre filtreleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            {/* Video Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Video</label>
              <Select value={selectedVideo || 'all'} onValueChange={(value) => setSelectedVideo(value === 'all' ? null : value)}>
                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl">
                  <SelectValue placeholder="Tüm videolar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Videolar</SelectItem>
                  {videos.map(video => (
                    <SelectItem key={video.videoId} value={video.videoId}>
                      {video.videoTitle.length > 30 ? video.videoTitle.substring(0, 30) + '...' : video.videoTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  placeholder="Yorum, yazar veya video ara..."
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
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">
                  Toplam: <span className="font-semibold text-slate-800 dark:text-slate-200">{totalComments}</span> yorum
                </span>
              </div>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">
                    Filtrelenmiş: <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredComments.length}</span> yorum
                  </span>
                </div>
              )}
            </div>
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                {Math.round((filteredComments.length / totalComments) * 100)}% eşleşme
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Comments Analysis */}
      {filteredComments.length > 0 && (
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
              Filtrelenmiş Yorumlar
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
              {hasActiveFilters 
                ? `Filtrelenmiş yorumlar (${filteredComments.length}/${totalComments})`
                : `Tüm kanal yorumları (${filteredComments.length} yorum)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-700/50">
              {filteredComments.slice(0, 50).map((comment, index) => (
                <div 
                  key={index} 
                  className="p-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-white/50 dark:hover:bg-slate-600/50 transition-all duration-300"
                >
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-700 shadow-lg flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {comment.author.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{comment.author}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{comment.videoTitle}</p>
                        </div>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-8 animate-in fade-in-0 duration-500">
    {/* Channel Overview Skeleton */}
    <Card className="glass-effect border-border/50">
      <CardHeader className="text-center pb-6">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-24 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
          <div className="text-center">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-24 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
          <div className="text-center">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-24 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
          <div className="text-center">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-24 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
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
        <div className="grid gap-4 md:grid-cols-4">
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

    {/* Videos List Skeleton */}
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

    {/* All Comments Skeleton */}
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
