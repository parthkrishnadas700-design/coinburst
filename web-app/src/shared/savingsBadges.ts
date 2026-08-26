import type { Transaction, Account, Budget } from './useFinanceStore';
import { formatCurrency } from './useFinanceStore';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend' | 'special';
export type BadgeCategory = 'savers' | 'spenders' | 'discipline' | 'veteran';

export interface SavingsBadge {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  tier: BadgeTier;
  color: string;
  bgGlow: string;
  borderColor: string;
  unlocked: boolean;
  progress: number; // 0 - 100
  currentFormatted: string;
  targetFormatted: string;
}

// Base threshold values in USD (scaled dynamically per currency)
const getCurrencyScaleMultiplier = (currencyCode: string): number => {
  switch (currencyCode) {
    case 'INR': return 80;
    case 'JPY': return 150;
    case 'AED': return 3.67;
    case 'EUR': return 0.92;
    case 'GBP': return 0.78;
    case 'CAD': return 1.35;
    case 'AUD': return 1.50;
    case 'CHF': return 0.88;
    case 'SGD': return 1.34;
    default: return 1; // USD
  }
};

export const computeSavingsBadges = (
  transactions: Transaction[],
  accounts: Account[],
  budgets: Budget[],
  currencyCode: string
): SavingsBadge[] => {
  const mult = getCurrencyScaleMultiplier(currencyCode);
  const fmt = (val: number) => formatCurrency(val, currencyCode);

  // Financial Metrics
  const incomeTxs = transactions.filter(t => t.type === 'income');
  const expenseTxs = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

  const totalAccountBalance = accounts.reduce((sum, a) => sum + Math.max(0, a.balance), 0);
  const netSavings = Math.max(0, totalIncome - totalExpense, totalAccountBalance);

  const savingsRate = totalIncome > 0 
    ? Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))) 
    : 0;

  const spendRate = totalIncome > 0
    ? Math.max(0, Math.min(100, Math.round((totalExpense / totalIncome) * 100)))
    : (totalExpense > 0 ? 100 : 0);

  const totalTxCount = transactions.length;
  const expenseTxCount = expenseTxs.length;
  const incomeTxCount = incomeTxs.length;
  const accountCount = accounts.length;

  const foodTxsCount = expenseTxs.filter(t => {
    const cat = (t.category || '').toLowerCase();
    const desc = (t.description || '').toLowerCase();
    return cat.includes('food') || cat.includes('dining') || cat.includes('coffee') || cat.includes('grocery') ||
           desc.includes('food') || desc.includes('coffee') || desc.includes('cafe') || desc.includes('restaurant');
  }).length;

  const maxSingleExpense = expenseTxs.reduce((max, t) => Math.max(max, t.amount), 0);

  const activeBudgets = budgets.length;
  const budgetsExceeded = budgets.filter(b => (b.spent || 0) > b.limit).length;
  const isBudgetDisciplined = activeBudgets > 0 && budgetsExceeded === 0;

  // Thresholds
  const tier1Amount = 50 * mult;     // $50 / ₹4,000
  const tier2Amount = 500 * mult;    // $500 / ₹40,000
  const tier3Amount = 2500 * mult;   // $2,500 / ₹200,000
  const tier4Amount = 10000 * mult;  // $10,000 / ₹800,000
  const tier5Amount = 50000 * mult;  // $50,000 / ₹4,000,000

  const singleBigExpenseThreshold = 100 * mult; // $100 / ₹8,000
  const whaleExpenseThreshold = 500 * mult;     // $500 / ₹40,000
  const highRollerSpendThreshold = 1000 * mult; // $1,000 / ₹80,000

  const badges: SavingsBadge[] = [
    // ── MONEY SAVERS BADGES 💰 ────────────────────────────────────────────────
    {
      id: 'starter_saver',
      name: 'Starter Saver',
      tagline: 'First Step to Wealth',
      description: `Save your first ${fmt(tier1Amount)} in net accumulated wealth.`,
      icon: '🌱',
      category: 'savers',
      tier: 'bronze',
      color: 'from-amber-600 to-yellow-500',
      bgGlow: 'rgba(217, 119, 6, 0.15)',
      borderColor: 'border-amber-500/40',
      unlocked: netSavings >= tier1Amount,
      progress: Math.min(100, Math.round((netSavings / tier1Amount) * 100)),
      currentFormatted: fmt(netSavings),
      targetFormatted: fmt(tier1Amount),
    },
    {
      id: 'smart_saver',
      name: 'Smart Saver',
      tagline: 'Building Momentum',
      description: `Accumulate ${fmt(tier2Amount)} in total net savings.`,
      icon: '🥉',
      category: 'savers',
      tier: 'bronze',
      color: 'from-slate-400 to-zinc-300',
      bgGlow: 'rgba(148, 163, 184, 0.15)',
      borderColor: 'border-slate-400/40',
      unlocked: netSavings >= tier2Amount,
      progress: Math.min(100, Math.round((netSavings / tier2Amount) * 100)),
      currentFormatted: fmt(netSavings),
      targetFormatted: fmt(tier2Amount),
    },
    {
      id: 'nest_egg_master',
      name: 'Nest Egg Master',
      tagline: 'Solid Foundation',
      description: `Reach ${fmt(tier3Amount)} in accumulated net savings.`,
      icon: '🥈',
      category: 'savers',
      tier: 'silver',
      color: 'from-blue-400 to-cyan-300',
      bgGlow: 'rgba(56, 189, 248, 0.15)',
      borderColor: 'border-cyan-400/40',
      unlocked: netSavings >= tier3Amount,
      progress: Math.min(100, Math.round((netSavings / tier3Amount) * 100)),
      currentFormatted: fmt(netSavings),
      targetFormatted: fmt(tier3Amount),
    },
    {
      id: 'treasure_vault',
      name: 'Treasure Vault',
      tagline: 'Financial Fortress',
      description: `Amass ${fmt(tier4Amount)} in verified savings vault.`,
      icon: '🥇',
      category: 'savers',
      tier: 'gold',
      color: 'from-yellow-400 to-amber-300',
      bgGlow: 'rgba(250, 204, 21, 0.15)',
      borderColor: 'border-yellow-400/40',
      unlocked: netSavings >= tier4Amount,
      progress: Math.min(100, Math.round((netSavings / tier4Amount) * 100)),
      currentFormatted: fmt(netSavings),
      targetFormatted: fmt(tier4Amount),
    },
    {
      id: 'wealth_titan',
      name: 'Wealth Titan',
      tagline: 'Elite Wealth Commander',
      description: `Achieve legendary net savings of ${fmt(tier5Amount)}.`,
      icon: '👑',
      category: 'savers',
      tier: 'legend',
      color: 'from-purple-500 via-pink-500 to-rose-400',
      bgGlow: 'rgba(236, 72, 153, 0.2)',
      borderColor: 'border-pink-500/50',
      unlocked: netSavings >= tier5Amount,
      progress: Math.min(100, Math.round((netSavings / tier5Amount) * 100)),
      currentFormatted: fmt(netSavings),
      targetFormatted: fmt(tier5Amount),
    },
    {
      id: 'frugal_ninja',
      name: 'Frugal Ninja',
      tagline: '50%+ Savings Rate',
      description: 'Save more than 50% of your total logged income.',
      icon: '🥷',
      category: 'savers',
      tier: 'silver',
      color: 'from-emerald-400 to-teal-300',
      bgGlow: 'rgba(52, 211, 153, 0.15)',
      borderColor: 'border-emerald-400/40',
      unlocked: savingsRate >= 50 && totalIncome > 0,
      progress: Math.min(100, Math.round((savingsRate / 50) * 100)),
      currentFormatted: `${savingsRate}%`,
      targetFormatted: '50%',
    },
    {
      id: 'wealth_architect',
      name: 'Wealth Architect',
      tagline: '75%+ Savings Elite',
      description: 'Save 75% or more of your total logged income.',
      icon: '🚀',
      category: 'savers',
      tier: 'diamond',
      color: 'from-indigo-400 via-purple-400 to-pink-400',
      bgGlow: 'rgba(168, 85, 247, 0.2)',
      borderColor: 'border-purple-400/50',
      unlocked: savingsRate >= 75 && totalIncome > 0,
      progress: Math.min(100, Math.round((savingsRate / 75) * 100)),
      currentFormatted: `${savingsRate}%`,
      targetFormatted: '75%',
    },
    {
      id: 'ice_cold_stash',
      name: 'Ice Cold Stash',
      tagline: '90%+ Pure Savings Rate',
      description: 'Save 90% or more of your income. Cold, hard cash vault!',
      icon: '🧊',
      category: 'savers',
      tier: 'legend',
      color: 'from-cyan-400 via-sky-300 to-blue-500',
      bgGlow: 'rgba(56, 189, 248, 0.25)',
      borderColor: 'border-sky-400/60',
      unlocked: savingsRate >= 90 && totalIncome > 0,
      progress: Math.min(100, Math.round((savingsRate / 90) * 100)),
      currentFormatted: `${savingsRate}%`,
      targetFormatted: '90%',
    },
    {
      id: 'diamond_hands',
      name: 'Diamond Hands',
      tagline: '5+ Income Streams Logged',
      description: 'Log 5 or more income entries to solidify your income streams.',
      icon: '💎',
      category: 'savers',
      tier: 'gold',
      color: 'from-blue-400 via-cyan-400 to-indigo-400',
      bgGlow: 'rgba(96, 165, 250, 0.2)',
      borderColor: 'border-blue-400/50',
      unlocked: incomeTxCount >= 5,
      progress: Math.min(100, Math.round((incomeTxCount / 5) * 100)),
      currentFormatted: `${incomeTxCount} Incomes`,
      targetFormatted: '5 Incomes',
    },

    // ── CRAZY SPENDERS BADGES 💸 ──────────────────────────────────────────────
    {
      id: 'shopping_spree',
      name: 'Shopping Spree',
      tagline: 'Active Outbound Flow',
      description: 'Log 10 or more expense transactions in your ledger.',
      icon: '🛍️',
      category: 'spenders',
      tier: 'bronze',
      color: 'from-pink-500 to-rose-400',
      bgGlow: 'rgba(244, 63, 94, 0.15)',
      borderColor: 'border-pink-500/40',
      unlocked: expenseTxCount >= 10,
      progress: Math.min(100, Math.round((expenseTxCount / 10) * 100)),
      currentFormatted: `${expenseTxCount} Expenses`,
      targetFormatted: '10 Expenses',
    },
    {
      id: 'caffeine_cartel',
      name: 'Caffeine Cartel',
      tagline: 'Food & Coffee Lover',
      description: 'Log 3 or more expenses under Food, Coffee, or Dining.',
      icon: '☕',
      category: 'spenders',
      tier: 'bronze',
      color: 'from-amber-700 to-orange-500',
      bgGlow: 'rgba(194, 65, 12, 0.15)',
      borderColor: 'border-orange-500/40',
      unlocked: foodTxsCount >= 3,
      progress: Math.min(100, Math.round((foodTxsCount / 3) * 100)),
      currentFormatted: `${foodTxsCount} Food Logs`,
      targetFormatted: '3 Food Logs',
    },
    {
      id: 'flash_spender',
      name: 'Flash Spender',
      tagline: 'Big Ticket Purchase',
      description: `Log a single expense transaction greater than ${fmt(singleBigExpenseThreshold)}.`,
      icon: '⚡',
      category: 'spenders',
      tier: 'silver',
      color: 'from-violet-500 to-purple-400',
      bgGlow: 'rgba(139, 92, 246, 0.15)',
      borderColor: 'border-purple-500/40',
      unlocked: maxSingleExpense >= singleBigExpenseThreshold,
      progress: Math.min(100, Math.round((maxSingleExpense / singleBigExpenseThreshold) * 100)),
      currentFormatted: fmt(maxSingleExpense),
      targetFormatted: fmt(singleBigExpenseThreshold),
    },
    {
      id: 'whale_move',
      name: 'Whale Move',
      tagline: 'Mega Transaction',
      description: `Execute a single major purchase exceeding ${fmt(whaleExpenseThreshold)}.`,
      icon: '🐋',
      category: 'spenders',
      tier: 'gold',
      color: 'from-blue-600 via-indigo-500 to-purple-500',
      bgGlow: 'rgba(79, 70, 229, 0.2)',
      borderColor: 'border-indigo-500/50',
      unlocked: maxSingleExpense >= whaleExpenseThreshold,
      progress: Math.min(100, Math.round((maxSingleExpense / whaleExpenseThreshold) * 100)),
      currentFormatted: fmt(maxSingleExpense),
      targetFormatted: fmt(whaleExpenseThreshold),
    },
    {
      id: 'high_roller',
      name: 'High Roller',
      tagline: `Accumulated ${fmt(highRollerSpendThreshold)}+ Expenses`,
      description: `Spend over ${fmt(highRollerSpendThreshold)} in total cumulative expenses.`,
      icon: '🎰',
      category: 'spenders',
      tier: 'gold',
      color: 'from-rose-500 via-red-500 to-amber-500',
      bgGlow: 'rgba(239, 68, 68, 0.2)',
      borderColor: 'border-rose-500/50',
      unlocked: totalExpense >= highRollerSpendThreshold,
      progress: Math.min(100, Math.round((totalExpense / highRollerSpendThreshold) * 100)),
      currentFormatted: fmt(totalExpense),
      targetFormatted: fmt(highRollerSpendThreshold),
    },
    {
      id: 'speed_demon_burn',
      name: 'Speed Demon Burn',
      tagline: '80%+ Burn Rate',
      description: 'Spend 80% or more of your total income. High velocity circulation!',
      icon: '🏎️',
      category: 'spenders',
      tier: 'special',
      color: 'from-red-500 via-orange-500 to-yellow-400',
      bgGlow: 'rgba(249, 115, 22, 0.25)',
      borderColor: 'border-orange-500/60',
      unlocked: spendRate >= 80 && totalIncome > 0,
      progress: Math.min(100, Math.round((spendRate / 80) * 100)),
      currentFormatted: `${spendRate}% Burn`,
      targetFormatted: '80% Burn',
    },
    {
      id: 'shopaholic_supreme',
      name: 'Shopaholic Supreme',
      tagline: '25+ Expenses Logged',
      description: 'Log 25 or more individual expenses. True market operative!',
      icon: '🔥',
      category: 'spenders',
      tier: 'diamond',
      color: 'from-pink-600 via-rose-500 to-orange-400',
      bgGlow: 'rgba(225, 29, 72, 0.25)',
      borderColor: 'border-rose-500/50',
      unlocked: expenseTxCount >= 25,
      progress: Math.min(100, Math.round((expenseTxCount / 25) * 100)),
      currentFormatted: `${expenseTxCount} Expenses`,
      targetFormatted: '25 Expenses',
    },

    // ── DISCIPLINE & VETERAN BADGES 🛡️ ────────────────────────────────────────
    {
      id: 'budget_guardian',
      name: 'Budget Guardian',
      tagline: 'Disciplined Sentinel',
      description: 'Keep all active category budgets strictly under limits.',
      icon: '🛡️',
      category: 'discipline',
      tier: 'gold',
      color: 'from-emerald-500 to-green-400',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'border-emerald-500/40',
      unlocked: isBudgetDisciplined,
      progress: activeBudgets > 0 ? Math.round(((activeBudgets - budgetsExceeded) / activeBudgets) * 100) : 0,
      currentFormatted: `${activeBudgets - budgetsExceeded}/${activeBudgets} Intact`,
      targetFormatted: 'All Intact',
    },
    {
      id: 'ledger_veteran',
      name: 'Ledger Veteran',
      tagline: '20+ Logged Entries',
      description: 'Log 20 or more total financial transactions in your ledger.',
      icon: '📜',
      category: 'veteran',
      tier: 'bronze',
      color: 'from-amber-400 to-orange-400',
      bgGlow: 'rgba(251, 146, 60, 0.15)',
      borderColor: 'border-orange-400/40',
      unlocked: totalTxCount >= 20,
      progress: Math.min(100, Math.round((totalTxCount / 20) * 100)),
      currentFormatted: `${totalTxCount} Entries`,
      targetFormatted: '20 Entries',
    },
    {
      id: 'vault_keeper',
      name: 'Vault Commander',
      tagline: 'Multi-Account Strategy',
      description: 'Establish 3 or more active financial accounts/wallets.',
      icon: '🏛️',
      category: 'veteran',
      tier: 'silver',
      color: 'from-sky-400 to-blue-500',
      bgGlow: 'rgba(56, 189, 248, 0.15)',
      borderColor: 'border-sky-400/40',
      unlocked: accountCount >= 3,
      progress: Math.min(100, Math.round((accountCount / 3) * 100)),
      currentFormatted: `${accountCount} Wallets`,
      targetFormatted: '3 Wallets',
    },
    {
      id: 'financial_mastermind',
      name: 'Financial Mastermind',
      tagline: 'Positive Net Savings & Perfect Budgets',
      description: 'Achieve positive net savings with zero budget overflows.',
      icon: '🧠',
      category: 'discipline',
      tier: 'legend',
      color: 'from-purple-500 via-indigo-500 to-cyan-400',
      bgGlow: 'rgba(147, 51, 234, 0.25)',
      borderColor: 'border-purple-500/60',
      unlocked: netSavings > 0 && budgetsExceeded === 0 && totalTxCount >= 5,
      progress: netSavings > 0 && budgetsExceeded === 0 ? Math.min(100, Math.round((totalTxCount / 5) * 100)) : 0,
      currentFormatted: netSavings > 0 && budgetsExceeded === 0 ? `${totalTxCount}/5 Logs` : 'Overflown',
      targetFormatted: '5 Logs Clean',
    },
  ];

  return badges;
};
