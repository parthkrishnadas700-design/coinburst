import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Sparkles, Trophy, CheckCircle2, Lock } from 'lucide-react';
import { useFinanceStore } from '../shared/useFinanceStore';
import { computeSavingsBadges } from '../shared/savingsBadges';
import { useThemeStyles } from './DashboardWeb';

interface SavingsBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavingsBadgesModal: React.FC<SavingsBadgesModalProps> = ({ isOpen, onClose }) => {
  const { transactions, accounts, budgets, currency } = useFinanceStore();
  const cStyles = useThemeStyles();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const badges = computeSavingsBadges(transactions, accounts, budgets, currency);
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const completionPercentage = Math.round((unlockedCount / badges.length) * 100);

  const filteredBadges = badges.filter(b => {
    if (filterCategory === 'unlocked') return b.unlocked;
    if (filterCategory === 'locked') return !b.unlocked;
    if (filterCategory === 'savers') return b.category === 'savers';
    if (filterCategory === 'spenders') return b.category === 'spenders';
    if (filterCategory === 'discipline') return b.category === 'discipline' || b.category === 'veteran';
    return true;
  });

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-900/30 text-amber-400 border-amber-700/50';
      case 'silver': return 'bg-slate-700/40 text-slate-300 border-slate-500/50';
      case 'gold': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'diamond': return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50';
      case 'legend': return 'bg-purple-500/20 text-pink-300 border-pink-500/50';
      case 'special': return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border ${cStyles.cardBg} ${cStyles.shadow} overflow-hidden shadow-2xl`}
        >
          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-purple-950/20 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Trophy className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight text-white font-['Poppins']">Gamified Badges Vault</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {unlockedCount}/{badges.length} Unlocked
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Crazy achievements for Money Savers 💰 and High-Octane Spenders 💸!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Savings Progress Hero Bar */}
          <div className="p-6 bg-gradient-to-br from-emerald-900/20 via-black/40 to-purple-900/20 border-b border-white/5">
            <div className="flex items-center justify-between text-xs font-mono font-bold mb-2">
              <span className="text-gray-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Total Badges Mastery
              </span>
              <span className="text-emerald-400">{completionPercentage}% Completed</span>
            </div>
            <div className="w-full h-3 bg-gray-800/80 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 via-pink-500 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Badges' },
              { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
              { id: 'savers', label: '💰 Money Savers' },
              { id: 'spenders', label: '💸 Crazy Spenders' },
              { id: 'discipline', label: '🛡️ Discipline' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterCategory === tab.id
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Badges Grid List */}
          <div className="p-6 overflow-y-auto max-h-[55vh] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBadges.map(badge => (
                <motion.div
                  key={badge.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 ${
                    badge.unlocked
                      ? `bg-gradient-to-br from-white/10 to-white/5 ${badge.borderColor} shadow-lg hover:border-emerald-500/50`
                      : 'bg-white/[0.02] border-white/5 opacity-70 grayscale-[0.3] hover:opacity-100'
                  }`}
                  style={{
                    boxShadow: badge.unlocked ? `0 0 20px ${badge.bgGlow}` : 'none',
                  }}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Badge Icon Box */}
                    <div
                      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                        badge.unlocked
                          ? 'bg-white/10 border-white/20 shadow-md'
                          : 'bg-gray-900 border-gray-800 text-gray-500'
                      }`}
                    >
                      {badge.icon}
                      {badge.unlocked ? (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-0.5 rounded-full shadow-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 bg-gray-800 text-gray-400 p-0.5 rounded-full border border-gray-700">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Badge Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-sm font-black text-white truncate font-['Poppins']">{badge.name}</h4>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTierBadgeStyle(badge.tier)}`}>
                          {badge.tier}
                        </span>
                      </div>

                      <p className="text-[11px] font-medium text-emerald-400 font-mono mb-1">{badge.tagline}</p>
                      <p className="text-[11px] text-gray-400 leading-tight mb-2.5">{badge.description}</p>

                      {/* Progress Bar for Badge */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-gray-400 font-bold">
                          <span>Progress: {badge.currentFormatted}</span>
                          <span>Target: {badge.targetFormatted}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              badge.unlocked ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-gray-600'
                            }`}
                            style={{ width: `${badge.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Automated Realtime Badge Calculation
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
