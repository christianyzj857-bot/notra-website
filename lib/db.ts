// Simple in-memory database for Notra sessions
// This is a simplified implementation for cost-saving strategy
// In production, this should be replaced with a real database (PostgreSQL, MongoDB, etc.)

import { NotraSession, SessionType } from '@/types/notra';
import { createHash } from 'crypto';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

// In-memory storage (fallback if file system fails)
const inMemorySessions: Map<string, NotraSession> = new Map();

// File-based storage path
const DB_DIR = path.join(process.cwd(), '.notra-data');
const SESSIONS_FILE = path.join(DB_DIR, 'sessions.json');

// Ensure directory exists
async function ensureDbDir() {
  try {
    await mkdir(DB_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore
  }
}

// Load sessions from file
async function loadSessions(): Promise<Map<string, NotraSession>> {
  try {
    await ensureDbDir();
    const data = await readFile(SESSIONS_FILE, 'utf-8');
    const sessions = JSON.parse(data) as NotraSession[];
    const map = new Map<string, NotraSession>();
    sessions.forEach(session => {
      map.set(session.id, session);
    });
    return map;
  } catch (error) {
    // File doesn't exist or error reading, return empty map
    return new Map();
  }
}

// Save sessions to file
async function saveSessions(sessions: Map<string, NotraSession>) {
  try {
    await ensureDbDir();
    const sessionsArray = Array.from(sessions.values());
    await writeFile(SESSIONS_FILE, JSON.stringify(sessionsArray, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save sessions to file:', error);
    // Fallback to in-memory only
  }
}

// Generate content hash for deduplication
export function generateContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

// Find session by content hash (for deduplication)
export async function findSessionByHash(hash: string): Promise<NotraSession | null> {
  const sessions = await loadSessions();
  
  // Also check in-memory
  for (const session of inMemorySessions.values()) {
    if (session.contentHash === hash) {
      return session;
    }
  }
  
  // Check file-based storage
  for (const session of sessions.values()) {
    if (session.contentHash === hash) {
      return session;
    }
  }
  
  return null;
}

// Create a new session
export async function createSession(
  data: Omit<NotraSession, 'id' | 'createdAt'>
): Promise<NotraSession> {
  const sessions = await loadSessions();
  
  const newSession: NotraSession = {
    ...data,
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  
  // Store in both in-memory and file
  inMemorySessions.set(newSession.id, newSession);
  sessions.set(newSession.id, newSession);
  await saveSessions(sessions);
  
  return newSession;
}

// Get session by ID
export async function getSessionById(id: string): Promise<NotraSession | null> {
  // Check in-memory first
  if (inMemorySessions.has(id)) {
    return inMemorySessions.get(id)!;
  }
  
  // Check file-based storage
  const sessions = await loadSessions();
  return sessions.get(id) || null;
}

// List recent sessions
export async function listRecentSessions(limit: number = 10): Promise<NotraSession[]> {
  const sessions = await loadSessions();
  
  // Merge in-memory and file-based
  const allSessions = new Map(sessions);
  inMemorySessions.forEach((session, id) => {
    allSessions.set(id, session);
  });
  
  // Sort by createdAt (newest first) and return limited results
  return Array.from(allSessions.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

// Delete session (optional, for cleanup)
export async function deleteSession(id: string): Promise<boolean> {
  const sessions = await loadSessions();
  
  if (sessions.has(id) || inMemorySessions.has(id)) {
    sessions.delete(id);
    inMemorySessions.delete(id);
    await saveSessions(sessions);
    return true;
  }
  
  return false;
}

