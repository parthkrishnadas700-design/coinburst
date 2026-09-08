import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInAsGuest } from '../shared/firebase';
import coinburstLogo from '../assets/coinburst_logo.png';
import { useFinanceStore } from '../shared/useFinanceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, TrendingUp, ShieldCheck, Palette, Smartphone, 
  User, Sparkles, ArrowRight, Zap
} from 'lucide-react';
import { TermsModal } from './TermsModal';

export const LandingPage: React.FC = () => {
  const user = useFinanceStore(state => state.user);
  const [showTerms, setShowTerms] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuestEntry = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInAsGuest(name.trim() || 'Wealth Builder');
      // Play success chime
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-84.wav');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (err: any) {
      console.error("Guest Entry Error:", err);
      setError(err.message?.replace('Firebase: ', '') || 'Failed to initialize session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#07050F] via-[#0F0C20] to-[#170E30] text-white font-sans overflow-x-hidden flex flex-col justify-between relative selection:bg-emerald-500 selection:text-black">
      {/* Abstract Animated Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#FF007F]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#00FF88]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF007F] via-[#00FF88] to-[#00E5FF] p-[2px] shadow-md">
            <div className="w-full h-full bg-[#0B0B0F] rounded-xl flex items-center justify-center p-1 overflow-hidden">
              <img src={coinburstLogo} alt="CoinBurst Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
          </div>
          <div>
            <h1 className="font-['Poppins'] font-black text-lg tracking-wider">COINBURST</h1>
            <span className="font-['Manrope'] text-[9px] tracking-widest text-emerald-400 font-semibold uppercase">Wealth Hub</span>
          </div>
        </div>
        {user && (
          <Link
            to="/home"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-2 transition-all no-underline shadow-lg shadow-emerald-500/20"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </header>

      {/* Main Hero & Auth Portal */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start relative z-10 flex-1">
        {/* Left Hand: Features & Marketing Pitch */}
        <div className="order-last lg:order-first lg:col-span-7 space-y-8 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Revolutionizing Personal Finance
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
              Your Capital.<br/>
              Highly Secured.<br/>
              Intelligently Synced.
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-xl leading-relaxed">
              CoinBurst is a premium decentralised financial nexus. Log your transactions, enforce gamified budgets with liquid progress gauges, consult your personal autonomous AI advisor, and experience real-time sync across web and mobile platforms.
            </p>
          </motion.div>

          {/* Core Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {[
              {
                icon: Bot,
                title: "AI Portfolio Advisor",
                desc: "An integrated in-browser tactical AI advisor providing real-time capital flow feedback."
              },
              {
                icon: TrendingUp,
                title: "Comparative Analytics",
                desc: "Beautiful daily comparative inflow vs. outflow charts outlining net savings rate."
              },
              {
                icon: ShieldCheck,
                title: "Gamified Budget Limiters",
                desc: "Set category boundaries powered by reactive, gorgeous liquid SVG progress indicators."
              },
              {
                icon: Palette,
                title: "Five Interactive Themes",
                desc: "Instantly switch global aesthetics (True Dark, Soft Light, Retro Cyber, Glass Synthwave, Forest Zen) with sound chimes."
              },
              {
                icon: Smartphone,
                title: "Full Realtime Mobile Sync",
                desc: "Syncs directly with React Native app nodes via Firebase Realtime Database."
              }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx} 
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm text-white mt-4">{feat.title}</h4>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Right Hand: Interactive 1-Click Guest Access Portal */}
        <div className="order-first lg:order-last lg:col-span-5 flex justify-center w-full lg:sticky lg:top-24 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden"
          >
            {/* Soft decorative blur */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                Unlock Your Vault
              </h3>
              <p className="text-xs text-gray-400 mt-1.5">
                Instant guest access • Seamless real-time cloud sync
              </p>
            </div>

            {/* Error Message banner */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium leading-normal"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instant Guest Entry Form */}
            <form onSubmit={handleGuestEntry} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                  Operative Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Wealth Builder"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white transition-all duration-300 placeholder:text-gray-600"
                  />
                </div>
                <p className="text-[10px] text-gray-500 font-medium pl-1">
                  Leave blank to proceed as "Wealth Builder"
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#07050F] font-black uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_25px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.5)] hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <span className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>Enter Vault as Guest</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Privacy & Security Feature Highlights */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero credentials or passwords required</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Encrypted private ledger synced to cloud</span>
              </div>
            </div>

            {/* Terms & Conditions Notice */}
            <p className="text-[10px] text-gray-400 text-center mt-5 leading-relaxed">
              By entering the vault, you agree to our{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline font-semibold inline"
              >
                Terms & Conditions
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline font-semibold inline"
              >
                Privacy Policy
              </a>.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6 relative z-10">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 CoinBurst Wealth Hub.</p>
          <div className="flex gap-6">
            <a 
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors text-xs text-gray-400"
            >
              Terms & Conditions
            </a>
            <a 
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors text-xs text-gray-400"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>

      {/* Terms & Conditions Modal */}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};
