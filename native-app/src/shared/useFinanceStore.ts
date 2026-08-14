import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, set, get as getDbData } from 'firebase/database';
import { database } from './firebase';

// ── Types ──
export type ThemeType = 'dark' | 'cyberpunk' | 'synthwave';

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
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  assigned: number;
  spent: number;
  month: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  selectedTheme?: ThemeType;
}

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

// ── Firebase Sync ──
const saveStateToFirebase = async (
  uid: string, accounts: Account[], transactions: Transaction[],
  budgets: Budget[], theme: ThemeType, currency: string
) => {
  try {
    await set(ref(database, `users/${uid}`), { accounts, transactions, budgets, theme, currency });
  } catch (e) {
    console.error('Firebase save error:', e);
  }
};

// ── Store Interface ──
interface FinanceState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  theme: ThemeType;
  currency: string;
  selectedAccountId: string | null;
  user: UserProfile | null;
  loading: boolean;

  addAccount: (account: Omit<Account, 'id'>) => void;
  deleteAccount: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Transaction;
  deleteTransaction: (id: string) => void;
  setTheme: (theme: ThemeType) => void;
  setCurrency: (currency: string) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  deleteBudget: (id: string) => void;
  setSelectedAccountId: (id: string | null) => void;
  setUser: (user: UserProfile | null) => Promise<void>;
  setLoading: (loading: boolean) => void;
  syncData: (data: any) => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  accounts: [],
  transactions: [],
  budgets: [],
  theme: 'dark',
  currency: 'USD',
  selectedAccountId: null,
  user: null,
  loading: false,

  addAccount: (accountData) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const newAccount: Account = { ...accountData, id };
    const updatedAccounts = [...get().accounts, newAccount];
    set({ accounts: updatedAccounts });
    const { user, transactions, budgets, theme, currency } = get();
    if (user) saveStateToFirebase(user.uid, updatedAccounts, transactions, budgets, theme, currency);
  },

  deleteAccount: (id) => {
    const updatedAccounts = get().accounts.filter(a => a.id !== id);
    set({ accounts: updatedAccounts });
    const { user, transactions, budgets, theme, currency } = get();
    if (user) saveStateToFirebase(user.uid, updatedAccounts, transactions, budgets, theme, currency);
  },

  addTransaction: (txData) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const newTransaction: Transaction = { ...txData, id };
    const updatedTransactions = [newTransaction, ...get().transactions];
    const updatedAccounts = get().accounts.map(acc => {
      if (acc.id === txData.accountId) {
        return {
          ...acc,
          balance: txData.type === 'income' ? acc.balance + txData.amount : acc.balance - txData.amount,
        };
      }
      return acc;
    });
    const updatedBudgets = get().budgets.map(b => {
      if (txData.type === 'expense' && (b.category === txData.category || b.category === 'all')) {
        return { ...b, spent: b.spent + txData.amount };
      }
      return b;
    });
    set({ transactions: updatedTransactions, accounts: updatedAccounts, budgets: updatedBudgets });
    const { user, theme, currency } = get();
    if (user) saveStateToFirebase(user.uid, updatedAccounts, updatedTransactions, updatedBudgets, theme, currency);
    return newTransaction;
  },

  deleteTransaction: (id) => {
    const tx = get().transactions.find(t => t.id === id);
    if (!tx) return;
    const updatedTransactions = get().transactions.filter(t => t.id !== id);
    const updatedAccounts = get().accounts.map(acc => {
      if (acc.id === tx.accountId) {
        return {
          ...acc,
          balance: tx.type === 'income' ? acc.balance - tx.amount : acc.balance + tx.amount,
        };
      }
      return acc;
    });
    set({ transactions: updatedTransactions, accounts: updatedAccounts });
    const { user, budgets, theme, currency } = get();
    if (user) saveStateToFirebase(user.uid, updatedAccounts, updatedTransactions, budgets, theme, currency);
  },

  setTheme: (theme) => {
    set({ theme });
    const { user, accounts, transactions, budgets, currency } = get();
    if (user) saveStateToFirebase(user.uid, accounts, transactions, budgets, theme, currency);
  },

  setCurrency: (currency) => {
    set({ currency });
    const { user, accounts, transactions, budgets, theme } = get();
    if (user) saveStateToFirebase(user.uid, accounts, transactions, budgets, theme, currency);
  },

  addBudget: (budgetData) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const newBudget: Budget = { ...budgetData, assigned: 0, id, spent: 0 };
    const updatedBudgets = [...get().budgets, newBudget];
    set({ budgets: updatedBudgets });
    const { user, accounts, transactions, theme, currency } = get();
    if (user) saveStateToFirebase(user.uid, accounts, transactions, updatedBudgets, theme, currency);
  },

  deleteBudget: (id) => {
    const updatedBudgets = get().budgets.filter(b => b.id !== id);
    set({ budgets: updatedBudgets });
    const { user, accounts, transactions, theme, currency } = get();
    if (user) saveStateToFirebase(user.uid, accounts, transactions, updatedBudgets, theme, currency);
  },

  setSelectedAccountId: (id) => set({ selectedAccountId: id }),

  syncData: (data) => {
    set((state) => ({
      accounts: data.accounts ?? state.accounts,
      transactions: data.transactions ?? state.transactions,
      budgets: data.budgets ?? state.budgets,
      theme: data.theme ?? state.theme,
      currency: data.currency ?? state.currency,
    }));
  },

  setUser: async (user) => {
    set({ user, loading: !!user });
    if (user) {
      try {
        const snapshot = await getDbData(ref(database, `users/${user.uid}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          set({
            accounts: data.accounts || [],
            transactions: data.transactions || [],
            budgets: data.budgets || [],
            theme: data.theme || 'dark',
            currency: data.currency || 'USD',
            loading: false,
          });
        } else {
          set({ loading: false });
        }
      } catch {
        set({ loading: false });
      }
    } else {
      set({ accounts: [], transactions: [], budgets: [], theme: 'dark', currency: 'USD', loading: false });
    }
  },

  setLoading: (loading) => set({ loading }),
}));
