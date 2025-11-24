import { detectVideoPlatform, extractVideoId } from '../videoPlatforms';
import { getYouTubeTranscript, getYouTubeMetadata } from './youtube';
import { getBilibiliTranscript, getBilibiliMetadata } from './bilibili';
import OpenAI from 'openai';

/**
 * 获取视频转录文本
 * 支持 YouTube 和 Bilibili
 */
export async function getVideoTranscript(url: string): Promise<{
  transcript: string;
  title: string;
  description: string;
}> {
  const platform = detectVideoPlatform(url);
  const videoId = extractVideoId(url, platform);
  
  if (!videoId) {
    throw new Error('Invalid video URL or unable to extract video ID');
  }
  
  if (platform === 'unknown') {
    throw new Error('Unsupported video platform. Currently supported: YouTube, Bilibili');
  }
  
  try {
    let transcript: string;
    let title: string;
    let description: string;
    
    switch (platform) {
      case 'youtube':
        transcript = await getYouTubeTranscript(videoId);
        const youtubeMeta = await getYouTubeMetadata(videoId);
        title = youtubeMeta.title;
        description = youtubeMeta.description;
        break;
        
      case 'bilibili':
        transcript = await getBilibiliTranscript(videoId);
        const bilibiliMeta = await getBilibiliMetadata(videoId);
        title = bilibiliMeta.title;
        description = bilibiliMeta.description;
        break;
        
      default:
        throw new Error(`Platform ${platform} not yet implemented`);
    }
    
    // 如果转录为空，尝试使用描述
    if (!transcript || transcript.trim().length === 0) {
      if (description && description.trim().length > 0) {
        transcript = description;
      } else {
        throw new Error('No transcript or description available for this video');
      }
    }
    
    return {
      transcript: transcript.trim(),
      title: title || `Video ${videoId}`,
      description: description || '',
    };
  } catch (error: any) {
    console.error(`Video transcript error (${platform}):`, error);
    
    // 降级方案：如果平台 API 失败，可以尝试使用 Whisper API
    // 但这需要下载视频，成本较高，暂时不实现
    throw new Error(
      `Failed to get transcript from ${platform}: ${error.message || 'Unknown error'}. ` +
      `Please ensure the video has captions/subtitles enabled.`
    );
  }
}

/**
 * 使用 Whisper API 进行语音转文字（降级方案）
 * 成本: $0.006/分钟
 */
export async function transcribeWithWhisper(audioUrl: string): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured for Whisper transcription');
  }
  
  const openai = new OpenAI({ apiKey: openaiApiKey });
  
  try {
    // 注意：这需要先下载视频并提取音频
    // 实现较复杂，暂时不实现
    throw new Error('Whisper transcription not yet implemented. Please use videos with captions.');
  } catch (error: any) {
    throw new Error(`Whisper transcription failed: ${error.message}`);
  }
}

