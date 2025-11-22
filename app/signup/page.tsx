'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';
import NotraLogo from '@/components/NotraLogo';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already onboarded (optional check)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('onboarding_complete');
      if (!onboarded || onboarded !== 'true') {
        // If not onboarded, redirect to onboarding
        window.location.href = '/onboarding/step1';
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // TODO: Implement actual signup logic with backend
    // For now, just simulate signup and redirect to HOME (not dashboard)
    setTimeout(() => {
      setIsLoading(false);
      // Store user info (mock for now)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_display_name', displayName || 'Notra Learner');
        localStorage.setItem('user_logged_in', 'true');
        // Redirect to HOME page (not dashboard) - user can access Dashboard from Home
        window.location.href = '/';
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in duration-500">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center cursor-pointer group mb-6">
            <div className="mr-3">
              <NotraLogo size="lg" />
            </div>
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
              Notra
            </span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            Create your account
          </h1>
          <p className="text-lg text-slate-600">
            Start your learning journey with Notra
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name Field */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-slate-700 mb-2">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Pick a name, e.g. &quot;MathNinja&quot;"
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                This is how you'll appear in Notra. You can use a nickname.
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Google Signup Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              // TODO: Implement actual Google OAuth logic
              // For now, simulate Google login and redirect to HOME
              setIsLoading(true);
              setTimeout(() => {
                if (typeof window !== 'undefined') {
                  // Mock: Set user info from Google (in real app, get from OAuth response)
                  localStorage.setItem('user_email', 'user@example.com');
                  localStorage.setItem('user_display_name', 'Google User');
                  localStorage.setItem('user_logged_in', 'true');
                  // Redirect to HOME page (not chat or dashboard)
                  window.location.href = '/';
                }
              }, 1000);
            }}
            className="w-full py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue with Google
          </button>

          {/* Login Link */}
          <p className="text-center text-slate-600 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Log in
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-slate-500 mt-6">
          By signing up, you agree to Notra's{' '}
          <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

