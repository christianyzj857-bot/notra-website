'use client';

import React from 'react';

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

export default function NotraApp() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
          <span className="font-bold text-2xl">N</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Notra AI</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          This is your personal dashboard. <br/>
          Ready to start learning?
        </p>
        
        <Link 
          href="/chat" 
          className="inline-flex items-center justify-center w-full px-6 py-3.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
        >
          Launch Chat Interface →
        </Link>
      </div>
    </div>
  );
}