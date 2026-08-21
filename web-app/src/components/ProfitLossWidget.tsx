import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinanceStore, formatCurrency } from '../shared/useFinanceStore';
import { pushRealtimeWidgetUpdate } from '../shared/nativeBridge';

export const ProfitLossWidget: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'month' | '30days' | 'all'>('month');

  const transactions = useFinanceStore((state) => state.transactions);
  const currency = useFinanceStore((state) => state.currency);

  // Calculate Profit & Loss based on selected time filter
  const filterTransactions = () => {
    const now = new Date();
    return transactions.filter(t => {
      const txDate = new Date(t.date);
      if (timeRange === 'month') {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      }
      if (timeRange === '30days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return txDate >= thirtyDaysAgo;
      }
      return true; // all
    });
  };

  const filteredTxs = filterTransactions();

  const totalIncome = filteredTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfitLoss = totalIncome - totalExpense;
  const isProfit = netProfitLoss >= 0;

  const marginPercentage = totalIncome > 0
    ? ((netProfitLoss / totalIncome) * 100).toFixed(1)
    : '0.0';

  const fmt = (amt: number) => formatCurrency(amt, currency);

  // Sync real-time data to native Android Home Screen Widget
  React.useEffect(() => {
    const formattedNet = `${isProfit ? '+' : ''}${fmt(netProfitLoss)}`;
    const formattedInc = `+${fmt(totalIncome)}`;
    const formattedExp = `-${fmt(totalExpense)}`;
    const statusStr = isProfit ? 'PROFIT SURPLUS' : 'NET DEFICIT';

    pushRealtimeWidgetUpdate({
      netProfit: formattedNet,
      income: formattedInc,
      expense: formattedExp,
      status: statusStr,
      isProfit: isProfit,
    });
  }, [totalIncome, totalExpense, netProfitLoss, isProfit, currency]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-3xl bg-gradient-to-b from-[#120B29] via-[#0F0C20] to-[#07050F] border border-white/10 p-6 shadow-2xl relative overflow-hidden text-white font-sans"
    >
      {/* Background Decorative Glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isProfit ? 'bg-emerald-500/10' : 'bg-pink-500/10'}`} />

      {/* Widget Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center p-2.5 border ${
            isProfit
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(0,255,136,0.3)]'
              : 'bg-pink-500/20 text-pink-400 border-pink-500/40 shadow-[0_0_15px_rgba(255,0,127,0.3)]'
          }`}>
            {isProfit ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-gray-400">
                PROFIT & LOSS SENTINEL WIDGET
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                isProfit ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
              }`}>
                {isProfit ? 'PROFIT SURPLUS' : 'NET DEFICIT'}
              </span>
            </div>
            <h3 className="text-xl font-black font-['Poppins'] tracking-tight mt-0.5">
              Net Capital Flow: <span className={isProfit ? 'text-emerald-400' : 'text-pink-500'}>{isProfit ? '+' : ''}{fmt(netProfitLoss)}</span>
            </h3>
          </div>
        </div>

        {/* Time Period Filter Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
          {(['month', '30days', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-white/15 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range === 'month' ? 'This Month' : range === '30days' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {/* Metric 1: Inbound Income */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Inbound (Income)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
            +{fmt(totalIncome)}
          </p>
          <span className="text-[10px] text-gray-500 block">Gross revenue & deposits</span>
        </div>

        {/* Metric 2: Outbound Expenses */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Outbound (Expenses)</span>
            <ArrowDownRight className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-2xl font-black font-mono text-pink-500 tracking-tight">
            -{fmt(totalExpense)}
          </p>
          <span className="text-[10px] text-gray-500 block">Operational & lifestyle burn</span>
        </div>

        {/* Metric 3: Profit Margin & Efficiency */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Profit Margin %</span>
            <Sparkles className={`w-4 h-4 ${isProfit ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <p className={`text-2xl font-black font-mono tracking-tight ${isProfit ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isProfit ? '+' : ''}{marginPercentage}%
          </p>
          <span className="text-[10px] text-gray-500 block">Retained income ratio</span>
        </div>
      </div>

      {/* Progress Bar comparison */}
      <div className="mt-5 pt-4 border-t border-white/10 relative z-10 space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-emerald-400 font-bold">Income: {fmt(totalIncome)}</span>
          <span className="text-pink-500 font-bold">Expenses: {fmt(totalExpense)}</span>
        </div>

        <div className="w-full h-3 rounded-full bg-black/60 border border-white/10 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{
              width: `${totalIncome + totalExpense > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 50}%`
            }}
          />
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-rose-600 transition-all duration-500"
            style={{
              width: `${totalIncome + totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense)) * 100 : 50}%`
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
