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
    return NextResponse.json(
      { error: e.message || 'Login failed' },
      { status: 500 }
    );
  }
}

