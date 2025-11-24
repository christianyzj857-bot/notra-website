// Helper function to get current user plan
// 🚧 Currently returns hardcoded "free"
// In the future, this should read from auth session / token / database

import type { UserPlan } from "@/config/usageLimits";

export function getCurrentUserPlan(): UserPlan {
  // 🚧 Now hardcoded as "free"
  // When real auth / billing is integrated, read from session / token / DB
  
  // ⚠️ WARNING: This function uses window/localStorage which only works in browser/client-side
  // For server-side (Edge runtime), always return "free" as default
  // Optional: Check localStorage for testing (client-side only)
  if (typeof window !== 'undefined') {
    const plan = localStorage.getItem('user_plan') as UserPlan | null;
    if (plan === 'free' || plan === 'pro') {
      return plan;
    }
  }
  
  // Default to "free" for server-side
  return "free";
}
