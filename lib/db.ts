// Simple in-memory database for Notra sessions
// This is a simplified implementation for cost-saving strategy
// In production, this should be replaced with a real database (PostgreSQL, MongoDB, etc.)

import { NotraSession, SessionType } from '@/types/notra';
import { createHash } from 'crypto';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

// User interface for file-based auth
export interface NotraUser {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string; // bcrypt hash
  plan: 'free' | 'pro';
  createdAt: string;
}

// In-memory storage (fallback if file system fails)
const inMemorySessions: Map<string, NotraSession> = new Map();
const inMemoryUsers: Map<string, NotraUser> = new Map();

// File-based storage path
const DB_DIR = path.join(process.cwd(), '.notra-data');
const SESSIONS_FILE = path.join(DB_DIR, 'sessions.json');
const USERS_FILE = path.join(DB_DIR, 'users.json');

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

// Create a new session (with optional userId)
export async function createSession(
  data: Omit<NotraSession, 'id' | 'createdAt'> & { userId?: string }
): Promise<NotraSession> {
  const sessions = await loadSessions();
  
  const { userId, ...sessionData } = data;
  
  const newSession: NotraSession & { userId?: string } = {
    ...sessionData,
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    userId, // Store userId if provided
  };
  
  // Store in both in-memory and file
  inMemorySessions.set(newSession.id, newSession as NotraSession);
  sessions.set(newSession.id, newSession as NotraSession);
  await saveSessions(sessions);
  
  return newSession as NotraSession;
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

// List recent sessions (optionally filtered by userId)
export async function listRecentSessions(limit: number = 10, userId?: string): Promise<NotraSession[]> {
  const sessions = await loadSessions();
  
  // Merge in-memory and file-based
  const allSessions = new Map(sessions);
  inMemorySessions.forEach((session, id) => {
    allSessions.set(id, session);
  });
  
  // Filter by userId if provided
  let filteredSessions = Array.from(allSessions.values());
  if (userId) {
    filteredSessions = filteredSessions.filter((session: any) => session.userId === userId);
  }
  
  // Sort by createdAt (newest first) and return limited results
  return filteredSessions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

// User management functions (for file-based auth)
async function loadUsers(): Promise<Map<string, NotraUser>> {
  try {
    await ensureDbDir();
    const data = await readFile(USERS_FILE, 'utf-8');
    const users = JSON.parse(data) as NotraUser[];
    const map = new Map<string, NotraUser>();
    users.forEach(user => {
      map.set(user.id, user);
    });
    return map;
  } catch (error) {
    return new Map();
  }
}

async function saveUsers(users: Map<string, NotraUser>) {
  try {
    await ensureDbDir();
    const usersArray = Array.from(users.values());
    await writeFile(USERS_FILE, JSON.stringify(usersArray, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save users to file:', error);
  }
}

// Create a new user
export async function createUser(data: Omit<NotraUser, 'id' | 'createdAt'>): Promise<NotraUser> {
  const users = await loadUsers();
  
  // Check if email already exists
  for (const user of users.values()) {
    if (user.email === data.email) {
      throw new Error('Email already registered');
    }
  }
  
  const newUser: NotraUser = {
    ...data,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  
  inMemoryUsers.set(newUser.id, newUser);
  users.set(newUser.id, newUser);
  await saveUsers(users);
  
  return newUser;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<NotraUser | null> {
  // Check in-memory first
  for (const user of inMemoryUsers.values()) {
    if (user.email === email) {
      return user;
    }
  }
  
  // Check file-based storage
  const users = await loadUsers();
  for (const user of users.values()) {
    if (user.email === email) {
      return user;
    }
  }
  
  return null;
}

// Get user by ID
export async function getUserById(id: string): Promise<NotraUser | null> {
  if (inMemoryUsers.has(id)) {
    return inMemoryUsers.get(id)!;
  }
  
  const users = await loadUsers();
  return users.get(id) || null;
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

