'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Menu } from 'lucide-react';

// ---------------------------------------------------------
// 🔧 修复：使用自定义 Link 组件替代 next/link 以适应预览环境
// ---------------------------------------------------------
const Link = ({ href, children, className, ...props }: any) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};

// --- Components ---

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
           <div className="relative flex h-8 w-8 items-center justify-center">
             {/* Dynamic background glow */}
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 rounded-2xl shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/70 transition-all duration-300 group-hover:scale-110"></div>
             
             {/* Rotating decorative ring */}
             <div className="absolute inset-0 rounded-2xl border-2 border-white/30 group-hover:border-white/50 transition-all duration-300 group-hover:rotate-180"></div>
             
             {/* Letter N with enhanced styling */}
             <span className="relative z-10 text-xs font-extrabold text-white tracking-tight transform group-hover:scale-110 transition-transform duration-300" style={{
               textShadow: '0 2px 8px rgba(0,0,0,0.3)',
               letterSpacing: '-0.05em'
             }}>
               N
             </span>
             
             {/* Highlight dot */}
             <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/60 rounded-full blur-sm group-hover:bg-white/80 transition-all z-10"></div>
             
             {/* Sparkle particles */}
             <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity"></div>
           </div>
           <span className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Notra</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600">Home</Link>
          <Link href="/pricing" className="text-sm font-medium text-blue-600">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/chat" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all">
             Log in
           </Link>
        </div>
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-auto">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <div className="mb-4 flex justify-center items-center gap-2">
         <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
           <span className="text-[10px] font-bold">N</span>
         </div>
         <span className="font-bold text-slate-700">Notra</span>
      </div>
      <p className="text-slate-500 text-sm">© 2025 NotraStudio. All rights reserved.</p>
    </div>
  </footer>
);

// --- Main Pricing Content ---

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col pt-16">
      <Navbar />

      <main className="flex-1">
        {/* Header Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
           {/* Background Decor */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
              <div className="absolute top-20 left-[20%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50" />
              <div className="absolute top-40 right-[20%] w-[400px] h-[400px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
           </div>

           <div className="max-w-7xl mx-auto px-4 text-center">
             <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
               <Sparkles size={12} className="mr-2" /> 
               Invest in your brain
             </div>
             <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
               Simple pricing for <br className="hidden md:block" />
               <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                 limitless learning.
               </span>
             </h1>
             <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
               Start for free, upgrade for GPT-5.1 reasoning power and unlimited audio transcription.
             </p>

             {/* Toggle */}
             <div className="flex items-center justify-center gap-4 mb-16">
               <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
               <button 
                 onClick={() => setIsAnnual(!isAnnual)}
                 className="relative w-14 h-8 bg-slate-200 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
               >
                 <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
               </button>
               <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                 Yearly <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full ml-1">-20%</span>
               </span>
             </div>
           </div>
        </section>

        {/* Cards Section */}
        <section className="max-w-7xl mx-auto px-4 pb-24">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Free Plan */}
            <div className="border border-slate-200 rounded-3xl p-8 bg-white flex flex-col hover:border-slate-300 transition-all">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Free</h3>
                <p className="text-slate-500 text-sm">Essential tools for casual learners.</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-500"> / forever</span>
              </div>
              <Link href="/chat" className="w-full py-3 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-center mb-8 inline-block">
                Start for Free
              </Link>
              <ul className="space-y-4 flex-1">
                {[
                  "Unlimited GPT-4o-mini access",
                  "5 daily GPT-4o queries",
                  "60 mins audio transcription/mo",
                  "Upload docs up to 5MB",
                  "Basic notes export"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Plan with Planet Rotation Animation Background */}
            <div className="relative border-2 border-blue-500 rounded-3xl p-8 bg-slate-900 text-white flex flex-col shadow-2xl shadow-blue-900/20 transform md:-translate-y-4 overflow-hidden">
              {/* Animated Planet Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Main Rotating Planet */}
                <div className="absolute top-1/2 right-8 -translate-y-1/2 w-48 h-48 opacity-30">
                  <div className="relative w-full h-full" style={{
                    animation: 'rotatePlanet 20s linear infinite'
                  }}>
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <defs>
                        <linearGradient id="planetGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                          <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
                        </linearGradient>
                        <radialGradient id="planetShine1" cx="30%" cy="30%">
                          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <circle cx="100" cy="100" r="80" fill="url(#planetGradient1)" />
                      <circle cx="100" cy="100" r="80" fill="url(#planetShine1)" />
                      {/* Planet surface details */}
                      <ellipse cx="100" cy="100" rx="60" ry="40" fill="#1E40AF" fillOpacity="0.3" />
                      <ellipse cx="120" cy="90" rx="30" ry="20" fill="#3B82F6" fillOpacity="0.4" />
                      <ellipse cx="80" cy="110" rx="25" ry="15" fill="#8B5CF6" fillOpacity="0.3" />
                    </svg>
                  </div>
                </div>
                
                {/* Second Smaller Rotating Planet */}
                <div className="absolute top-1/4 left-8 w-32 h-32 opacity-25">
                  <div className="relative w-full h-full" style={{
                    animation: 'rotatePlanet 15s linear infinite reverse'
                  }}>
                    <svg viewBox="0 0 150 150" className="w-full h-full">
                      <defs>
                        <linearGradient id="planetGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.7" />
                          <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.7" />
                        </linearGradient>
                        <radialGradient id="planetShine2" cx="25%" cy="25%">
                          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <circle cx="75" cy="75" r="60" fill="url(#planetGradient2)" />
                      <circle cx="75" cy="75" r="60" fill="url(#planetShine2)" />
                      <ellipse cx="75" cy="75" rx="45" ry="30" fill="#6366F1" fillOpacity="0.3" />
                    </svg>
                  </div>
                </div>
                
                {/* Third Tiny Planet */}
                <div className="absolute bottom-1/4 right-1/4 w-24 h-24 opacity-20">
                  <div className="relative w-full h-full" style={{
                    animation: 'rotatePlanet 12s linear infinite'
                  }}>
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="40" fill="#60A5FA" fillOpacity="0.6" />
                      <circle cx="50" cy="50" r="40" fill="url(#planetShine1)" />
                    </svg>
                  </div>
                </div>
                
                {/* Orbiting Stars/Rings around planets */}
                <div className="absolute top-1/2 right-8 -translate-y-1/2 w-48 h-48 opacity-20">
                  <div className="absolute inset-0 border border-blue-400/30 rounded-full" style={{
                    animation: 'rotateRing 25s linear infinite'
                  }}></div>
                  <div className="absolute inset-4 border border-purple-400/20 rounded-full" style={{
                    animation: 'rotateRing 20s linear infinite reverse'
                  }}></div>
                </div>
                
                {/* Animated stars/sparkles */}
                <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '1.5s' }}></div>
                <div className="absolute top-32 left-20 w-1.5 h-1.5 bg-blue-300 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }}></div>
                <div className="absolute bottom-20 left-16 w-2 h-2 bg-purple-300 rounded-full animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.6s' }}></div>
                <div className="absolute top-20 right-32 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-ping" style={{ animationDuration: '2.2s', animationDelay: '0.4s' }}></div>
                
                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-purple-900/30"></div>
                
                {/* Animated nebula clouds */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-blue-400/15 via-blue-400/8 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s' }}></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-radial from-purple-400/15 via-purple-400/8 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
              </div>
              
              <div className="relative z-20 mb-6">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  Pro <Sparkles size={16} className="text-yellow-400 animate-pulse" />
                </h3>
                <p className="text-slate-400 text-sm">Power tools for serious students.</p>
              </div>
              <div className="relative z-20 mb-6">
                <span className="text-4xl font-bold text-white">${isAnnual ? '9.90' : '12.90'}</span>
                <span className="text-slate-400"> / month</span>
                {isAnnual && <div className="text-xs text-slate-400 mt-1">Billed $118.80 yearly</div>}
              </div>
              <button className="relative z-20 w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all mb-8 hover:scale-105 transform duration-300 hover:from-blue-600 hover:to-indigo-600">
                Upgrade to Pro 🚀
              </button>
              <ul className="relative z-20 space-y-4 flex-1">
                {[
                  "Unlock GPT-5.1 (Reasoning)",
                  "Unlimited GPT-4o access",
                  "Unlimited audio transcription",
                  "Unlimited video analysis",
                  "Upload massive docs (500+ pages)",
                  "Priority processing queue",
                  "Advanced export (Notion, PDF)"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check size={16} className="text-blue-400 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Team Plan */}
            <div className="border border-slate-200 rounded-3xl p-8 bg-slate-50/50 flex flex-col opacity-80">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Team</h3>
                <p className="text-slate-500 text-sm">For study groups & classrooms.</p>
              </div>
              <div className="mb-6">
                <span className="text-2xl font-bold text-slate-400">Coming Soon</span>
              </div>
              <button disabled className="w-full py-3 rounded-full border border-slate-200 text-slate-400 font-semibold cursor-not-allowed mb-8">
                Join Waitlist
              </button>
              <ul className="space-y-4 flex-1">
                {[
                  "Shared workspace",
                  "Collaborative notes",
                  "Centralized billing",
                  "Admin controls",
                  "SAML / SSO"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-500">
                    <Check size={16} className="text-slate-300 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto px-4 pb-24">
          <h2 className="text-2xl font-bold text-slate-900 mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time from your account settings. You will retain access until the end of your billing period." },
              { q: "What is the difference between GPT-4o and GPT-5.1?", a: "GPT-4o is excellent for speed and general tasks. GPT-5.1 (available in Pro) offers deeper reasoning capabilities, perfect for complex academic papers and thesis work." },
              { q: "Do you offer student discounts?", a: "Our Pro plan pricing is already optimized for students ($9.90/mo). However, we do offer bulk discounts for educational institutions." }
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6">
                <h4 className="font-bold text-slate-900 mb-2">{item.q}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}