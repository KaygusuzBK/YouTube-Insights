import { type AnalyzeSentimentOutput } from "@/ai/flows/analyze-sentiment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Frown, Meh, Smile, ThumbsDown, ThumbsUp } from "lucide-react";

interface SentimentResultsProps {
  isLoading: boolean;
  analysis: AnalyzeSentimentOutput | null;
  error: string | null;
}

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
  if (sentiment.toLowerCase().includes('positive')) {
    return <Smile className="h-8 w-8 text-positive" />;
  }
  if (sentiment.toLowerCase().includes('negative')) {
    return <Frown className="h-8 w-8 text-destructive" />;
  }
  return <Meh className="h-8 w-8 text-yellow-500" />;
};

export function SentimentResults({ isLoading, analysis, error }: SentimentResultsProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error && !analysis) { // Only show error if there are no results to display
    return (
      <Alert variant="destructive">
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
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Genel Duygu</CardTitle>
            <SentimentIcon sentiment={overallSentiment} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{overallSentiment}</div>
            <p className="text-xs text-muted-foreground">Yorumların yapay zeka analizine göre</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pozitif Anahtar Kelimeler</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {positiveKeywords.length > 0 ? positiveKeywords.map((keyword) => (
                <Badge key={keyword} variant="positive">{keyword}</Badge>
              )) : <p className="text-sm text-muted-foreground">Bulunamadı</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Negatif Anahtar Kelimeler</CardTitle>
            <ThumbsDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {negativeKeywords.length > 0 ? negativeKeywords.map((keyword) => (
                <Badge key={keyword} variant="destructive">{keyword}</Badge>
              )) : <p className="text-sm text-muted-foreground">Bulunamadı</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Yorum Analizi Dökümü</CardTitle>
          <CardDescription>Videonun yorumlarından bazılarının duygu analizi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {comments.length > 0 ? comments.map((comment, index) => (
            <div key={index} className="flex gap-4">
              <Avatar>
                <AvatarImage src={`https://placehold.co/40x40.png?text=${comment.author.substring(0,2)}`} data-ai-hint="person avatar" />
                <AvatarFallback>{comment.author.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{comment.author}</p>
                  {comment.sentiment === 'Positive' && <Badge variant="positive" className="text-xs">Pozitif</Badge>}
                  {comment.sentiment === 'Negative' && <Badge variant="destructive" className="text-xs">Negatif</Badge>}
                  {comment.sentiment === 'Neutral' && <Badge variant="secondary" className="text-xs">Nötr</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{comment.text}</p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground text-center">Bu video için analiz edilecek yorum bulunamadı.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-8">
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-1"><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
      <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent className="flex flex-wrap gap-2"><Skeleton className="h-6 w-16" /><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-12" /></CardContent></Card>
      <Card><CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader><CardContent className="flex flex-wrap gap-2"><Skeleton className="h-6 w-16" /><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-12" /></CardContent></Card>
    </div>
    <Card>
      <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
      <CardContent className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);
