import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, ArrowUpRight, PiggyBank, Flame, Users, Bot, Settings, Command } from 'lucide-react';
import { triggerHapticNotification } from '../shared/nativeBridge';

export const FloatingNavDock: React.FC<{
  onOpenCommandPalette?: () => void;
}> = ({ onOpenCommandPalette }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const dockItems = [
    { id: '/home', label: 'Nexus', icon: BarChart3 },
    { id: '/transactions', label: 'Ledger', icon: ArrowUpRight },
    { id: '/budgets', label: 'Budgets', icon: PiggyBank },
    { id: '/burn-rate', label: 'Burn Rate', icon: Flame },
    { id: '/split-bills', label: 'Splitter', icon: Users },
    { id: '/ai', label: 'AI Advisor', icon: Bot },
    { id: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[92%] sm:w-auto">
      <div className={`p-2 rounded-2xl bg-[#0F0F17]/90 backdrop-blur-xl border border-cyan-500/30 shadow-2xl flex items-center justify-around gap-1 sm:gap-2 select-none`}>
        {dockItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.id || (item.id === '/home' && location.pathname === '/');
          return (
            <button
              key={item.id}
              onClick={() => {
                triggerHapticNotification('success');
                navigate(item.id);
              }}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/20 scale-105 font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[9px] font-black tracking-tight hidden xs:inline">{item.label}</span>
            </button>
          );
        })}

        {/* Command Palette Button */}
        <button
          onClick={() => {
            triggerHapticNotification('success');
            onOpenCommandPalette?.();
          }}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex flex-col items-center gap-0.5 transition-all cursor-pointer"
          title="Open Command Palette (Ctrl+K)"
        >
          <Command className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
          <span className="text-[9px] font-black tracking-tight hidden xs:inline">Cmd K</span>
        </button>
      </div>
    </div>
  );
};
