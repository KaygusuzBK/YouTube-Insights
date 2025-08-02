'use server';

/**
 * @fileOverview A YouTube sentiment analyzer supporting both video and channel analysis.
 *
 * - analyzeSentiment - A function that handles the sentiment analysis of YouTube video comments.
 * - analyzeChannelSentiment - A function that handles the sentiment analysis of YouTube channel comments.
 * - AnalyzeSentimentInput - The input type for the analyzeSentiment function.
 * - AnalyzeChannelSentimentInput - The input type for the analyzeChannelSentiment function.
 * - AnalyzeSentimentOutput - The return type for the analyzeSentiment function.
 * - AnalyzeChannelSentimentOutput - The return type for the analyzeChannelSentiment function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import {getComments, getChannelComments, extractChannelId} from '@/services/youtube';

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

// Video Analysis Types
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
export type AnalyzeSentimentOutput = z.infer<typeof AnalyzeSentimentOutputSchema>;

// Channel Analysis Types
const AnalyzeChannelSentimentInputSchema = z.object({
  channelUrl: z.string().describe('The URL of the YouTube channel to analyze.'),
});
export type AnalyzeChannelSentimentInput = z.infer<typeof AnalyzeChannelSentimentInputSchema>;

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
function getCachedResult(key: string): any | null {
  const cached = analysisCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }
  return null;
}

function setCachedResult(key: string, result: any): void {
  analysisCache.set(key, {
    result,
    timestamp: Date.now()
  });
}

// Video Analysis Function
export async function analyzeSentiment(
  input: AnalyzeSentimentInput
): Promise<AnalyzeSentimentOutput> {
  const videoId = extractVideoId(input.videoUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube video URL');
  }

  // Check cache first
  const cachedResult = getCachedResult(`video_${videoId}`);
  if (cachedResult) {
    console.log('Returning cached result for video:', videoId);
    return cachedResult;
  }

  return analyzeVideoSentimentFlow({videoId});
}

// Channel Analysis Function
export async function analyzeChannelSentiment(
  input: AnalyzeChannelSentimentInput
): Promise<AnalyzeChannelSentimentOutput> {
  const channelId = extractChannelId(input.channelUrl);
  if (!channelId) {
    throw new Error('Invalid YouTube channel URL');
  }

  // Check cache first
  const cachedResult = getCachedResult(`channel_${channelId}`);
  if (cachedResult) {
    console.log('Returning cached result for channel:', channelId);
    return cachedResult;
  }

  return analyzeChannelSentimentFlow({channelId});
}

// Helper function to extract video ID
function extractVideoId(url: string): string | null {
  const regex = /(?:v=)([^&?]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Video Analysis Tools
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

// Channel Analysis Tools
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

// Video Analysis Prompt
const videoPrompt = ai.definePrompt({
  name: 'analyzeVideoSentimentPrompt',
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

// Channel Analysis Prompt
const channelPrompt = ai.definePrompt({
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

IMPORTANT: Each video object MUST include the "videoId" property. This is a required field.

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
}

CRITICAL RULES:
1. Every video object MUST have a "videoId" field at the top level of the video object
2. The "videoId" field should NEVER be inside the comments array
3. Comments should ONLY have "author", "text", and "sentiment" fields
4. Do NOT put videoId inside individual comments
5. The videoId must be a string and must be present for every video`,
});

// Video Analysis Flow
const analyzeVideoSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeVideoSentimentFlow',
    inputSchema: z.object({videoId: z.string()}),
    outputSchema: AnalyzeSentimentOutputSchema,
  },
  async ({ videoId }) => {
    console.log('Starting video analysis for:', videoId);
    
    // Stage 1: Fetching comments (25%)
    console.log('Stage 1: Fetching YouTube comments...');
    const videoComments = await getComments(videoId);
    console.log(`Fetched ${videoComments.length} comments`);

    if (videoComments.length === 0) {
      const result: AnalyzeSentimentOutput = { 
        overallSentiment: 'Neutral', 
        positiveKeywords: [], 
        negativeKeywords: [], 
        comments: [] 
      };
      setCachedResult(`video_${videoId}`, result);
      return result;
    }

    // Stage 2: AI Analysis with retry mechanism (75%)
    console.log('Stage 2: Analyzing comments with AI...');
    
    let result: AnalyzeSentimentOutput = { 
      overallSentiment: 'Neutral', 
      positiveKeywords: [], 
      negativeKeywords: [], 
      comments: [] 
    };
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const {output} = await videoPrompt({ videoComments: JSON.stringify(videoComments) });
        result = output || { 
          overallSentiment: 'Neutral', 
          positiveKeywords: [], 
          negativeKeywords: [], 
          comments: [] 
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
              overallSentiment: 'Neutral', 
              positiveKeywords: [], 
              negativeKeywords: [], 
              comments: videoComments.map(c => ({
                author: c.author,
                text: c.text,
                sentiment: 'Neutral' as const
              }))
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
    setCachedResult(`video_${videoId}`, result);
    
    console.log('Video analysis completed successfully');
    return result;
  }
);

// Channel Analysis Flow
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
      const result: AnalyzeChannelSentimentOutput = {
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
      setCachedResult(`channel_${channelId}`, result);
      return result;
    }

    // Stage 2: AI Analysis with retry mechanism (75%)
    console.log('Stage 2: Analyzing channel with AI...');
    
    let result: AnalyzeChannelSentimentOutput = {
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
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const {output} = await channelPrompt({ channelData: JSON.stringify(channelData) });
        
        // Validate and fix the output if needed
        let validatedOutput = output;
        if (output && output.videos) {
          validatedOutput = {
            ...output,
            videos: output.videos.map((video: any, index: number) => {
              // Ensure videoId exists and is in the correct place
              const correctVideoId = video.videoId || 
                                   channelData.videos[index]?.video.id || 
                                   `video_${Math.random().toString(36).substr(2, 9)}`;
              
              // Remove videoId from comments if it's incorrectly placed there
              const cleanedComments = video.comments ? video.comments.map((comment: any) => {
                const { videoId, ...cleanComment } = comment;
                return cleanComment;
              }) : [];
              
              return {
                ...video,
                videoId: correctVideoId,
                comments: cleanedComments
              };
            })
          };
        }
        
        result = validatedOutput || {
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
                videoId: v.video.id || `video_${Math.random().toString(36).substr(2, 9)}`,
                videoTitle: v.video.title,
                publishedAt: v.video.publishedAt,
                viewCount: v.video.viewCount,
                commentCount: v.video.commentCount,
                overallSentiment: 'Neutral' as const,
                positiveKeywords: [],
                negativeKeywords: [],
                comments: v.comments.map(c => {
                  // Ensure comment doesn't have videoId property
                  const { videoId, ...cleanComment } = c as any;
                  return {
                    author: cleanComment.author || c.author,
                    text: cleanComment.text || c.text,
                    sentiment: 'Neutral' as const
                  };
                })
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
    setCachedResult(`channel_${channelId}`, result);
    
    console.log('Channel analysis completed successfully');
    return result;
  }
);
