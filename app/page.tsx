'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Library,
  Video, // Added for new feature
} from 'lucide-react';
import WelcomeUser from '@/components/WelcomeUser';
import NotraLogo from '@/components/NotraLogo';

// ---------------------------------------------------------
// 🔧 使用 Next.js Link 组件以优化跳转性能
// ---------------------------------------------------------
import NextLink from 'next/link';

const Link = ({ href, children, className, prefetch = true, ...props }: any) => {
  return (
    <NextLink href={href} prefetch={prefetch} className={className} {...props}>
      {children}
    </NextLink>
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
    // Updated primary for dark theme contrast
    primary: "text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 border border-transparent",
    gradient: "text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-0.5 border border-transparent",
    // Updated secondary for dark theme
    secondary: "text-slate-200 bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/20 backdrop-blur-sm shadow-sm hover:shadow-md",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

const SectionBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
    <Sparkles className="w-3 h-3 mr-1.5 text-indigo-400" />
    {children}
  </div>
);

// --- Sections ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Get current path
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
      
      // Check login status
      const loggedIn = localStorage.getItem('user_logged_in') === 'true';
      const displayName = localStorage.getItem('user_display_name') || '';
      setIsLoggedIn(loggedIn);
      setUserDisplayName(displayName);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_logged_in');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_display_name');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_plan');
      localStorage.removeItem('supabase_access_token');
    }
    
    // Reload page
    window.location.href = '/';
  };

  // 导航链接配置 - 均匀居中排布，Settings 在最右边
  const navItems = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Notra AI', href: '/app' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/settings' }
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0B0C15]/90 backdrop-blur-xl border-b border-white/5 shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex flex-col items-start">
            <Link href="/" className="flex items-center cursor-pointer group">
              <NotraLogo size="lg" showText={true} variant="hero" />
            </Link>
            <div className="mt-1 ml-12">
              <WelcomeUser />
            </div>
          </div>

          {/* Desktop Links - 均匀居中排布 */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8 lg:space-x-10">
              {navItems.map((item) => {
                const isActive = currentPath === item.href || (item.href.startsWith('/#') && currentPath === '/');
                return (
                  <Link 
                    key={item.label} 
                    href={item.href} 
                    className={`text-sm font-medium transition-colors ${
                      isActive 
                        ? 'text-indigo-400' 
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CTA (Actions) - 只显示未登录时的按钮 */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn && (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white">
                  Log in
                </Link>
                <Link href="/app">
                  <Button variant="primary" className="h-10 px-5 text-sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0B0C15] border-b border-white/10 absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-2 shadow-xl">
            {navItems.map((item) => {
              const isActive = currentPath === item.href || (item.href.startsWith('/#') && currentPath === '/');
              return (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-indigo-400 bg-white/5'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* 移动端只显示未登录时的按钮 */}
            {!isLoggedIn && (
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <Link href="/login">
                  <Button variant="secondary" className="w-full justify-center">Log in</Button>
                </Link>
                <Link href="/app">
                  <Button variant="primary" className="w-full justify-center">Get Started Free</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex flex-col justify-center">
      {/* 移除原有的背景代码，由 MagicBackground 全局组件接管 */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <FadeIn>
          <SectionBadge>Notra AI 2.0 is Here</SectionBadge>
          
          {/* Batch 2: Headline Font Recovery (Bold Sans-Serif) & Batch 3: Contrast Fix */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-8 leading-[1.1] headline-glow">
            Turn chaos into <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
              structured knowledge.
            </span>
          </h1>
          
          {/* Batch 2: Subhead Layout Polish */}
          <h2 className="text-lg md:text-2xl font-medium text-indigo-200/80 mb-8 font-serif italic">
            "Notes for a New Era."
          </h2>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
            Your AI copilot for academic excellence. Upload lectures, slides, or papers, 
            and instantly generate structured notes, flashcards, and summaries.
          </p>
          
          {/* Batch 6: Button Polish */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/dashboard">
              <Button variant="gradient" icon={Sparkles} className="w-full sm:w-auto h-14 px-10 text-base shadow-indigo-500/20 hover:shadow-indigo-500/40">
                Go to Dashboard
              </Button>
            </Link>
            
            <Link href="#features">
              <Button variant="secondary" icon={Play} className="w-full sm:w-auto h-14 px-10 text-base text-white border-white/10 hover:bg-white/10">
                See Features
              </Button>
            </Link>
          </div>
        </FadeIn>

        {/* Batch 4: Hero Image Update (First-person math notes) */}
        <FadeIn delay={200}>
          <div className="relative mx-auto max-w-5xl">
            <div className="relative rounded-3xl bg-white/5 p-2 lg:p-3 backdrop-blur-sm ring-1 ring-white/10">
               <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[16/9] relative group">
                  <img 
                    src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2940&auto=format&fit=crop" 
                    alt="First person view of writing math notes" 
                    className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out opacity-90 hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C15]/80 via-transparent to-transparent"></div>
                  
                  {/* Floating UI Card */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[60%] bg-[#1A1B26]/90 backdrop-blur-md rounded-xl shadow-xl border border-white/10 p-5 text-left flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-700">
                     <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                       <Brain size={20} />
                     </div>
                     <div className="flex-1">
                        <h3 className="text-sm font-bold text-white mb-1">Analyzing "Calculus III - Partial Derivatives"</h3>
                        <div className="space-y-2">
                           <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full w-[85%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
                           </div>
                           <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider">
                              <span>Processing formulas...</span>
                              <span>85%</span>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Try Notra AI Button - 在图片中间 */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <Link href="/chat">
                      <Button 
                        variant="gradient" 
                        icon={Sparkles} 
                        className="h-14 px-10 text-base shadow-indigo-500/20 hover:shadow-indigo-500/40"
                      >
                        Try Notra AI
                      </Button>
                    </Link>
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
  <div className="bg-transparent border-y border-white/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-10">
        Trusted by 50,000+ students from top universities worldwide
      </p>
      <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-500">
         {['Stanford', 'MIT', 'Oxford', 'Cambridge', 'NUS', 'Toronto'].map(uni => (
           <span key={uni} className="text-xl font-serif font-bold text-slate-300">{uni}</span>
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
      // 🌟 图片更新：写实风格，戴耳机的学生
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2940&auto=format&fit=crop"
    },
    {
      title: "Document Analysis",
      subtitle: "PDF to Insight",
      desc: "Stop highlighting everything. Upload 500+ page textbooks or research papers. Notra acts as your personal TA, extracting key arguments, formulas, and generating exam-ready summaries.",
      icon: FileText,
      bullets: ["OCR for Scanned Docs", "Formula Extraction", "Auto-Flashcard Generation"],
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2940&auto=format&fit=crop"
    },
    // Batch 5: New Video Analysis Feature
    {
      title: "Turn videos into notes",
      subtitle: "Video Analysis",
      desc: "Paste a video link from platforms like YouTube, Bilibili or classroom recordings, and Notra will generate summaries, key concepts, quizzes and flashcards from the content.",
      icon: Video,
      bullets: ["YouTube & Bilibili Support", "Key Moment Extraction", "Auto-generated Quizzes"],
      // 🌟 图片更新：写实风格，观看屏幕学习
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2940&auto=format&fit=crop"
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
    <section id="features" className="py-32 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <SectionBadge>Core Capabilities</SectionBadge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
             Not just a tool. <br/>
             Your academic <span className="text-indigo-400">second brain.</span>
          </h2>
        </div>

        <div className="space-y-32">
          {features.map((feature, idx) => (
            <FadeIn key={idx}>
              <div className={`flex flex-col lg:flex-row gap-16 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                
                {/* Text Content */}
                <div className="flex-1 space-y-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm">
                    <feature.icon size={28} />
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-indigo-400 mb-2 uppercase tracking-wider">{feature.subtitle}</p>
                    <h3 className="text-3xl font-bold text-white">{feature.title}</h3>
                  </div>

                  <p className="text-lg text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                  
                  <ul className="space-y-4 pt-4">
                    {feature.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-center bg-white/5 p-3 rounded-lg border border-white/5 shadow-sm w-fit">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                           <Check size={14} className="text-green-400" />
                        </div>
                        <span className="text-slate-300 font-medium">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Image Card */}
                <div className="flex-1 w-full">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 group aspect-[4/3]">
                     <img 
                       src={feature.image} 
                       alt={feature.title} 
                       className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                     />
                     <div className="absolute inset-0 bg-indigo-900/20 group-hover:bg-transparent transition-colors duration-500"></div>
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
    <section className="py-32 bg-transparent relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
           <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why top students choose Notra</h2>
           <p className="text-slate-400 max-w-2xl mx-auto text-lg">Everything you need to excel in your studies, minus the busywork.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, idx) => (
            <FadeIn key={idx} delay={idx * 100}>
              <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors duration-300 h-full">
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
  <section className="py-32 bg-transparent">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <SectionBadge>Workflow</SectionBadge>
        <h2 className="text-4xl font-bold text-white mb-6">From material to mastery</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-12 relative">
        <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-800 -z-10"></div>
        {[
          { step: "01", title: "Upload or Record", desc: "Drop your lecture slides, PDFs, or start recording in the classroom." },
          { step: "02", title: "AI Processing", desc: "Select your preferred model. Notra deconstructs the content into key concepts." },
          { step: "03", title: "Master & Review", desc: "Receive structured notes, take quizzes, and chat with your materials." },
        ].map((item, idx) => (
          <FadeIn key={idx} delay={idx * 200}>
            <div className="relative bg-transparent group p-4">
               <div className="w-24 h-24 mx-auto bg-white/5 border-4 border-indigo-900/50 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-400 mb-8 shadow-lg group-hover:scale-110 group-hover:border-indigo-500/50 transition-transform duration-300">
                 {item.step}
               </div>
               <h3 className="text-xl font-bold text-white mb-4 text-center">{item.title}</h3>
               <p className="text-slate-400 text-center leading-relaxed">{item.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

const FAQ = () => (
  <section id="faq" className="py-24 bg-transparent border-t border-white/5">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {[
          { q: "Is Notra free to use?", a: "Yes, we offer a generous Free Plan that includes daily access to GPT-4o-mini and essential note-taking features." },
          { q: "Which languages are supported?", a: "We support mixed recognition for over 30+ languages including English, Mandarin, Japanese, and Spanish. Perfect for international students." },
          { q: "How is this different from ChatGPT?", a: "ChatGPT is a generalist. Notra is purpose-built for structured knowledge. We integrate long-context document parsing, OCR, and specialized academic prompts that general chatbots lack." },
        ].map((item, idx) => (
          <div key={idx} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-indigo-500/30 transition-colors">
            <button className="w-full flex justify-between items-center p-6 text-left focus:outline-none group">
              <span className="font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">{item.q}</span>
              <ChevronDown size={20} className="text-slate-500 group-hover:text-indigo-400" />
            </button>
            <div className="px-6 pb-6 text-slate-400 leading-relaxed">
              {item.a}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[#050508]/80 backdrop-blur-lg text-slate-400 py-16 border-t border-white/5 relative z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 mb-6 group">
            <NotraLogo size="sm" showText={true} variant="minimal" />
          </Link>
          <p className="text-slate-500 mb-6 leading-relaxed">
            Notes for a New Era. <br/>
            Your intelligent learning companion for the future of education.
          </p>
          {/* Social Icons Placeholders */}
          <div className="flex gap-4">
             <div className="w-8 h-8 bg-white/10 rounded-full hover:bg-indigo-600 transition-colors cursor-pointer"></div>
             <div className="w-8 h-8 bg-white/10 rounded-full hover:bg-indigo-600 transition-colors cursor-pointer"></div>
             <div className="w-8 h-8 bg-white/10 rounded-full hover:bg-indigo-600 transition-colors cursor-pointer"></div>
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
                 <li key={lIdx}><Link href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">{link}</Link></li>
               ))}
             </ul>
           </div>
        ))}
      </div>
      
      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-slate-600">© 2025 NotraStudio. All rights reserved.</div>
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
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [bookAnimation, setBookAnimation] = useState('magic-book-enter');
  
  useEffect(() => {
    // 触发魔法书开场动画
    setTimeout(() => {
      setBookAnimation('magic-book-active');
    }, 100);
    
    // Check onboarding status on mount
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('onboarding_complete');
      if (onboarded !== 'true') {
        // Redirect to onboarding step 1 if not completed
        // Use replace to avoid showing homepage background
        router.replace('/onboarding/step1');
        return;
      }
      setIsChecking(false);
    }
  }, [router]);

  // Show loading state with onboarding background during check
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    // 使用 perspective-container 包装整个页面以实现 3D 效果
    <div className="perspective-container bg-transparent font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      <div className={bookAnimation}>
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
    </div>
  );
}