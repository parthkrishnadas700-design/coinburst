import React, { useState } from 'react';
import { useFinanceStore } from '../shared/useFinanceStore';
import { signOutUser } from "../shared/firebase";
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, ArrowUpRight, PiggyBank, Bot, Settings, Info, LogOut 
} from 'lucide-react';
import { useThemeStyles } from '../components/DashboardWeb'; // temporarily importing styles

export const Layout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const theme = useFinanceStore(state => state.theme);
  const user = useFinanceStore(state => state.user);
  const cStyles = useThemeStyles();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: '/', label: 'Dashboard', icon: BarChart3 },
    { id: '/transactions', label: 'Ledger & Entry', icon: ArrowUpRight },
    { id: '/budgets', label: 'Smart Budgets', icon: PiggyBank },
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
            <div className="flex items-center gap-3">
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
              const isActive = location.pathname === item.id;
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
                <p className="text-sm font-bold truncate">{user.displayName}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={signOutUser}
                title="Sign Out"
                className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer p-1 rounded-lg hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
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
    </div>
  );
};
