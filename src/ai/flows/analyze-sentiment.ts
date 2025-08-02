'use server';

/**
 * @fileOverview A YouTube comment sentiment analyzer using real comments.
 *
 * - analyzeSentiment - A function that handles the sentiment analysis of YouTube comments.
 * - AnalyzeSentimentInput - The input type for the analyzeSentiment function.
 * - AnalyzeSentimentOutput - The return type for the analyzeSentiment function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import {getComments} from '@/services/youtube';

const apiKey = 'AIzaSyB446sE3RuxjZb7iJHvz_QiY3ltVYB0ZQ8';

const ai = genkit({
  plugins: [googleAI({apiKey})],
});

// In-memory cache for storing analysis results
const analysisCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Progress tracking interface
export interface AnalysisProgress {
  stage: 'fetching' | 'analyzing' | 'processing' | 'complete';
  message: string;
  percentage: number;
}

const AnalyzeSentimentInputSchema = z.object({
  videoUrl: z.string().describe('The URL of the YouTube video to analyze.'),
});
export type AnalyzeSentimentInput = z.infer<typeof AnalyzeSentimentInputSchema>;

const CommentSchema = z.object({
  author: z.string().describe("The name of the comment's author."),
  text: z.string().describe('The text content of the comment.'),
  sentiment: z
    .enum(['Positive', 'Negative', 'Neutral'])
    .describe('The sentiment of the comment.'),
});

const AnalyzeSentimentOutputSchema = z.object({
  overallSentiment: z
    .string()
    .describe(
      'The overall sentiment of the comments (positive, negative, or neutral).'
    ),
  positiveKeywords: z
    .array(z.string())
    .describe('A list of key positive keywords extracted from the comments.'),
  negativeKeywords: z
    .array(z.string())
    .describe('A list of key negative keywords extracted from the comments.'),
  comments: z
    .array(CommentSchema)
    .describe('A list of analyzed comments from the video.'),
});
export type AnalyzeSentimentOutput = z.infer<
  typeof AnalyzeSentimentOutputSchema
>;

// Cache management functions
function getCachedResult(videoId: string): any | null {
  const cached = analysisCache.get(videoId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }
  return null;
}

function setCachedResult(videoId: string, result: any): void {
  analysisCache.set(videoId, {
    result,
    timestamp: Date.now()
  });
}

export async function analyzeSentiment(
  input: AnalyzeSentimentInput
): Promise<AnalyzeSentimentOutput> {
  const videoId = extractVideoId(input.videoUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  // Check cache first
  const cachedResult = getCachedResult(videoId);
  if (cachedResult) {
    console.log('Returning cached result for video:', videoId);
    return cachedResult;
  }

  return analyzeSentimentFlow({videoId});
}

function extractVideoId(url: string): string | null {
  const regex = /(?:v=)([^&?]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

const getCommentsTool = ai.defineTool(
  {
    name: 'getComments',
    description: 'Fetches the top comments for a given YouTube video ID.',
    inputSchema: z.object({
      videoId: z.string().describe('The ID of the YouTube video.'),
    }),
    outputSchema: z.array(
      z.object({
        author: z.string(),
        text: z.string(),
      })
    ),
  },
  async ({videoId}) => {
    return getComments(videoId);
  }
);

const prompt = ai.definePrompt({
  name: 'analyzeSentimentPrompt',
  input: {schema: z.object({ videoComments: z.string()})},
  output: {schema: AnalyzeSentimentOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a YouTube comment analysis expert. Your task is to analyze the provided comments for the video.

Here are the comments:
{{{videoComments}}}

Please perform the following actions:
1. Analyze the fetched comments to determine the overall sentiment (Positive, Negative, or Neutral).
2. Extract a list of 3-5 key positive keywords from the comments.
3. Extract a list of 3-5 key negative keywords from the comments.
4. Select up to 1000 of the most representative comments and analyze their individual sentiment.
5. Populate the output fields accordingly. If no comments are found, return empty arrays for keywords and comments, and a neutral overall sentiment.`,
});

const analyzeSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentFlow',
    inputSchema: z.object({videoId: z.string()}),
    outputSchema: AnalyzeSentimentOutputSchema,
  },
  async ({ videoId }) => {
    console.log('Starting analysis for video:', videoId);
    
    // Stage 1: Fetching comments (25%)
    console.log('Stage 1: Fetching YouTube comments...');
    const videoComments = await getComments(videoId);
    console.log(`Fetched ${videoComments.length} comments`);

    if (videoComments.length === 0) {
      const result = { 
        overallSentiment: 'Neutral', 
        positiveKeywords: [], 
        negativeKeywords: [], 
        comments: [] 
      };
      setCachedResult(videoId, result);
      return result;
    }

    // Stage 2: AI Analysis (75%)
    console.log('Stage 2: Analyzing comments with AI...');
    const {output} = await prompt({ videoComments: JSON.stringify(videoComments) });
    
    const result = output || { 
      overallSentiment: 'Neutral', 
      positiveKeywords: [], 
      negativeKeywords: [], 
      comments: [] 
    };

    // Stage 3: Caching result (100%)
    console.log('Stage 3: Caching result...');
    setCachedResult(videoId, result);
    
    console.log('Analysis completed successfully');
    return result;
  }
);
