import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BarChart3, ArrowUpRight, PiggyBank, Flame, Users, Bot, Settings, Info, Plus, Camera, Palette, Download, X, Command } from 'lucide-react';
import { useFinanceStore } from '../shared/useFinanceStore';
import { useScrollLock } from '../shared/useScrollLock';
import { triggerHapticNotification, showNativeToast } from '../shared/nativeBridge';

interface CommandPaletteItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Themes';
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

export const CommandPaletteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenAddTransaction?: () => void;
  onOpenScanner?: () => void;
}> = ({ isOpen, onClose, onOpenAddTransaction, onOpenScanner }) => {
  useScrollLock(isOpen);

  const navigate = useNavigate();
  const setTheme = useFinanceStore(state => state.setTheme);
  const exportData = useFinanceStore(state => state.exportData);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items: CommandPaletteItem[] = [
    // Navigation
    { id: 'nav-home', title: 'Dashboard (Financial Nexus)', category: 'Navigation', icon: BarChart3, shortcut: '⌘1', action: () => { navigate('/home'); onClose(); } },
    { id: 'nav-tx', title: 'Transaction Ledger & Entry', category: 'Navigation', icon: ArrowUpRight, shortcut: '⌘2', action: () => { navigate('/transactions'); onClose(); } },
    { id: 'nav-budgets', title: 'Smart Limit Enforcers & Budgets', category: 'Navigation', icon: PiggyBank, shortcut: '⌘3', action: () => { navigate('/budgets'); onClose(); } },
    { id: 'nav-burn', title: 'AI Burn-Rate & Runway Predictor', category: 'Navigation', icon: Flame, shortcut: '⌘4', action: () => { navigate('/burn-rate'); onClose(); } },
    { id: 'nav-split', title: 'Group Bill Splitter & Shared Ledger', category: 'Navigation', icon: Users, shortcut: '⌘5', action: () => { navigate('/split-bills'); onClose(); } },
    { id: 'nav-ai', title: 'AI Portfolio Advisor Chatbot', category: 'Navigation', icon: Bot, shortcut: '⌘6', action: () => { navigate('/ai'); onClose(); } },
    { id: 'nav-settings', title: 'User Settings & Custom Themes', category: 'Navigation', icon: Settings, shortcut: '⌘7', action: () => { navigate('/settings'); onClose(); } },
    { id: 'nav-about', title: 'About CoinBurst Nexus', category: 'Navigation', icon: Info, action: () => { navigate('/about'); onClose(); } },

    // Quick Actions
    { id: 'act-add', title: 'Record New Transaction (Income / Expense)', category: 'Actions', icon: Plus, shortcut: 'N', action: () => { onClose(); onOpenAddTransaction?.(); } },
    { id: 'act-ocr', title: 'Scan Receipt with Tesseract AI OCR', category: 'Actions', icon: Camera, shortcut: 'S', action: () => { onClose(); onOpenScanner?.(); } },
    { id: 'act-export', title: 'Export Financial Backup (JSON)', category: 'Actions', icon: Download, action: () => { exportData?.(); onClose(); showNativeToast('Exporting data...'); } },

    // Themes
    { id: 'theme-cyber', title: 'Switch Theme to Cyberpunk Glow', category: 'Themes', icon: Palette, action: () => { setTheme('cyberpunk'); onClose(); showNativeToast('Theme set to Cyberpunk'); } },
    { id: 'theme-dark', title: 'Switch Theme to Obsidian Dark', category: 'Themes', icon: Palette, action: () => { setTheme('dark'); onClose(); showNativeToast('Theme set to Dark'); } },
    { id: 'theme-glass', title: 'Switch Theme to Glassmorphism', category: 'Themes', icon: Palette, action: () => { setTheme('glass'); onClose(); showNativeToast('Theme set to Glass'); } },
    { id: 'theme-synthwave', title: 'Switch Theme to Synthwave Neon', category: 'Themes', icon: Palette, action: () => { setTheme('synthwave'); onClose(); showNativeToast('Theme set to Synthwave'); } },
    { id: 'theme-forest', title: 'Switch Theme to Emerald Forest', category: 'Themes', icon: Palette, action: () => { setTheme('forest'); onClose(); showNativeToast('Theme set to Forest'); } },
  ];

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        triggerHapticNotification('success');
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-start justify-center pt-16 sm:pt-24 p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-xl rounded-3xl bg-[#0F0F17] border border-cyan-500/40 shadow-2xl overflow-hidden modal-scroll-lock"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-800 bg-white/5">
              <Search className="w-5 h-5 text-cyan-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or jump to feature... (e.g. 'burn', 'split', 'budget')"
                className="w-full bg-transparent text-white placeholder-gray-500 font-bold text-sm focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filtered Item List */}
            <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1 modal-scroll-lock">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-gray-500 font-medium text-xs">
                  No matching navigation command found for "{query}"
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => { triggerHapticNotification('success'); item.action(); }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-white shadow-lg' 
                          : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500 text-white' : 'bg-white/10 text-cyan-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs">{item.title}</h4>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{item.category}</span>
                        </div>
                      </div>

                      {item.shortcut && (
                        <span className="px-2 py-0.5 rounded bg-white/10 text-gray-400 font-mono text-[10px] font-bold">
                          {item.shortcut}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-800/60 bg-black/40 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Command className="w-3 h-3 text-cyan-400" /> Multi-Navigational Command Palette
              </span>
              <span>Use ↑ ↓ to navigate, ↵ to select</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
