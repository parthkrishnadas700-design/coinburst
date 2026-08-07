import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { database } from './firebase';
import { ref, set as firebaseSet, get as firebaseGet, update as firebaseUpdate } from 'firebase/database';
import { triggerHaptic, triggerHapticNotification, showNativeToast } from './nativeBridge';
import { sanitizeText, validateAmount, sanitizeCategory, hashPin } from './securityUtils';

export type ThemeType = 'dark' | 'light' | 'cyberpunk' | 'glass' | 'forest' | 'synthwave';

// ── Currency definitions ──────────────────────────────────────────────────────
export interface CurrencyDefinition {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyDefinition[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee',        locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar',            locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro',                 locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound',        locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen',         locale: 'ja-JP' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham',         locale: 'ar-AE' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar',    locale: 'en-SG' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar',     locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar',   locale: 'en-AU' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc',         locale: 'de-CH' },
];

/** Formats a number as a currency string using the stored currency code */
export const formatCurrency = (amount: number, currencyCode: string): string => {
  const def = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) ?? SUPPORTED_CURRENCIES[0];
  // JPY has no decimal places
  const decimals = currencyCode === 'JPY' ? 0 : 2;
  return `${def.symbol}${Math.abs(amount).toLocaleString(def.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

// ── Interfaces ────────────────────────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  selectedTheme: ThemeType;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit';
  balance: number;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  isRecurring?: boolean;
  recurrenceFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextRecurrenceDate?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  assigned?: number;
  month: string;
}

interface FinanceState {
  theme: ThemeType;
  currency: string; // ISO 4217 code e.g. 'INR'
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  selectedAccountId: string | null;
  user: UserProfile | null;
  loading: boolean;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;

  // ── Security & PIN Lock ───────────────────────────────────────────
  isPinEnabled: boolean;
  securityPinHash: string | null;
  isLocked: boolean;

  setSecurityPin: (pin: string | null) => void;
  verifyAndUnlock: (pin: string) => boolean;
  lockApp: () => void;

  setCurrency: (currency: string) => void;
  setTheme: (theme: ThemeType) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  deleteAccount: (id: string) => void;
  updateAccountBalance: (accountId: string, amount: number) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  deleteBudget: (id: string) => void;
  setSelectedAccountId: (id: string | null) => void;
  syncData: (data: {
    accounts?: Account[];
    transactions?: Transaction[];
    budgets?: Budget[];
    theme?: ThemeType;
    currency?: string;
  }) => void;
  setUser: (user: UserProfile | null) => Promise<void>;
  setLoading: (loading: boolean) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateTransaction: (updatedTx: Transaction) => void;
  addXP?: (amount: number) => void;
  checkStreak?: () => void;
  processRecurringTransactions?: () => void;
  allocateBudgetAmount?: (budgetId: string, amount: number) => void;
}

const getCurrentMonthString = (dateStr?: string) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}`;
};

/**
 * Recalculates spent totals for all budgets based on matching expense transactions.
 * Matches by category name OR transaction title/description (case-insensitive) or 'all'.
 */
export const recalculateBudgetSpent = (budgets: Budget[], transactions: Transaction[]): Budget[] => {
  return budgets.map((budget) => {
    const budgetMonth = budget.month;
    const bCatLower = (budget.category || '').toLowerCase().trim();

    const matchingExpenses = transactions.filter((t) => {
      if (t.type !== 'expense') return false;

      // Month match (if budget has a month specified)
      const tMonth = getCurrentMonthString(t.date);
      if (budgetMonth && budgetMonth !== tMonth) return false;

      // Category & Title (description) match logic
      const isAll = bCatLower === 'all';
      const tCatLower = (t.category || '').toLowerCase().trim();
      const tDescLower = (t.description || '').toLowerCase().trim();

      const matchesCategory = bCatLower === tCatLower || (bCatLower.length > 2 && tCatLower.includes(bCatLower));
      const matchesDescription =
        tDescLower === bCatLower ||
        (bCatLower.length > 2 && tDescLower.includes(bCatLower)) ||
        (tDescLower.length > 2 && bCatLower.includes(tDescLower));

      return isAll || matchesCategory || matchesDescription;
    });

    const totalSpent = matchingExpenses.reduce((sum, t) => sum + t.amount, 0);
    return { ...budget, spent: totalSpent };
  });
};

// Firebase RTDB silently drops empty arrays — convert [] to null so the key is preserved
const toFirebaseArray = <T>(arr: T[]): T[] | null => arr.length > 0 ? arr : null;

// Convert Firebase null back to an empty array
const fromFirebaseArray = <T>(val: unknown): T[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val as T[];
  // Firebase sometimes stores arrays as objects keyed by index — convert them back
  if (typeof val === 'object') return Object.values(val) as T[];
  return [];
};

// Save full ledger state to Firebase under the user's node
const saveStateToFirebase = (
  uid: string,
  accounts: Account[],
  transactions: Transaction[],
  budgets: Budget[],
  theme: ThemeType,
  currency: string
) => {
  const dbRef = ref(database, `users/${uid}`);
  const payload: Record<string, unknown> = {
    theme,
    currency,
    accounts: toFirebaseArray(accounts),
    transactions: toFirebaseArray(transactions),
    budgets: toFirebaseArray(budgets),
  };
  firebaseUpdate(dbRef, payload)
    .catch(err => console.error('[CoinBurst] Firebase sync failed:', err));
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      currency: 'INR',  // Default currency = Indian Rupee
      accounts: [],
      transactions: [],
      budgets: [],
      selectedAccountId: null,
      user: null,
      loading: false,
      xp: 0,
      level: 1,
      streakDays: 0,
      lastActiveDate: '',

      // Security PIN Lock Defaults
      isPinEnabled: false,
      securityPinHash: null,
      isLocked: false,

      setSecurityPin: (pin) => {
        if (!pin) {
          set({ isPinEnabled: false, securityPinHash: null, isLocked: false });
          showNativeToast('Security PIN removed');
        } else {
          const hashed = hashPin(pin);
          set({ isPinEnabled: true, securityPinHash: hashed, isLocked: false });
          showNativeToast('4-Digit Security PIN enabled!');
        }
      },

      verifyAndUnlock: (pin) => {
        const { securityPinHash } = get();
        if (!securityPinHash) {
          set({ isLocked: false });
          return true;
        }
        const enteredHash = hashPin(pin);
        if (enteredHash === securityPinHash) {
          set({ isLocked: false });
          triggerHapticNotification('success');
          return true;
        }
        triggerHapticNotification('error');
        return false;
      },

      lockApp: () => {
        const { isPinEnabled } = get();
        if (isPinEnabled) {
          set({ isLocked: true });
          triggerHaptic('medium');
        }
      },

      // ── Currency ──────────────────────────────────────────────────────────────
      setCurrency: (currency) => {
        set({ currency });
        const { user, accounts, transactions, budgets, theme } = get();
        if (user) saveStateToFirebase(user.uid, accounts, transactions, budgets, theme, currency);
      },

      // ── Theme ──────────────────────────────────────────────────────────────
      setTheme: (theme) => {
        set({ theme });
        const { user, accounts, transactions, budgets, currency } = get();
        if (user) saveStateToFirebase(user.uid, accounts, transactions, budgets, theme, currency);
      },

      // ── Transactions ────────────────────────────────────────────────────────
      addTransaction: (txData) => {
        const id = 'tx_' + Math.random().toString(36).substring(2, 9);
        const sanitizedTx: Transaction = {
          ...txData,
          id,
          description: sanitizeText(txData.description, 200),
          category: sanitizeCategory(txData.category),
          amount: validateAmount(txData.amount),
        };
        const amountChange = sanitizedTx.type === 'income' ? sanitizedTx.amount : -sanitizedTx.amount;
        const { accounts, budgets, transactions, theme, currency } = get();

        const updatedAccounts = accounts.map((acc) =>
          acc.id === sanitizedTx.accountId
            ? { ...acc, balance: acc.balance + amountChange }
            : acc
        );

        const updatedTransactions = [sanitizedTx, ...transactions];
        const updatedBudgets = recalculateBudgetSpent(budgets, updatedTransactions);

        set({ transactions: updatedTransactions, accounts: updatedAccounts, budgets: updatedBudgets });
        triggerHaptic('medium');
        triggerHapticNotification('success');
        showNativeToast('Transaction saved');

        const { user } = get();
        if (user) saveStateToFirebase(user.uid, updatedAccounts, updatedTransactions, updatedBudgets, theme, currency);

        return sanitizedTx;
      },

      deleteTransaction: (id) => {
        const { transactions, accounts, budgets, theme, currency } = get();
        const txToDelete = transactions.find((t) => t.id === id);
        if (!txToDelete) return;

        const amountChange = txToDelete.type === 'income' ? -txToDelete.amount : txToDelete.amount;

        const updatedAccounts = accounts.map((acc) =>
          acc.id === txToDelete.accountId
            ? { ...acc, balance: acc.balance + amountChange }
            : acc
        );

        const updatedTransactions = transactions.filter((t) => t.id !== id);
        const updatedBudgets = recalculateBudgetSpent(budgets, updatedTransactions);

        set({ transactions: updatedTransactions, accounts: updatedAccounts, budgets: updatedBudgets });
        triggerHaptic('heavy');
        showNativeToast('Transaction deleted');

        const { user } = get();
        if (user) saveStateToFirebase(user.uid, updatedAccounts, updatedTransactions, updatedBudgets, theme, currency);
      },

      // ── Accounts ─────────────────────────────────────────────────────────────
      addAccount: (accData) => {
        const id = 'acc_' + Math.random().toString(36).substring(2, 9);
        const newAccount: Account = {
          ...accData,
          id,
          name: sanitizeText(accData.name, 100),
          balance: validateAmount(accData.balance, true),
        };
        const updatedAccounts = [...get().accounts, newAccount];
        set({ accounts: updatedAccounts });

        const { user, transactions, budgets, theme, currency } = get();
        if (user) saveStateToFirebase(user.uid, updatedAccounts, transactions, budgets, theme, currency);
      },

      deleteAccount: (id) => {
        const { transactions, budgets, theme, currency } = get();
        const updatedAccounts = get().accounts.filter((a) => a.id !== id);
        const updatedTransactions = transactions.filter((t) => t.accountId !== id);
        const updatedBudgets = recalculateBudgetSpent(budgets, updatedTransactions);
        set({ accounts: updatedAccounts, transactions: updatedTransactions, budgets: updatedBudgets, selectedAccountId: null });

        const { user } = get();
        if (user) saveStateToFirebase(user.uid, updatedAccounts, updatedTransactions, updatedBudgets, theme, currency);
      },

      updateAccountBalance: (accountId, amount) => {
        const validatedAmt = validateAmount(amount, true);
        const updatedAccounts = get().accounts.map((acc) =>
          acc.id === accountId ? { ...acc, balance: acc.balance + validatedAmt } : acc
        );
        set({ accounts: updatedAccounts });

        const { user, transactions, budgets, theme, currency } = get();
        if (user) saveStateToFirebase(user.uid, updatedAccounts, transactions, budgets, theme, currency);
      },

      // ── Budgets ──────────────────────────────────────────────────────────────
      addBudget: (budgetData) => {
        const id = 'bud_' + Math.random().toString(36).substring(2, 9);
        const { transactions } = get();
        const rawBudget: Budget = {
          ...budgetData,
          category: sanitizeCategory(budgetData.category),
          limit: validateAmount(budgetData.limit),
          assigned: (budgetData as any).assigned || 0,
          id,
          spent: 0,
        };
        const updatedBudgets = recalculateBudgetSpent([...get().budgets, rawBudget], transactions);
        set({ budgets: updatedBudgets });

        const { user, accounts, theme, currency } = get();
        if (user) saveStateToFirebase(user.uid, accounts, transactions, updatedBudgets, theme, currency);
      },

      deleteBudget: (id) => {
        const updatedBudgets = get().budgets.filter((b) => b.id !== id);
        set({ budgets: updatedBudgets });

        const { user, accounts, transactions, theme, currency } = get();
        if (user) saveStateToFirebase(user.uid, accounts, transactions, updatedBudgets, theme, currency);
      },

      // ── Selection ─────────────────────────────────────────────────────────────
      setSelectedAccountId: (id) => set({ selectedAccountId: id }),


      addXP: (amount) => {
        set((state) => {
          const newXP = state.xp + amount;
          const nextLevelXP = state.level * 1000;
          if (newXP >= nextLevelXP) {
            return { xp: newXP - nextLevelXP, level: state.level + 1 };
          }
          return { xp: newXP };
        });
      },
      
      checkStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => {
          if (state.lastActiveDate === today) return state;
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (state.lastActiveDate === yesterdayStr) {
            return { streakDays: state.streakDays + 1, lastActiveDate: today };
          } else {
            return { streakDays: 1, lastActiveDate: today };
          }
        });
      },
      
      processRecurringTransactions: () => {
        const { transactions, addTransaction } = get();
        const now = new Date();
        
        const recurring = transactions.filter(t => t.isRecurring && t.nextRecurrenceDate);
        
        recurring.forEach(tx => {
          const nextDate = new Date(tx.nextRecurrenceDate!);
          if (now >= nextDate) {
            addTransaction({
              accountId: tx.accountId,
              type: tx.type,
              category: tx.category,
              amount: tx.amount,
              description: tx.description + ' (Auto-Recurring)',
              date: nextDate.toISOString(),
            });
            
            const newNext = new Date(nextDate);
            const freq = tx.recurrenceFrequency || 'monthly';
            if (freq === 'daily') newNext.setDate(newNext.getDate() + 1);
            else if (freq === 'weekly') newNext.setDate(newNext.getDate() + 7);
            else if (freq === 'monthly') newNext.setMonth(newNext.getMonth() + 1);
            else if (freq === 'yearly') newNext.setFullYear(newNext.getFullYear() + 1);
            
            set(state => ({
              transactions: state.transactions.map(t => t.id === tx.id ? { ...t, nextRecurrenceDate: newNext.toISOString() } : t)
            }));
          }
        });
      },

      transferToBudget: (budgetId: string, amount: number) => {
        set((state) => ({
          budgets: state.budgets.map(b => b.id === budgetId ? { ...b, assigned: (b.assigned || 0) + amount } : b)
        }));
      },

      syncData: (data) => {
        set((state) => ({
          accounts: data.accounts ?? state.accounts,
          transactions: data.transactions ?? state.transactions,
          budgets: data.budgets ?? state.budgets,
          theme: data.theme ?? state.theme,
          currency: data.currency ?? state.currency,
        }));
      },

      // ── Auth / Firebase Load ──────────────────────────────────────────────────
      updateTransaction: (updatedTx: Transaction) => {
    const { transactions, accounts, user, theme, currency } = get();
    const newTransactions = transactions.map(t => t.id === updatedTx.id ? updatedTx : t);
    // Update account balance based on difference
    const oldTx = transactions.find(t => t.id === updatedTx.id);
    if (oldTx) {
      const amountDiff = (updatedTx.type === 'income' ? updatedTx.amount : -updatedTx.amount) - (oldTx.type === 'income' ? oldTx.amount : -oldTx.amount);
      const updatedAccounts = accounts.map(acc =>
        acc.id === updatedTx.accountId ? { ...acc, balance: acc.balance + amountDiff } : acc
      );
      set({ transactions: newTransactions, accounts: updatedAccounts });
      if (user) saveStateToFirebase(user.uid, updatedAccounts, newTransactions, get().budgets, theme, currency);
    } else {
      set({ transactions: newTransactions });
    }
  },
      setUser: async (user) => {
        if (user) {
          set({ user, loading: true });
          const dbRef = ref(database, `users/${user.uid}`);
          try {
            const snapshot = await firebaseGet(dbRef);
            if (snapshot.exists()) {
              const data = snapshot.val();
              const loadedUser = { ...user };
              if (data.profile) {
                loadedUser.displayName = data.profile.displayName || user.displayName;
                loadedUser.photoURL = data.profile.photoURL || user.photoURL;
              }
              const loadedAccounts = fromFirebaseArray<Account>(data.accounts);
              const loadedTransactions = fromFirebaseArray<Transaction>(data.transactions);
              const rawBudgets = fromFirebaseArray<Budget>(data.budgets);
              const loadedBudgets = recalculateBudgetSpent(rawBudgets, loadedTransactions);

              set({
                user: loadedUser,
                accounts: loadedAccounts,
                transactions: loadedTransactions,
                budgets: loadedBudgets,
                theme: (data.theme as ThemeType) || 'dark',
                currency: data.currency || 'INR',
              });
              console.log('[CoinBurst] Loaded user data from Firebase.');
            } else {
              const freshProfile = {
                displayName: user.displayName,
                photoURL: user.photoURL || '',
                email: user.email,
              };
              await firebaseSet(dbRef, {
                theme: 'dark',
                currency: 'INR',
                profile: freshProfile,
              });
              set({
                user,
                accounts: [],
                transactions: [],
                budgets: [],
                theme: 'dark',
                currency: 'INR',
              });
              console.log('[CoinBurst] New user record created in Firebase.');
            }
          } catch (error) {
            console.error('[CoinBurst] Firebase load failed:', error);
          } finally {
            set({ loading: false });
          }
        } else {
          set({
            user: null,
            accounts: [],
            transactions: [],
            budgets: [],
            selectedAccountId: null,
            loading: false,
            currency: 'INR',
          });
        }
      },


      setLoading: (loading) => set({ loading }),

      // ── Profile Update ────────────────────────────────────────────────────────
      updateUserProfile: async (profile) => {
        const { user } = get();
        if (!user) return;

        const updatedUser = { ...user, ...profile };
        set({ user: updatedUser });

        const dbRef = ref(database, `users/${user.uid}/profile`);
        try {
          await firebaseUpdate(dbRef, {
            displayName: updatedUser.displayName,
            photoURL: updatedUser.photoURL || '',
            email: updatedUser.email,
          });
        } catch (error) {
          console.error('Firebase profile update failed:', error);
        }
      },
    }),
    {
      name: 'coinburst-v2-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Persist user preference and local ledger cache for offline / instant load on mobile
      partialize: (state) => ({
        theme: state.theme,
        currency: state.currency,
        accounts: state.accounts,
        transactions: state.transactions,
        budgets: state.budgets,
      }),
    }
  )
);
