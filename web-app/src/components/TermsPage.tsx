import React from 'react';
import { ShieldCheck, FileText, ArrowLeft, CheckCircle2, Globe } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#07050F] text-white font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Header Bar */}
      <header className="border-b border-white/10 bg-[#0B0C1A]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF007F] via-[#00FF88] to-[#00E5FF] p-[2px]">
              <div className="w-full h-full bg-[#0B0B0F] rounded-xl flex items-center justify-center">
                <span className="font-['Poppins'] font-black text-sm text-white">CB</span>
              </div>
            </div>
            <div>
              <h1 className="font-['Poppins'] font-black text-base tracking-wider">COINBURST</h1>
              <span className="font-['Manrope'] text-[9px] tracking-widest text-emerald-400 font-semibold uppercase block -mt-0.5">
                Legal & Security Protocol
              </span>
            </div>
          </div>

          <a
            href="/"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold flex items-center gap-2 border border-white/10 text-gray-300 hover:text-white transition-colors text-decoration-none"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Application
          </a>
        </div>
      </header>

      {/* Main Legal Content Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Document Title Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-900/20 via-[#0F0C20] to-emerald-900/20 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Documentation
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-['Poppins'] tracking-tight">
              Terms of Service & Privacy Policy
            </h2>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              This document governs your use of the CoinBurst Wealth Hub application, cloud data synchronization services, local notification engine, and Google Identity authentication integration.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-gray-400">
              <span>Effective Date: August 17, 2026</span>
              <span>•</span>
              <span>Version: 2.5.0</span>
              <span>•</span>
              <span className="text-emerald-400">Status: Verified Compliance</span>
            </div>
          </div>
        </div>

        {/* Section 1: Overview & Data Privacy */}
        <section className="space-y-4 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-['Poppins']">1. Privacy Policy & Financial Data Protection</h3>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            CoinBurst takes user data privacy with paramount seriousness. Your financial ledgers, account balances, monthly budgets, and custom expense tags are stored locally on your device and synchronized securely to private cloud databases managed via Google Firebase Realtime Database.
          </p>
          <ul className="space-y-2.5 text-xs text-gray-300 pt-2">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Zero Data Selling:</strong> We do not sell, rent, monetize, or trade your personal financial logs to third-party advertisers or data brokers.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>End-to-End Transport Security:</strong> All data transmitted between your device and cloud infrastructure is encrypted using TLS 1.3 encryption protocols.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>User Data Deletion:</strong> You retain full ownership of your data and may request total account erasure at any time in application settings.</span>
            </li>
          </ul>
        </section>

        {/* Section 2: Google Identity Authentication */}
        <section className="space-y-4 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-['Poppins']">2. Google Sign-In & Authentication</h3>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            When authenticating via Google Identity, CoinBurst uses standard OAuth 2.0 protocols to verify your identity.
          </p>
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs text-gray-300">
            <p className="font-semibold text-white">Information Requested from Google Account:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
              <li>Primary email address (for account identification and cloud data mapping)</li>
              <li>Display Name (for personalized app greeting and account nodes)</li>
              <li>Profile Picture URL (for user avatar display)</li>
            </ul>
            <p className="text-[11px] text-cyan-300 pt-1">
              ✓ We do NOT request access to your Google Drive, Gmail messages, contacts, or financial accounts.
            </p>
          </div>
        </section>

        {/* Section 3: Terms of Service */}
        <section className="space-y-4 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold font-['Poppins']">3. Terms of Service & Acceptable Use</h3>
          </div>
          <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
            <p>
              <strong>Account Responsibility:</strong> You are responsible for safeguarding your login credentials and maintaining the confidentiality of your device.
            </p>
            <p>
              <strong>Personal Financial Management:</strong> CoinBurst is designed as a personal wealth management tool. It provides automated financial insights, budget sentinels, and expense analytics. Calculations are generated based on user-entered logs.
            </p>
            <p>
              <strong>Local Push Notifications:</strong> By enabling notifications, you authorize CoinBurst to schedule local device alerts (e.g., Every 1 Hour interval check-ins, low money threshold warnings, and budget limit notifications). Notification sounds and intervals can be modified in settings.
            </p>
          </div>
        </section>

        {/* Section 4: Contact & Legal Verification Links */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h4 className="font-bold text-sm text-white">Google Verification & Compliance URLs</h4>
            <p className="text-xs text-gray-400 mt-0.5">Use these URLs for Google OAuth Consent Screen submission:</p>
            <div className="mt-2 space-y-1 font-mono text-xs">
              <p className="text-emerald-400 font-semibold">Terms of Service URL: <span className="text-white bg-black/40 px-2 py-0.5 rounded">/terms</span></p>
              <p className="text-cyan-400 font-semibold">Privacy Policy URL: <span className="text-white bg-black/40 px-2 py-0.5 rounded">/privacy</span></p>
            </div>
          </div>
          <a
            href="/"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07050F] font-black uppercase text-xs tracking-wider transition-colors cursor-pointer text-decoration-none whitespace-nowrap"
          >
            Accept & Continue
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6 text-center text-xs text-gray-500">
        <p>© 2026 CoinBurst Wealth Hub. All rights reserved.</p>
      </footer>
    </div>
  );
};
