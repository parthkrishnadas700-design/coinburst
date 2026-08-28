import React, { useState } from 'react';
import { Flame, TrendingUp, AlertTriangle, Zap, ShieldCheck, Sliders, PieChart, Sparkles } from 'lucide-react';
import { useFinanceStore } from '../shared/useFinanceStore';
import { useThemeStyles } from './DashboardWeb';

export const BurnRatePredictor: React.FC = () => {
  const cStyles = useThemeStyles();
  const accounts = useFinanceStore(state => state.accounts);
  const transactions = useFinanceStore(state => state.transactions);
  const currency = useFinanceStore(state => state.currency);

  const [reductionPercent, setReductionPercent] = useState<number>(15);
  const [selectedPreset, setSelectedPreset] = useState<'safe' | 'balanced' | 'aggressive'>('balanced');

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  // Calculate 30-day daily burn rate
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentExpenses = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d >= thirtyDaysAgo;
  });

  const totalSpent30Days = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
  const baseDailyBurn = Math.max(1, Math.round(totalSpent30Days / 30));

  // Category Breakdown
  const categoryMap: { [key: string]: number } = {};
  recentExpenses.forEach(t => {
    const cat = t.category || 'Uncategorized';
    categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const topCategory = sortedCategories[0] ? sortedCategories[0][0] : 'Discretionary';
  const topCategoryAmount = sortedCategories[0] ? sortedCategories[0][1] : 0;

  // Interactive Simulator Math
  const effectiveReduction = reductionPercent / 100;
  const simulatedDailyBurn = Math.max(1, Math.round(baseDailyBurn * (1 - effectiveReduction)));
  const monthlySavings = Math.round((baseDailyBurn - simulatedDailyBurn) * 30);

  const currentRunwayDays = totalBalance > 0 ? Math.floor(totalBalance / baseDailyBurn) : 0;
  const simulatedRunwayDays = totalBalance > 0 ? Math.floor(totalBalance / simulatedDailyBurn) : 0;
  const extendedDays = Math.max(0, simulatedRunwayDays - currentRunwayDays);

  const currentEndDate = new Date(now.getTime() + currentRunwayDays * 24 * 60 * 60 * 1000);
  const simulatedEndDate = new Date(now.getTime() + simulatedRunwayDays * 24 * 60 * 60 * 1000);

  const formatDate = (date: Date) => date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

  const getStatusColor = (days: number) => {
    if (days >= 60) return { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', label: 'Safe Runway 🛡️', icon: ShieldCheck };
    if (days >= 20) return { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', label: 'Moderate Burn Rate ⚡', icon: Zap };
    return { bg: 'bg-pink-500/10 border-pink-500/30 text-pink-400', label: 'High Velocity Burn ⚠️', icon: AlertTriangle };
  };

  const status = getStatusColor(currentRunwayDays);
  const StatusIcon = status.icon;

  const handlePresetSelect = (preset: 'safe' | 'balanced' | 'aggressive') => {
    setSelectedPreset(preset);
    if (preset === 'safe') setReductionPercent(10);
    if (preset === 'balanced') setReductionPercent(20);
    if (preset === 'aggressive') setReductionPercent(35);
  };

  return (
    <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} border border-purple-500/20 space-y-6 relative overflow-hidden select-none`}>
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-500 text-white shadow-lg shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-purple-400">
                AI Autonomous Predictive Engine
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold uppercase border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" /> Fully Functional
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-wide mt-0.5">
              Burn-Rate & Financial Runway Forecast Simulator
            </h3>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${status.bg}`}>
          <StatusIcon className="w-4 h-4" />
          <span>{status.label}</span>
        </div>
      </div>

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Balance</span>
          <span className="font-mono font-black text-lg text-emerald-400">{currency} {totalBalance.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Daily Burn Speed</span>
          <span className="font-mono font-black text-lg text-pink-400">{currency} {baseDailyBurn.toLocaleString()} / day</span>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1">
          <span className="text-[10px] uppercase font-bold text-purple-300 block">Current Runway</span>
          <span className="font-mono font-black text-lg text-purple-300">
            {currentRunwayDays > 365 ? '365+ Days' : `${currentRunwayDays} Days`}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-300 block">Simulated Extended Runway</span>
          <span className="font-mono font-black text-xl text-emerald-400">
            {simulatedRunwayDays > 365 ? '365+ Days' : `${simulatedRunwayDays} Days`}
            {extendedDays > 0 && <span className="text-xs font-bold text-emerald-300 ml-1.5">(+{extendedDays}d)</span>}
          </span>
        </div>
      </div>

      {/* Interactive AI Burn Reduction Simulator */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h4 className="font-bold text-sm text-white">Interactive Burn Reduction Simulator</h4>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePresetSelect('safe')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${selectedPreset === 'safe' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
            >
              Mild (-10%)
            </button>
            <button
              onClick={() => handlePresetSelect('balanced')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${selectedPreset === 'balanced' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
            >
              Balanced (-20%)
            </button>
            <button
              onClick={() => handlePresetSelect('aggressive')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${selectedPreset === 'aggressive' ? 'bg-pink-500/20 border-pink-500 text-pink-300' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
            >
              Aggressive (-35%)
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Target Expense Reduction:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{reductionPercent}% reduction</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={reductionPercent}
            onChange={(e) => {
              setReductionPercent(Number(e.target.value));
              setSelectedPreset('balanced');
            }}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Live Simulation Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
          <div className="text-xs">
            <span className="text-gray-400 block">New Daily Burn Rate:</span>
            <span className="font-mono font-bold text-white text-sm">{currency} {simulatedDailyBurn.toLocaleString()} / day</span>
          </div>

          <div className="text-xs">
            <span className="text-gray-400 block">Monthly Savings Capital:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">+{currency} {monthlySavings.toLocaleString()} / mo</span>
          </div>

          <div className="text-xs">
            <span className="text-gray-400 block">New Zero-Balance Date:</span>
            <span className="font-mono font-bold text-purple-300 text-sm">{formatDate(simulatedEndDate)}</span>
          </div>
        </div>
      </div>

      {/* Visual Trajectory Timeline Bar */}
      <div className="space-y-2 relative z-10">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-gray-400">Runway Timeline Comparison</span>
          <span className="text-purple-300 font-mono">Current: {formatDate(currentEndDate)} → Simulated: {formatDate(simulatedEndDate)}</span>
        </div>
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10 relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, (simulatedRunwayDays / 120) * 100))}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown & AI Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Top Burn Categories */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-300">Top 30-Day Capital Drains</h4>
          </div>

          {sortedCategories.length > 0 ? (
            <div className="space-y-2.5">
              {sortedCategories.map(([cat, amount], idx) => {
                const pct = totalSpent30Days > 0 ? Math.round((amount / totalSpent30Days) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-300">{cat}</span>
                      <span className="font-mono text-purple-300">{currency} {amount.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No 30-day expense transactions logged yet.</p>
          )}
        </div>

        {/* AI Tactical Optimization Advice */}
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400">AI Tactical Optimization Advice</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Targeting your largest expense category (<strong className="text-white">{topCategory}</strong>) with a {reductionPercent}% spending reduction saves <strong className="text-emerald-400">{currency} {Math.round(topCategoryAmount * effectiveReduction).toLocaleString()}</strong> monthly and extends your liquidity runway by <strong className="text-purple-300">+{extendedDays} additional days</strong>.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-[11px] text-gray-400 font-mono flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>AI Auto-Forecast updates live with every logged transaction</span>
          </div>
        </div>
      </div>
    </div>
  );
};
