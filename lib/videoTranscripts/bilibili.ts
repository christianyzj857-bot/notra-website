/**
 * Bilibili 视频转录获取
 * 使用第三方 API 服务（如 OneAPI）
 */

export async function getBilibiliTranscript(videoId: string): Promise<string> {
  const apiKey = process.env.BILIBILI_API_KEY;
  const apiUrl = process.env.BILIBILI_API_URL || 'https://api.oneapi.com/bilibili';
  
  if (!apiKey) {
    throw new Error('Bilibili API key not configured. Please set BILIBILI_API_KEY in environment variables.');
  }
  
  try {
    // 获取视频信息（包含字幕）
    const response = await fetch(`${apiUrl}/video/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `Bilibili API error: ${response.status} ${response.statusText}`
      );
    }
    
    const data = await response.json();
    
    // 尝试获取字幕/转录
    if (data.subtitle && data.subtitle.subtitles && data.subtitle.subtitles.length > 0) {
      // 如果有字幕，提取文本
      const subtitleText = data.subtitle.subtitles
        .map((sub: any) => sub.content || '')
        .join(' ')
        .trim();
      
      if (subtitleText) {
        return subtitleText;
      }
    }
    
    // 如果没有字幕，尝试使用描述
    if (data.description) {
      return data.description;
    }
    
    // 如果都没有，使用标题
    if (data.title) {
      return data.title;
    }
    
    throw new Error('No transcript or content available for this Bilibili video');
  } catch (error: any) {
    console.error('Bilibili API error:', error);
    throw new Error(`Failed to get Bilibili transcript: ${error.message || 'Unknown error'}`);
  }
}

export async function getBilibiliMetadata(videoId: string): Promise<{
  title: string;
  description: string;
}> {
  const apiKey = process.env.BILIBILI_API_KEY;
  const apiUrl = process.env.BILIBILI_API_URL || 'https://api.oneapi.com/bilibili';
  
  if (!apiKey) {
    return {
      title: `Bilibili Video ${videoId}`,
      description: '',
    };
  }
  
  try {
    const response = await fetch(`${apiUrl}/video/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Bilibili metadata');
    }
    
    const data = await response.json();
    
    return {
      title: data.title || `Bilibili Video ${videoId}`,
      description: data.description || '',
    };
  } catch (error: any) {
    console.error('Bilibili metadata error:', error);
    return {
      title: `Bilibili Video ${videoId}`,
      description: '',
    };
  }
}

