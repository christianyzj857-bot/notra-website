export type VideoPlatform = 'youtube' | 'bilibili' | 'douyin' | 'unknown';

export function detectVideoPlatform(url: string): VideoPlatform {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }
  // 中国 B 站（Bilibili）识别
  // 支持: bilibili.com, www.bilibili.com, m.bilibili.com 等所有子域名
  if (lowerUrl.includes('bilibili.com')) {
    return 'bilibili';
  }
  // 抖音（中国版）
  if (lowerUrl.includes('douyin.com') || lowerUrl.includes('iesdouyin.com')) {
    return 'douyin';
  }
  return 'unknown';
}

export function extractVideoId(url: string, platform: VideoPlatform): string | null {
  try {
    const urlObj = new URL(url);
    
    switch (platform) {
      case 'youtube':
        // youtube.com/watch?v=VIDEO_ID
        if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
          return urlObj.searchParams.get('v');
        }
        // youtu.be/VIDEO_ID
        if (urlObj.hostname === 'youtu.be') {
          return urlObj.pathname.slice(1);
        }
        // youtube.com/embed/VIDEO_ID
        if (urlObj.pathname.startsWith('/embed/')) {
          return urlObj.pathname.slice(7);
        }
        break;
        
      case 'bilibili':
        // 中国 B 站视频 ID 提取
        // 支持格式:
        // - bilibili.com/video/BVxxxxx
        // - www.bilibili.com/video/BVxxxxx
        // - m.bilibili.com/video/BVxxxxx
        // - bilibili.com/video/avxxxxx (旧格式)
        
        // BV 号格式（新格式，优先）
        const bvMatch = url.match(/\/video\/(BV[a-zA-Z0-9]+)/i);
        if (bvMatch) {
          return bvMatch[1].toUpperCase(); // 统一转为大写
        }
        
        // av 号格式（旧格式）
        const avMatch = url.match(/\/video\/av(\d+)/i);
        if (avMatch) {
          return `av${avMatch[1]}`;
        }
        
        // 短链接格式: b23.tv/xxxxx (需要解析重定向，暂时不支持)
        // 如果以上都不匹配，尝试从 URL 路径中提取
        const pathMatch = url.match(/bilibili\.com\/video\/([^\/\?]+)/i);
        if (pathMatch) {
          const id = pathMatch[1];
          // 如果是 BV 或 av 格式，返回
          if (id.toUpperCase().startsWith('BV') || id.toLowerCase().startsWith('av')) {
            return id;
          }
        }
        break;
        
      case 'douyin':
        // douyin.com/video/xxxxx
        const douyinMatch = url.match(/\/video\/(\d+)/);
        if (douyinMatch) {
          return douyinMatch[1];
        }
        break;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
}

