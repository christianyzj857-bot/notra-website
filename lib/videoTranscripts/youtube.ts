/**
 * YouTube 视频转录获取
 * 优先使用免费库，失败时使用 YouTube Data API v3
 */

import { transcribeYouTubeVideoFallback } from '../video-processor';

/**
 * Get YouTube transcript with fallback to Whisper transcription
 * Priority: Official subtitles (free) → Whisper transcription (cost: $0.006/min)
 */
export async function getYouTubeTranscript(
  videoId: string,
  videoUrl?: string,
  useFallback: boolean = true
): Promise<string> {
  try {
    // Priority 1: Try official subtitles (free, 0 cost)
    const { YoutubeTranscript } = await import('youtube-transcript');
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'en',
    });
    const transcript = transcriptItems.map((item: any) => item.text).join(' ').trim();
    if (transcript && transcript.length > 0) {
      console.log('[YouTube] Using official subtitles (free)');
      return transcript;
    }
    throw new Error('No official subtitles available');
  } catch (error: any) {
    console.error('[YouTube] Official subtitle fetch failed:', error.message);
    
    // Priority 2: Fallback to YouTube Data API v3 if API key is available
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        const apiTranscript = await getYouTubeTranscriptViaAPI(videoId, apiKey);
        if (apiTranscript && apiTranscript.trim().length > 0) {
          console.log('[YouTube] Using YouTube Data API v3 transcript');
          return apiTranscript;
        }
      } catch (apiError) {
        console.error('[YouTube] YouTube Data API v3 transcript error:', apiError);
      }
    }
    
    // Priority 3: Fallback to Whisper transcription (extract audio → transcribe)
    if (useFallback && videoUrl) {
      console.log('[YouTube] Falling back to Whisper transcription (cost: $0.006/min)');
      try {
        return await transcribeYouTubeVideoFallback(videoUrl);
      } catch (whisperError: any) {
        console.error('[YouTube] Whisper transcription failed:', whisperError);
        throw new Error(
          `Failed to get transcript: Official subtitles unavailable and Whisper transcription failed. ` +
          `Please ensure the video has captions/subtitles enabled. Error: ${whisperError.message}`
        );
      }
    }
    
    throw new Error(
      `Failed to get YouTube transcript: ${error.message || 'Unknown error'}. ` +
      `Please ensure the video has captions/subtitles enabled.`
    );
  }
}

async function getYouTubeTranscriptViaAPI(videoId: string, apiKey: string): Promise<string> {
  // 获取视频的字幕轨道
  const captionsResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${apiKey}&part=snippet`
  );
  
  if (!captionsResponse.ok) {
    throw new Error('Failed to fetch captions list');
  }
  
  const captionsData = await captionsResponse.json();
  
  if (!captionsData.items || captionsData.items.length === 0) {
    throw new Error('No captions available for this video');
  }
  
  // 获取第一个可用的字幕（优先英文）
  const caption = captionsData.items.find((item: any) => 
    item.snippet.language === 'en'
  ) || captionsData.items[0];
  
  const captionId = caption.id;
  
  // 下载字幕内容
  const transcriptResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${apiKey}`,
    {
      headers: {
        'Accept': 'text/plain',
      },
    }
  );
  
  if (!transcriptResponse.ok) {
    throw new Error('Failed to download transcript');
  }
  
  const transcript = await transcriptResponse.text();
  return transcript;
}

export async function getYouTubeMetadata(videoId: string): Promise<{
  title: string;
  description: string;
}> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    // 如果没有 API key，返回基本信息
    return {
      title: `YouTube Video ${videoId}`,
      description: '',
    };
  }
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch video metadata');
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }
    
    return {
      title: data.items[0].snippet.title,
      description: data.items[0].snippet.description,
    };
  } catch (error: any) {
    console.error('YouTube metadata error:', error);
    return {
      title: `YouTube Video ${videoId}`,
      description: '',
    };
  }
}

