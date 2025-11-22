'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Mic, 
  FileText, 
  Brain, 
  Zap, 
  Check, 
  Play, 
  Menu, 
  X, 
  ChevronDown, 
  Globe,
  Library
} from 'lucide-react';
import WelcomeUser from '@/components/WelcomeUser';
import NotraLogo from '@/components/NotraLogo';

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

// --- Animation Hook ---
function useOnScreen(ref: any, rootMargin = "0px") {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, rootMargin]);
  return isIntersecting;
}

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const ref = useRef(null);
  const isVisible = useOnScreen(ref, "-50px");
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- UI Components ---

const Button = ({ children, variant = 'primary', className = '', icon: Icon, ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer";
  
  const variants: any = {
    primary: "text-white bg-slate-900 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5 border border-transparent",
    gradient: "text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 border border-transparent",
    secondary: "text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 bg-transparent",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

const SectionBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
    <Sparkles className="w-3 h-3 mr-1.5" />
    {children}
  </div>
);

// --- Sections ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Get current path
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 导航链接配置
  const navItems = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Notra AI', href: '/app' },
    { label: 'Dashboard', href: '/dashboard' }
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex flex-col items-start">
            <Link href="/" className="flex items-center cursor-pointer group">
              <div className="mr-3">
                <NotraLogo size="sm" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                Notra
              </span>
            </Link>
            <div className="mt-1 ml-12">
              <WelcomeUser />
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => {
              const isActive = currentPath === item.href || (item.href.startsWith('/#') && currentPath === '/');
              return (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  className={`text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' 
                      : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* CTA (Actions) */}
          <div className="hidden md:flex items-center space-x-4">
             <Link href="/chat" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
               Log in
             </Link>
             <Link href="/app">
                <Button variant="primary" className="h-10 px-5 text-sm">Get Started</Button>
             </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-slate-900">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-2 shadow-xl">
            {navItems.map((item) => {
              const isActive = currentPath === item.href || (item.href.startsWith('/#') && currentPath === '/');
              return (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <Link href="/chat">
                <Button variant="secondary" className="w-full justify-center">Log in</Button>
              </Link>
              <Link href="/app">
                <Button variant="primary" className="w-full justify-center">Get Started Free</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-indigo-50/50 to-blue-50/50" />
      <div className="absolute inset-0 -z-10 bg-repeat opacity-[0.05]" style={{
        backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-100/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style={{animationDuration: '8s'}} />
         <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] mix-blend-multiply" />
         
         {/* 3D Decorative Element */}
         <div className="hidden lg:block absolute top-[25%] left-[5%] w-48 h-48 lg:w-72 lg:h-72 z-0">
            <div className="absolute inset-0 rounded-[4rem] bg-gradient-to-br from-indigo-500/80 to-cyan-400/80 filter blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '6s' }}></div>
            <div className="relative w-full h-full transform rotate-12 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/30 shadow-2xl"
                 style={{
                    animation: 'float-subtle 6s ease-in-out infinite alternate',
                    perspective: '1000px',
                    transform: 'rotateX(20deg) rotateY(-10deg) scale(0.9)',
                 }}
            >
               <div className="absolute inset-4 rounded-xl bg-slate-900/50 backdrop-blur-md"></div>
               <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-5xl opacity-30">N</span>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <SectionBadge>Notra AI 2.0 is Here</SectionBadge>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1] headline-glow">
            Turn chaos into <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              structured knowledge.
            </span>
          </h1>
          
          <h2 className="text-lg md:text-2xl font-medium text-indigo-700/70 mb-8 font-serif italic">
            "Notes for a New Era."
          </h2>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-12 leading-relaxed">
            Your AI copilot for academic excellence. Upload lectures, slides, or papers, 
            and instantly generate structured notes, flashcards, and summaries.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/dashboard">
              <Button 
                variant="gradient" 
                icon={Sparkles} 
                className="w-full sm:w-auto h-14 px-10 text-base shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:ring-2 hover:ring-indigo-500/50"
              >
                Go to Dashboard
              </Button>
            </Link>
            
            <Link href="#features">
              <Button 
                variant="secondary" 
                icon={Play} 
                className="w-full sm:w-auto h-14 px-10 text-base border-slate-300 hover:border-indigo-400 hover:text-indigo-700 hover:shadow-indigo-200/50"
              >
                See Features
              </Button>
            </Link>
          </div>
        </FadeIn>

        {/* Hero Visual */}
        <FadeIn delay={200}>
          <div className="relative mx-auto max-w-6xl">
            <div className="relative rounded-3xl bg-slate-900/5 p-2 lg:p-4 backdrop-blur-sm ring-1 ring-slate-900/10">
               <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[16/9] relative group">
                  <img 
                    src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2940&auto=format&fit=crop" 
                    alt="Students working on laptops" 
                    className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent"></div>
                  
                  {/* Floating UI Card */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/50 p-6 text-left transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-start gap-4">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                           <Brain size={20} />
                         </div>
                         <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-900 mb-1">Analyzing "Advanced Macroeconomics - Lecture 04"</h3>
                            <div className="space-y-2">
                               <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full w-[85%] bg-blue-500 rounded-full"></div>
                               </div>
                               <div className="flex justify-between text-xs text-slate-500">
                                  <span>Extracting key concepts...</span>
                                  <span>85%</span>
                               </div>
                            </div>
                         </div>
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

const SocialProof = () => (
  <div className="bg-white border-y border-slate-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-10">
        Trusted by 50,000+ students from top universities worldwide
      </p>
      <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
         {/* University Names */}
         {['Stanford', 'MIT', 'Oxford', 'Cambridge', 'NUS', 'Toronto'].map(uni => (
           <span key={uni} className="text-xl font-serif font-bold text-slate-800">{uni}</span>
         ))}
      </div>
    </div>
  </div>
);

const Features = () => {
  const features = [
    {
      title: "Lecture Transcription",
      subtitle: "Audio to Knowledge",
      desc: "Record your lectures or meetings directly. Notra filters out silence and filler words, identifies speakers, and converts hours of audio into concise, structured notes in minutes.",
      icon: Mic,
      bullets: ["Speaker Identification", "Smart Noise Reduction", "Timestamp Linking"],
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2940&auto=format&fit=crop"
    },
    {
      title: "Document Analysis",
      subtitle: "PDF to Insight",
      desc: "Stop highlighting everything. Upload 500+ page textbooks or research papers. Notra acts as your personal TA, extracting key arguments, formulas, and generating exam-ready summaries.",
      icon: FileText,
      bullets: ["OCR for Scanned Docs", "Formula Extraction", "Auto-Flashcard Generation"],
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2940&auto=format&fit=crop"
    },
    {
      title: "Context-Aware Tutor",
      subtitle: "Interactive Learning",
      desc: "Don't just read—interact. Ask questions about your specific course material. Notra uses context from your uploaded files to give accurate, cited answers using GPT-5.1 logic.",
      icon: Brain,
      bullets: ["Citation & Sourcing", "Academic Writing Mode", "Quiz Generation"],
      image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=2874&auto=format&fit=crop"
    }
  ];

  return (
    <section id="features" className="py-32 bg-[#FDFCFE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <SectionBadge>Core Capabilities</SectionBadge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
             Not just a tool. <br/>
             Your academic <span className="text-indigo-600">second brain.</span>
          </h2>
        </div>

        <div className="space-y-32">
          {features.map((feature, idx) => (
            <FadeIn key={idx}>
              <div className={`flex flex-col lg:flex-row gap-16 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                
                {/* Text Content */}
                <div className="flex-1 space-y-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
                    <feature.icon size={28} />
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wider">{feature.subtitle}</p>
                    <h3 className="text-3xl font-bold text-slate-900">{feature.title}</h3>
                  </div>

                  <p className="text-lg text-slate-600 leading-relaxed">
                    {feature.desc}
                  </p>
                  
                  <ul className="space-y-4 pt-4">
                    {feature.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm w-fit">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                           <Check size={14} className="text-green-600" />
                        </div>
                        <span className="text-slate-700 font-medium">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Realistic Image Card */}
                <div className="flex-1 w-full">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 group aspect-[4/3]">
                     <img 
                       src={feature.image} 
                       alt={feature.title} 
                       className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                     />
                     <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                </div>

              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const BenefitsGrid = () => {
  const cards = [
    { title: "Academic Precision", desc: "Powered by GPT-4o, tailored for academic jargon, formulas, and complex reasoning.", icon: Zap },
    { title: "Cloud Sync", desc: "Start on your laptop during the lecture, review on your phone during the commute.", icon: Globe },
    { title: "Smart Export", desc: "Export to Notion, Obsidian, PDF, or Markdown. Your data belongs to you.", icon: FileText },
    { title: "Deep Focus", desc: "A minimalist, distraction-free interface designed for deep work and reading.", icon: Library },
  ];

  return (
    <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
           <h2 className="text-3xl md:text-4xl font-bold mb-6">Why top students choose Notra</h2>
           <p className="text-slate-400 max-w-2xl mx-auto text-lg">Everything you need to excel in your studies, minus the busywork.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, idx) => (
            <FadeIn key={idx} delay={idx * 100}>
              <div className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-colors duration-300 h-full">
                 <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 mb-6">
                   <card.icon size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                 <p className="text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => (
  <section className="py-32 bg-[#FDFCFE]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <SectionBadge>Workflow</SectionBadge>
        <h2 className="text-4xl font-bold text-slate-900 mb-6">From material to mastery</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-12 relative">
        <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-slate-200 via-indigo-200 to-slate-200 -z-10"></div>
        {[
          { step: "01", title: "Upload or Record", desc: "Drop your lecture slides, PDFs, or start recording in the classroom." },
          { step: "02", title: "AI Processing", desc: "Select your preferred model. Notra deconstructs the content into key concepts." },
          { step: "03", title: "Master & Review", desc: "Receive structured notes, take quizzes, and chat with your materials." },
        ].map((item, idx) => (
          <FadeIn key={idx} delay={idx * 200}>
            <div className="relative bg-[#FDFCFE] group">
               <div className="w-24 h-24 mx-auto bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                 {item.step}
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">{item.title}</h3>
               <p className="text-slate-600 text-center leading-relaxed">{item.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

const FAQ = () => (
  <section id="faq" className="py-24 bg-white border-t border-slate-100">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {[
          { q: "Is Notra free to use?", a: "Yes, we offer a generous Free Plan that includes daily access to GPT-4o-mini and essential note-taking features." },
          { q: "Which languages are supported for recording?", a: "We support mixed recognition for over 30+ languages including English, Mandarin, Japanese, and Spanish. Perfect for international students." },
          { q: "How is this different from ChatGPT?", a: "ChatGPT is a generalist. Notra is purpose-built for structured knowledge. We integrate long-context document parsing, OCR, and specialized academic prompts that general chatbots lack." },
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-200 transition-colors">
            <button className="w-full flex justify-between items-center p-6 text-left focus:outline-none group">
              <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{item.q}</span>
              <ChevronDown size={20} className="text-slate-400 group-hover:text-indigo-500" />
            </button>
            <div className="px-6 pb-6 text-slate-600 leading-relaxed">
              {item.a}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 mb-6 group">
             <div className="relative flex h-8 w-8 items-center justify-center">
               <NotraLogo size="sm" />
             </div>
             <span className="text-xl font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors">Notra</span>
          </Link>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Notes for a New Era. <br/>
            Your intelligent learning companion for the future of education.
          </p>
          <div className="flex gap-4">
             <div className="w-8 h-8 bg-slate-800 rounded-full hover:bg-indigo-600 transition-colors cursor-pointer"></div>
             <div className="w-8 h-8 bg-slate-800 rounded-full hover:bg-indigo-600 transition-colors cursor-pointer"></div>
             <div className="w-8 h-8 bg-slate-800 rounded-full hover:bg-indigo-600 transition-colors cursor-pointer"></div>
          </div>
        </div>
        
        {[
          { title: "Product", links: ["Features", "Pricing", "Changelog", "Download"] },
          { title: "Company", links: ["About Us", "Careers", "Privacy Policy", "Terms of Service"] },
          { title: "Resources", links: ["Community", "Help Center", "Blog", "Contact"] }
        ].map((col, idx) => (
           <div key={idx}>
             <h4 className="font-bold text-white mb-6">{col.title}</h4>
             <ul className="space-y-4">
               {col.links.map((link, lIdx) => (
                 <li key={lIdx}><Link href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">{link}</Link></li>
               ))}
             </ul>
           </div>
        ))}
      </div>
      
      <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-slate-500">© 2025 NotraStudio. All rights reserved.</div>
        <div className="flex gap-6">
           <Link href="/app">
             <Button variant="gradient" className="px-6 h-10 text-sm">Start Learning Free</Button>
           </Link>
        </div>
      </div>
    </div>
  </footer>
);

// --- Main Layout ---

export default function LandingPage() {
  // Check onboarding status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('onboarding_complete');
      if (onboarded !== 'true') {
        // Redirect to onboarding step 1 if not completed
        window.location.href = '/onboarding/step1';
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFE] font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <BenefitsGrid />
        <HowItWorks />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}