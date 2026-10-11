import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ShieldCheck, X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[85vh] bg-[#0F0C20] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white font-sans"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-wide font-['Poppins']">Terms & Conditions and Privacy Policy</h3>
                <p className="text-xs text-gray-400">CoinBurst Wealth Hub — Legal & Security Protocol</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-300 leading-relaxed custom-scrollbar">
            {/* Security Summary Banner */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-300 text-xs">Data Privacy & Security Guarantee</h4>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">
                  Your financial records are strictly confidential. CoinBurst encrypts user data, syncs securely via Firebase Realtime Database, and never sells or transfers your financial information.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span className="text-emerald-400 font-mono">01.</span> Acceptance of Terms
              </h4>
              <p>
                By creating an account, authenticating via Google Identity, or accessing the CoinBurst application, you agree to comply with and be bound by these Terms of Service and Privacy Policy. If you do not agree to these terms, you may not use the application.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span className="text-cyan-400 font-mono">02.</span> User Account & Google Identity Authentication
              </h4>
              <p>
                CoinBurst provides seamless authentication via Google OAuth 2.0 and Email/Password credentials. When signing in with Google, we receive only basic profile information (such as your display name, email address, and profile photo) to establish your account vault node.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span className="text-pink-400 font-mono">03.</span> Financial Data Storage & Synchronization
              </h4>
              <p>
                Your financial ledgers (transactions, account balances, monthly budgets, and custom categories) are stored locally in your device state and synced to cloud servers via Firebase. You retain complete ownership of all logged data.
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span className="text-amber-400 font-mono">04.</span> Local Notifications & Sound Effects
              </h4>
              <p>
                CoinBurst schedules local push notifications on your device for low money threshold warnings, recurring check-in reminders, and budget alerts. You can customize notification frequencies (e.g. Every 1 Hour) or disable notifications at any time in User Settings.
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span className="text-purple-400 font-mono">05.</span> AI Financial Advisor Engine
              </h4>
              <p>
                The integrated AI assistant processes queries using encrypted provider channels to assist with transaction logging, budget creation, and insights. Queries do not store personally identifiable financial data externally.
              </p>
            </div>

            {/* Section 6 */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span className="text-emerald-400 font-mono">06.</span> Account Deletion & Data Rights
              </h4>
              <p>
                You have the right to purge your stored transactions, reset account balances, or delete your account at any time directly through the application settings.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-[10px] text-gray-400 font-mono">Last Updated: August 2026 — Version 2.5</span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07050F] font-black uppercase text-xs tracking-wider transition-colors cursor-pointer"
            >
              I Understand & Agree
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
