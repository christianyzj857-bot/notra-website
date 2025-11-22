// Sample configuration mapping: role -> sample ID
import type { OnboardingRole } from '@/types/notra';

export type SampleId =
  | "middle_school_algebra"
  | "undergraduate_calculus"
  | "graduate_linear_algebra"
  | "professional_business_report"
  | "educator_teaching_strategies"
  | "other_calculus";

export const SAMPLE_BY_ROLE: Record<OnboardingRole, SampleId> = {
  middle_school: "middle_school_algebra",
  undergraduate: "undergraduate_calculus",
  graduate: "graduate_linear_algebra",
  working_professional: "professional_business_report",
  educator: "educator_teaching_strategies",
  other: "undergraduate_calculus", // Default to undergraduate calculus
};

// Helper function to get sample ID by role
export function getSampleIdByRole(role: OnboardingRole): SampleId {
  return SAMPLE_BY_ROLE[role] || "undergraduate_calculus";
}

