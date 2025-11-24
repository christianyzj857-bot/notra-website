'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Lock, Globe, Moon, Bell, LogOut, Trash2, 
  ChevronRight, Shield, ChevronLeft, Users, Settings as SettingsIcon
} from 'lucide-react';
import NotraLogo from '@/components/NotraLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CountrySwitcher from '@/components/CountrySwitcher';
import { t, getUILanguage } from '@/lib/i18n';
import { getEducationModeByCountry, type EducationMode } from '@/lib/educationMode';

export default function SettingsPage() {
  const [user, setUser] = useState<{
    email: string;
    displayName: string;
    plan: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('space');
  const [uiLanguage, setUILanguage] = useState('en');
  const [contentLanguage, setContentLanguage] = useState('en');
  const [country, setCountry] = useState<string>('');
  const [educationMode, setEducationMode] = useState<EducationMode>('western');

  // 在客户端挂载后初始化语言状态，避免服务端渲染不匹配
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('user_email');
      const displayName = localStorage.getItem('user_display_name') || 'User';
      const plan = localStorage.getItem('user_plan') || 'free';
      
      // 使用 getUILanguage() 获取初始语言状态
      const currentLang = getUILanguage();
      setUILanguage(currentLang);
      // 内容语言默认与 UI 语言一致，也可以单独从 localStorage 获取
      setContentLanguage(localStorage.getItem('content_language') || currentLang);
      
      const savedCountry = localStorage.getItem('onboarding_country') || '';
      setCountry(savedCountry);
      
      // Set education mode based on country
      if (savedCountry) {
        const mode = getEducationModeByCountry(savedCountry);
        setEducationMode(mode);
      }
      
      if (email) {
        setUser({ email, displayName, plan });
      } else {
        // Redirect to login if not logged in
        window.location.href = '/login';
      }
    }
  }, []);
  
  // 处理 UI 语言变更的函数
  const handleUILanguageChange = (lang: string) => {
    // 1. 规范化语言代码为小写格式 (如 'zh-cn')
    let normalizedLang = lang.toLowerCase();
    if (normalizedLang === 'zhcn') normalizedLang = 'zh-cn';
    if (normalizedLang === 'zhtw') normalizedLang = 'zh-tw';

    console.log('[Settings] Changing UI language to:', normalizedLang);

    // 2. 保存到相关的 localStorage 键
    localStorage.setItem('ui_language', normalizedLang);
    // 通常 UI 语言改变时，偏好的内容语言也会随之改变
    localStorage.setItem('content_language', normalizedLang);
    // 也可以更新 onboarding 语言选项作为备份
    localStorage.setItem('onboarding_content_language', normalizedLang);

    // 更新状态
    setUILanguage(normalizedLang);
    setContentLanguage(normalizedLang);

    // 3. 刷新页面以应用新的语言设置
    // 使用短暂延迟确保 localStorage 已成功写入
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };
  
  // 处理内容语言变更 (如果需要单独设置)
  const handleContentLanguageChange = (lang: string) => {
     // 同样进行规范化
    let normalizedLang = lang.toLowerCase();
    if (normalizedLang === 'zhcn') normalizedLang = 'zh-cn';
    if (normalizedLang === 'zhtw') normalizedLang = 'zh-tw';
    localStorage.setItem('content_language', normalizedLang);
    setContentLanguage(normalizedLang);
    // 内容语言改变通常不需要刷新整个页面
  };
  
  const handleCountryChange = (newCountry: string) => {
    localStorage.setItem('onboarding_country', newCountry);
    setCountry(newCountry);
    const newMode = getEducationModeByCountry(newCountry);
    setEducationMode(newMode);
    alert(t('settings.countryChanged', { mode: t(`settings.mode.${newMode.toLowerCase()}`) }));
  };

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
    
    // Redirect to home
    window.location.href = '/';
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0C15] flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C15] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0C15]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/" className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <NotraLogo size="sm" showText={true} variant="minimal" />
            </Link>
            <h1 className="text-lg font-semibold text-white ml-4">Settings</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
              
              <div className="pt-6 mt-6 border-t border-white/5">
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 space-y-6">
            
            {/* Account Section */}
            <section id="account" className={`space-y-6 ${activeTab !== 'account' && 'hidden lg:block'}`}>
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <User className="text-indigo-400" size={24} /> Account Info
                </h2>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl ring-4 ring-white/5">
                    {user.displayName[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">@{user.displayName}</h3>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {user.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    </div>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={user.displayName} 
                        readOnly 
                        className="flex-1 bg-[#0B0C15] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      value={user.email} 
                      readOnly 
                      className="w-full bg-[#0B0C15] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm text-slate-400">Want to use a different account?</span>
                  <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <Users size={14} /> Switch Account
                  </button>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section id="security" className={`space-y-6 ${activeTab !== 'security' && 'hidden lg:block'}`}>
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Lock className="text-emerald-400" size={24} /> Security
                </h2>
                
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                    <div className="text-left">
                      <div className="font-medium text-slate-200 group-hover:text-white">Change Password</div>
                      <div className="text-xs text-slate-500">Last changed 3 months ago</div>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                    <div className="text-left">
                      <div className="font-medium text-slate-200 group-hover:text-white">Two-Factor Authentication</div>
                      <div className="text-xs text-emerald-500 flex items-center gap-1">
                        <Shield size={10} /> Enabled
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                      ON
                    </div>
                  </button>
                </div>
              </div>
            </section>

            {/* Preferences Section */}
            <section id="preferences" className={`space-y-6 ${activeTab !== 'preferences' && 'hidden lg:block'} relative`}>
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl relative">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Globe className="text-blue-400" size={24} /> Appearance & Language
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Light', 'Dark', 'Space'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t.toLowerCase())}
                          className={`flex items-center justify-center py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                            theme === t.toLowerCase()
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                              : 'bg-[#0B0C15] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    {/* Single Language Switcher - controls both UI and Content language */}
                    <div>
                      <LanguageSwitcher
                        value={uiLanguage}
                        onChange={handleUILanguageChange}
                        variant="dropdown"
                        size="md"
                        showLabel={true}
                      />
                      <p className="text-xs text-slate-400 mt-2">
                        {t('settings.uiLanguageHint')} {t('settings.contentLanguageHint')}
                      </p>
                    </div>
                    {/* Country Switcher */}
                    <div>
                      <CountrySwitcher
                        value={country}
                        onChange={handleCountryChange}
                        size="md"
                        showLabel={true}
                      />
                      {educationMode && (
                        <p className="text-xs text-slate-400 mt-2">
                          {t('settings.educationMode')}: {t(`settings.mode.${educationMode.toLowerCase()}`)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Notifications Section */}
            <section id="notifications" className={`space-y-6 ${activeTab !== 'notifications' && 'hidden lg:block'}`}>
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Bell className="text-yellow-400" size={24} /> Notifications
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <div className="font-medium text-slate-200">Email Notifications</div>
                      <div className="text-xs text-slate-500">Receive updates about your account</div>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notifications ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications ? 'translate-x-6' : ''
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="pt-8">
              <div className="rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
                <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                  <Trash2 size={18} /> Danger Zone
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  Deleting your account is permanent. All your notes, flashcards, and chat history will be wiped immediately.
                </p>
                <button className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold transition-colors">
                  Delete Account
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

