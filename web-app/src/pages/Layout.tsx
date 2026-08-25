import React, { useState } from 'react';
import { useFinanceStore } from '../shared/useFinanceStore';
import { signOutUser } from "../shared/firebase";
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, ArrowUpRight, PiggyBank, Bot, Settings, Info, LogOut, RefreshCw, X, Flame, Users
} from 'lucide-react';
import { useThemeStyles } from '../components/DashboardWeb'; // temporarily importing styles

import { AdminBroadcastBanner } from '../components/AdminBroadcastBanner';
import { useScrollLock } from '../shared/useScrollLock';
import { CommandPaletteModal } from '../components/CommandPaletteModal';

export const Layout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const theme = useFinanceStore(state => state.theme);
  const user = useFinanceStore(state => state.user);
  const syncWithFirebase = useFinanceStore(state => state.syncWithFirebase);
  const loading = useFinanceStore(state => state.loading);
  const cStyles = useThemeStyles();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔒 Lock background scrolling completely when mobile sidebar is open
  useScrollLock(isMobileSidebarOpen);

  // ⚡ Global Keyboard Shortcut Listener (Ctrl + K / Cmd + K to open Command Palette)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSidebarSync = async () => {
    if (syncWithFirebase) {
      setIsSyncing(true);
      await syncWithFirebase();
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  const navItems = [
    { id: '/home', label: 'Dashboard', icon: BarChart3 },
    { id: '/transactions', label: 'Ledger & Entry', icon: ArrowUpRight },
    { id: '/budgets', label: 'Smart Budgets', icon: PiggyBank },
    { id: '/burn-rate', label: 'AI Burn Forecast', icon: Flame },
    { id: '/split-bills', label: 'Group Splitter', icon: Users },
    { id: '/ai', label: 'AI Advisor', icon: Bot },
    { id: '/settings', label: 'User Theme', icon: Settings },
    { id: '/about', label: 'About Nexus', icon: Info }
  ];

  return (
    <div className={`flex w-full min-h-screen ${cStyles.bg} ${cStyles.textNormal} font-sans`}>
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden cursor-pointer"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 border-r
        ${theme === 'cyberpunk' ? 'border-[#FF007F]' : 'border-gray-800'}
        flex flex-col justify-between ${cStyles.cardBg}
        transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-10 md:h-screen
      `}>
        <div>
          <div className="p-6 border-b border-gray-800/50 flex justify-between items-center gap-3">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/home')}>
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/assets/coinburst_logo.png" alt="CoinBurst Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-['Poppins'] font-black text-lg tracking-wider">COINBURST</h1>
                <span className="font-['Manrope'] text-[9px] tracking-widest text-emerald-400 font-semibold uppercase">Wealth Hub</span>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 md:hidden cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="mt-6 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.id || (item.id === '/home' && location.pathname === '/');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer ${
                    isActive ? cStyles.navActive : cStyles.navInactive
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800/50 flex items-center gap-3">
          {user && (
            <>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full shadow-md object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-black shadow-md">
                  {user.displayName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold truncate">{user.displayName}</p>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Cloud Synced Live" />
                </div>
                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleSidebarSync}
                disabled={isSyncing || loading}
                title="Sync Full Data with Firebase"
                className="text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-emerald-500/10 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing || loading ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                title="Sign Out"
                className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <AdminBroadcastBanner />
        <div className={`md:hidden flex items-center justify-between px-4 py-3 border-b ${theme === 'cyberpunk' ? 'border-[#FF007F]' : 'border-gray-800'} ${cStyles.cardBg} sticky top-0 z-20 w-full`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-['Poppins'] font-black text-sm tracking-wider text-white">COINBURST</span>
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full relative z-10">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation & Trigger Notice Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#0B0C1A] border border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.8)] text-white relative overflow-hidden"
            >
              {/* Decorative radial blur */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <LogOut className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-white">Notice: You are logging out</h3>
                    <p className="text-xs text-gray-400 mt-0.5">CoinBurst Wealth Hub Session</p>
                  </div>
                </div>
                <button
                  onClick={() => !isLoggingOut && setShowLogoutModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  disabled={isLoggingOut}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-gray-300 leading-relaxed flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0" />
                <p>
                  You are about to log out of your session. Your local ledger sync and preferences are securely saved.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer border border-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsLoggingOut(true);
                    setTimeout(async () => {
                      await signOutUser();
                      setIsLoggingOut(false);
                      setShowLogoutModal(false);
                    }, 500);
                  }}
                  disabled={isLoggingOut}
                  className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      Yes, Log Out
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚡ Universal Command Palette (Ctrl + K) */}
      <CommandPaletteModal 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </div>
  );
};
