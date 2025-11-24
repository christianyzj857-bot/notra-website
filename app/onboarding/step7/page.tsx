'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initial: string;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Notra has completely transformed how I study. The AI-generated notes are incredibly detailed and the flashcards help me retain concepts much faster. My grades have improved significantly since using Notra.",
    name: "Sarah Chen",
    role: "Undergraduate Student, Stanford University",
    initial: "S",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    quote: "As a master's student at Oxford, I'm constantly juggling dense readings and research papers. Notra turns long PDFs into clear, structured notes and quizzes so I can focus on understanding ideas instead of formatting them.",
    name: "James Miller",
    role: "Master's Student, University of Oxford",
    initial: "J",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    quote: "I use Notra to share organized lecture summaries with my students. The generated quizzes and flashcards keep them engaged between classes and make exam revision much more effective.",
    name: "Dr. Emily Turner",
    role: "Lecturer in Economics, MIT",
    initial: "E",
    gradient: "from-orange-500 to-red-600",
  },
];

export default function OnboardingStep7() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Check if user came from step6
    if (typeof window !== 'undefined') {
      const stage = localStorage.getItem('onboarding_stage');
      if (!stage) {
        router.replace('/onboarding/step1');
      }
    }

    // Auto-rotate testimonials every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const handleJoinNow = () => {
    // Set onboarding as complete
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_complete', 'true');
      // Navigate to signup page (not homepage)
      router.push('/signup');
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EDE5FF] to-white flex items-center justify-center p-4">
      <div className="max-w-5xl w-full text-center animate-in fade-in duration-500">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
          1 Million Students trust Notra
        </h1>

        {/* Rating */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-6 h-6 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <span className="text-2xl font-bold text-slate-900">4.8</span>
          <span className="text-xl text-slate-600">25K reviews</span>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative mb-8">
          {/* Desktop: Show multiple cards side by side */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 mb-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-slate-100 transition-all duration-300 ${
                  index === currentIndex ? 'scale-105 shadow-2xl' : 'opacity-75'
                }`}
              >
                <div className="flex justify-center mb-4">
                  <Quote className="w-10 h-10 text-[#9F6BFF]" />
                </div>
                <p className="text-base md:text-lg text-slate-700 leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                    {testimonial.initial}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-sm">{testimonial.name}</p>
                    <p className="text-slate-600 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Single card with navigation */}
          <div className="md:hidden relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="min-w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
                  >
                    <div className="flex justify-center mb-6">
                      <Quote className="w-12 h-12 text-[#9F6BFF]" />
                    </div>
                    <p className="text-xl text-slate-700 leading-relaxed mb-6 italic">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                        {testimonial.initial}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900">{testimonial.name}</p>
                        <p className="text-slate-600 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="hidden md:flex items-center justify-center gap-4 mb-4">
            <button
              onClick={goToPrevious}
              className="w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={goToNext}
              className="w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-3 h-3 bg-[#9F6BFF]'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : undefined}
              />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleJoinNow}
          className="px-12 py-5 bg-[#9F6BFF] text-white font-bold text-xl rounded-xl hover:bg-[#8B5CF6] transition-all shadow-xl hover:shadow-2xl hover:scale-105"
        >
          Join Now – It's Free
        </button>
      </div>
    </div>
  );
}

