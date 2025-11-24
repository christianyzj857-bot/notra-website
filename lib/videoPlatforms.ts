export type VideoPlatform = 'youtube' | 'bilibili' | 'douyin' | 'unknown';

export function detectVideoPlatform(url: string): VideoPlatform {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (lowerUrl.includes('bilibili.com')) {
    return 'bilibili';
  }
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
        // bilibili.com/video/BVxxxxx
        const bvMatch = url.match(/\/video\/(BV[a-zA-Z0-9]+)/);
        if (bvMatch) {
          return bvMatch[1];
        }
        // bilibili.com/video/avxxxxx
        const avMatch = url.match(/\/video\/av(\d+)/);
        if (avMatch) {
          return `av${avMatch[1]}`;
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

