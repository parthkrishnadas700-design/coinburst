import { GoogleGenerativeAI } from '@google/generative-ai';
import { useFinanceStore, formatCurrency } from '../shared/useFinanceStore';

const getApiKeys = (): string[] => {
  const envVal = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEYS || '';
  return envVal
    .split(',')
    .map((k: string) => k.trim())
    .filter((k: string) => k.length > 0 && !k.startsWith('YOUR_'));
};

let currentKeyIndex = 0;

export const generateAIResponse = async (message: string): Promise<{ text: string; action?: string }> => {
  const store = useFinanceStore.getState();
  const { accounts, transactions, budgets, currency, user } = store;
  const keys = getApiKeys();

  // Demo fallback mode if API keys are unconfigured
  if (keys.length === 0) {
    return getDemoResponse(message, store);
  }

  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const contextPrompt = `You are Nexus AI, a personal finance assistant in the CoinBurst mobile app.
Current User Context:
- Name: ${user?.displayName || 'User'}
- Currency: ${currency}
- Total Net Worth: ${formatCurrency(totalBalance, currency)}
- Total Income: ${formatCurrency(totalIncome, currency)}
- Total Expense: ${formatCurrency(totalExpense, currency)}
- Accounts Count: ${accounts.length}
- Transactions Count: ${transactions.length}
- Budgets Count: ${budgets.length}

Answer the user concisely and helpfully in markdown. User Query: "${message}"`;

  let lastError: any = null;
  const totalKeys = keys.length;

  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const keyIdx = (currentKeyIndex + attempt) % totalKeys;
    const apiKey = keys[keyIdx];

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const result = await model.generateContent(contextPrompt);
      const responseText = result.response.text();

      // On success, rotate current index for load balancing
      currentKeyIndex = (keyIdx + 1) % totalKeys;

      return { text: responseText };
    } catch (error: any) {
      lastError = error;
      console.warn(`[Native AI Engine] Key index ${keyIdx} failed:`, error?.message || error);
      const errMsg = error?.message || error?.toString() || '';
      const isRateLimit = error?.status === 429 || error?.code === 429 || /429|quota|RESOURCE_EXHAUSTED|limit|exceeded|rate/i.test(errMsg);

      if (isRateLimit && attempt < totalKeys - 1) {
        console.info(`[Native AI Engine] Key index ${keyIdx} hit rate limit. Rotating to key index ${(keyIdx + 1) % totalKeys}...`);
        continue;
      }
      break;
    }
  }

  console.error('Native AI Engine Error (all keys attempted):', lastError);
  return getDemoResponse(message, store);
};

const getDemoResponse = (message: string, store: any) => {
  const query = message.toLowerCase();
  const fmt = (val: number) => formatCurrency(val, store.currency);

  if (query.includes('balance') || query.includes('net worth') || query.includes('summary')) {
    const total = store.accounts.reduce((s: number, a: any) => s + a.balance, 0);
    return { text: `💳 **Portfolio Summary**\n\nYour total net worth is **${fmt(total)}** across ${store.accounts.length} active account(s).` };
  }
  if (query.includes('expense') || query.includes('spent')) {
    const totalExp = store.transactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);
    return { text: `📉 **Expense Overview**\n\nYou have spent a total of **${fmt(totalExp)}** in logged transactions.` };
  }
  if (query.includes('income') || query.includes('earned')) {
    const totalInc = store.transactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);
    return { text: `📈 **Income Overview**\n\nYour total recorded income is **${fmt(totalInc)}**.` };
  }
  return { text: `🤖 **Nexus AI Advisor**\n\nI analyzed your query: "${message}". Your financial health looks stable with ${store.transactions.length} recorded entries.` };
};
