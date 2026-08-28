import React, { useState } from 'react';
import { useFinanceStore } from '../shared/useFinanceStore';
import { computeSavingsBadges } from '../shared/savingsBadges';
import { useThemeStyles } from './DashboardWeb';
import { Trophy, ChevronRight, Sparkles } from 'lucide-react';
import { SavingsBadgesModal } from './SavingsBadgesModal';

export const SavingsBadgesWidget: React.FC = () => {
  const { transactions, accounts, budgets, currency } = useFinanceStore();
  const cStyles = useThemeStyles();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const badges = computeSavingsBadges(transactions, accounts, budgets, currency);
  const unlockedBadges = badges.filter(b => b.unlocked);
  const totalBadges = badges.length;

  // Highest unlocked badge or upcoming badge
  const nextTargetBadge = badges.find(b => !b.unlocked) || badges[badges.length - 1];

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`p-5 rounded-3xl ${cStyles.cardBg} ${cStyles.shadow} border border-white/10 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
      >
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">Gamified Ledger</span>
              <h4 className="text-base font-black text-white font-['Poppins']">Savings Badges</h4>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Unlocked Badges Preview Bar */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/40 border border-white/5 mb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {unlockedBadges.length > 0 ? (
              unlockedBadges.slice(0, 5).map(b => (
                <span
                  key={b.id}
                  title={b.name}
                  className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-base shrink-0 shadow-sm transition-transform hover:scale-110"
                >
                  {b.icon}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400 font-mono italic">Log transactions to earn badges!</span>
            )}
          </div>
          <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            {unlockedBadges.length}/{totalBadges} Badges
          </span>
        </div>

        {/* Progress to next target badge */}
        {nextTargetBadge && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono min-w-0">
              <span className="text-gray-400 flex items-center gap-1 min-w-0 truncate">
                <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" /> Next: <strong className="text-white truncate">{nextTargetBadge.name}</strong>
              </span>
              <span className="text-emerald-400 font-bold shrink-0 ml-2">{nextTargetBadge.progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${nextTargetBadge.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Badges Modal */}
      <SavingsBadgesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
