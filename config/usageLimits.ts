// User plan types and usage limits configuration

export type UserPlan = "free" | "pro";

export interface UsageLimitConfig {
  maxFileSessionsPerMonth: number;   // 每月最多解析多少个文件
  maxAudioSessionsPerMonth: number;  // 每月最多录音/音频转文字多少次
  maxVideoSessionsPerMonth: number;  // 每月最多解析多少个视频
  maxChatMessagesPerDay: number;     // 每日最多聊天消息数量
  maxPagesPerFile: number;           // 单个文件最大页数（或简单模拟一个大小上限）
  maxAudioMinutesPerSession: number; // 单次音频最长分钟数（可大致估算）
  rateLimitQPS?: number;             // Rate limit: queries per second (optional)
  rateLimitQuota?: number;           // Rate limit: daily quota (optional)
}

export const USAGE_LIMITS: Record<UserPlan, UsageLimitConfig> = {
  free: {
    maxFileSessionsPerMonth: 15,
    maxAudioSessionsPerMonth: 10,
    maxVideoSessionsPerMonth: 3, // Free plan: 3 videos per month
    maxChatMessagesPerDay: 50,
    maxPagesPerFile: 20,
    maxAudioMinutesPerSession: 5,
    rateLimitQPS: 5, // 5 requests per second
    rateLimitQuota: 1000, // 1000 requests per day
  },
  pro: {
    maxFileSessionsPerMonth: 9999,
    maxAudioSessionsPerMonth: 9999,
    maxVideoSessionsPerMonth: 9999,
    maxChatMessagesPerDay: 9999,
    maxPagesPerFile: 200,
    maxAudioMinutesPerSession: 60,
    rateLimitQPS: 20, // 20 requests per second
    rateLimitQuota: 10000, // 10000 requests per day
  },
};
