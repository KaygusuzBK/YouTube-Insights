import {google} from 'googleapis';
import {z} from 'zod';

const youtube = google.youtube('v3');
const apiKey = 'AIzaSyB446sE3RuxjZb7iJHvz_QiY3ltVYB0ZQ8';

const CommentSchema = z.object({
  author: z.string(),
  text: z.string(),
});
type Comment = z.infer<typeof CommentSchema>;

const VideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  publishedAt: z.string(),
  viewCount: z.string(),
  commentCount: z.string(),
});
type Video = z.infer<typeof VideoSchema>;

const ChannelSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  subscriberCount: z.string(),
  videoCount: z.string(),
});
type Channel = z.infer<typeof ChannelSchema>;

// Extract video ID from YouTube video URL
export function extractVideoId(url: string): string | null {
  // Remove query parameters and fragments
  const cleanUrl = url.split('?')[0].split('#')[0];
  
  // Handle different video URL formats
  const patterns = [
    // youtube.com/watch?v=VIDEO_ID
    /youtube\.com\/watch\?v=([^&\s]+)/,
    // youtu.be/VIDEO_ID
    /youtu\.be\/([^&\s]+)/,
    // Direct video ID (11 characters)
    /^([A-Za-z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) {
      const extracted = match[1];
      console.log('Extracted video ID:', extracted);
      return extracted;
    }
  }

  console.log('No video ID found in URL:', url);
  return null;
}

// Extract channel ID from various YouTube channel URL formats
export function extractChannelId(url: string): string | null {
  // Remove query parameters and fragments
  const cleanUrl = url.split('?')[0].split('#')[0];
  
  // Handle different channel URL formats
  const patterns = [
    // youtube.com/@username
    /youtube\.com\/@([^\/\s]+)/,
    // youtube.com/channel/UC...
    /youtube\.com\/channel\/([^\/\s]+)/,
    // youtube.com/c/username
    /youtube\.com\/c\/([^\/\s]+)/,
    // youtube.com/user/username
    /youtube\.com\/user\/([^\/\s]+)/,
    // Direct channel ID (UC...)
    /^([UC][A-Za-z0-9_-]{23})$/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) {
      const extracted = match[1];
      console.log('Extracted channel identifier:', extracted);
      return extracted;
    }
  }

  console.log('No channel ID found in URL:', url);
  return null;
}

// Get channel info by ID or username
export async function getChannelInfo(channelId: string): Promise<Channel | null> {
  try {
    console.log('Fetching channel info for:', channelId);
    
    // First try with the ID as-is (might be a channel ID)
    let response = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      id: [channelId],
      key: apiKey,
    });

    let channel = response.data.items?.[0];
    
    // If not found, try searching by username (for @username format)
    if (!channel && channelId.startsWith('@')) {
      console.log('Trying to find channel by username:', channelId);
      const searchResponse = await youtube.search.list({
        part: ['snippet'],
        q: channelId,
        type: ['channel'],
        maxResults: 1,
        key: apiKey,
      });
      
      const searchResult = searchResponse.data.items?.[0];
      if (searchResult?.id?.channelId) {
        // Now get full channel info with the found channel ID
        const channelResponse = await youtube.channels.list({
          part: ['snippet', 'statistics'],
          id: [searchResult.id.channelId],
          key: apiKey,
        });
        channel = channelResponse.data.items?.[0];
      }
    }

    if (!channel) {
      console.log('Channel not found for ID:', channelId);
      return null;
    }

    console.log('Found channel:', channel.snippet?.title);
    return {
      id: channel.id!,
      title: channel.snippet?.title || 'Unknown Channel',
      description: channel.snippet?.description || '',
      subscriberCount: channel.statistics?.subscriberCount || '0',
      videoCount: channel.statistics?.videoCount || '0',
    };
  } catch (error) {
    console.error('Error fetching channel info:', error);
    return null;
  }
}

// Get all videos from a channel
export async function getChannelVideos(channelId: string, maxResults: number = 50): Promise<Video[]> {
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      channelId: channelId,
      type: ['video'],
      order: 'date', // Get latest videos first
      maxResults: maxResults,
      key: apiKey,
    });

    const videos = response.data.items;
    if (!videos || videos.length === 0) {
      return [];
    }

    // Get detailed video information including statistics
    const videoIds = videos.map(video => video.id?.videoId).filter(Boolean) as string[];
    const videoDetails = await getVideoDetails(videoIds);

    return videos.map(video => {
      const videoId = video.id?.videoId;
      const details = videoDetails.find(v => v.id === videoId);
      
      return {
        id: videoId || '',
        title: video.snippet?.title || 'Unknown Title',
        publishedAt: video.snippet?.publishedAt || '',
        viewCount: details?.viewCount || '0',
        commentCount: details?.commentCount || '0',
      };
    }).filter(video => video.id && parseInt(video.commentCount) > 0); // Only videos with comments

  } catch (error) {
    console.error('Error fetching channel videos:', error);
    return [];
  }
}

// Get detailed video information
async function getVideoDetails(videoIds: string[]): Promise<Array<{id: string, viewCount: string, commentCount: string}>> {
  try {
    const response = await youtube.videos.list({
      part: ['statistics'],
      id: videoIds,
      key: apiKey,
    });

    const videos = response.data.items;
    if (!videos) return [];

    return videos.map(video => ({
      id: video.id!,
      viewCount: video.statistics?.viewCount || '0',
      commentCount: video.statistics?.commentCount || '0',
    }));
  } catch (error) {
    console.error('Error fetching video details:', error);
    return [];
  }
}

// Get comments for a specific video
export async function getComments(videoId: string): Promise<Comment[]> {
  try {
    const response = await youtube.commentThreads.list({
      part: ['snippet'],
      videoId: videoId,
      maxResults: 100, // Reduced to avoid rate limits
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

  } catch (error: any) {
    // Check if comments are disabled
    if (error.message?.includes('disabled comments') || error.message?.includes('403')) {
      console.log(`Comments are disabled for video: ${videoId}`);
      return [];
    }
    
    console.error('Error fetching YouTube comments:', error);
    return [];
  }
}

// Get all comments from all videos in a channel
export async function getChannelComments(channelId: string): Promise<{
  channel: Channel;
  videos: Array<{
    video: Video;
    comments: Comment[];
  }>;
}> {
  console.log('Fetching channel info...');
  const channel = await getChannelInfo(channelId);
  if (!channel) {
    throw new Error('Channel not found');
  }

  console.log('Fetching channel videos...');
  const videos = await getChannelVideos(channelId, 20); // Limit to 20 videos for performance

  console.log(`Found ${videos.length} videos with comments`);

  const videosWithComments = [];
  for (const video of videos) {
    console.log(`Fetching comments for video: ${video.title}`);
    const comments = await getComments(video.id);
    
    if (comments.length > 0) {
      videosWithComments.push({
        video,
        comments,
      });
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return {
    channel,
    videos: videosWithComments,
  };
}
