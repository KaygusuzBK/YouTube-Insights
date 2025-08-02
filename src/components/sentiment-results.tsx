'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Filter, 
  X, 
  Play, 
  Calendar, 
  Eye,
  Users,
  Video,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Heart
} from 'lucide-react';
import { useState, useMemo } from 'react';
import type { AnalyzeSentimentOutput, AnalyzeChannelSentimentOutput } from '@/ai/flows/analyze-sentiment';

interface SentimentResultsProps {
  isLoading: boolean;
  analysis: AnalyzeSentimentOutput | AnalyzeChannelSentimentOutput | null;
  error: string | null;
  type: 'video' | 'channel';
}

export function SentimentResults({ isLoading, analysis, error, type }: SentimentResultsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [keywordFilter, setKeywordFilter] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Type guards to check analysis type
  const isVideoAnalysis = (analysis: any): analysis is AnalyzeSentimentOutput => {
    return type === 'video' && analysis && 'comments' in analysis && !('videos' in analysis);
  };

  const isChannelAnalysis = (analysis: any): analysis is AnalyzeChannelSentimentOutput => {
    return type === 'channel' && analysis && 'videos' in analysis;
  };

  // Get all comments based on analysis type
  const allComments = useMemo(() => {
    if (!analysis) return [];
    
    if (isVideoAnalysis(analysis)) {
      return analysis.comments;
    } else if (isChannelAnalysis(analysis)) {
      return analysis.videos.flatMap(video => 
        video.comments.map(comment => ({
          ...comment,
          videoTitle: video.videoTitle,
          videoId: video.videoId
        }))
      );
    }
    
    return [];
  }, [analysis, type]);

  // Filter comments based on search and filters
  const filteredComments = useMemo(() => {
    let filtered = allComments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(comment => {
        const hasText = comment.text.toLowerCase().includes(searchTerm.toLowerCase());
        const hasAuthor = comment.author.toLowerCase().includes(searchTerm.toLowerCase());
        const hasVideoTitle = 'videoTitle' in comment && comment.videoTitle && 
          typeof comment.videoTitle === 'string' &&
          comment.videoTitle.toLowerCase().includes(searchTerm.toLowerCase());
        
        return hasText || hasAuthor || hasVideoTitle;
      });
    }

    // Sentiment filter
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(comment => comment.sentiment === sentimentFilter);
    }

    // Video filter (for channel analysis)
    if (selectedVideo && type === 'channel' && isChannelAnalysis(analysis)) {
      filtered = filtered.filter(comment => 'videoId' in comment && comment.videoId === selectedVideo);
    }

    return filtered;
  }, [allComments, searchTerm, sentimentFilter, selectedVideo, analysis, type]);

  const clearFilters = () => {
    setSearchTerm('');
    setSentimentFilter('all');
    setKeywordFilter('all');
    setSelectedVideo(null);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  if (isLoading) {
    return <LoadingSkeleton type={type} />;
  }

  if (error) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Analiz Hatası
          </h3>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Video Analysis Results */}
      {isVideoAnalysis(analysis) && (
        <>
          {/* Overall Sentiment Card */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                Video Analizi Sonuçları
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                {analysis.comments.length} yorum analiz edildi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center mb-4">
                    {getSentimentIcon(analysis.overallSentiment)}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Genel Duygu
                  </h3>
                  <Badge className={`text-sm font-medium ${getSentimentColor(analysis.overallSentiment)}`}>
                    {analysis.overallSentiment}
                  </Badge>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center mb-4">
                    <ThumbsUp className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Pozitif Anahtar Kelimeler
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {analysis.positiveKeywords.map((keyword, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-center mb-4">
                    <ThumbsDown className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Negatif Anahtar Kelimeler
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {analysis.negativeKeywords.map((keyword, index) => (
                      <Badge key={index} className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Channel Analysis Results */}
      {isChannelAnalysis(analysis) && (
        <>
          {/* Channel Overview Card */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-purple-800 dark:from-white dark:to-purple-200 bg-clip-text text-transparent">
                Kanal Genel Bakış
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                {analysis.channelTitle} - {analysis.totalVideos} video, {analysis.totalComments} yorum analiz edildi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Abone Sayısı
                  </h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {parseInt(analysis.subscriberCount).toLocaleString()}
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center mb-4">
                    <Video className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Analiz Edilen Video
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analysis.totalVideos}
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center mb-4">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Analiz Edilen Yorum
                  </h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analysis.totalComments}
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-center mb-4">
                    {getSentimentIcon(analysis.overallSentiment)}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Genel Duygu
                  </h3>
                  <Badge className={`text-sm font-medium ${getSentimentColor(analysis.overallSentiment)}`}>
                    {analysis.overallSentiment}
                  </Badge>
                </div>
              </div>

              {/* Channel Keywords */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                    Pozitif Anahtar Kelimeler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.positiveKeywords.map((keyword, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <ThumbsDown className="h-5 w-5 text-red-600" />
                    Negatif Anahtar Kelimeler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.negativeKeywords.map((keyword, index) => (
                      <Badge key={index} className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                {analysis.videos.map((video, index) => (
                  <div
                    key={video.videoId}
                    className={`p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer hover:shadow-lg ${
                      selectedVideo === video.videoId
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                    onClick={() => setSelectedVideo(selectedVideo === video.videoId ? null : video.videoId)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          {video.videoTitle}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(video.publishedAt).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {parseInt(video.viewCount).toLocaleString()} görüntüleme
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {video.comments.length} yorum
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(video.overallSentiment)}
                        <Badge className={`text-sm font-medium ${getSentimentColor(video.overallSentiment)}`}>
                          {video.overallSentiment}
                        </Badge>
                      </div>
                    </div>

                    {/* Video Keywords */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {video.positiveKeywords.slice(0, 3).map((keyword, keywordIndex) => (
                          <Badge key={keywordIndex} className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {video.negativeKeywords.slice(0, 3).map((keyword, keywordIndex) => (
                          <Badge key={keywordIndex} className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Comments Preview */}
                    {selectedVideo === video.videoId && (
                      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                          Yorum Önizlemesi
                        </h4>
                        <div className="space-y-4 max-h-60 overflow-y-auto">
                          {video.comments.slice(0, 5).map((comment, commentIndex) => (
                            <div key={commentIndex} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {comment.author}
                                </span>
                                <Badge className={`text-xs ${getSentimentColor(comment.sentiment)}`}>
                                  {comment.sentiment}
                                </Badge>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-sm">
                                {comment.text}
                              </p>
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
        </>
      )}

      {/* Filtering Section */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
            Filtreleme ve Arama
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            Yorumları filtreleyin ve arayın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Yorum ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sentiment Filter */}
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Duygu filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Duygular</SelectItem>
                <SelectItem value="Positive">Pozitif</SelectItem>
                <SelectItem value="Negative">Negatif</SelectItem>
                <SelectItem value="Neutral">Nötr</SelectItem>
              </SelectContent>
            </Select>

            {/* Video Filter (for channel analysis) */}
            {isChannelAnalysis(analysis) && (
              <Select value={selectedVideo || 'all'} onValueChange={(value) => setSelectedVideo(value === 'all' ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Video filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Videolar</SelectItem>
                  {analysis.videos.map((video) => (
                    <SelectItem key={video.videoId} value={video.videoId}>
                      {video.videoTitle.substring(0, 30)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Filtreleri Temizle
            </Button>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Toplam Yorum: {allComments.length}
              </span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Filtrelenmiş: {filteredComments.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Aktif Filtreler: {
                  [searchTerm, sentimentFilter, selectedVideo].filter(Boolean).length
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Analysis */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
            {type === 'video' ? 'Yorum Analizi' : 'Tüm Yorumlar Analizi'}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            {filteredComments.length} yorum gösteriliyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredComments.map((comment, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-start justify-between mb-3">
                                     <div className="flex items-center gap-2">
                     <span className="font-semibold text-slate-800 dark:text-slate-200">
                       {comment.author}
                     </span>
                     {(() => {
                       if ('videoTitle' in comment && comment.videoTitle && typeof comment.videoTitle === 'string') {
                         return (
                           <Badge variant="outline" className="text-xs">
                             {comment.videoTitle.substring(0, 20)}...
                           </Badge>
                         );
                       }
                       return null;
                     })()}
                   </div>
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(comment.sentiment)}
                    <Badge className={`text-xs ${getSentimentColor(comment.sentiment)}`}>
                      {comment.sentiment}
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton({ type }: { type: 'video' | 'channel' }) {
  return (
    <div className="space-y-8">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>

      {type === 'channel' && (
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
