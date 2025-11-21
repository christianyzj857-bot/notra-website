// Unified type definitions for Notra learning platform

export type SessionType = "file" | "audio" | "video";

export interface NoteSection {
  id: string;
  heading: string;
  content: string;
  bullets?: string[];
  example?: string;
  tableSummary?: {
    label: string;
    value: string;
  }[];
}

export interface QuizOption {
  label: string;   // "A" | "B" | "C" … or dynamic
  text: string;
}

export interface QuizItem {
  id: string;
  question: string;
  options: QuizOption[];
  correctIndex: number;
  explanation: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tag?: string;
}

export interface NotraSession {
  id: string;
  type: SessionType;
  title: string;
  contentHash: string;
  createdAt: string;
  notes: NoteSection[];
  quizzes: QuizItem[];
  flashcards: Flashcard[];
  summaryForChat: string;
}

// API Request/Response types
export type ChatMode = "general" | "note";

export interface ChatRequestBody {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  model?: "gpt-4o-mini" | "gpt-4o" | "gpt-5.1";
  mode?: ChatMode;
  sessionId?: string; // Required when mode === "note"
  userPlan?: "free" | "pro";
}

export interface ProcessResult {
  sessionId: string;
  type: SessionType;
  title: string;
  createdAt: string;
}

// Onboarding types
export type OnboardingRole =
  | "high-school"
  | "undergrad"
  | "graduate"
  | "professional"
  | "educator"
  | "other";

export interface SampleFileMeta {
  id: string;
  title: string;
  subject: string;
  level: string;
  description: string;
}

export interface OnboardingSampleBundle {
  role: OnboardingRole;
  file: SampleFileMeta;
  notes: NoteSection[];
  quizzes: QuizItem[];
  flashcards: Flashcard[];
}

