'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { onboardingSamples } from '../config';
import { type OnboardingRole, type OnboardingSampleBundle } from '@/types/notra';
import { InlineMath, BlockMath } from 'react-katex';
import Image from 'next/image';

// Academic images for different roles
const getAcademicImage = (role: OnboardingRole | null): string => {
  switch (role) {
    case 'middle_school':
      // Basic STEM - Algebra/Geometry
      return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2940&auto=format&fit=crop';
    case 'undergraduate':
      // Textbook style - Linear Algebra/Calculus
      return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2940&auto=format&fit=crop';
    case 'graduate':
      // Advanced research - Complex formulas and graphs
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop';
    case 'working_professional':
      // Business reports and data charts
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop';
    case 'educator':
      // Course structure and lesson plans
      return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=2940&auto=format&fit=crop';
    default:
      return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2940&auto=format&fit=crop';
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
    middle_school: 'Middle School',
    undergraduate: 'Undergraduate',
    graduate: 'Graduate',
    working_professional: 'Working Professional',
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
              <div className="relative w-full h-64 rounded-xl overflow-hidden border border-blue-100">
                <Image
                  src={getAcademicImage(onboardingRole)}
                  alt={`${roleLabels[onboardingRole || 'other']} academic content`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm font-semibold drop-shadow-lg">
                    {roleLabels[onboardingRole || 'other']} Level Content
                  </p>
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

          {/* Overview Paragraph */}
          <div className="mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Overview</h3>
            <p className="text-lg text-slate-700 leading-relaxed">
              {sections.overview}
            </p>
          </div>

          {/* Illustrations Grid - 3-4 images (Enhanced) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {sections?.illustrations?.map((illustration: any, idx: number) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${
                  idx % 4 === 0 ? 'from-blue-50 to-indigo-50 border-blue-100' :
                  idx % 4 === 1 ? 'from-purple-50 to-pink-50 border-purple-100' :
                  idx % 4 === 2 ? 'from-green-50 to-emerald-50 border-green-100' :
                  'from-orange-50 to-red-50 border-orange-100'
                } rounded-2xl p-6 border-2`}
              >
                <div className="aspect-square bg-white rounded-xl flex flex-col items-center justify-center mb-4 border-2 border-slate-200">
                  <div className="text-4xl mb-3">{illustration.icon}</div>
                  <div className="text-center">
                    <p className="text-xs font-mono text-slate-600 break-words px-2">
                      {illustration.description}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-700 text-center">
                  {illustration.title}
                </p>
              </div>
            ))}
          </div>

          {/* Concept Intuition */}
          <div className="mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              {sections.conceptIntuition.title}
            </h3>
            <div className="space-y-4">
              {sections?.conceptIntuition?.paragraphs?.map((para: string, idx: number) => (
                <p key={idx} className="text-lg text-slate-700 leading-relaxed">
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
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-indigo-100">
              {sections?.formalDefinition?.definition && (
                <div className="text-lg text-slate-900 leading-relaxed">
                  <MathBlock math={sections.formalDefinition.definition} />
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
                    <div className="flex-1">
                      <MathInline math={item.function} />
                      <span className="text-slate-600 mx-2">→</span>
                      <MathInline math={item.derivative} />
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
                  <MathBlock math={sections.workedExample.problem} />
                </div>
              )}
            </div>
            <ol className="space-y-3">
              {sections?.workedExample?.steps?.map((step: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-[#9F6BFF] font-bold mt-1">{idx + 1}.</span>
                  <span className="text-slate-700 text-base leading-relaxed">
                    {step.includes('\\') ? <MathInline math={step} /> : step}
                  </span>
                </li>
              ))}
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
