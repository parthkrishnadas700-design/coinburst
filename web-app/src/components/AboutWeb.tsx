import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Code, 
  SlidersHorizontal, ArrowUpRight, PiggyBank, Bot, Settings,
  CheckCircle2, Sparkles, BookOpen, ExternalLink, Globe, PlayCircle, Zap, Download
} from 'lucide-react';
import { useThemeStyles } from './DashboardWeb';
import { AdminPasscodeModal } from './AdminPasscodeModal';
import { PLAY_STORE_URL, triggerAppUpdateModal, checkAppUpdateStatus } from './UpdatePromptModal';

export type VideoGuideItem = {
  id: number;
  title: string;
  badge: string;
  icon: any;
  color: string;
  accentColor: string;
  summary: string;
  steps: string[];
};

export const AboutWeb: React.FC = () => {
  const cStyles = useThemeStyles();
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const currentVer = localStorage.getItem('coinburst_installed_ver') || '2.35.0';

  const handleManualCheck = async () => {
    setCheckingUpdate(true);
    const res = await checkAppUpdateStatus();
    setCheckingUpdate(false);
    if (res.isUpdateAvailable) {
      triggerAppUpdateModal(res.reason);
    } else {
      alert(`CoinBurst is up to date! You are running the latest official version (v${res.currentVersion}).`);
    }
  };

  const handleLogoTap = () => {
    setTapCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setShowAdminModal(true);
        return 0;
      }
      return next;
    });

    setTimeout(() => {
      setTapCount(0);
    }, 3000);
  };

  // 5 primary tutorial step guides
  const videoTutorials: VideoGuideItem[] = [
    {
      id: 1,
      title: '1. Full Application & Wallets Walkthrough',
      badge: 'Guide 1',
      icon: SlidersHorizontal,
      color: 'from-emerald-500 to-cyan-500',
      accentColor: 'text-emerald-400',
      summary: 'Master scrubbing wallet seekbars, present balance available, and funding accounts.',
      steps: [
        'Navigate to Dashboard or Ledger view.',
        'Drag the horizontal Range Seekbar left/right or use < > arrows to scrub between wallets.',
        'View the Present Amount Available in large font along with Lifetime Inflow & Outflow.',
        'Click "+ Add Money to Wallet" or choose quick preset chips (+₹500 / +₹1,000 / +₹5,000).'
      ]
    },
    {
      id: 2,
      title: '2. Ledger & Transaction Recording Guide',
      badge: 'Guide 2',
      icon: ArrowUpRight,
      color: 'from-blue-500 to-indigo-500',
      accentColor: 'text-blue-400',
      summary: 'Track income, expenses, categories, and account allocations in real time.',
      steps: [
        'Open "Ledger & Entry" from the sidebar.',
        'Click "+ Add Transaction" to launch the entry wizard.',
        'Choose Transaction Type (Income vs Expense), select target Wallet Node, and enter Amount.',
        'Assign Category (Food, Salary, Bills, Shopping) and search transaction history.'
      ]
    },
    {
      id: 3,
      title: '3. Smart Budgets & Category Sentinels',
      badge: 'Guide 3',
      icon: PiggyBank,
      color: 'from-pink-500 to-purple-500',
      accentColor: 'text-pink-400',
      summary: 'Set spending caps per category and receive automated visual guardrail warnings.',
      steps: [
        'Open "Smart Budgets" tab.',
        'Set monthly budget caps for individual categories (e.g., ₹5,000 for Groceries).',
        'Watch the Liquid Budget Bar fill up as transactions are recorded.',
        'Receive automated visual warnings when approaching or exceeding your target budget.'
      ]
    },
    {
      id: 4,
      title: '4. AI Advisor & Intelligent Command Engine',
      badge: 'Guide 4',
      icon: Bot,
      color: 'from-amber-500 to-orange-500',
      accentColor: 'text-amber-400',
      summary: 'Control your entire workspace using natural language AI instructions.',
      steps: [
        'Click "AI Advisor" in the left navigation panel.',
        'Type or dictate instructions like: "Add expense 500 Food" or "Log income 10000 Salary".',
        'Execute account commands e.g. "Create account HDFC Bank" or "Delete last transaction".',
        'Ask financial questions e.g. "Show my spending breakdown" or "Check budgets".'
      ]
    },
    {
      id: 5,
      title: '5. User Theme & Multi-Currency Settings',
      badge: 'Guide 5',
      icon: Settings,
      color: 'from-cyan-500 to-emerald-500',
      accentColor: 'text-cyan-400',
      summary: 'Personalize your display currency (INR, USD, EUR, etc.) and visual theme presets in real-time.',
      steps: [
        'Navigate to "User Theme & Preferences" in Settings.',
        'Select your preferred currency (INR ₹, USD $, EUR €, GBP £, JPY ¥, AED, CAD, AUD).',
        'Switch visual theme presets: Dark Mode, Minimal Light, Cyberpunk Neon, Glassmorphism, Forest, or Synthwave.',
        'Profile changes sync automatically across all logged-in devices via Firebase Cloud Sync.'
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-5xl mx-auto pb-12"
    >
      <AdminPasscodeModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={() => navigate('/settings')}
      />

      {/* Hero Header */}
      <div className={`p-8 rounded-3xl ${cStyles.cardBg} ${cStyles.shadow} relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/20`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00FF88]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF007F]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <div 
            onClick={handleLogoTap}
            className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#FF007F] via-[#00FF88] to-[#00E5FF] p-[3px] shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            title="CoinBurst Feature Guides (Tap 5x for Secret Admin Console)"
          >
            <div className="w-full h-full bg-[#0B0B0F] rounded-2xl flex items-center justify-center relative">
              <BookOpen className="w-10 h-10 text-emerald-400 animate-pulse" />
              {tapCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center animate-ping">
                  {tapCount}
                </span>
              )}
            </div>
          </div>
          <div onClick={handleLogoTap} className="cursor-pointer">
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Application Interactive Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
              CoinBurst Feature Guides
            </h2>
            <p className={`${cStyles.textMuted} text-xs mt-1 max-w-lg`}>
              Follow step-by-step guides to master wallets, seekbars, ledger transactions, AI commands, and user themes.
            </p>
          </div>
        </div>

        <div className="shrink-0 relative z-10 flex flex-col items-end gap-2">
          <button
            onClick={handleManualCheck}
            disabled={checkingUpdate}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer flex items-center gap-2"
          >
            <Zap className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
            <span>Installed: v{currentVer} • Check Updates</span>
          </button>
        </div>
      </div>

      {/* Official Google Play Store Release Banner */}
      <div className={`p-6 sm:p-7 rounded-3xl ${cStyles.cardBg} ${cStyles.shadow} border border-emerald-500/30 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6`}>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-black shadow-lg shrink-0">
            <Download className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" /> Official Android Application Release
            </span>
            <h3 className="text-lg font-black text-white mt-0.5">
              CoinBurst Wealth Hub on Google Play
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
              Verify your application version or update to the latest build on Google Play Store (Package: <span className="font-mono text-emerald-400">com.coinburst.app</span>).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
          <button
            onClick={handleManualCheck}
            disabled={checkingUpdate}
            className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
          >
            {checkingUpdate ? 'Checking...' : 'Check Status'}
          </button>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-105"
          >
            <Download className="w-4 h-4" />
            Play Store Page
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Official Website Video Statement Banner */}
      <a
        href="https://coinburst-zttp.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className={`p-6 sm:p-8 rounded-3xl ${cStyles.cardBg} ${cStyles.shadow} border border-cyan-500/30 hover:border-cyan-400/60 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 transition-all group cursor-pointer block`}
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
              Video Tutorials & Media Library
            </span>
            <h3 className="text-lg font-black text-white mt-0.5 group-hover:text-cyan-300 transition-colors">
              Looking for Detailed Video Tutorials?
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
              For detailed video walkthroughs and high-definition feature demonstrations, click here to visit the official CoinBurst website.
            </p>
          </div>
        </div>

        <div className="shrink-0 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:from-emerald-400 group-hover:to-cyan-400 text-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all transform group-hover:scale-105">
          <PlayCircle className="w-4 h-4 fill-black" />
          Visit Official Website
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </a>

      {/* 5 Detailed Step-by-Step Tutorial Execution Guides */}
      <div className="space-y-6">
        <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          Step-by-Step Execution Guides
        </h3>

        <div className="grid grid-cols-1 gap-6">
          {videoTutorials.map((video) => {
            const Icon = video.icon;
            return (
              <div
                key={video.id}
                className={`p-6 sm:p-8 rounded-3xl border ${cStyles.cardBg} ${cStyles.shadow} border-gray-800 space-y-5 hover:border-emerald-500/30 transition-all duration-300`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/60 pb-5">
                  <div className="flex items-center gap-4">
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${video.color} text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-white">{video.title}</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {video.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{video.summary}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Execution Steps:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {video.steps.map((stepText, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-gray-800/80 bg-white/5 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-xs font-medium text-gray-200 leading-relaxed">
                          {stepText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Stack Footer */}
      <div className={`p-6 rounded-2xl ${cStyles.cardBg} border border-gray-800 space-y-4`}>
        <h4 className="font-black text-lg flex items-center gap-2 text-white">
          <Code className={cStyles.accent} size={20} />
          Technical Stack & Security Architecture
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-400">
          <div>
            <strong className="text-white block mb-1">Frontend Engine:</strong>
            React 19, TypeScript, Zustand state persistence, Framer Motion, and Tailwind CSS.
          </div>
          <div>
            <strong className="text-white block mb-1">Backend & Mobile:</strong>
            Firebase Realtime Database sync, Capacitor Native Android SDK, and offline queue.
          </div>
        </div>
      </div>

    </motion.div>
  );
};
