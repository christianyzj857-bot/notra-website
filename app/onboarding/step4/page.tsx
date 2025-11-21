'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { onboardingSamples, type OnboardingRole } from '../config';

export default function OnboardingStep4() {
  const [onboardingRole, setOnboardingRole] = useState<OnboardingRole>('other');
  const [noteContent, setNoteContent] = useState(onboardingSamples['other'].note);

  useEffect(() => {
    // Check if user came from step3 and get role
    if (typeof window !== 'undefined') {
      const stage = localStorage.getItem('onboarding_stage') as OnboardingRole;
      if (!stage) {
        window.location.href = '/onboarding/step1';
      } else {
        setOnboardingRole(stage);
        setNoteContent(onboardingSamples[stage]?.note || onboardingSamples['other'].note);
      }
    }
  }, []);

  const handleContinue = () => {
    window.location.href = '/onboarding/step5';
  };

  const { sections } = noteContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-12 px-4">
      <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
            {noteContent.title}
          </h1>
          <p className="text-2xl text-slate-600">
            {noteContent.subtitle}
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

          {/* Overview Paragraph */}
          <p className="text-lg text-slate-700 leading-relaxed mb-8">
            {sections.overview}
          </p>

          {/* Illustrations Grid - 3-4 images */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {sections.illustrations.map((illustration, idx) => (
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
              {sections.conceptIntuition.paragraphs.map((para, idx) => (
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
            <p className="text-lg font-mono text-slate-800 mb-3 bg-white/50 p-3 rounded-lg">
              {sections.formalDefinition.definition}
            </p>
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
              {sections.commonPatterns.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-[#9F6BFF]/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-[#9F6BFF] font-bold mt-1">•</span>
                    <div className="flex-1">
                      <span className="font-mono text-slate-800">{item.function}</span>
                      <span className="text-slate-600 mx-2">→</span>
                      <span className="font-mono text-slate-800">{item.derivative}</span>
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
              {sections.realWorldApplications.items.map((item, idx) => (
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
            <p className="text-lg font-semibold text-slate-800 mb-4 font-mono bg-white/70 p-3 rounded-lg">
              {sections.workedExample.problem}
            </p>
            <ol className="space-y-2">
              {sections.workedExample.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-[#9F6BFF] font-bold mt-1">{idx + 1}.</span>
                  <span className="text-slate-700 text-base leading-relaxed">{step}</span>
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
                  {sections.summaryTable.rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-200 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      } hover:bg-indigo-50/50 transition-colors`}
                    >
                      <td className="px-6 py-4 font-mono text-slate-800">{row.function}</td>
                      <td className="px-6 py-4 font-mono text-slate-800">{row.derivative}</td>
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
