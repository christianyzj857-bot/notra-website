/**
 * YouTube 视频转录获取
 * 优先使用免费库，失败时使用 YouTube Data API v3
 */

export async function getYouTubeTranscript(videoId: string): Promise<string> {
  try {
    // 方法 1: 使用 youtube-transcript 库（免费，无需 API key）
    // 这个库可以直接获取 YouTube 的自动生成字幕
    const { YouTubeTranscript } = await import('youtube-transcript');
    
    const transcriptItems = await YouTubeTranscript.fetchTranscript(videoId, {
      lang: 'en', // 优先英文，如果没有会自动选择
    });
    
    const transcript = transcriptItems
      .map(item => item.text)
      .join(' ')
      .trim();
    
    if (!transcript || transcript.length === 0) {
      throw new Error('No transcript available for this video');
    }
    
    return transcript;
  } catch (error: any) {
    console.error('YouTube transcript fetch error:', error);
    
    // 方法 2: 如果方法 1 失败，尝试使用 YouTube Data API v3 获取字幕
    // 注意：这需要 API key，但通常方法 1 就足够了
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        return await getYouTubeTranscriptViaAPI(videoId, apiKey);
      } catch (apiError) {
        console.error('YouTube API transcript error:', apiError);
      }
    }
    
    throw new Error(`Failed to get YouTube transcript: ${error.message || 'Unknown error'}`);
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

