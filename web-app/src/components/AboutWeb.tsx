import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  SlidersHorizontal, ArrowUpRight, PiggyBank, Bot, 
  CheckCircle2, Sparkles, BookOpen, FileVideo
} from 'lucide-react';
import { useThemeStyles } from './DashboardWeb';

export type VideoGuideItem = {
  id: number;
  title: string;
  badge: string;
  icon: any;
  color: string;
  accentColor: string;
  summary: string;
  videoUrl: string;
  steps: string[];
};

export const AboutWeb: React.FC = () => {
  const cStyles = useThemeStyles();
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);

  // Exactly 4 primary video tutorials
  const videoTutorials: VideoGuideItem[] = [
    {
      id: 1,
      title: '1. Full Application & Wallets Walkthrough',
      badge: 'Video Tutorial 1',
      icon: SlidersHorizontal,
      color: 'from-emerald-500 to-cyan-500',
      accentColor: 'text-emerald-400',
      summary: 'Master scrubbing wallet seekbars, present balance available, and funding accounts.',
      videoUrl: '/videos/1st tutorial CB.mp4',
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
      badge: 'Video Tutorial 2',
      icon: ArrowUpRight,
      color: 'from-blue-500 to-indigo-500',
      accentColor: 'text-blue-400',
      summary: 'Track income, expenses, categories, and account allocations in real time.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
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
      badge: 'Video Tutorial 3',
      icon: PiggyBank,
      color: 'from-pink-500 to-purple-500',
      accentColor: 'text-pink-400',
      summary: 'Set spending caps per category and receive automated visual guardrail warnings.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
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
      badge: 'Video Tutorial 4',
      icon: Bot,
      color: 'from-amber-500 to-orange-500',
      accentColor: 'text-amber-400',
      summary: 'Control your entire workspace using natural language AI instructions.',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      steps: [
        'Click "AI Advisor" in the left navigation panel.',
        'Type or dictate instructions like: "Add expense 500 Food" or "Log income 10000 Salary".',
        'Execute account commands e.g. "Create account HDFC Bank" or "Delete last transaction".',
        'Ask financial questions e.g. "Show my spending breakdown" or "Check budgets".'
      ]
    }
  ];

  const currentVideo = videoTutorials[activeVideoIndex] || videoTutorials[0];

  const renderVideoPlayer = (url: string, title: string) => {
    if (!url) return null;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0] || '';
      }
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full aspect-video rounded-2xl border border-gray-800 shadow-2xl bg-black"
        />
      );
    }

    return (
      <video
        controls
        autoPlay
        key={url}
        src={url}
        className="w-full max-h-[70vh] rounded-2xl bg-black object-contain border border-gray-800 shadow-2xl mx-auto block"
      >
        Your browser does not support HTML5 video.
      </video>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-5xl mx-auto pb-12"
    >
      {/* Hero Header */}
      <div className={`p-8 rounded-3xl ${cStyles.cardBg} ${cStyles.shadow} relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00FF88]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF007F]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#FF007F] via-[#00FF88] to-[#00E5FF] p-[3px] shadow-lg">
            <div className="w-full h-full bg-[#0B0B0F] rounded-2xl flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Application Interactive Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
              CoinBurst Official 4 Video Tutorials
            </h2>
            <p className={`${cStyles.textMuted} text-xs mt-1 max-w-lg`}>
              Watch step-by-step video demonstrations to master wallets, seekbars, ledger transactions, and AI commands.
            </p>
          </div>
        </div>

        <div className="shrink-0 relative z-10 flex flex-col items-end gap-2">
          <span className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Version 2.5 • 4 Video Series
          </span>
        </div>
      </div>

      {/* 4 Standalone Video Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {videoTutorials.map((video, idx) => {
          const Icon = video.icon;
          const isActive = activeVideoIndex === idx;
          return (
            <button
              key={video.id}
              onClick={() => setActiveVideoIndex(idx)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between gap-3 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border-emerald-400 shadow-lg scale-102'
                  : 'bg-white/5 text-gray-400 border-gray-800 hover:border-gray-700 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl bg-gradient-to-tr ${video.color} text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-400 text-black' : 'bg-white/10 text-gray-400'}`}>
                  Video {idx + 1}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{video.title}</h4>
                <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{video.summary}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Video Display Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVideo.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={`p-6 sm:p-8 rounded-3xl border ${cStyles.cardBg} ${cStyles.shadow} space-y-8`}
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/60 pb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl bg-gradient-to-tr ${currentVideo.color} text-white shadow-lg`}>
                <currentVideo.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight text-white">{currentVideo.title}</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {currentVideo.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{currentVideo.summary}</p>
              </div>
            </div>
          </div>

          {/* Main Video Player Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-black/90 shadow-2xl">
            {/* Video Canvas Header Bar */}
            <div className="px-4 py-2.5 bg-black/80 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-2 text-emerald-400 font-bold">
                <FileVideo className="w-4 h-4" /> Now Playing: {currentVideo.title}
              </span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Video {activeVideoIndex + 1} of 4
              </span>
            </div>

            {/* Video Player Display */}
            <div className="p-2 sm:p-4 bg-black">
              {renderVideoPlayer(currentVideo.videoUrl, currentVideo.title)}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-4 border-t border-gray-800/60 pt-6">
            <h4 className="text-sm font-black uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Step-by-Step Execution Guide:
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {currentVideo.steps.map((stepText, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-start gap-4 ${cStyles.ledgerFeedBg}`}>
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-semibold text-gray-200 leading-relaxed">
                    {stepText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Tech Stack Footer */}
      <div className={`p-6 rounded-2xl ${cStyles.cardBg} border space-y-4`}>
        <h4 className="font-black text-lg flex items-center gap-2">
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
