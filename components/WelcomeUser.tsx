'use client';

import React, { useState, useEffect } from 'react';

export default function WelcomeUser() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('user_display_name');
      const loggedIn = localStorage.getItem('user_logged_in') === 'true';
      
      if (name && loggedIn) {
        setDisplayName(name);
        setIsLoggedIn(true);
      }
    }
  }, []);

  // Show "Welcome, Student" if not logged in, or nothing if no name
  if (!displayName) {
    return null;
  }

  return (
    <div className="flex flex-col items-start animate-in fade-in slide-in-from-top-2 duration-700">
      <div className="flex items-center gap-2">
        <span className="text-base md:text-lg font-medium text-slate-300 dark:text-slate-300">
          Welcome,
        </span>
        <span 
          className="text-base md:text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 dark:from-purple-300 dark:via-indigo-300 dark:to-blue-300"
          style={{
            textShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
            animation: 'welcomeGlow 3s ease-in-out infinite',
          }}
        >
          {displayName}
        </span>
      </div>
    </div>
  );
}

