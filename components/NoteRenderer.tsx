'use client';

import React from 'react';

interface RenderTextProps {
  text: string;
  className?: string;
}

/**
 * Enhanced text renderer that supports:
 * - **bold** text
 * - Date and deadline highlighting
 * - Important term highlighting
 */
export function RenderText({ text, className = '' }: RenderTextProps) {
  // Split by markdown bold syntax
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if it's bold text
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);

          // Check if it's a date/deadline
          const isDate = /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|deadline|due date/i.test(content);
          const isImportant = /important|required|must|deadline|critical/i.test(content);

          if (isDate) {
            return (
              <span
                key={index}
                className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded"
              >
                {content}
              </span>
            );
          } else if (isImportant) {
            return (
              <span
                key={index}
                className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded"
              >
                {content}
              </span>
            );
          } else {
            return (
              <strong key={index} className="font-bold text-slate-900">
                {content}
              </strong>
            );
          }
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

interface BulletListProps {
  bullets: string[];
  className?: string;
}

/**
 * Enhanced bullet list renderer with markdown support
 */
export function BulletList({ bullets, className = '' }: BulletListProps) {
  return (
    <ul className={`list-disc list-inside space-y-2 ${className}`}>
      {bullets.map((bullet, idx) => (
        <li key={idx} className="text-slate-700">
          <RenderText text={bullet} />
        </li>
      ))}
    </ul>
  );
}

interface TableProps {
  data: Array<{ label: string; value: string }>;
  className?: string;
}

/**
 * Enhanced table renderer with better styling
 */
export function SimpleTable({ data, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto mt-4 ${className}`}>
      <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700">
              Term
            </th>
            <th className="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700">
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="border border-slate-300 px-4 py-3 font-medium text-slate-700">
                <RenderText text={row.label} />
              </td>
              <td className="border border-slate-300 px-4 py-3 text-slate-700">
                <RenderText text={row.value} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ExampleBoxProps {
  example: string;
  className?: string;
}

/**
 * Enhanced example box with better styling
 */
export function ExampleBox({ example, className = '' }: ExampleBoxProps) {
  return (
    <div className={`bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 p-4 rounded-r-xl ${className}`}>
      <p className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
        <span className="text-lg">💡</span>
        Example:
      </p>
      <p className="text-indigo-800 leading-relaxed">
        <RenderText text={example} />
      </p>
    </div>
  );
}

interface NoteContentProps {
  content: string;
  className?: string;
}

/**
 * Enhanced content renderer with full markdown support
 */
export function NoteContent({ content, className = '' }: NoteContentProps) {
  return (
    <div className={`text-lg text-slate-700 leading-relaxed ${className}`}>
      <RenderText text={content} />
    </div>
  );
}

interface NoteSectionIconProps {
  heading: string;
}

/**
 * Get appropriate icon based on section heading
 */
export function NoteSectionIcon({ heading }: NoteSectionIconProps) {
  const headingLower = heading.toLowerCase();

  if (headingLower.includes('overview') || headingLower.includes('summary')) {
    return <span className="text-2xl">📋</span>;
  } else if (headingLower.includes('requirement') || headingLower.includes('admission')) {
    return <span className="text-2xl">📝</span>;
  } else if (headingLower.includes('date') || headingLower.includes('deadline')) {
    return <span className="text-2xl">📅</span>;
  } else if (headingLower.includes('fee') || headingLower.includes('cost') || headingLower.includes('funding')) {
    return <span className="text-2xl">💰</span>;
  } else if (headingLower.includes('contact') || headingLower.includes('support')) {
    return <span className="text-2xl">📧</span>;
  } else if (headingLower.includes('programme') || headingLower.includes('program') || headingLower.includes('course')) {
    return <span className="text-2xl">🎓</span>;
  } else if (headingLower.includes('benefit') || headingLower.includes('advantage')) {
    return <span className="text-2xl">✨</span>;
  } else if (headingLower.includes('key point')) {
    return <span className="text-2xl">🔑</span>;
  }

  return <span className="text-2xl">📄</span>;
}
