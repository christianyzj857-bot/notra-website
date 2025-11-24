/**
 * Zod schemas for validating learning asset generation results
 */

import { z } from 'zod';

// Quiz option schema
const QuizOptionSchema = z.object({
  label: z.string(),
  text: z.string(),
});

// Note section schema
export const NoteSectionSchema = z.object({
  id: z.string(),
  heading: z.string(),
  content: z.string(),
  bullets: z.array(z.string()).optional(),
  example: z.string().optional(),
  tableSummary: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
  conceptExplanation: z.string().optional(),
  formulaDerivation: z.string().optional(),
  applications: z.array(z.string()).optional(),
  commonMistakes: z.array(z.string()).optional(),
  summaryTable: z.array(z.object({
    concept: z.string(),
    formula: z.string(),
    notes: z.string(),
  })).optional(),
});

// Quiz item schema
export const QuizItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(QuizOptionSchema).min(2).max(6),
  correctIndex: z.number().int().min(0),
  explanation: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

// Flashcard schema
export const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  tag: z.string().optional(),
});

// Complete learning asset result schema
export const LearningAssetResultSchema = z.object({
  title: z.string(),
  notes: z.array(NoteSectionSchema).min(1),
  quizzes: z.array(QuizItemSchema).min(1),
  flashcards: z.array(FlashcardSchema).min(1),
  summaryForChat: z.string().min(10),
});

export type ValidatedLearningAssetResult = z.infer<typeof LearningAssetResultSchema>;

