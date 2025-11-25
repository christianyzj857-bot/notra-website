import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured (not using placeholder)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl.includes('placeholder') || 
        supabaseAnonKey.includes('placeholder')) {
      // Mock login for development (when Supabase not configured)
      // 🚧 DEVELOPMENT: All users default to "pro" for testing
      return NextResponse.json({
        user: {
          id: `mock-${Date.now()}`,
          email: email,
          username: email.split('@')[0],
          displayName: email.split('@')[0],
          plan: 'pro', // Development: default to pro
        },
        session: {
          access_token: `mock-token-${Date.now()}`,
        },
      });
    }

    // Sign in user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Get user metadata
    const displayName = data.user?.user_metadata?.display_name || 
                       data.user?.email?.split('@')[0] || 
                       'User';

    // Return user data
    // 🚧 DEVELOPMENT: All users default to "pro" for testing
    // In production, read plan from user metadata or database
    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        username: displayName,
        displayName: displayName,
        plan: 'pro', // Development: default to pro for all users
      },
      session: data.session,
    });
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json(
      { error: e.message || 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

