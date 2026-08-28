import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFinanceStore, SUPPORTED_CURRENCIES } from '../shared/useFinanceStore';
import type { Transaction } from '../shared/useFinanceStore';
import { useThemeStyles } from './DashboardWeb';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Calendar, Layers, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

import { useScrollLock } from '../shared/useScrollLock';

export const AddTransactionWeb: React.FC<{
  onClose: () => void;
  isOpen: boolean;
  transactionToEdit?: Transaction | null;
}> = ({ onClose, isOpen, transactionToEdit }) => {
  const cStyles = useThemeStyles();
  const accounts = useFinanceStore((state) => state.accounts);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const updateTransaction = useFinanceStore((state) => state.updateTransaction);
  const currency = useFinanceStore((state) => state.currency);

  // 🔒 Lock background scrolling completely when modal is active
  useScrollLock(isOpen);

  const currencyDef = SUPPORTED_CURRENCIES.find(c => c.code === currency) ?? SUPPORTED_CURRENCIES[0];

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Food');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  // ── Sync accountId whenever accounts list changes (fix: empty on fresh login) ──
  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  // Lock body scroll when transaction slide is open so main background slide cannot move
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
        document.body.style.touchAction = '';
      };
    }
  }, [isOpen]);

  // Reset or pre-fill form when modal opens or edit targets change
  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setDescription(transactionToEdit.description);
        setAmount(transactionToEdit.amount.toString());
        setType(transactionToEdit.type);
        setCategory(transactionToEdit.category);
        setAccountId(transactionToEdit.accountId);
        setDate(new Date(transactionToEdit.date).toISOString().substring(0, 10));
      } else {
        setDescription('');
        setAmount('');
        setType('expense');
        setCategory('Food');
        setDate(new Date().toISOString().substring(0, 10));
        // Set accountId to first available account
        if (accounts.length > 0) {
          setAccountId(accounts[0].id);
        }
      }
    }
  }, [isOpen, transactionToEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const categories = [
    'Food', 'Entertainment', 'Salary', 'Rent', 'Shopping',
    'Utilities', 'Travel', 'Healthcare', 'Transport', 'Education', 'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || !parsedAmount || parsedAmount <= 0 || !accountId) return;

    if (transactionToEdit) {
      updateTransaction({
        ...transactionToEdit,
        description: description.trim(),
        amount: parsedAmount,
        type,
        category,
        accountId,
        date: new Date(date + 'T12:00:00').toISOString(),
      });
    } else {
      addTransaction({
        description: description.trim(),
        amount: parsedAmount,
        type,
        category,
        accountId,
        date: new Date(date + 'T12:00:00').toISOString(),
      });
    }

    // 🎉 Confetti celebration
    confetti({
      particleCount: 150,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#00FF88', '#FF007F', '#00E5FF', '#FFE600'],
    });

    // 🔊 Cash register sound
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-84.wav');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}

    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          onTouchMove={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto overscroll-contain pointer-events-auto select-none"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className={`relative z-10 w-full max-w-lg my-auto p-6 sm:p-8 rounded-3xl ${cStyles.cardBg} ${cStyles.shadow} overflow-y-auto max-h-[90vh] overscroll-contain`}
          >
            {/* Decorative glows */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#00FF88]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#FF007F]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Record Transaction</h3>
                <p className="text-xs text-gray-400 mt-0.5">Currency: <span className="font-bold">{currencyDef.symbol} {currencyDef.name}</span></p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors cursor-pointer ${cStyles.closeBtn}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* No account warning */}
            {accounts.length === 0 ? (
              <div className="relative z-10 flex flex-col items-center gap-4 py-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <p className="font-bold">No Wallet Nodes Found</p>
                <p className="text-sm text-gray-400 max-w-xs">
                  You need to create at least one wallet account before recording a transaction.
                  Go to the <strong>Dashboard</strong> and tap <strong>"Add Wallet"</strong>.
                </p>
                <button
                  onClick={onClose}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold ${cStyles.primaryBtn}`}
                >
                  Got it, I'll add a wallet first
                </button>
              </div>
            ) : (
              <>
                {/* Expense / Income toggle */}
                <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl mb-6 relative z-10 ${cStyles.dialogHeaderBg}`}>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                      type === 'expense'
                        ? 'bg-pink-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)]'
                        : cStyles.tabInactive
                    }`}
                  >
                    💸 Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                      type === 'income'
                        ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
                        : cStyles.tabInactive
                    }`}
                  >
                    💰 Income
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Amount ({currencyDef.code})
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 font-bold text-lg">
                        {currencyDef.symbol}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={`w-full pl-10 pr-4 py-4 rounded-xl font-mono text-xl font-bold focus:outline-none transition-all duration-300 ${cStyles.input}`}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grocery shopping at D-Mart"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full px-4 py-4 rounded-xl focus:outline-none transition-all duration-300 ${cStyles.input}`}
                    />
                  </div>

                  {/* Category + Account */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" /> Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`w-full px-4 py-4 rounded-xl focus:outline-none transition-all duration-300 appearance-none ${cStyles.input}`}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat} className={cStyles.selectOptionBg}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" /> Wallet
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            window.dispatchEvent(new CustomEvent('coinburst_open_add_wallet'));
                          }}
                          className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          + Add Wallet
                        </button>
                      </div>
                      <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className={`w-full px-4 py-4 rounded-xl focus:outline-none transition-all duration-300 appearance-none ${cStyles.input}`}
                      >
                        {accounts.length === 0 ? (
                          <option value="" disabled className={cStyles.selectOptionBg}>No Wallets - Click + Add Wallet</option>
                        ) : (
                          accounts.map((acc) => (
                            <option key={acc.id} value={acc.id} className={cStyles.selectOptionBg}>{acc.name} ({acc.type})</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`w-full px-4 py-4 rounded-xl focus:outline-none transition-all duration-300 ${cStyles.input}`}
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${cStyles.primaryBtn}`}
                  >
                    Transmit to Ledger
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
