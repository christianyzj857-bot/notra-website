'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { onboardingSamples, type OnboardingRole } from '../config';
import { type OnboardingSampleBundle } from '@/types/notra';
import { InlineMath, BlockMath } from 'react-katex';

// Import all image components
import { AlgebraHeroImage } from '@/components/onboarding-images/AlgebraHeroImage';
import { AlgebraConceptDiagram } from '@/components/onboarding-images/AlgebraConceptDiagram';
import { CalculusHeroImage } from '@/components/onboarding-images/CalculusHeroImage';
import { CalculusApplicationDiagram } from '@/components/onboarding-images/CalculusApplicationDiagram';
import { LinearAlgebraHeroImage } from '@/components/onboarding-images/LinearAlgebraHeroImage';
import { EigenDecompositionDiagram } from '@/components/onboarding-images/EigenDecompositionDiagram';
import { GradientHeroImage } from '@/components/onboarding-images/GradientHeroImage';
import { DirectionalDerivativeDiagram } from '@/components/onboarding-images/DirectionalDerivativeDiagram';
import { SalesDashboardHero } from '@/components/onboarding-images/SalesDashboardHero';
import { BusinessMetricsDiagram } from '@/components/onboarding-images/BusinessMetricsDiagram';
import { ActiveLearningHero } from '@/components/onboarding-images/ActiveLearningHero';
import { LearningStrategiesDiagram } from '@/components/onboarding-images/LearningStrategiesDiagram';

// Get hero image component for different roles
const getHeroImageComponent = (role: OnboardingRole | null) => {
  switch (role) {
    case 'middleschool':
      return <AlgebraHeroImage />;
    case 'highschool':
      return <CalculusHeroImage />;
    case 'undergrad':
      return <LinearAlgebraHeroImage />;
    case 'grad':
      return <GradientHeroImage />;
    case 'professional':
      return <SalesDashboardHero />;
    case 'educator':
      return <ActiveLearningHero />;
    default:
      return <AlgebraHeroImage />;
  }
};

// Get concept diagram component for different roles
const getConceptDiagramComponent = (role: OnboardingRole | null) => {
  switch (role) {
    case 'middleschool':
      return <AlgebraConceptDiagram />;
    case 'highschool':
      return <CalculusApplicationDiagram />;
    case 'undergrad':
      return <EigenDecompositionDiagram />;
    case 'grad':
      return <DirectionalDerivativeDiagram />;
    case 'professional':
      return <BusinessMetricsDiagram />;
    case 'educator':
      return <LearningStrategiesDiagram />;
    default:
      return <AlgebraConceptDiagram />;
  }
};

// Math inline component using KaTeX
const MathInline = ({ math }: { math: string }) => {
  try {
    return <InlineMath>{math}</InlineMath>;
  } catch (e) {
    return <span className="math-text text-slate-800">{math}</span>;
  }
};

// Math block component using KaTeX
const MathBlock = ({ math }: { math: string }) => {
  try {
    return <BlockMath>{math}</BlockMath>;
  } catch (e) {
    return <div className="math-block text-slate-900">{math}</div>;
  }
};

export default function OnboardingStep4() {
  const [onboardingRole, setOnboardingRole] = useState<OnboardingRole | null>(null);
  const [noteContent, setNoteContent] = useState<any>(null);
  const [sampleBundle, setSampleBundle] = useState<OnboardingSampleBundle | null>(null);

  useEffect(() => {
    // Check if user came from step3 and get sample data from localStorage
    if (typeof window !== 'undefined') {
      const stage = localStorage.getItem('onboarding_stage') as OnboardingRole | null;
      if (!stage) {
        window.location.href = '/onboarding/step1';
        return;
      }
      
      setOnboardingRole(stage);
      
      // Try to get sample data from localStorage (stored during drag-and-drop)
      const sampleDataStr = localStorage.getItem('onboarding_sample_data');
      if (sampleDataStr) {
        try {
          const sampleBundle: OnboardingSampleBundle = JSON.parse(sampleDataStr);
          setSampleBundle(sampleBundle);
          
          // Use config as fallback for note structure
          // Map the role from new format to old format if needed
          const configRoleMap: Record<string, keyof typeof onboardingSamples> = {
            'middle_school': 'middleschool',
            'undergraduate': 'undergrad',
            'graduate': 'grad',
            'working_professional': 'professional',
            'educator': 'educator',
            'other': 'other',
          };
          const configRole = configRoleMap[stage] || 'other';
          if (onboardingSamples[configRole]?.note) {
            setNoteContent(onboardingSamples[configRole].note);
          }
        } catch (e) {
          console.error('Failed to parse sample data:', e);
          // Fallback to config
          const configRoleMap: Record<string, keyof typeof onboardingSamples> = {
            'middle_school': 'middleschool',
            'undergraduate': 'undergrad',
            'graduate': 'grad',
            'working_professional': 'professional',
            'educator': 'educator',
            'other': 'other',
          };
          const configRole = configRoleMap[stage] || 'other';
          setNoteContent(onboardingSamples[configRole]?.note || onboardingSamples['other'].note);
        }
      } else {
        // Fallback to config if no localStorage data
        const configRoleMap: Record<string, keyof typeof onboardingSamples> = {
          'middle_school': 'middleschool',
          'undergraduate': 'undergrad',
          'graduate': 'grad',
          'working_professional': 'professional',
          'educator': 'educator',
          'other': 'other',
        };
        const configRole = configRoleMap[stage] || 'other';
        setNoteContent(onboardingSamples[configRole]?.note || onboardingSamples['other'].note);
      }
    }
  }, []);

  const handleContinue = () => {
    window.location.href = '/onboarding/step5';
  };

  // Early return if no content loaded yet
  if (!noteContent || !onboardingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Loading notes...</p>
        </div>
      </div>
    );
  }

  const { sections } = noteContent;

  // Get role label and metadata
  const roleLabels: Partial<Record<OnboardingRole, string>> = {
    middleschool: 'Middle School',
    highschool: 'High School',
    undergrad: 'Undergraduate',
    grad: 'Graduate',
    professional: 'Working Professional',
    educator: 'Educator',
    other: 'Other',
  };

  const getSubjectAndLevel = () => {
    if (sampleBundle) {
      return {
        subject: sampleBundle.file.subject,
        level: sampleBundle.file.level,
      };
    }
    // Fallback to config
    return {
      subject: noteContent.subtitle?.split('–')?.[1]?.trim() || 'General',
      level: roleLabels[onboardingRole || 'other'] || 'General',
    };
  };

  const { subject, level } = getSubjectAndLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-12 px-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="max-w-5xl mx-auto">
        {/* Top Section: Title + Subject + Level + Role Tag */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-2 duration-700">
          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
              {roleLabels[onboardingRole] || 'Other'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {subject}
            </span>
            <span className="text-slate-400">•</span>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              {level}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
            {sampleBundle?.file?.title || noteContent.mainTitle || noteContent.title}
          </h1>
          <p className="text-2xl text-slate-600">
            {noteContent.subtitle || 'Overview'}
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-slate-100">
          {/* Section Heading */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {noteContent.mainTitle}
            </h2>
            <p className="text-xl text-slate-500">{noteContent.mainSubtitle}</p>
          </div>

          {/* Top Visual Area: Academic Image + Formula Card */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Left: Academic Image (Role-specific) */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4 px-4">Academic Content</h4>
              <div className="relative w-full rounded-xl overflow-hidden border border-blue-100 bg-white">
                <div className="w-full" style={{ aspectRatio: '3/2' }}>
                  {getHeroImageComponent(onboardingRole)}
                </div>
              </div>
            </div>
            
            {/* Right: Main Formula Card with KaTeX */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-8 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
              <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">Main Formula</h4>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
                <div className="text-center">
                  <MathBlock math="f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-4 text-center">
                Limit definition of derivative
              </p>
            </div>
          </div>

          {/* Overview Paragraph - Concise */}
          <div className="mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Overview</h3>
            <p className="text-lg text-slate-700 leading-relaxed max-w-3xl">
              {sections.overview}
            </p>
          </div>

          {/* Concept Diagram - Textbook-style illustration */}
          <div className="mb-12 bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
            <div className="w-full" style={{ aspectRatio: '3/2' }}>
              {getConceptDiagramComponent(onboardingRole)}
            </div>
          </div>

          {/* Key Concepts - Replacing illustrations with concise concept cards */}
          {sections?.keyConcepts && sections.keyConcepts.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {sections.keyConcepts.map((concept: string, idx: number) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 hover:border-indigo-200 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    {concept}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Concept Intuition - Concise */}
          <div className="mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              {sections.conceptIntuition.title}
            </h3>
            <div className="space-y-3">
              {sections?.conceptIntuition?.paragraphs?.slice(0, 2).map((para: string, idx: number) => (
                <p key={idx} className="text-base text-slate-700 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Formal Definition */}
          <div className="mb-10 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-l-4 border-[#9F6BFF]">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {sections.formalDefinition.title}
            </h3>
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-indigo-100 overflow-hidden">
              {sections?.formalDefinition?.definition && (
                <div className="text-lg text-slate-900 leading-relaxed break-words overflow-wrap-anywhere">
                  {(() => {
                    const definition = sections.formalDefinition.definition;
                    const mathSymbols = /[∇∂∑∏∫√≤≥≠≈αβγδθλπσφω₀₁₂₃₄₅₆₇₈₉]/;
                    const hasMathSymbols = mathSymbols.test(definition);
                    const hasLaTeX = definition.includes('\\');
                    
                    // Check for colon separator
                    if (definition.includes(':')) {
                      const colonIndex = definition.indexOf(':');
                      const label = definition.substring(0, colonIndex).trim();
                      const afterColon = definition.substring(colonIndex + 1).trim();
                      
                      if ((hasMathSymbols || hasLaTeX || afterColon.match(/[a-zA-Z]+\s*[=<>≤≥]/)) && label) {
                        return (
                          <div className="flex flex-col gap-2">
                            <span className="font-medium">{label}:</span>
                            <div>
                              {hasLaTeX || hasMathSymbols ? (
                                <MathBlock math={afterColon} />
                              ) : (
                                <span>{afterColon}</span>
                              )}
                            </div>
                          </div>
                        );
                      }
                    }
                    
                    // Check if it's a pure formula (starts with math or is short)
                    if (hasLaTeX || hasMathSymbols || definition.match(/^[a-zA-Z]+\s*[=<>≤≥]/)) {
                      return <MathBlock math={definition} />;
                    }
                    
                    // Default: render as text
                    return <p className="whitespace-normal break-words">{definition}</p>;
                  })()}
                </div>
              )}
            </div>
            <p className="text-base text-slate-700 leading-relaxed">
              {sections.formalDefinition.explanation}
            </p>
          </div>

          {/* Common Patterns */}
          <div className="mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
              {sections.commonPatterns.title}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {sections?.commonPatterns?.items?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-[#9F6BFF]/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-[#9F6BFF] font-bold mt-1">•</span>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="text-slate-800 font-medium">
                        {item.function.includes('\\') ? (
                          <MathInline math={item.function} />
                        ) : (
                          <span>{item.function}</span>
                        )}
                      </div>
                      <span className="text-slate-400 text-xs">→</span>
                      <div className="text-slate-700">
                        {item.derivative.includes('\\') ? (
                          <MathInline math={item.derivative} />
                        ) : (
                          <span>{item.derivative}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-world Applications */}
          <div className="mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
              {sections.realWorldApplications.title}
            </h3>
            <ul className="space-y-3">
              {sections?.realWorldApplications?.items?.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-200">
                  <span className="text-[#9F6BFF] font-bold mt-1">•</span>
                  <span className="text-slate-700 text-lg leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Worked Example */}
          <div className="mb-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              {sections.workedExample.title}
            </h3>
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-blue-100 mb-4">
              {sections.workedExample.problem && (
                <div className="text-lg text-slate-900 leading-relaxed">
                  {(() => {
                    const problem = sections.workedExample.problem;
                    const mathSymbols = /[∇∂∑∏∫√≤≥≠≈αβγδθλπσφω₀₁₂₃₄₅₆₇₈₉]/;
                    const hasMathSymbols = mathSymbols.test(problem);
                    const hasLaTeX = problem.includes('\\');
                    
                    // Check for colon separator
                    if (problem.includes(':')) {
                      const colonIndex = problem.indexOf(':');
                      const label = problem.substring(0, colonIndex).trim();
                      const afterColon = problem.substring(colonIndex + 1).trim();
                      
                      if ((hasMathSymbols || hasLaTeX || afterColon.match(/[a-zA-Z]+\s*[=<>≤≥]/)) && label) {
                        return (
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{label}:</span>
                            <div>
                              {hasLaTeX || hasMathSymbols ? (
                                <MathBlock math={afterColon} />
                              ) : (
                                <span>{afterColon}</span>
                              )}
                            </div>
                          </div>
                        );
                      }
                    }
                    
                    // Default: render as is
                    return hasLaTeX ? <MathBlock math={problem} /> : <span>{problem}</span>;
                  })()}
                </div>
              )}
            </div>
            <ol className="space-y-3">
              {sections?.workedExample?.steps?.map((step: string, idx: number) => {
                // Parse step to separate English text from formulas
                const mathSymbols = /[∇∂∑∏∫√≤≥≠≈αβγδθλπσφω₀₁₂₃₄₅₆₇₈₉]/;
                const hasMathSymbols = mathSymbols.test(step);
                const hasLaTeX = step.includes('\\');
                const hasMath = hasMathSymbols || hasLaTeX;
                
                // Check for colon separator (e.g., "Partials: ∂f/∂x = 2xy")
                if (step.includes(':')) {
                  const colonIndex = step.indexOf(':');
                  const label = step.substring(0, colonIndex).trim();
                  const afterColon = step.substring(colonIndex + 1).trim();
                  
                  // Check if after colon contains math
                  const afterColonHasMath = mathSymbols.test(afterColon) || afterColon.includes('\\') || afterColon.match(/[a-zA-Z]+\s*[=<>≤≥]/);
                  
                  if (afterColonHasMath && label) {
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-[#9F6BFF] font-bold mt-1">{idx + 1}.</span>
                        <div className="flex-1 flex flex-col gap-1">
                          <span className="text-slate-800 font-medium">{label}:</span>
                          <div className="text-slate-700">
                            {hasLaTeX || hasMathSymbols ? (
                              <MathInline math={afterColon} />
                            ) : (
                              <span>{afterColon}</span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  }
                }
                
                // Check for arrow separator (e.g., "Apply power rule → f'(x) = 3x²")
                if (step.includes('→')) {
                  const arrowIndex = step.indexOf('→');
                  const beforeArrow = step.substring(0, arrowIndex).trim();
                  const afterArrow = step.substring(arrowIndex + 1).trim();
                  
                  const afterArrowHasMath = mathSymbols.test(afterArrow) || afterArrow.includes('\\') || afterArrow.match(/[a-zA-Z]+\s*[=<>≤≥]/);
                  
                  if (afterArrowHasMath && beforeArrow) {
                    return (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-[#9F6BFF] font-bold mt-1">{idx + 1}.</span>
                        <div className="flex-1 flex flex-col gap-1">
                          <span className="text-slate-800 font-medium">{beforeArrow}</span>
                          <div className="text-slate-700">
                            {hasLaTeX || hasMathSymbols ? (
                              <MathInline math={afterArrow} />
                            ) : (
                              <span>{afterArrow}</span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  }
                }
                
                // Default: render as is
                return (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-[#9F6BFF] font-bold mt-1">{idx + 1}.</span>
                    <span className="text-slate-700 text-base leading-relaxed">
                      {hasLaTeX ? <MathInline math={step} /> : step}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Summary Table */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              {sections.summaryTable.title}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-[#9F6BFF] to-[#8B5CF6] text-white">
                    <th className="px-6 py-4 text-left font-semibold">Function</th>
                    <th className="px-6 py-4 text-left font-semibold">Derivative</th>
                    <th className="px-6 py-4 text-left font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sections?.summaryTable?.rows?.map((row: any, idx: number) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-200 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      } hover:bg-indigo-50/50 transition-colors`}
                    >
                      <td className="px-6 py-4">
                        {row.function?.includes('\\') ? (
                          <MathInline math={row.function} />
                        ) : (
                          <span className="math-text">{row.function}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {row.derivative?.includes('\\') ? (
                          <MathInline math={row.derivative} />
                        ) : (
                          <span className="math-text">{row.derivative}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            className="px-8 py-4 bg-[#9F6BFF] text-white font-semibold rounded-xl hover:bg-[#8B5CF6] transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
