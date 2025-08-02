import { type AnalyzeSentimentOutput } from "@/ai/flows/analyze-sentiment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Frown, Meh, Smile, ThumbsDown, ThumbsUp } from "lucide-react";

interface SentimentResultsProps {
  isLoading: boolean;
  analysis: AnalyzeSentimentOutput | null;
  error: string | null;
}

const mockComments = [
  {
    author: 'TechieTom',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'person tech',
    text: "This is an <span class='bg-positive/20 text-positive font-medium rounded px-1.5 py-0.5'>amazing</span> product! I absolutely <span class='bg-positive/20 text-positive font-medium rounded px-1.5 py-0.5'>love</span> how it simplifies my workflow. <span class='bg-positive/20 text-positive font-medium rounded px-1.5 py-0.5'>Highly recommended</span>!",
    sentiment: 'Positive',
  },
  {
    author: 'CriticalChris',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'person glasses',
    text: "Honestly, I found it a bit <span class='bg-destructive/20 text-destructive font-medium rounded px-1.5 py-0.5'>disappointing</span>. The interface is <span class='bg-destructive/20 text-destructive font-medium rounded px-1.5 py-0.5'>clunky</span> and not very intuitive. <span class='bg-destructive/20 text-destructive font-medium rounded px-1.5 py-0.5'>Needs improvement</span>.",
    sentiment: 'Negative',
  },
  {
    author: 'NeutralNancy',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'woman portrait',
    text: "It's an okay tool. It does the job as described, but doesn't have any standout features. Pretty much what I expected.",
    sentiment: 'Neutral',
  },
  {
    author: 'EnthusiastEva',
    avatar: 'https://placehold.co/40x40.png',
    dataAiHint: 'woman smiling',
    text: "Wow! Just wow! <span class='bg-positive/20 text-positive font-medium rounded px-1.5 py-0.5'>Incredible</span> piece of technology. The developers did a <span class='bg-positive/20 text-positive font-medium rounded px-1.5 py-0.5'>fantastic</span> job. I'm very <span class='bg-positive/20 text-positive font-medium rounded px-1.5 py-0.5'>impressed</span>.",
    sentiment: 'Positive',
  }
];

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

  const positiveKeywords = analysis.positiveKeywords.split(',').map(k => k.trim()).filter(Boolean);
  const negativeKeywords = analysis.negativeKeywords.split(',').map(k => k.trim()).filter(Boolean);

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Sentiment</CardTitle>
            <SentimentIcon sentiment={analysis.overallSentiment} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{analysis.overallSentiment}</div>
            <p className="text-xs text-muted-foreground">Based on AI analysis of comments</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Positive Keywords</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {positiveKeywords.length > 0 ? positiveKeywords.map((keyword) => (
                <Badge key={keyword} variant="positive">{keyword}</Badge>
              )) : <p className="text-sm text-muted-foreground">None found</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Negative Keywords</CardTitle>
            <ThumbsDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {negativeKeywords.length > 0 ? negativeKeywords.map((keyword) => (
                <Badge key={keyword} variant="destructive">{keyword}</Badge>
              )) : <p className="text-sm text-muted-foreground">None found</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Comment Analysis Breakdown (Mock)</CardTitle>
          <CardDescription>This is a mock representation of how individual comments would be analyzed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {mockComments.map((comment, index) => (
            <div key={index} className="flex gap-4">
              <Avatar>
                <AvatarImage src={comment.avatar} data-ai-hint={comment.dataAiHint} />
                <AvatarFallback>{comment.author.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{comment.author}</p>
                  {comment.sentiment === 'Positive' && <Badge variant="positive" className="text-xs">Positive</Badge>}
                  {comment.sentiment === 'Negative' && <Badge variant="destructive" className="text-xs">Negative</Badge>}
                  {comment.sentiment === 'Neutral' && <Badge variant="secondary" className="text-xs">Neutral</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: comment.text }} />
              </div>
            </div>
          ))}
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
