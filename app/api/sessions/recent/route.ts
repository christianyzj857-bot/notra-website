import { NextResponse } from "next/server";
import { listRecentSessions } from "@/lib/db";

// Use Node.js runtime for file system operations
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const userId = searchParams.get('userId') || undefined;

    const sessions = await listRecentSessions(limit, userId);

    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error('Recent sessions fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recent sessions' },
      { status: 500 }
    );
  }
}

