import { persist, createJSONStorage } from 'zustand/middleware';

// --- Type Definitions ---
export type ThemeType = 'dark' | 'light' | 'cyberpunk' | 'glass' | 'forest' | 'synthwave';

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
  color: string; // Tailwind color classes or Hex
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string; // ISO String
  isRecurring?: 'daily' | 'weekly' | 'monthly' | 'none';
  nextRecurrenceDate?: string;
}

export interface Budget {
  id: string;
  category: string; // 'Food', 'Entertainment', 'all' etc.
  limit: number;
  assigned: number;
  spent: number;
  month: string; // YYYY-MM
}

interface FinanceState {
  theme: ThemeType;
  currency: string;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  selectedAccountId: string | null; 
  
  // Gamification
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string | null;
  user?: UserProfile | null;

  // Actions
  setTheme: (theme: ThemeType) => void;
  setCurrency: (currency: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction;
  deleteTransaction: (id: string) => void;
  
  addAccount: (account: Omit<Account, 'id'>) => void;
  deleteAccount: (id: string) => void;
  updateAccountBalance: (accountId: string, amount: number) => void;
  
  addBudget: (budget: Omit<Budget, 'id' | 'spent' | 'assigned'> & { assigned?: number }) => void;
  deleteBudget: (id: string) => void;
  transferToBudget: (budgetId: string, amount: number) => void;
  
  setSelectedAccountId: (id: string | null) => void;
  
  addXP: (amount: number) => void;
  processRecurringTransactions: () => void;
  checkStreak: () => void;

  syncData: (data: Partial<FinanceState>) => void;
}

const getCurrentMonthString = (dateStr?: string) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return \`\${year}-\${month}\`;
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      currency: 'USD',
      accounts: [
        { id: '1', name: 'Everyday Cash', type: 'cash', balance: 1250, color: '#10B981' },
        { id: '2', name: 'Chase Checking', type: 'bank', balance: 5420, color: '#3B82F6' },
        { id: '3', name: 'Gold Credit Card', type: 'credit', balance: -450, color: '#EC4899' },
      ],
      transactions: [
        { id: 't1', accountId: '2', type: 'income', category: 'Salary', amount: 3200, description: 'Bi-weekly Direct Deposit', date: '2026-06-25T10:00:00Z' },
        { id: 't2', accountId: '1', type: 'expense', category: 'Food', amount: 45.5, description: 'Sushi dinner with friends', date: '2026-06-26T19:30:00Z' },
        { id: 't3', accountId: '3', type: 'expense', category: 'Entertainment', amount: 120, description: 'Concert Tickets', date: '2026-06-24T14:15:00Z' },
      ],
      budgets: [
        { id: 'b1', category: 'Food', limit: 500, assigned: 500, spent: 45.5, month: '2026-06' },
        { id: 'b2', category: 'Entertainment', limit: 300, assigned: 300, spent: 120, month: '2026-06' },
      ],
      selectedAccountId: null,
      
      xp: 150,
      level: 1,
      streakDays: 3,
      lastActiveDate: new Date().toISOString().split('T')[0],
      user: null,

      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      
      updateUserProfile: async (profile) => {
        set((state) => ({ user: state.user ? { ...state.user, ...profile } : (profile as UserProfile) }));
      },

      addTransaction: (txData) => {
        const id = 'tx_' + Math.random().toString(36).substring(2, 9);
        const newTransaction: Transaction = { ...txData, id };
        
        const txMonth = getCurrentMonthString(newTransaction.date);
        const amountChange = newTransaction.type === 'income' ? newTransaction.amount : -newTransaction.amount;

        const { accounts, budgets, transactions, addXP } = get();

        const updatedAccounts = accounts.map((acc) => {
          if (acc.id === newTransaction.accountId) {
            return { ...acc, balance: acc.balance + amountChange };
          }
          return acc;
        });

        const updatedBudgets = budgets.map((budget) => {
          if (newTransaction.type === 'expense' && budget.month === txMonth) {
            if (budget.category.toLowerCase() === newTransaction.category.toLowerCase() || budget.category === 'all') {
              return { ...budget, spent: budget.spent + newTransaction.amount };
            }
          }
          return budget;
        });

        set({
          transactions: [newTransaction, ...transactions],
          accounts: updatedAccounts,
          budgets: updatedBudgets,
        });

        // Gamification: Give XP for logging a transaction
        addXP(10);
        
        return newTransaction;
      },

      deleteTransaction: (id) => {
        const { transactions, accounts, budgets } = get();
        const txToDelete = transactions.find((t) => t.id === id);
        if (!txToDelete) return;

        const txMonth = getCurrentMonthString(txToDelete.date);
        const amountChange = txToDelete.type === 'income' ? -txToDelete.amount : txToDelete.amount;

        const updatedAccounts = accounts.map((acc) => {
          if (acc.id === txToDelete.accountId) {
            return { ...acc, balance: acc.balance + amountChange };
          }
          return acc;
        });

        const updatedBudgets = budgets.map((budget) => {
          if (txToDelete.type === 'expense' && budget.month === txMonth) {
            if (budget.category.toLowerCase() === txToDelete.category.toLowerCase() || budget.category === 'all') {
              return { ...budget, spent: Math.max(0, budget.spent - txToDelete.amount) };
            }
          }
          return budget;
        });

        set({
          transactions: transactions.filter((t) => t.id !== id),
          accounts: updatedAccounts,
          budgets: updatedBudgets,
        });
      },

      addAccount: (accData) => {
        const id = 'acc_' + Math.random().toString(36).substring(2, 9);
        const newAccount: Account = { ...accData, id };
        set((state) => ({ accounts: [...state.accounts, newAccount] }));
      },
      
      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter(a => a.id !== id),
          transactions: state.transactions.filter(t => t.accountId !== id)
        }));
      },

      updateAccountBalance: (accountId, amount) => {
        set((state) => ({
          accounts: state.accounts.map((acc) => 
            acc.id === accountId ? { ...acc, balance: acc.balance + amount } : acc
          )
        }));
      },

      addBudget: (budgetData) => {
        const id = 'bud_' + Math.random().toString(36).substring(2, 9);
        const newBudget: Budget = { ...budgetData, assigned: budgetData.assigned || 0, id, spent: 0 };
        set((state) => ({ budgets: [...state.budgets, newBudget] }));
      },
      
      deleteBudget: (id) => {
        set((state) => ({ budgets: state.budgets.filter(b => b.id !== id) }));
      },
      
      transferToBudget: (budgetId, amount) => {
        set((state) => ({
          budgets: state.budgets.map(b => b.id === budgetId ? { ...b, assigned: b.assigned + amount } : b)
        }));
      },

      setSelectedAccountId: (id) => set({ selectedAccountId: id }),
      
      addXP: (amount) => {
        set((state) => {
          const newXP = state.xp + amount;
          const nextLevelXP = state.level * 1000;
          if (newXP >= nextLevelXP) {
            // Reached next level
            return { xp: newXP - nextLevelXP, level: state.level + 1 };
          }
          return { xp: newXP };
        });
      },
      
      checkStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => {
          if (state.lastActiveDate === today) return state; // Already active today
          
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
        
        const recurring = transactions.filter(t => t.isRecurring && t.isRecurring !== 'none' && t.nextRecurrenceDate);
        
        recurring.forEach(tx => {
          const nextDate = new Date(tx.nextRecurrenceDate!);
          if (now >= nextDate) {
            // Process it
            addTransaction({
              accountId: tx.accountId,
              type: tx.type,
              category: tx.category,
              amount: tx.amount,
              description: tx.description + ' (Auto-Recurring)',
              date: nextDate.toISOString(),
            });
            
            // Calculate next date
            const newNext = new Date(nextDate);
            if (tx.isRecurring === 'daily') newNext.setDate(newNext.getDate() + 1);
            else if (tx.isRecurring === 'weekly') newNext.setDate(newNext.getDate() + 7);
            else if (tx.isRecurring === 'monthly') newNext.setMonth(newNext.getMonth() + 1);
            
            // Update original tx with new nextRecurrenceDate
            set(state => ({
              transactions: state.transactions.map(t => t.id === tx.id ? { ...t, nextRecurrenceDate: newNext.toISOString() } : t)
            }));
          }
        });
      },

      syncData: (data) => {
        set((state) => ({ ...state, ...data }));
      },
    }),
    {
      name: 'coinburst-finance-storage',
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
    }
  )
);
