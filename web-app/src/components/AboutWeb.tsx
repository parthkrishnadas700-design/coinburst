import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  SlidersHorizontal, ArrowUpRight, PiggyBank, Bot, 
  Settings, CheckCircle2, Sparkles, BookOpen, Video, Link, Check
} from 'lucide-react';
import { useThemeStyles } from './DashboardWeb';

export const AboutWeb: React.FC = () => {
  const cStyles = useThemeStyles();
  const [activeGuideTab, setActiveGuideTab] = useState<number>(0);
  const [videoUrls, setVideoUrls] = useState<Record<number, string>>({
    0: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    1: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    2: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    3: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    4: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutback2012.mp4',
  });
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
  const [inputUrl, setInputUrl] = useState<string>('');

  const guideSteps = [
    {
      id: 1,
      title: '1. Wallets Seekbar & Adding Money',
      badge: 'New Feature',
      icon: SlidersHorizontal,
      color: 'from-emerald-500 to-cyan-500',
      accentColor: 'text-emerald-400',
      summary: 'Inspect present amounts in any wallet and top up funds instantly.',
      steps: [
        'Navigate to Dashboard or Ledger view.',
        'Drag the horizontal Range Seekbar left/right or use < > arrows to scrub between wallets.',
        'View the Present Amount Available in large font along with Lifetime Inflow & Outflow.',
        'Click "+ Add Money to Wallet" or choose quick preset chips (+₹500 / +₹1,000 / +₹5,000).',
        'Use the in-card "Slide & Deposit" slider to dynamically choose deposit amounts and click Deposit.'
      ],
      videoSimText: 'Scrubbing Wallet Seekbar & Depositing Funds into Chase Savings'
    },
    {
      id: 2,
      title: '2. Ledger & Transaction Recording',
      badge: 'Core Ledger',
      icon: ArrowUpRight,
      color: 'from-blue-500 to-indigo-500',
      accentColor: 'text-blue-400',
      summary: 'Track income, expenses, categories, and account allocations.',
      steps: [
        'Open "Ledger & Entry" from the sidebar.',
        'Click "+ Add Transaction" to launch the entry wizard.',
        'Choose Transaction Type (Income vs Expense), select target Wallet Node, and enter Amount.',
        'Assign Category (Food, Salary, Bills, Shopping) and write an optional note.',
        'Filter or search history instantly using the live search bar or delete items with confirmation.'
      ],
      videoSimText: 'Logging Income & Expenses into Specific Wallet Nodes'
    },
    {
      id: 3,
      title: '3. Smart Budgets & Sentinels',
      badge: 'Financial Guardrails',
      icon: PiggyBank,
      color: 'from-pink-500 to-purple-500',
      accentColor: 'text-pink-400',
      summary: 'Set spending limits per category and prevent overspending.',
      steps: [
        'Open "Smart Budgets" tab.',
        'Set monthly budget caps for individual categories (e.g., ₹5,000 for Groceries).',
        'Watch the Liquid Budget Bar fill up as transactions are recorded.',
        'Receive automated visual warnings when approaching or exceeding your target budget.'
      ],
      videoSimText: 'Creating Category Limits & Liquid Progress Indicators'
    },
    {
      id: 4,
      title: '4. AI Advisor & Voice Commands',
      badge: 'Smart Engine',
      icon: Bot,
      color: 'from-amber-500 to-orange-500',
      accentColor: 'text-amber-400',
      summary: 'Control your entire workspace using natural language instructions.',
      steps: [
        'Click "AI Advisor" in the left navigation panel.',
        'Type or dictate instructions like: "Add expense 500 Food" or "Log income 10000 Salary".',
        'Execute account commands e.g. "Create account HDFC Bank" or "Delete last transaction".',
        'Ask financial questions e.g. "Show my spending breakdown" or "Check budgets".'
      ],
      videoSimText: 'Using Natural Language AI Engine to Perform Ledger Actions'
    },
    {
      id: 5,
      title: '5. Themes & Multi-Currency Settings',
      badge: 'Customization',
      icon: Settings,
      color: 'from-cyan-500 to-emerald-500',
      accentColor: 'text-cyan-400',
      summary: 'Personalize your display currency and visual aesthetics.',
      steps: [
        'Navigate to "User Theme" settings.',
        'Select your preferred currency (INR ₹, USD $, EUR €, GBP £, JPY ¥, AED, CAD, AUD).',
        'Switch theme presets: Dark Mode, Minimal Light, Cyberpunk Neon, Glassmorphism, Forest, or Synthwave.',
        'Profile changes sync automatically across all logged-in devices via Firebase.'
      ],
      videoSimText: 'Changing Theme Styles and Currency Formats in Real-Time'
    }
  ];

  const currentStep = guideSteps[activeGuideTab];
  const currentVideoUrl = videoUrls[activeGuideTab] || '';

  const handleSaveVideoUrl = () => {
    if (inputUrl.trim()) {
      setVideoUrls(prev => ({ ...prev, [activeGuideTab]: inputUrl.trim() }));
    }
    setEditingVideoIndex(null);
    setInputUrl('');
  };

  const renderVideoPlayer = (url: string, title: string) => {
    if (!url) return null;

    // Check YouTube link
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

    // Direct HTML5 video file (.mp4, .webm, etc.)
    return (
      <video
        controls
        key={url}
        src={url}
        className="w-full aspect-video rounded-2xl bg-black object-cover border border-gray-800 shadow-2xl"
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
              CoinBurst Master Guide & Video Tutorials
            </h2>
            <p className={`${cStyles.textMuted} text-xs mt-1 max-w-lg`}>
              Complete step-by-step manual and interactive video demonstrations to master wallets, seekbars, ledger transactions, and AI commands.
            </p>
          </div>
        </div>

        <div className="shrink-0 relative z-10 flex flex-col items-end gap-2">
          <span className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Version 2.5 • Video Enabled
          </span>
        </div>
      </div>

      {/* Guide Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {guideSteps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeGuideTab === idx;
          return (
            <button
              key={step.id}
              onClick={() => {
                setActiveGuideTab(idx);
                setEditingVideoIndex(null);
              }}
              className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 border flex items-center gap-2.5 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border-emerald-400 shadow-lg scale-102'
                  : 'bg-white/5 text-gray-400 border-gray-800 hover:border-gray-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? step.accentColor : 'text-gray-400'}`} />
              <span>{step.title.split('.')[1]}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Video & Step Display Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={`p-6 sm:p-8 rounded-3xl border ${cStyles.cardBg} ${cStyles.shadow} space-y-8`}
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/60 pb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl bg-gradient-to-tr ${currentStep.color} text-white shadow-lg`}>
                <currentStep.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight text-white">{currentStep.title}</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {currentStep.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{currentStep.summary}</p>
              </div>
            </div>

            {/* Custom Video Embed Control Button */}
            <button
              onClick={() => {
                setEditingVideoIndex(editingVideoIndex === activeGuideTab ? null : activeGuideTab);
                setInputUrl(currentVideoUrl);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>{editingVideoIndex === activeGuideTab ? 'Cancel Edit' : '🎥 Change Video URL'}</span>
            </button>
          </div>

          {/* Edit Video URL Bar */}
          {editingVideoIndex === activeGuideTab && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3"
            >
              <label className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                <Link className="w-3.5 h-3.5" /> Paste Video Link (MP4 Direct URL or YouTube Watch Link):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://domain.com/video.mp4"
                  className="flex-1 px-4 py-2 rounded-xl bg-black/60 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={handleSaveVideoUrl}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Check className="w-4 h-4" /> Save Video
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Supports YouTube links (`youtube.com/watch?v=...`), YouTube Shorts, or direct `.mp4` video files.
              </p>
            </motion.div>
          )}

          {/* Video Player Box */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-black/80 shadow-2xl group">
            {/* Video Canvas Header Bar */}
            <div className="px-4 py-2.5 bg-black/80 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Video Player • {currentStep.videoSimText}
              </span>
              <span>HD 1080p • Live Stream</span>
            </div>

            {/* Video Player Element */}
            <div className="p-2 sm:p-4 bg-black">
              {renderVideoPlayer(currentVideoUrl, currentStep.title)}
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Step-by-Step Execution Guide:
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {currentStep.steps.map((stepText, idx) => (
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
