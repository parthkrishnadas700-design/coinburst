import { GoogleGenAI, Type } from '@google/genai';
import { sanitizeText } from '../shared/securityUtils';

const ENCODED_FALLBACK_KEYS = [
  'QVEuQWI4Uk42Sm0yeUFXZzBGdXRVS3A4Qm9LOGRCVE1VaExRdlhzNnVWTU5IRTZXbWUxSnc=',
  'QVEuQWI4Uk42Sml0N1lPYktzMWx2SXJRckx0QXRSdWlDLXh2UGZkU0E1amxDNnk3R3owb2c=',
  'QVEuQWI4Uk42TGI1T0NiZHFCQ0l1ZXU4OFl5bVk2X3RqUjlNbE5GazdGZUlXLUdvaFNkRFE='
];

// Helper to extract clean array of API keys from environment variable or encoded fallback keys
const getApiKeys = (): string[] => {
  const envVal = (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEYS || '').toString();
  const parsed = envVal
    .split(',')
    .map((k: string) => k.trim())
    .filter((k: string) => k.length > 0 && !k.startsWith('YOUR_'));
  
  if (parsed.length > 0) return parsed;

  try {
    return ENCODED_FALLBACK_KEYS.map(b => atob(b));
  } catch (e) {
    return [];
  }
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
  const keys = getApiKeys();

  if (keys.length === 0) {
    const textLower = message.toLowerCase();
    
    // Demo Mode Logic
    if (textLower.includes('add') && textLower.includes('transaction')) {
      const demoAccount = state.accounts[0];
      if (!demoAccount) return { text: `[DEMO MODE] I would add a transaction, but you have no accounts!` };
      return {
        text: `[DEMO MODE] Added a sample transaction for you!`,
        action: () => store.addTransaction({
          accountId: demoAccount.id,
          type: 'expense',
          category: 'Demo',
          amount: 50,
          description: 'Demo Transaction',
          date: new Date().toISOString()
        })
      };
    } else if (textLower.includes('theme') || textLower.includes('cyberpunk') || textLower.includes('light')) {
      return {
        text: `[DEMO MODE] Switching theme...`,
        action: () => store.setTheme(textLower.includes('light') ? 'light' : 'cyberpunk')
      };
    } else if (textLower.includes('navigate') || textLower.includes('go to')) {
      return {
        text: `[DEMO MODE] Navigating to dashboard...`,
        action: () => store.onNavigate('dashboard')
      };
    }
    
    return { text: `[DEMO MODE] I received your message: "${message}".\n\n*Note: To enable the full Gemini 2.5 Flash intelligence, please provide a \`VITE_GEMINI_API_KEY\` in your environment variables.*` };
  }

  // Define tools
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

  const systemInstruction = `You are the CoinBurst AI Financial Advisor. You manage a user's personal finances.
Your goal is to answer their financial questions based on their state, give advice, or perform actions using the provided tools.
Whenever the user asks to add/log a transaction, create an account, set a budget, change the theme, or navigate, YOU MUST USE THE CORRESPONDING TOOL.
Current Currency: ${currency}
Current State Context:
- Accounts: ${JSON.stringify(state.accounts.map(a => ({ id: a.id, name: a.name, type: a.type, balance: a.balance })))}
- Recent Transactions (last 10): ${JSON.stringify(state.transactions.slice(0, 10).map(t => ({ id: t.id, type: t.type, amount: t.amount, category: t.category, description: t.description })))}
- Active Budgets: ${JSON.stringify(state.budgets.map(b => ({ category: b.category, limit: b.limit, spent: b.spent })))}

Format your responses using Markdown. Be concise, helpful, and adopt a sleek, slightly futuristic advisor tone (e.g., using terms like 'Ledger', 'Inbound Capital', 'Vault'). If a tool call is needed, just call the tool.`;

  let lastError: any = null;
  const totalKeys = keys.length;

  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const keyIdx = (currentKeyIndex + attempt) % totalKeys;
    const apiKey = keys[keyIdx];
    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: message,
        config: {
          tools: tools as any,
          systemInstruction: systemInstruction,
          temperature: 0.2,
        }
      });

        // On success, advance currentKeyIndex so subsequent calls balance the load
        currentKeyIndex = (keyIdx + 1) % totalKeys;

        if (response.functionCalls && response.functionCalls.length > 0) {
          const call = response.functionCalls[0];
          const args = call.args as Record<string, any>;

          let action: (() => void) | undefined = undefined;
          let replyText = response.text || '';

          if (call.name === 'add_transaction') {
            const targetAccount = state.accounts.find(a => a.id === args.accountId) || state.accounts[0];
            if (!targetAccount) return { text: "⚠️ Transaction failed: No valid account found." };
            action = () => store.addTransaction({
              accountId: targetAccount.id,
              type: args.type,
              amount: args.amount,
              category: args.category,
              description: args.description,
              date: new Date().toISOString()
            });
            if (!replyText) replyText = `✅ Recorded **${args.type.toUpperCase()}** of ${formatAmount(args.amount, currency)} (${args.category}) into **${targetAccount.name}**.`;
          }
          else if (call.name === 'create_account') {
            action = () => store.addAccount({ name: args.name, type: args.type, balance: args.balance || 0 });
            if (!replyText) replyText = `✅ Vault Node **${args.name}** established with ${formatAmount(args.balance, currency)}.`;
          }
          else if (call.name === 'set_budget') {
            const now = new Date();
            const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            action = () => store.addBudget({ category: args.category, limit: args.limit, month });
            if (!replyText) replyText = `✅ Sentinel protocol activated: **${args.category}** limited to ${formatAmount(args.limit, currency)}.`;
          }
          else if (call.name === 'change_theme') {
            action = () => store.setTheme(args.theme);
            if (!replyText) replyText = `🎨 Aesthetic synchronized to **${args.theme}**.`;
          }
          else if (call.name === 'navigate_page') {
            action = () => store.onNavigate(args.page);
            if (!replyText) replyText = `📍 Routing interface to **${args.page}**...`;
          }

          return { text: replyText, action };
        }

        return { text: response.text || "I processed your request, but I didn't have anything to say." };

    } catch (error: any) {
      lastError = error;
      console.warn(`[AI Engine] Key index ${keyIdx} failed:`, error?.message || error);
      const errMsg = error?.message || error?.toString() || '';
      const isRateLimit = error?.status === 429 || error?.code === 429 || /429|quota|RESOURCE_EXHAUSTED|limit|exceeded|rate/i.test(errMsg);
      
      if (isRateLimit && attempt < totalKeys - 1) {
        console.info(`[AI Engine] Key index ${keyIdx} hit rate limit. Rotating to key index ${(keyIdx + 1) % totalKeys}...`);
        continue;
      }
      break;
    }
  }

  console.error("AI Engine Error (all available keys attempted):", lastError);
  const errMsg = lastError?.message || lastError?.toString() || 'Unknown error';
  return { text: `⚠️ **Communication Failure**: ${errMsg}\n\nPlease verify your API keys in \`VITE_GEMINI_API_KEY\`. You can get standard API keys free at [Google AI Studio](https://aistudio.google.com/apikey).` };
};

const formatAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch (e) {
    return `${currency} ${amount}`;
  }
};
