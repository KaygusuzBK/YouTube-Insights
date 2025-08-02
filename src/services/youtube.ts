import {google} from 'googleapis';
import {z} from 'zod';

const youtube = google.youtube('v3');
const apiKey = 'AIzaSyB446sE3RuxjZb7iJHvz_QiY3ltVYB0ZQ8';

const CommentSchema = z.object({
  author: z.string(),
  text: z.string(),
});
type Comment = z.infer<typeof CommentSchema>;

export async function getComments(videoId: string): Promise<Comment[]> {

  try {
    const response = await youtube.commentThreads.list({
      part: ['snippet'],
      videoId: videoId,
      maxResults: 20, // Fetch top 20 comment threads
      order: 'relevance',
      key: apiKey,
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