import {google} from 'googleapis';
import {z} from 'zod';

const youtube = google.youtube('v3');

const CommentSchema = z.object({
  author: z.string(),
  text: z.string(),
});
type Comment = z.infer<typeof CommentSchema>;

export async function getComments(videoId: string): Promise<Comment[]> {
  const apiKey = 'AIzaSyB446sE3RuxjZb7iJHvz_QiY3ltVYB0ZQ8';
  if (!apiKey) {
    // This should not happen given the key is hardcoded, but it's good practice.
    throw new Error('YOUTUBE_API_KEY is not set.');
  }

  try {
    const response = await youtube.commentThreads.list({
      auth: apiKey, // Use 'auth' instead of 'key' for authentication
      part: ['snippet'],
      videoId: videoId,
      maxResults: 20, // Fetch top 20 comment threads
      order: 'relevance',
    });

    const commentThreads = response.data.items;
    if (!commentThreads || commentThreads.length === 0) {
      return [];
    }

    return commentThreads.map(thread => {
      const comment = thread.snippet?.topLevelComment?.snippet;
      return {
        author: comment?.authorDisplayName || 'Unknown',
        text: comment?.textOriginal || '',
      };
    }).filter(c => c.text); // Filter out empty comments

  } catch (error) {
    console.error('Error fetching YouTube comments:', error);
    // Return an empty array to allow the UI to handle it gracefully.
    return [];
  }
}
