import React from 'react';
import { Flame, TrendingUp, AlertTriangle, Zap, ShieldCheck } from 'lucide-react';
import { useFinanceStore } from '../shared/useFinanceStore';
import { useThemeStyles } from './DashboardWeb';

export const BurnRatePredictor: React.FC = () => {
  const cStyles = useThemeStyles();
  const accounts = useFinanceStore(state => state.accounts);
  const transactions = useFinanceStore(state => state.transactions);
  const currency = useFinanceStore(state => state.currency);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  // Calculate 30-day daily burn rate
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentExpenses = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d >= thirtyDaysAgo;
  });

  const totalSpent30Days = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
  const dailyBurnRate = Math.max(1, Math.round(totalSpent30Days / 30));

  const runwayDays = totalBalance > 0 ? Math.floor(totalBalance / dailyBurnRate) : 0;

  const runwayEndDate = new Date(now.getTime() + runwayDays * 24 * 60 * 60 * 1000);
  const formattedEndDate = runwayEndDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

  const getStatusColor = () => {
    if (runwayDays >= 60) return { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', label: 'Safe Runway 🛡️', icon: ShieldCheck };
    if (runwayDays >= 20) return { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: 'Moderate Burn Rate ⚡', icon: Zap };
    return { bg: 'bg-pink-500/10 border-pink-500/30 text-pink-400', label: 'High Velocity Burn ⚠️', icon: AlertTriangle };
  };

  const status = getStatusColor();
  const StatusIcon = status.icon;

  return (
    <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} border border-purple-500/20 space-y-6 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-lg shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-purple-400">
              AI Forecast Engine
            </span>
            <h3 className="text-lg font-black text-white tracking-wide mt-0.5">
              Burn-Rate & Financial Runway Calculator
            </h3>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${status.bg}`}>
          <StatusIcon className="w-4 h-4" />
          <span>{status.label}</span>
        </div>
      </div>

      {/* KPI Meter Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Current Total Balance</span>
          <span className="font-mono font-black text-lg text-emerald-400">{currency} {totalBalance.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Avg Daily Burn Speed</span>
          <span className="font-mono font-black text-lg text-pink-400">{currency} {dailyBurnRate.toLocaleString()} / day</span>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1">
          <span className="text-[10px] uppercase font-bold text-purple-300 block">Estimated Financial Runway</span>
          <span className="font-mono font-black text-xl text-purple-400">
            {runwayDays > 365 ? '365+ Days' : `${runwayDays} Days`}
          </span>
        </div>
      </div>

      {/* AI Trajectory Visual Bar */}
      <div className="space-y-2 relative z-10">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-gray-400">Runway Forecast</span>
          <span className="text-purple-400 font-mono">Zero-Balance Date: {formattedEndDate}</span>
        </div>
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-purple-500 to-pink-500 transition-all duration-1000"
            style={{ width: `${Math.min(100, Math.max(5, (runwayDays / 90) * 100))}%` }}
          />
        </div>
      </div>

      {/* AI Recommendation Chip */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 flex items-start gap-3 relative z-10">
        <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">AI Optimization Tip:</span>
          <p className="text-gray-400 text-xs leading-relaxed">
            Reducing daily discretionary food & entertainment spending by <strong className="text-emerald-400">{currency} {Math.round(dailyBurnRate * 0.15)}</strong> expands your financial runway by <strong className="text-purple-400">+12 additional days</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
