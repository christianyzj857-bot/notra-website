import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, displayName } = body;

    // Validate input
    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: 'Email, password, and display name are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured (not using placeholder)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl.includes('placeholder') || 
        supabaseAnonKey.includes('placeholder')) {
      // Mock registration for development (when Supabase not configured)
      return NextResponse.json({
        user: {
          id: `mock-${Date.now()}`,
          email: email,
          username: displayName,
          displayName: displayName,
          plan: 'free',
        },
        session: {
          access_token: `mock-token-${Date.now()}`,
        },
      });
    }

    // Sign up user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          username: displayName.toLowerCase().replace(/\s+/g, '_'),
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Return user data
    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        username: displayName,
        displayName: displayName,
        plan: 'free',
      },
      session: data.session,
    });
  } catch (e: any) {
    console.error('Registration error:', e);
    return NextResponse.json(
      { error: e.message || 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

