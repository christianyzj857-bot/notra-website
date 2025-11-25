// Helper function to get current user plan
// 🚧 Currently returns hardcoded "pro" for development
// In the future, this should read from auth session / token / database

import type { UserPlan } from "@/config/usageLimits";

export function getCurrentUserPlan(): UserPlan {
  // 🚧 DEVELOPMENT MODE: Default to "pro" for testing
  // Set DEV_DEFAULT_PLAN=free in environment to use free plan, or DEV_DEFAULT_PLAN=pro for pro
  // When real auth / billing is integrated, read from session / token / DB
  
  // Check environment variable first (for server-side)
  const envPlan = process.env.DEV_DEFAULT_PLAN as UserPlan | undefined;
  if (envPlan === 'free' || envPlan === 'pro') {
    return envPlan;
  }
  
  // Check localStorage for client-side (browser)
  if (typeof window !== 'undefined') {
    const plan = localStorage.getItem('user_plan') as UserPlan | null;
    if (plan === 'free' || plan === 'pro') {
      return plan;
    }
  }
  
  // Default to "pro" for development/testing (allows full feature access)
  // Change this to "free" when ready for production with real auth
  return "pro";
}
