/**
 * Development-only API: Force set user plan to "pro"
 * This endpoint allows developers to quickly upgrade their account to pro for testing
 */

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // 🚧 DEVELOPMENT ONLY: Force all users to pro plan
  // This endpoint should be removed or protected in production
  
  return NextResponse.json({
    success: true,
    message: 'User plan set to "pro" for development',
    plan: 'pro',
    note: 'Please refresh the page and clear localStorage if needed. Run: localStorage.setItem("user_plan", "pro") in browser console.',
  });
}

