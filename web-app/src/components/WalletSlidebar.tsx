import React, { useState } from 'react';
import { useFinanceStore, formatCurrency } from '../shared/useFinanceStore';
import type { Account } from '../shared/useFinanceStore';
import { useThemeStyles } from './DashboardWeb';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Plus, ChevronLeft, ChevronRight, 
  ArrowUpRight, ArrowDownRight, Landmark, CreditCard, Coins, 
  X, Check, Sparkles, SlidersHorizontal
} from 'lucide-react';
import { triggerHaptic, showNativeToast } from '../shared/nativeBridge';

interface WalletSlidebarProps {
  onOpenAddWallet?: () => void;
  className?: string;
}

export const WalletSlidebar: React.FC<WalletSlidebarProps> = ({ onOpenAddWallet, className = '' }) => {
  const { accounts, transactions, addTransaction, setSelectedAccountId, currency } = useFinanceStore();
  const cStyles = useThemeStyles();

  // Active wallet index for seekbar
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  // Add Money Modal state
  const [targetAccount, setTargetAccount] = useState<Account | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositCategory, setDepositCategory] = useState<string>('Top-Up');
  const [depositNote, setDepositNote] = useState<string>('Added money via Wallet Seekbar');
  
  // Interactive Slider Add Money value
  const [sliderAddAmount, setSliderAddAmount] = useState<number>(1000);

  const fmt = (val: number) => formatCurrency(val, currency);

  if (accounts.length === 0) {
    return (
      <div className={`p-8 rounded-2xl text-center border ${cStyles.cardBg} ${cStyles.shadow} ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <Wallet className="w-6 h-6 animate-bounce" />
        </div>
        <h3 className="text-lg font-black mb-1">No Wallet Nodes Configured</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
          Create your first wallet node to track balances, seek between accounts, and quickly add money!
        </p>
        {onOpenAddWallet && (
          <button
            onClick={onOpenAddWallet}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 mx-auto ${cStyles.primaryBtn}`}
          >
            <Plus className="w-4 h-4" /> Create First Wallet
          </button>
        )}
      </div>
    );
  }

  // Ensure activeIndex is valid
  const safeActiveIndex = Math.min(Math.max(0, activeIndex), accounts.length - 1);
  const currentWallet = accounts[safeActiveIndex] || accounts[0];

  // Calculate wallet-specific stats
  const walletTransactions = transactions.filter(t => t.accountId === currentWallet.id);
  const walletIncome = walletTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const walletExpense = walletTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const handleSeekChange = (index: number) => {
    setActiveIndex(index);
    setSelectedAccountId(accounts[index].id);
    triggerHaptic('light');
  };

  const handleQuickAdd = (acc: Account, amount: number) => {
    addTransaction({
      accountId: acc.id,
      type: 'income',
      category: depositCategory || 'Top-Up',
      amount: amount,
      description: `Quick deposit into ${acc.name}`,
      date: new Date().toISOString(),
    });
    triggerHaptic('heavy');
    showNativeToast(`Added ${fmt(amount)} to ${acc.name}!`);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(depositAmount);
    if (!targetAccount || isNaN(num) || num <= 0) return;

    addTransaction({
      accountId: targetAccount.id,
      type: 'income',
      category: depositCategory || 'Top-Up',
      amount: num,
      description: depositNote || 'Wallet Top-Up',
      date: new Date().toISOString(),
    });

    triggerHaptic('heavy');
    showNativeToast(`Successfully added ${fmt(num)} to ${targetAccount.name}`);
    setTargetAccount(null);
    setDepositAmount('');
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Landmark className="w-5 h-5" />;
      case 'credit': return <CreditCard className="w-5 h-5" />;
      default: return <Coins className="w-5 h-5" />;
    }
  };

  const currencySymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  return (
    <div className={`p-6 rounded-3xl border ${cStyles.cardBg} ${cStyles.shadow} space-y-6 ${className}`}>
      
      {/* Header with Title & Add Wallet Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black tracking-tight">Wallets Seekbar & Funds</h3>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {accounts.length} Node{accounts.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-gray-400">Scrub to inspect balances and top up funds in real-time.</p>
          </div>
        </div>

        {onOpenAddWallet && (
          <button
            onClick={onOpenAddWallet}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${cStyles.primaryBtnOutline}`}
          >
            <Plus className="w-4 h-4" /> Add Wallet
          </button>
        )}
      </div>

      {/* --- Interactive Range Seek Bar --- */}
      <div className="space-y-2 bg-black/20 p-4 rounded-2xl border border-gray-800/40">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> Seek Wallet
          </span>
          <span className="text-emerald-400 font-mono">
            Wallet {safeActiveIndex + 1} of {accounts.length}: <span className="text-white">{currentWallet.name}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSeekChange(Math.max(0, safeActiveIndex - 1))}
            disabled={safeActiveIndex === 0}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-white"
            title="Previous Wallet"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={accounts.length - 1}
              step={1}
              value={safeActiveIndex}
              onChange={(e) => handleSeekChange(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:accent-emerald-300 transition-all focus:outline-none"
            />
          </div>

          <button
            onClick={() => handleSeekChange(Math.min(accounts.length - 1, safeActiveIndex + 1))}
            disabled={safeActiveIndex === accounts.length - 1}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-white"
            title="Next Wallet"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Wallet Selector Chips under seekbar */}
        <div className="flex gap-2 overflow-x-auto pt-2 scrollbar-none">
          {accounts.map((acc, idx) => (
            <button
              key={acc.id}
              onClick={() => handleSeekChange(idx)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-300 border flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                safeActiveIndex === idx
                  ? 'bg-emerald-500/20 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-105'
                  : 'bg-white/5 text-gray-400 border-gray-800 hover:border-gray-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }} />
              {acc.name} ({fmt(acc.balance)})
            </button>
          ))}
        </div>
      </div>

      {/* --- Main Active Wallet Spotlight Card --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWallet.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="relative overflow-hidden rounded-2xl border p-6 bg-gradient-to-br from-black/40 via-black/20 to-black/40 backdrop-blur-md"
          style={{ borderColor: `${currentWallet.color}60` }}
        >
          {/* Background Ambient Glow */}
          <div 
            className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" 
            style={{ backgroundColor: currentWallet.color }} 
          />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            {/* Left side: Name, Tag, Big Balance */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div 
                  className="p-3 rounded-2xl text-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: currentWallet.color }}
                >
                  {getAccountIcon(currentWallet.type)}
                </div>
                <div>
                  <h4 className="text-xl font-black tracking-wide text-white">{currentWallet.name}</h4>
                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                    {currentWallet.type} Node • ID: {currentWallet.id}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400 block">Present Amount Available</span>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white flex items-baseline gap-2 mt-1">
                  <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    {fmt(currentWallet.balance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: Wallet Stats (Income vs Expense) */}
            <div className="flex gap-4 p-4 rounded-xl bg-black/40 border border-white/10 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" /> Lifetime Inflow
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400 block">{fmt(walletIncome)}</span>
              </div>
              <div className="w-[1px] bg-white/10" />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3 text-red-400" /> Lifetime Outflow
                </span>
                <span className="text-sm font-mono font-bold text-red-400 block">{fmt(walletExpense)}</span>
              </div>
            </div>

            {/* Right side: Add Money Action */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button
                onClick={() => {
                  setTargetAccount(currentWallet);
                  setDepositAmount('');
                }}
                className={`w-full md:w-auto px-6 py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg ${cStyles.primaryBtn}`}
              >
                <Plus className="w-5 h-5" /> Add Money to Wallet
              </button>

              <div className="flex gap-1.5 justify-center md:justify-end">
                {[500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleQuickAdd(currentWallet, amt)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-white/5 hover:bg-white/15 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                  >
                    +{currencySymbol}{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Seek & Add Money Slider Bar within Card */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-2/3 flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Slide & Deposit:
              </span>
              <input
                type="range"
                min={100}
                max={50000}
                step={500}
                value={sliderAddAmount}
                onChange={(e) => setSliderAddAmount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
              />
              <span className="text-xs font-mono font-black text-cyan-400 min-w-[70px] text-right">
                {fmt(sliderAddAmount)}
              </span>
            </div>

            <button
              onClick={() => handleQuickAdd(currentWallet, sliderAddAmount)}
              className="w-full sm:w-auto px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Deposit {fmt(sliderAddAmount)}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* --- Modal for Custom Deposit / Add Money --- */}
      <AnimatePresence>
        {targetAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md p-6 rounded-3xl border ${cStyles.cardBg} ${cStyles.shadow} space-y-5`}
            >
              <div className="flex justify-between items-center border-b border-gray-800/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Add Money</h3>
                    <p className="text-xs text-gray-400">Target Node: <strong className="text-emerald-400">{targetAccount.name}</strong></p>
                  </div>
                </div>
                <button
                  onClick={() => setTargetAccount(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current balance reminder */}
              <div className="p-3 rounded-xl bg-black/30 border border-gray-800/60 flex justify-between items-center text-xs">
                <span className="text-gray-400 font-bold uppercase">Current Node Balance</span>
                <span className="font-mono font-black text-emerald-400 text-sm">{fmt(targetAccount.balance)}</span>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Amount to Add ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-gray-400">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className={`w-full pl-9 pr-4 py-3 rounded-xl font-mono text-lg font-bold ${cStyles.input}`}
                    />
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[500, 1000, 2000, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepositAmount(String(preset))}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/5 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
                    >
                      +{currencySymbol}{preset}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Fund Category
                  </label>
                  <select
                    value={depositCategory}
                    onChange={(e) => setDepositCategory(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold ${cStyles.input}`}
                  >
                    <option value="Top-Up" className={cStyles.selectOptionBg}>Top-Up / Deposit</option>
                    <option value="Salary" className={cStyles.selectOptionBg}>Salary</option>
                    <option value="Investment" className={cStyles.selectOptionBg}>Investment Return</option>
                    <option value="Gift" className={cStyles.selectOptionBg}>Gift / Reward</option>
                    <option value="Other" className={cStyles.selectOptionBg}>Other Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Note / Description
                  </label>
                  <input
                    type="text"
                    placeholder="Optional memo e.g. Monthly topup"
                    value={depositNote}
                    onChange={(e) => setDepositNote(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold ${cStyles.input}`}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetAccount(null)}
                    className="flex-1 py-3 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 text-gray-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 ${cStyles.primaryBtn}`}
                  >
                    <Check className="w-4 h-4" /> Confirm Deposit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
