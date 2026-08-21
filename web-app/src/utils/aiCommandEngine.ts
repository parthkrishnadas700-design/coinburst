import { GoogleGenAI, Type } from '@google/genai';
import { sanitizeText } from '../shared/securityUtils';

const getGeminiKeys = (): string[] => {
  const envVal = (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEYS || '').toString();
  return envVal
    .split(',')
    .map((k: string) => k.trim())
    .filter((k: string) => k.length > 0 && (k.startsWith('AIzaSy') || (k.length > 25 && !k.startsWith('AQ.') && !k.startsWith('YOUR_') && !k.startsWith('sk-'))));
};

const getOpenAIKeys = (): string[] => {
  const envVal = (import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEYS || '').toString();
  return envVal
    .split(',')
    .map((k: string) => k.trim())
    .filter((k: string) => k.startsWith('sk-proj-') || k.startsWith('sk-'));
};

const getOpenRouterKeys = (): string[] => {
  const envVal = (import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEYS || '').toString();
  return envVal
    .split(',')
    .map((k: string) => k.trim())
    .filter((k: string) => k.startsWith('sk-or-'));
};

let currentKeyIndex = 0;

export type AIResult = { text: string; action?: () => void };

export const generateAIResponse = async (
  rawMessage: string,
  state: { accounts: any[]; transactions: any[]; budgets: any[] },
  currency: string,
  store: {
    addTransaction: (t: any) => any;
    deleteTransaction: (id: string) => void;
    addAccount: (a: any) => void;
    deleteAccount: (id: string) => void;
    addBudget: (b: any) => void;
    deleteBudget: (id: string) => void;
    setTheme: (t: any) => void;
    setCurrency: (c: string) => void;
    onNavigate: (p: any) => void;
  }
): Promise<AIResult> => {
  // Security: Sanitize user input to prevent prompt injection and XSS
  const message = sanitizeText(rawMessage, 500);
  const geminiKeys = getGeminiKeys();
  const openAIKeys = getOpenAIKeys();
  const openRouterKeys = getOpenRouterKeys();

  // Define tools for LLM function calling
  const tools = [{
    functionDeclarations: [
      {
        name: 'add_transaction',
        description: 'Log a new income or expense transaction.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, description: 'Must be "income" or "expense"' },
            amount: { type: Type.NUMBER, description: 'The monetary amount' },
            category: { type: Type.STRING, description: 'Category (e.g. Food, Salary, Entertainment)' },
            description: { type: Type.STRING, description: 'A short description of the transaction' },
            accountId: { type: Type.STRING, description: 'Optional ID of the account. Leave null if not specified.' }
          },
          required: ['type', 'amount', 'category', 'description']
        }
      },
      {
        name: 'create_account',
        description: 'Create a new financial account/wallet.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Name of the account (e.g. Chase Bank, Cash Wallet)' },
            type: { type: Type.STRING, description: 'Must be "cash", "bank", or "credit"' },
            balance: { type: Type.NUMBER, description: 'Initial balance amount' }
          },
          required: ['name', 'type', 'balance']
        }
      },
      {
        name: 'set_budget',
        description: 'Set a new budget limit for a specific category.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'Category (e.g. Food, Entertainment, Shopping)' },
            limit: { type: Type.NUMBER, description: 'The monthly limit amount' }
          },
          required: ['category', 'limit']
        }
      },
      {
        name: 'change_theme',
        description: 'Change the application theme.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING, description: 'Must be one of: "dark", "light", "cyberpunk", "glass", "forest", "synthwave"' }
          },
          required: ['theme']
        }
      },
      {
        name: 'navigate_page',
        description: 'Navigate to a different page in the application.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            page: { type: Type.STRING, description: 'Must be one of: "dashboard", "transactions", "budgets", "settings", "ai", "about"' }
          },
          required: ['page']
        }
      }
    ]
  }];

  const systemInstruction = `You are the CoinBurst Autonomous AI Advisor. You manage personal finances with precision.
Whenever the user asks to add/log a transaction, create an account, set a budget, change the theme, or navigate, YOU MUST USE THE CORRESPONDING TOOL.
Current Currency: ${currency}
Current State Context:
- Accounts: ${JSON.stringify(state.accounts.map(a => ({ id: a.id, name: a.name, type: a.type, balance: a.balance })))}
- Recent Transactions (last 10): ${JSON.stringify(state.transactions.slice(0, 10).map(t => ({ id: t.id, type: t.type, amount: t.amount, category: t.category, description: t.description })))}
- Active Budgets: ${JSON.stringify(state.budgets.map(b => ({ category: b.category, limit: b.limit, spent: b.spent })))}

Format your responses using clean Markdown. Be concise, helpful, and adopt a sleek financial advisor tone.`;

  let lastError: any = null;

  // 1. Attempt Gemini Provider Keys (gemini-2.5-flash -> gemini-1.5-flash)
  if (geminiKeys.length > 0) {
    const totalKeys = geminiKeys.length;
    for (let attempt = 0; attempt < totalKeys; attempt++) {
      const keyIdx = (currentKeyIndex + attempt) % totalKeys;
      const apiKey = geminiKeys[keyIdx];
      const ai = new GoogleGenAI({ apiKey });

      const geminiModels = ['gemini-2.5-flash', 'gemini-1.5-flash'];
      for (const modelName of geminiModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: message,
            config: {
              tools: tools as any,
              systemInstruction: systemInstruction,
              temperature: 0.2,
            }
          });

          currentKeyIndex = (keyIdx + 1) % totalKeys;

          if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            const args = (call.args || {}) as Record<string, any>;
            return processToolCall(call.name || '', args, state, currency, store);
          }

          if (response.text) {
            return { text: response.text };
          }
        } catch (error: any) {
          lastError = error;
          console.warn(`[AI Engine] Gemini Model ${modelName} key index ${keyIdx} failed:`, error?.message || error);
        }
      }
    }
  }

  // 2. Attempt OpenAI Provider Keys (sk-proj-...)
  if (openAIKeys.length > 0) {
    for (const openAIKey of openAIKeys) {
      const openAIResult = await callOpenAICompatibleAI(
        openAIKey,
        'https://api.openai.com/v1/chat/completions',
        'gpt-4o-mini',
        systemInstruction,
        message
      );
      if (openAIResult) return openAIResult;
    }
  }

  // 3. Attempt OpenRouter Provider Keys (sk-or-...)
  if (openRouterKeys.length > 0) {
    for (const openRouterKey of openRouterKeys) {
      const openRouterResult = await callOpenAICompatibleAI(
        openRouterKey,
        'https://openrouter.ai/api/v1/chat/completions',
        'google/gemini-2.5-flash',
        systemInstruction,
        message
      );
      if (openRouterResult) return openRouterResult;
    }
  }

  // 4. Intelligent Local Natural Language Engine Fallback
  // Parses intent offline so the AI Advisor NEVER fails
  const localResult = processLocalNaturalLanguage(message, state, currency, store);
  if (localResult) {
    return localResult;
  }

  console.warn("AI Engine falling back to intelligent overview due to API key resolution:", lastError);
  return generateFinancialOverview(state, currency);
};

// Tool execution helper
const processToolCall = (
  name: string,
  args: Record<string, any>,
  state: { accounts: any[]; transactions: any[]; budgets: any[] },
  currency: string,
  store: any
): AIResult => {
  let action: (() => void) | undefined = undefined;
  let replyText = '';

  if (name === 'add_transaction') {
    const targetAccount = state.accounts.find(a => a.id === args.accountId) || state.accounts[0];
    if (!targetAccount) return { text: "⚠️ Transaction failed: No active wallet node found." };
    action = () => store.addTransaction({
      accountId: targetAccount.id,
      type: args.type || 'expense',
      amount: Number(args.amount) || 0,
      category: args.category || 'General',
      description: args.description || args.category || 'Logged via AI',
      date: new Date().toISOString()
    });
    replyText = `✅ Recorded **${(args.type || 'EXPENSE').toUpperCase()}** of **${formatAmount(args.amount, currency)}** (${args.category}) into **${targetAccount.name}**.`;
  }
  else if (name === 'create_account') {
    action = () => store.addAccount({ name: args.name, type: args.type || 'bank', balance: Number(args.balance) || 0 });
    replyText = `✅ Vault Node **${args.name}** created with initial balance of **${formatAmount(args.balance || 0, currency)}**.`;
  }
  else if (name === 'set_budget') {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    action = () => store.addBudget({ category: args.category, limit: Number(args.limit) || 0, month });
    replyText = `✅ Sentinel protocol activated: **${args.category}** limit set to **${formatAmount(args.limit, currency)}**.`;
  }
  else if (name === 'change_theme') {
    action = () => store.setTheme(args.theme);
    replyText = `🎨 Visual preset updated to **${args.theme}**.`;
  }
  else if (name === 'navigate_page') {
    action = () => store.onNavigate(args.page);
    replyText = `📍 Navigating interface to **${args.page.toUpperCase()}**...`;
  }

  return { text: replyText, action };
};

// Intelligent Local Natural Language Engine Parser
const processLocalNaturalLanguage = (
  rawMsg: string,
  state: { accounts: any[]; transactions: any[]; budgets: any[] },
  currency: string,
  store: any
): AIResult | null => {
  const msg = rawMsg.toLowerCase().trim();

  // Pattern A: Add Transaction (e.g. "add expense 500 food", "spent 120 coffee", "income 10000 salary", "add 500 food")
  const txMatch = msg.match(/(?:add|log|record|spent|paid|received|earned)?\s*(income|expense)?\s*(?:of|for)?\s*(?:₹|\$|€|£)?\s*(\d+(?:\.\d+)?)\s*(?:on|for|in|category)?\s*([a-z0-9\s]+)?/i);
  if (txMatch && (msg.includes('add') || msg.includes('log') || msg.includes('spent') || msg.includes('income') || msg.includes('expense') || msg.includes('paid') || msg.includes('received') || msg.includes('earned'))) {
    const amountStr = txMatch[2];
    if (amountStr) {
      const amount = parseFloat(amountStr);
      let type: 'income' | 'expense' = 'expense';
      if (msg.includes('income') || msg.includes('received') || msg.includes('earned') || msg.includes('salary') || msg.includes('deposit')) {
        type = 'income';
      }

      let category = (txMatch[3] || '').trim();
      category = category.replace(/^(expense|income|transaction|log|add|on|for|in|category)\s*/g, '').trim();
      if (!category) {
        if (msg.includes('food') || msg.includes('coffee') || msg.includes('dinner')) category = 'Food';
        else if (msg.includes('salary')) category = 'Salary';
        else if (msg.includes('rent') || msg.includes('bill')) category = 'Bills';
        else if (msg.includes('shopping')) category = 'Shopping';
        else category = type === 'income' ? 'Salary' : 'General';
      } else {
        category = category.charAt(0).toUpperCase() + category.slice(1);
      }

      const targetAccount = state.accounts[0];
      if (!targetAccount) return { text: "⚠️ Transaction failed: No active wallet node found." };

      return {
        text: `✅ **AI Autonomous Execution**: Logged **${type.toUpperCase()}** of **${formatAmount(amount, currency)}** under category **${category}** in **${targetAccount.name}**.`,
        action: () => store.addTransaction({
          accountId: targetAccount.id,
          type,
          amount,
          category,
          description: `${category} transaction`,
          date: new Date().toISOString()
        })
      };
    }
  }

  // Pattern B: Create Account / Wallet (e.g. "create account HDFC 5000", "add bank Cash 1000")
  if (msg.includes('account') || msg.includes('wallet') || msg.includes('bank')) {
    const accMatch = msg.match(/(?:create|add|new)\s*(?:account|wallet|bank)?\s*([a-z0-9\s]+?)\s*(?:with|balance)?\s*(?:₹|\$|€|£)?\s*(\d+(?:\.\d+)?)/i);
    if (accMatch) {
      const name = accMatch[1].trim() || 'New Wallet';
      const balance = parseFloat(accMatch[2]) || 0;
      let type: 'cash' | 'bank' | 'credit' = 'bank';
      if (msg.includes('cash')) type = 'cash';
      if (msg.includes('credit') || msg.includes('card')) type = 'credit';

      return {
        text: `✅ **AI Autonomous Execution**: Created Vault Node **${name}** with initial balance **${formatAmount(balance, currency)}**.`,
        action: () => store.addAccount({ name, type, balance })
      };
    }
  }

  // Pattern C: Set Budget (e.g. "set budget 5000 Food", "cap 2000 Groceries")
  if (msg.includes('budget') || msg.includes('cap') || msg.includes('limit')) {
    const bMatch = msg.match(/(?:set|add|create)?\s*budget\s*(?:limit|cap)?\s*(?:of|for)?\s*(?:₹|\$|€|£)?\s*(\d+(?:\.\d+)?)\s*(?:for|on)?\s*([a-z0-9\s]+)/i) ||
                   msg.match(/budget\s*([a-z0-9\s]+)\s*(?:₹|\$|€|£)?\s*(\d+(?:\.\d+)?)/i);
    if (bMatch) {
      let limit = 0;
      let category = 'General';
      if (!isNaN(parseFloat(bMatch[1]))) {
        limit = parseFloat(bMatch[1]);
        category = bMatch[2] || 'General';
      } else {
        category = bMatch[1] || 'General';
        limit = parseFloat(bMatch[2]) || 0;
      }
      category = category.trim().charAt(0).toUpperCase() + category.trim().slice(1);
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      return {
        text: `✅ **AI Sentinel Activated**: Budget cap of **${formatAmount(limit, currency)}** set for **${category}**.`,
        action: () => store.addBudget({ category, limit, month })
      };
    }
  }

  // Pattern D: Change Theme (e.g. "dark mode", "cyberpunk theme", "forest", "light mode")
  if (msg.includes('theme') || msg.includes('dark mode') || msg.includes('light mode') || msg.includes('cyberpunk') || msg.includes('forest') || msg.includes('glass')) {
    let theme = 'dark';
    if (msg.includes('light')) theme = 'light';
    else if (msg.includes('cyberpunk') || msg.includes('neon')) theme = 'cyberpunk';
    else if (msg.includes('glass')) theme = 'glass';
    else if (msg.includes('forest')) theme = 'forest';
    else if (msg.includes('synthwave')) theme = 'synthwave';

    return {
      text: `🎨 **Theme Synchronized**: Visual preset updated to **${theme.toUpperCase()}**.`,
      action: () => store.setTheme(theme)
    };
  }

  // Pattern E: Navigation (e.g. "show transactions", "go to budgets", "open settings", "about")
  if (msg.includes('navigate') || msg.includes('show') || msg.includes('go to') || msg.includes('open')) {
    let page: any = null;
    if (msg.includes('transaction') || msg.includes('ledger')) page = 'transactions';
    else if (msg.includes('budget')) page = 'budgets';
    else if (msg.includes('setting')) page = 'settings';
    else if (msg.includes('about')) page = 'about';
    else if (msg.includes('dashboard') || msg.includes('home')) page = 'dashboard';

    if (page) {
      return {
        text: `📍 **Routing**: Navigating interface to **${page.toUpperCase()}**...`,
        action: () => store.onNavigate(page)
      };
    }
  }

  // Pattern F: Financial Summary & Net Worth Query
  if (msg.includes('balance') || msg.includes('net worth') || msg.includes('spending') || msg.includes('summary') || msg.includes('overview') || msg.includes('how much')) {
    return generateFinancialOverview(state, currency);
  }

  return null;
};

// Generate detailed financial overview text
const generateFinancialOverview = (
  state: { accounts: any[]; transactions: any[]; budgets: any[] },
  currency: string
): AIResult => {
  const totalBalance = state.accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const totalIncome = state.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalExpense = state.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Group expenses by category
  const categoryTotals: Record<string, number> = {};
  state.transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  return {
    text: `📊 **CoinBurst Financial Nexus Report**

• **Aggregate Net Worth**: **${formatAmount(totalBalance, currency)}** across ${state.accounts.length} active wallet nodes.
• **Total Inbound Capital**: **${formatAmount(totalIncome, currency)}**
• **Total Outbound Expenditure**: **${formatAmount(totalExpense, currency)}**
• **Primary Expense Category**: ${topCategory ? `**${topCategory[0]}** (${formatAmount(topCategory[1], currency)})` : 'None recorded yet'}
• **Active Category Sentinels**: ${state.budgets.length} spending caps configured.

💡 *Tip: Type instructions like "Add expense 500 Food", "Create account HDFC 5000", or "Set budget 3000 Groceries" to control your ledger via AI.*`
  };
};

const callOpenAICompatibleAI = async (
  apiKey: string,
  endpoint: string,
  modelName: string,
  systemInstruction: string,
  message: string
): Promise<AIResult | null> => {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: message }
        ],
        temperature: 0.2,
      })
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.warn(`[AI Engine] ${modelName} fetch failed (${res.status}): ${errBody}`);
      return null;
    }

    const data = await res.json();
    const replyText = data.choices?.[0]?.message?.content || '';
    if (replyText) {
      return { text: replyText };
    }
    return null;
  } catch (err) {
    console.warn(`[AI Engine] ${modelName} error:`, err);
    return null;
  }
};

const formatAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch (e) {
    return `${currency} ${amount}`;
  }
};
