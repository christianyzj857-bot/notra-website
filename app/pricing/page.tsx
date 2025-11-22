'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Crown, MessageSquare, BookOpen, Zap, FileText, Mic, Video } from 'lucide-react';
import NotraLogo from '@/components/NotraLogo';

// Custom Link component (matching existing pattern)
const CustomLink = ({ href, children, className, ...props }: any) => {
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <CustomLink href="/" className="flex items-center cursor-pointer group">
              <div className="mr-3">
                <NotraLogo size="sm" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                Notra
              </span>
            </CustomLink>

            <div className="hidden md:flex items-center space-x-10">
              <CustomLink href="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                Home
              </CustomLink>
              <CustomLink href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                Dashboard
              </CustomLink>
              <CustomLink href="/pricing" className="text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 pb-1">
                Pricing
              </CustomLink>
            </div>

            <div className="flex items-center space-x-4">
              <CustomLink href="/chat" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                Log in
              </CustomLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="text-center py-16 md:py-24">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6">
              Notes for a new era of learning
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-4 leading-relaxed">
              Notra helps you turn lectures, PDFs, and messy ideas into clean study notes, quizzes, and flashcards – in seconds.
            </p>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-12">
              Start for free, upgrade only when you're ready to go all in.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CustomLink
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Get started with Notra
              </CustomLink>
              <CustomLink
                href="/chat"
                className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-semibold text-lg rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                Talk to Notra AI
              </CustomLink>
            </div>
          </section>

          {/* Pricing Cards */}
          <section className="max-w-5xl mx-auto mb-24">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900">$0</span>
                    <span className="text-slate-600"> / month</span>
                  </div>
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                    Best for trying Notra
                  </span>
                </div>

                <CustomLink
                  href="/signup"
                  className="block w-full mb-8 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all text-center border-2 border-slate-200"
                >
                  Continue free
                </CustomLink>

                <ul className="space-y-4">
                  {[
                    "Up to 15 file-based study sessions / month",
                    "Audio notes up to 5 minutes each",
                    "Daily chat with Notra (up to 50 messages)",
                    "Smart notes, quizzes & flashcards for sample files",
                    "GPT-4o-mini model access",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl transform md:scale-105 hover:scale-110 transition-transform duration-300">
                {/* Recommended Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                  Most popular
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    Notra Pro
                    <Crown className="w-5 h-5 text-yellow-400" />
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">$12</span>
                    <span className="text-blue-200"> / month</span>
                  </div>
                  <span className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm">
                    For serious learners, grad students & educators
                  </span>
                </div>

                <CustomLink
                  href="/signup"
                  className="block w-full mb-8 px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-blue-50 transition-all text-center shadow-lg hover:shadow-xl"
                >
                  Upgrade to Pro
                </CustomLink>

                <ul className="space-y-4">
                  {[
                    { icon: Sparkles, text: "Unlimited file-based study sessions" },
                    { icon: Sparkles, text: "Longer audio & lecture recordings" },
                    { icon: Sparkles, text: "Full access to charts, tables & rich notes" },
                    { icon: Sparkles, text: "Priority access to new features" },
                    { icon: Sparkles, text: "Access to GPT-4o & GPT-5.1 models" },
                    { icon: Sparkles, text: '"Chat with your notes" mode with deeper context' },
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <feature.icon className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                      <span className="text-white">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  q: "Is the free plan enough for me?",
                  a: "If you only need occasional help turning a few readings into clean notes and quizzes, the free plan is a great way to start. You can always upgrade later if you hit the limits."
                },
                {
                  q: "What's the difference between GPT-4o-mini, GPT-4o and GPT-5.1?",
                  a: "GPT-4o-mini is fast and affordable – perfect for quick summaries and everyday questions. GPT-4o and GPT-5.1 are more powerful models that shine on complex reasoning, long academic texts, and multi-step explanations. Notra Pro unlocks both."
                },
                {
                  q: "Can I cancel Pro anytime?",
                  a: "Yes. You can cancel your Pro subscription at any time. You'll keep your Pro benefits until the end of the billing period."
                },
                {
                  q: "Is my data safe?",
                  a: "Notra is built for students and educators. We never sell your data, and we don't use your private study content to train public models."
                }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 transition-colors">
                  <h4 className="text-lg font-bold text-slate-900 mb-3">{item.q}</h4>
                  <p className="text-slate-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
