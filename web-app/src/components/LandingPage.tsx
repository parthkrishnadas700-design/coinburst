import React, { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../shared/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, TrendingUp, ShieldCheck, Palette, Smartphone, 
  Mail, Lock, User, Sparkles, ArrowRight
} from 'lucide-react';
import { TermsModal } from './TermsModal';

export const LandingPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      // Play success chime
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-84.wav');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized in Firebase Console. Please add this domain to Firebase Auth -> Settings -> Authorized Domains.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Google Sign-In popup was closed. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Google Sign-In popup was blocked by your browser. Please enable popups.');
      } else {
        setError(err.message || 'Google Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Display Name is required for registration.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      // Play success chime
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-84.wav');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF007F] via-[#00FF88] to-[#00E5FF] p-[2px]">
            <div className="w-full h-full bg-[#0B0B0F] rounded-xl flex items-center justify-center">
              <span className="font-['Poppins'] font-black text-xl text-white">CB</span>
            </div>
          </div>
          <div>
            <h1 className="font-['Poppins'] font-black text-lg tracking-wider">COINBURST</h1>
            <span className="font-['Manrope'] text-[9px] tracking-widest text-emerald-400 font-semibold uppercase">Wealth Hub</span>
          </div>
        </div>
      </header>

      {/* Main Hero & Auth Portal */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 flex flex-col lg:grid lg:grid-cols-12 gap-12 items-center relative z-10 flex-1">
        {/* Left Hand: Features & Marketing Pitch */}
        <div className="lg:col-span-7 space-y-8 text-left">
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

        {/* Right Hand: Interactive Authentication Portal */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden"
          >
            {/* Soft decorative blur */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

            <div className="text-center mb-8">
              <h3 className="text-2xl font-black tracking-tight">
                {isSignUp ? 'Create Vault Node' : 'Unlock Your Vault'}
              </h3>
              <p className="text-xs text-gray-400 mt-1.5">
                {isSignUp ? 'Establish a secure credentials connection' : 'Provide signature keys to enter nexus'}
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

            {/* Auth Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    key="signup-name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5"
                  >
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Wealth Builder"
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white transition-all duration-300 placeholder:text-gray-600"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white transition-all duration-300 placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Security Key (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white transition-all duration-300 placeholder:text-gray-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07050F] font-black uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)]"
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Register Vault' : 'Decrypt Ledger'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6 text-center">
              <span className="absolute inset-x-0 top-1/2 border-t border-white/10" />
              <span className="relative z-10 px-3 bg-[#0F0C20] text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Or Continue With
              </span>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black hover:bg-gray-100 font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 border border-white/10 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.67 0 3.17.58 4.35 1.71l3.25-3.25C17.63 1.71 14.98 1 12 1 7.37 1 3.4 3.74 1.58 7.72l3.78 2.93C6.26 7.42 8.91 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.44c-.28 1.48-1.12 2.73-2.37 3.58l3.68 2.85c2.16-1.99 3.4-4.92 3.4-8.59z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.36 14.79c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.58 7.28C.78 8.87.33 10.66.33 12.5s.45 3.63 1.25 5.22l3.78-2.93z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.68-2.85c-1.02.68-2.33 1.09-3.95 1.09-3.09 0-5.74-2.38-6.68-5.61l-3.78 2.93C3.4 20.26 7.37 23 12 23z"
                />
              </svg>
              Google Identity
            </button>

            {/* Terms & Conditions Notice at Google Sign-In */}
            <p className="text-[10px] text-gray-400 text-center mt-3.5 leading-relaxed">
              By signing in with Google or registering, you agree to our{' '}
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

            {/* Toggle Switch */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-xs text-emerald-400 hover:underline font-semibold tracking-wide bg-transparent border-0 cursor-pointer"
              >
                {isSignUp 
                  ? 'Already have a secure vault? Sign in here' 
                  : 'New operative? Deploy your secure vault node'}
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6 relative z-10">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 CoinBurst Wealth Hub. Powered by Firebase Realtime Database.</p>
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
