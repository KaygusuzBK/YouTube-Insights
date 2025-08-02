'use server';

/**
 * @fileOverview A YouTube comment sentiment analyzer.
 *
 * - analyzeSentiment - A function that handles the sentiment analysis of YouTube comments.
 * - AnalyzeSentimentInput - The input type for the analyzeSentiment function.
 * - AnalyzeSentimentOutput - The return type for the analyzeSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSentimentInputSchema = z.object({
  videoUrl: z.string().describe('The URL of the YouTube video to analyze.'),
});
export type AnalyzeSentimentInput = z.infer<typeof AnalyzeSentimentInputSchema>;

const CommentSchema = z.object({
  author: z.string().describe("The name of the comment's author."),
  text: z.string().describe('The text content of the comment.'),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral']).describe('The sentiment of the comment.'),
});

const AnalyzeSentimentOutputSchema = z.object({
  overallSentiment: z
    .string()
    .describe('The overall sentiment of the comments (positive, negative, or neutral).'),
  positiveKeywords: z
    .array(z.string())
    .describe('A list of key positive keywords extracted from the comments.'),
  negativeKeywords: z
    .array(z.string())
    .describe('A list of key negative keywords extracted from the comments.'),
  comments: z.array(CommentSchema).describe('A list of generated example comments with their individual analysis.'),
});
export type AnalyzeSentimentOutput = z.infer<typeof AnalyzeSentimentOutputSchema>;

export async function analyzeSentiment(input: AnalyzeSentimentInput): Promise<AnalyzeSentimentOutput> {
  return analyzeSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSentimentPrompt',
  input: {schema: AnalyzeSentimentInputSchema},
  output: {schema: AnalyzeSentimentOutputSchema},
  prompt: `You are a YouTube comment analysis expert. Your task is to analyze a video based on its URL, infer its topic, and generate a realistic sentiment analysis as if you had access to its comments.

Video URL: {{{videoUrl}}}

Based on the likely topic of this video, please perform the following actions:
1.  Determine the overall sentiment (Positive, Negative, or Neutral).
2.  Extract a list of 3-5 key positive keywords.
3.  Extract a list of 3-5 key negative keywords.
4.  Generate 4 realistic, sample comments that reflect a mix of sentiments (positive, negative, neutral). For each comment, provide a fictional author, the comment text, and its individual sentiment.
5.  Make sure the generated comments are in the same language as the likely language of the video's title and content.
6.  Populate the output fields accordingly.`,
});

const analyzeSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentFlow',
    inputSchema: AnalyzeSentimentInputSchema,
    outputSchema: AnalyzeSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
