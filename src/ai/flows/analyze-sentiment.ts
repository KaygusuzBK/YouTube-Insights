'use server';

/**
 * @fileOverview A YouTube channel sentiment analyzer using real comments from all videos.
 *
 * - analyzeChannelSentiment - A function that handles the sentiment analysis of YouTube channel comments.
 * - AnalyzeChannelSentimentInput - The input type for the analyzeChannelSentiment function.
 * - AnalyzeChannelSentimentOutput - The return type for the analyzeChannelSentiment function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import {getChannelComments, extractChannelId} from '@/services/youtube';

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

const AnalyzeChannelSentimentInputSchema = z.object({
  channelUrl: z.string().describe('The URL of the YouTube channel to analyze.'),
});
export type AnalyzeChannelSentimentInput = z.infer<typeof AnalyzeChannelSentimentInputSchema>;

const CommentSchema = z.object({
  author: z.string().describe("The name of the comment's author."),
  text: z.string().describe('The text content of the comment.'),
  sentiment: z
    .enum(['Positive', 'Negative', 'Neutral'])
    .describe('The sentiment of the comment.'),
});

const VideoAnalysisSchema = z.object({
  videoId: z.string(),
  videoTitle: z.string(),
  publishedAt: z.string(),
  viewCount: z.string(),
  commentCount: z.string(),
  overallSentiment: z.string(),
  positiveKeywords: z.array(z.string()),
  negativeKeywords: z.array(z.string()),
  comments: z.array(CommentSchema),
});

const ChannelAnalysisSchema = z.object({
  channelId: z.string(),
  channelTitle: z.string(),
  subscriberCount: z.string(),
  videoCount: z.string(),
  overallSentiment: z.string(),
  positiveKeywords: z.array(z.string()),
  negativeKeywords: z.array(z.string()),
  videos: z.array(VideoAnalysisSchema),
  totalComments: z.number(),
  totalVideos: z.number(),
});
export type AnalyzeChannelSentimentOutput = z.infer<typeof ChannelAnalysisSchema>;

// Cache management functions
function getCachedResult(channelId: string): any | null {
  const cached = analysisCache.get(channelId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }
  return null;
}

function setCachedResult(channelId: string, result: any): void {
  analysisCache.set(channelId, {
    result,
    timestamp: Date.now()
  });
}

export async function analyzeChannelSentiment(
  input: AnalyzeChannelSentimentInput
): Promise<AnalyzeChannelSentimentOutput> {
  const channelId = extractChannelId(input.channelUrl);
  if (!channelId) {
    throw new Error('Invalid YouTube channel URL');
  }

  // Check cache first
  const cachedResult = getCachedResult(channelId);
  if (cachedResult) {
    console.log('Returning cached result for channel:', channelId);
    return cachedResult;
  }

  return analyzeChannelSentimentFlow({channelId});
}

const getChannelCommentsTool = ai.defineTool(
  {
    name: 'getChannelComments',
    description: 'Fetches all comments from all videos in a YouTube channel.',
    inputSchema: z.object({
      channelId: z.string().describe('The ID of the YouTube channel.'),
    }),
    outputSchema: z.object({
      channel: z.object({
        id: z.string(),
        title: z.string(),
        subscriberCount: z.string(),
        videoCount: z.string(),
      }),
      videos: z.array(z.object({
        video: z.object({
          id: z.string(),
          title: z.string(),
          publishedAt: z.string(),
          viewCount: z.string(),
          commentCount: z.string(),
        }),
        comments: z.array(z.object({
          author: z.string(),
          text: z.string(),
        })),
      })),
    }),
  },
  async ({channelId}) => {
    return getChannelComments(channelId);
  }
);

const prompt = ai.definePrompt({
  name: 'analyzeChannelSentimentPrompt',
  input: {schema: z.object({ channelData: z.string()})},
  output: {schema: ChannelAnalysisSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a YouTube channel analysis expert. Your task is to analyze the provided channel data including all videos and their comments.

Here is the channel data:
{{{channelData}}}

Please perform the following actions:
1. Analyze the overall channel sentiment based on all comments from all videos.
2. Extract a list of 5-8 key positive keywords from all comments.
3. Extract a list of 5-8 key negative keywords from all comments.
4. For each video, analyze its individual sentiment and extract keywords.
5. Provide a comprehensive analysis of the channel's audience engagement and sentiment trends.

Format your response as JSON with the following structure:
{
  "channelId": "channel_id",
  "channelTitle": "Channel Name",
  "subscriberCount": "subscriber_count",
  "videoCount": "video_count",
  "overallSentiment": "Positive/Negative/Neutral",
  "positiveKeywords": ["keyword1", "keyword2", ...],
  "negativeKeywords": ["keyword1", "keyword2", ...],
  "videos": [
    {
      "videoId": "video_id",
      "videoTitle": "Video Title",
      "publishedAt": "publish_date",
      "viewCount": "view_count",
      "commentCount": "comment_count",
      "overallSentiment": "Positive/Negative/Neutral",
      "positiveKeywords": ["keyword1", "keyword2"],
      "negativeKeywords": ["keyword1", "keyword2"],
      "comments": [
        {
          "author": "author_name",
          "text": "comment_text",
          "sentiment": "Positive/Negative/Neutral"
        }
      ]
    }
  ],
  "totalComments": total_comment_count,
  "totalVideos": total_video_count
}`,
});

const analyzeChannelSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeChannelSentimentFlow',
    inputSchema: z.object({channelId: z.string()}),
    outputSchema: ChannelAnalysisSchema,
  },
  async ({ channelId }) => {
    console.log('Starting channel analysis for:', channelId);
    
    // Stage 1: Fetching channel data (25%)
    console.log('Stage 1: Fetching channel data...');
    const channelData = await getChannelComments(channelId);
    console.log(`Fetched data for ${channelData.videos.length} videos`);

    if (channelData.videos.length === 0) {
      const result = {
        channelId: channelData.channel.id,
        channelTitle: channelData.channel.title,
        subscriberCount: channelData.channel.subscriberCount,
        videoCount: channelData.channel.videoCount,
        overallSentiment: 'Neutral',
        positiveKeywords: [],
        negativeKeywords: [],
        videos: [],
        totalComments: 0,
        totalVideos: 0,
      };
      setCachedResult(channelId, result);
      return result;
    }

    // Stage 2: AI Analysis with retry mechanism (75%)
    console.log('Stage 2: Analyzing channel with AI...');
    
    let result;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const {output} = await prompt({ channelData: JSON.stringify(channelData) });
        result = output || {
          channelId: channelData.channel.id,
          channelTitle: channelData.channel.title,
          subscriberCount: channelData.channel.subscriberCount,
          videoCount: channelData.channel.videoCount,
          overallSentiment: 'Neutral',
          positiveKeywords: [],
          negativeKeywords: [],
          videos: [],
          totalComments: 0,
          totalVideos: 0,
        };
        break; // Success, exit retry loop
      } catch (error: any) {
        retryCount++;
        console.log(`AI Analysis attempt ${retryCount} failed:`, error.message);
        
        if (error.message?.includes('503') || error.message?.includes('overloaded')) {
          if (retryCount < maxRetries) {
            console.log(`Retrying in ${retryCount * 2} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryCount * 2000)); // Exponential backoff
            continue;
          } else {
            console.log('Max retries reached, returning neutral result');
            result = {
              channelId: channelData.channel.id,
              channelTitle: channelData.channel.title,
              subscriberCount: channelData.channel.subscriberCount,
              videoCount: channelData.channel.videoCount,
              overallSentiment: 'Neutral',
              positiveKeywords: [],
              negativeKeywords: [],
              videos: channelData.videos.map(v => ({
                videoId: v.video.id,
                videoTitle: v.video.title,
                publishedAt: v.video.publishedAt,
                viewCount: v.video.viewCount,
                commentCount: v.video.commentCount,
                overallSentiment: 'Neutral' as const,
                positiveKeywords: [],
                negativeKeywords: [],
                comments: v.comments.map(c => ({
                  author: c.author,
                  text: c.text,
                  sentiment: 'Neutral' as const
                }))
              })),
              totalComments: channelData.videos.reduce((sum, v) => sum + v.comments.length, 0),
              totalVideos: channelData.videos.length,
            };
          }
        } else {
          // Non-retryable error, throw it
          throw error;
        }
      }
    }

    // Stage 3: Caching result (100%)
    console.log('Stage 3: Caching result...');
    setCachedResult(channelId, result);
    
    console.log('Channel analysis completed successfully');
    return result;
  }
);
