import React, { useState, useEffect, useRef } from 'react';
import { useFinanceStore, formatCurrency, SUPPORTED_CURRENCIES } from '../shared/useFinanceStore';
import type { ThemeType, Transaction } from '../shared/useFinanceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { 
  Plus, Trash2, ArrowUpRight, ArrowDownRight, Search, ChevronDown, 
  TrendingUp, PiggyBank, Bot, Download, Sparkles, Pencil,
  Upload, Database, RefreshCw, Bell, Clock, ShieldCheck, Camera
} from 'lucide-react';
import { generateAIResponse } from '../utils/aiCommandEngine';
import { AboutWeb } from './AboutWeb';
import { CalendarChartColumn } from './CalendarChartColumn';
import { WalletSlidebar } from './WalletSlidebar';
import { TermsModal } from './TermsModal';
import { ProfitLossWidget } from './ProfitLossWidget';
import { UserTelemetryPanel } from './UserTelemetryPanel';
import { ReceiptScannerModal } from './ReceiptScannerModal';
import { BurnRatePredictor } from './BurnRatePredictor';
import { GroupBillSplitter } from './GroupBillSplitter';
import { 
  requestNotificationPermissions, 
  scheduleDailyFinanceReminder, 
  scheduleIntervalFinanceReminder,
  checkNotificationPermissions
} from '../shared/nativeNotifications';

// --- Theme Helper Hooks ---
export const useThemeStyles = () => {
  const theme = useFinanceStore((state) => state.theme);
  
  const styles = {
    dark: {
      bg: 'bg-[#000000] text-[#FFFFFF]',
      cardBg: 'bg-[#0B0B0F] border border-[#1E1E26]',
      textMuted: 'text-[#9CA3AF]',
      textNormal: 'text-[#FFFFFF]',
      accent: 'text-[#00FF88]',
      accentBg: 'bg-[#00FF88]/10',
      accentPink: 'text-[#FF007F]',
      primaryBtn: 'bg-[#00FF88] text-[#000000] hover:shadow-[0_0_20px_rgba(0,255,136,0.5)] font-bold transition-all duration-300 cursor-pointer',
      primaryBtnOutline: 'border border-[#00FF88] text-[#00FF88] hover:bg-[#00FF88]/10 font-bold transition-all duration-300 cursor-pointer',
      input: 'bg-[#111118] border border-[#3A3A4A] focus:border-[#00FF88] text-white',
      shadow: 'shadow-[0_4px_20px_rgba(0,0,0,0.8)]',
      gradientBorder: 'hover:border-[#00FF88]/50 transition-all duration-300',
      navActive: 'bg-[#00FF88]/10 text-[#00FF88] border-r-4 border-[#00FF88]',
      navInactive: 'text-[#9CA3AF] hover:text-white hover:bg-white/5',
      chartColors: ['#00FF88', '#00E5FF', '#FF007F', '#A855F7'],
      gridColor: '#1E1E26',
      walletBtnUnselected: 'bg-black/40 text-gray-400 border-gray-800 hover:border-gray-600',
      walletBtnAllSelected: 'bg-white text-black border-white',
      headerAccent: 'bg-black/20 border-gray-800/40',
      ledgerFeedBg: 'bg-black/20 hover:bg-black/40 border border-gray-800/40',
      dialogHeaderBg: 'bg-black/40 border border-gray-800/40',
      tabInactive: 'text-gray-400 hover:text-white',
      closeBtn: 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10',
      selectOptionBg: 'bg-[#0B0B0F] text-white',
      badgeBg: 'bg-gray-800 text-gray-300',
      cardAccentBg: 'bg-black/10 border border-gray-800/40',
      settingsBtnSelected: 'border-[#00FF88] bg-[#00FF88]/5 shadow-lg shadow-[#00FF88]/10',
      settingsBtnUnselected: 'border-gray-800 hover:border-gray-700 bg-black/20',
    },
    light: {
      bg: 'bg-[#F3F4F6] text-[#1F2937]',
      cardBg: 'bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm',
      textMuted: 'text-[#6B7280]',
      textNormal: 'text-[#1F2937]',
      accent: 'text-[#10B981]',
      accentBg: 'bg-[#10B981]/10',
      accentPink: 'text-[#F43F5E]',
      primaryBtn: 'bg-[#10B981] text-white hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)] font-bold transition-all duration-300 cursor-pointer',
      primaryBtnOutline: 'border border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10 font-bold transition-all duration-300 cursor-pointer',
      input: 'bg-white border border-[#D1D5DB] focus:border-[#10B981] text-gray-900',
      shadow: 'shadow-[0_4px_12px_rgba(0,0,0,0.05)]',
      gradientBorder: 'hover:border-[#10B981]/50 transition-all duration-300',
      navActive: 'bg-[#10B981]/10 text-[#10B981] border-r-4 border-[#10B981]',
      navInactive: 'text-[#6B7280] hover:text-gray-900 hover:bg-gray-100',
      chartColors: ['#10B981', '#3B82F6', '#F43F5E', '#8B5CF6'],
      gridColor: '#E5E7EB',
      walletBtnUnselected: 'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
      walletBtnAllSelected: 'bg-gray-900 text-white border-gray-900',
      headerAccent: 'bg-white border border-gray-200',
      ledgerFeedBg: 'bg-white hover:bg-gray-50 border border-gray-200',
      dialogHeaderBg: 'bg-gray-100 border border-gray-200',
      tabInactive: 'text-gray-500 hover:text-gray-900',
      closeBtn: 'text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200',
      selectOptionBg: 'bg-white text-gray-900',
      badgeBg: 'bg-gray-100 text-gray-600',
      cardAccentBg: 'bg-gray-50 border border-gray-200',
      settingsBtnSelected: 'border-[#10B981] bg-[#10B981]/5 shadow-md shadow-[#10B981]/10',
      settingsBtnUnselected: 'border-gray-200 hover:border-gray-300 bg-white',
    },
    cyberpunk: {
      bg: 'bg-[#12042C] text-[#FFE600]',
      cardBg: 'bg-[#1F0E3D] border-2 border-[#FF007F] shadow-[0_0_15px_rgba(255,0,127,0.2)]',
      textMuted: 'text-[#A8A29E] text-opacity-90',
      textNormal: 'text-[#FFE600]',
      accent: 'text-[#FFE600]',
      accentBg: 'bg-[#FFE600]/10',
      accentPink: 'text-[#FF007F]',
      primaryBtn: 'bg-[#FFE600] text-[#12042C] font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(255,230,0,0.6)] border-2 border-[#FFE600] transition-all duration-300 cursor-pointer',
      primaryBtnOutline: 'border-2 border-[#FF007F] text-[#FF007F] hover:bg-[#FF007F]/15 font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer',
      input: 'bg-[#12042C] border-2 border-[#FF007F] focus:border-[#FFE600] text-[#FFE600] font-mono',
      shadow: 'shadow-[0_0_25px_rgba(255,0,127,0.35)]',
      gradientBorder: 'hover:border-[#FFE600] hover:shadow-[0_0_20px_rgba(255,0,127,0.5)] transition-all duration-300',
      navActive: 'bg-[#FF007F]/20 text-[#FFE600] border-r-4 border-[#FFE600] shadow-[inset_0_0_10px_rgba(255,0,127,0.3)]',
      navInactive: 'text-[#FF007F] hover:text-[#FFE600] hover:bg-[#FF007F]/10',
      chartColors: ['#FFE600', '#FF007F', '#39FF14', '#00E5FF'],
      gridColor: 'rgba(255, 0, 127, 0.2)',
      walletBtnUnselected: 'bg-[#1F0E3D] text-[#FF007F] border-[#FF007F]/40 hover:border-[#FF007F]',
      walletBtnAllSelected: 'bg-[#FFE600] text-[#12042C] border-[#FFE600]',
      headerAccent: 'bg-[#1F0E3D] border border-[#FF007F]/40',
      ledgerFeedBg: 'bg-[#1F0E3D]/50 hover:bg-[#1F0E3D] border border-[#FF007F]/30',
      dialogHeaderBg: 'bg-[#12042C] border border-[#FF007F]/40',
      tabInactive: 'text-[#FF007F] hover:text-[#FFE600]',
      closeBtn: 'text-[#FF007F] hover:text-[#FFE600] bg-[#FF007F]/10 hover:bg-[#FF007F]/20',
      selectOptionBg: 'bg-[#1F0E3D] text-[#FFE600]',
      badgeBg: 'bg-[#FF007F]/20 text-[#FF007F]',
      cardAccentBg: 'bg-[#1F0E3D] border border-[#FF007F]/30',
      settingsBtnSelected: 'border-[#FFE600] bg-[#FFE600]/5 shadow-lg shadow-[#FFE600]/10',
      settingsBtnUnselected: 'border-[#FF007F]/50 hover:border-[#FF007F] bg-[#1F0E3D]',
    },
    glass: {
      bg: 'bg-gradient-to-br from-[#0F0C20] via-[#151030] to-[#25103F] text-white',
      cardBg: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]',
      textMuted: 'text-[#D1D5DB]/70',
      textNormal: 'text-white',
      accent: 'text-[#00F0FF]',
      accentBg: 'bg-[#00F0FF]/10',
      accentPink: 'text-[#FF007F]',
      primaryBtn: 'bg-gradient-to-r from-[#FF007F] to-[#7B2CBF] text-white font-bold hover:shadow-[0_0_15px_rgba(255,0,127,0.5)] transition-all duration-300 border border-white/10 cursor-pointer',
      primaryBtnOutline: 'border border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF]/10 font-bold transition-all duration-300 cursor-pointer',
      input: 'bg-white/5 backdrop-blur-md border border-white/10 focus:border-[#00F0FF] text-white',
      shadow: 'shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]',
      gradientBorder: 'hover:border-[#00F0FF]/40 transition-all duration-300',
      navActive: 'bg-white/10 text-[#00F0FF] border-r-4 border-[#00F0FF]',
      navInactive: 'text-[#D1D5DB]/80 hover:text-white hover:bg-white/5',
      chartColors: ['#FF007F', '#00F0FF', '#7B2CBF', '#A855F7'],
      gridColor: 'rgba(255, 255, 255, 0.08)',
      walletBtnUnselected: 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20',
      walletBtnAllSelected: 'bg-[#FF007F] text-white border-[#FF007F]',
      headerAccent: 'bg-white/5 border border-white/10',
      ledgerFeedBg: 'bg-white/5 hover:bg-white/10 border border-white/10',
      dialogHeaderBg: 'bg-white/5 border border-white/10',
      tabInactive: 'text-gray-400 hover:text-white',
      closeBtn: 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10',
      selectOptionBg: 'bg-[#151030] text-white',
      badgeBg: 'bg-white/10 text-gray-300',
      cardAccentBg: 'bg-white/5 border border-white/10',
      settingsBtnSelected: 'border-[#00F0FF] bg-[#00F0FF]/5 shadow-lg shadow-[#00F0FF]/10',
      settingsBtnUnselected: 'border-white/10 hover:border-white/20 bg-white/5',
    },
    forest: {
      bg: 'bg-[#0E2015] text-[#F3F4F6]',
      cardBg: 'bg-[#142C1E] border border-[#234F35] shadow-sm',
      textMuted: 'text-[#85A995]',
      textNormal: 'text-[#F3F4F6]',
      accent: 'text-[#E5B842]',
      accentBg: 'bg-[#E5B842]/10',
      accentPink: 'text-[#E07A5F]',
      primaryBtn: 'bg-[#E5B842] text-[#0E2015] font-bold hover:shadow-[0_4px_12px_rgba(229,184,66,0.3)] transition-all duration-300 cursor-pointer',
      primaryBtnOutline: 'border border-[#E5B842] text-[#E5B842] hover:bg-[#E5B842]/10 font-bold transition-all duration-300 cursor-pointer',
      input: 'bg-[#0E2015] border border-[#234F35] focus:border-[#E5B842] text-[#F3F4F6]',
      shadow: 'shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
      gradientBorder: 'hover:border-[#E5B842]/50 transition-all duration-300',
      navActive: 'bg-[#E5B842]/10 text-[#E5B842] border-r-4 border-[#E5B842]',
      navInactive: 'text-[#85A995] hover:text-[#F3F4F6] hover:bg-white/5',
      chartColors: ['#E5B842', '#3D5A80', '#E07A5F', '#81B29A'],
      gridColor: '#234F35',
      walletBtnUnselected: 'bg-[#142C1E] text-[#85A995] border-[#234F35] hover:border-[#E5B842]/40',
      walletBtnAllSelected: 'bg-[#E5B842] text-[#0E2015] border-[#E5B842]',
      headerAccent: 'bg-[#142C1E] border border-[#234F35]',
      ledgerFeedBg: 'bg-[#142C1E] hover:bg-[#1C3D2B] border border-[#234F35]',
      dialogHeaderBg: 'bg-[#0E2015] border border-[#234F35]',
      tabInactive: 'text-[#85A995] hover:text-[#F3F4F6]',
      closeBtn: 'text-[#85A995] hover:text-[#F3F4F6] bg-white/5 hover:bg-white/10',
      selectOptionBg: 'bg-[#142C1E] text-[#F3F4F6]',
      badgeBg: 'bg-[#0E2015] text-[#85A995]',
      cardAccentBg: 'bg-[#142C1E] border border-[#234F35]',
      settingsBtnSelected: 'border-[#E5B842] bg-[#E5B842]/5 shadow-md shadow-[#E5B842]/10',
      settingsBtnUnselected: 'border-[#234F35] hover:border-gray-600 bg-[#142C1E]',
    },
    synthwave: {
      bg: 'bg-[#0A0516] text-[#00E5FF] selection:bg-[#FF007F] selection:text-white',
      cardBg: 'bg-[#120B24] border border-[#FF007F]/60 shadow-[0_0_15px_rgba(255,0,127,0.15)]',
      textMuted: 'text-[#9A8EA9]',
      textNormal: 'text-[#00E5FF]',
      accent: 'text-[#00E5FF]',
      accentBg: 'bg-[#00E5FF]/10',
      accentPink: 'text-[#FF007F]',
      primaryBtn: 'bg-gradient-to-r from-[#FF007F] via-[#B200FF] to-[#00E5FF] text-white font-extrabold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] border border-white/10 transition-all duration-300 cursor-pointer',
      primaryBtnOutline: 'border-2 border-[#FF007F] text-[#FF007F] hover:bg-[#FF007F]/15 font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer',
      input: 'bg-[#0A0516] border border-[#FF007F]/70 focus:border-[#00E5FF] text-[#00E5FF] font-mono',
      shadow: 'shadow-[0_0_25px_rgba(178,0,255,0.25)]',
      gradientBorder: 'hover:border-[#00E5FF] hover:shadow-[0_0_20px_rgba(255,0,127,0.4)] transition-all duration-300',
      navActive: 'bg-[#FF007F]/15 text-[#00E5FF] border-r-4 border-[#FF007F] shadow-[inset_0_0_10px_rgba(255,0,127,0.3)]',
      navInactive: 'text-[#FF007F] hover:text-[#00E5FF] hover:bg-[#FF007F]/10',
      chartColors: ['#FF007F', '#00E5FF', '#B200FF', '#FFE600'],
      gridColor: 'rgba(255, 0, 127, 0.2)',
      walletBtnUnselected: 'bg-[#120B24] text-[#FF007F] border-[#FF007F]/40 hover:border-[#FF007F]',
      walletBtnAllSelected: 'bg-gradient-to-r from-[#FF007F] to-[#00E5FF] text-white border-none',
      headerAccent: 'bg-[#120B24] border border-[#FF007F]/40',
      ledgerFeedBg: 'bg-[#120B24]/60 hover:bg-[#120B24] border border-[#FF007F]/30',
      dialogHeaderBg: 'bg-[#0A0516] border border-[#FF007F]/40',
      tabInactive: 'text-[#FF007F] hover:text-[#00E5FF]',
      closeBtn: 'text-[#FF007F] hover:text-[#00E5FF] bg-[#FF007F]/10 hover:bg-[#FF007F]/20',
      selectOptionBg: 'bg-[#120B24] text-[#00E5FF]',
      badgeBg: 'bg-[#0A0516] text-[#9A8EA9]',
      cardAccentBg: 'bg-[#120B24] border border-[#FF007F]/30',
      settingsBtnSelected: 'border-[#00E5FF] bg-[#00E5FF]/5 shadow-lg shadow-[#00E5FF]/10',
      settingsBtnUnselected: 'border-[#FF007F]/50 hover:border-[#FF007F] bg-[#120B24]',
    }
  };
  
  return styles[theme] || styles.dark;
};

// --- Liquid SVG Progress Bar Component ---
export const LiquidProgressBar: React.FC<{ spent: number; limit: number }> = ({ spent, limit }) => {
  const percentage = Math.min(100, Math.max(0, (spent / limit) * 100));
  const currency = useFinanceStore((state) => state.currency);
  const def = SUPPORTED_CURRENCIES.find(c => c.code === currency) ?? SUPPORTED_CURRENCIES[0];
  
  let fillColor = '#10B981';
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  if (percentage >= 100) {
    fillColor = '#EF4444';
    glowColor = 'rgba(239, 68, 68, 0.6)';
  } else if (percentage >= 80) {
    fillColor = '#F59E0B';
    glowColor = 'rgba(245, 158, 11, 0.5)';
  }

  // Wave height offset (from 100=empty to 10=full)
  const waveY = 100 - (percentage * 0.9);

  return (
    <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-gray-700/50 flex items-center justify-center bg-gray-900/40 shadow-inner">
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full"
        style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
      >
        {/* Back Wave (slower, offset phase, lower opacity) */}
        <motion.path
          d={`M 0,${waveY} Q 25,${waveY - 4} 50,${waveY} T 100,${waveY} Q 125,${waveY - 4} 150,${waveY} T 200,${waveY} L 200,100 L 0,100 Z`}
          fill={fillColor}
          opacity={0.35}
          animate={{ x: [-100, 0] }}
          transition={{
            repeat: Infinity,
            duration: 4.5,
            ease: "linear"
          }}
        />
        {/* Front Wave (faster, full opacity, opposite direction) */}
        <motion.path
          d={`M 0,${waveY} Q 25,${waveY - 6} 50,${waveY} T 100,${waveY} Q 125,${waveY - 6} 150,${waveY} T 200,${waveY} L 200,100 L 0,100 Z`}
          fill={fillColor}
          opacity={0.75}
          animate={{ x: [0, -100] }}
          transition={{
            repeat: Infinity,
            duration: 2.8,
            ease: "linear"
          }}
        />
      </svg>
      
      <div className="relative z-10 text-center select-none">
        <span className="text-3xl font-black text-white font-mono">
          {percentage.toFixed(0)}%
        </span>
        <div className="text-[10px] text-gray-200 uppercase tracking-widest font-bold drop-shadow-md">
          Spent
        </div>
        <div className="text-[11px] text-white/80 font-mono mt-1">
          {def.symbol}{spent.toFixed(0)} / {def.symbol}{limit.toFixed(0)}
        </div>
      </div>
    </div>
  );
};

// Sound effect player for theme changes
const playThemeSound = (themeId: string) => {
  try {
    const audioUrls = {
      dark: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav', // Cyber click
      light: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav', // Soft pop
      cyberpunk: 'https://assets.mixkit.co/active_storage/sfx/1072/1072-84.wav', // Retro laser
      glass: 'https://assets.mixkit.co/active_storage/sfx/911/911-84.wav', // Synth chime
      forest: 'https://assets.mixkit.co/active_storage/sfx/2566/2566-84.wav', // Wood block nature chime
      synthwave: 'https://assets.mixkit.co/active_storage/sfx/1072/1072-84.wav' // Retro laser
    };
    const url = audioUrls[themeId as keyof typeof audioUrls];
    if (url) {
      const audio = new Audio(url);
      audio.volume = 0.4;
      audio.play().catch(e => console.log('Audio playback blocked or failed:', e));
    }
  } catch (err) {
    console.warn('Audio playback failed:', err);
  }
};

// Multi-format Statement Exporter
const downloadStatement = (transactions: any[], accounts: any[], format: string = 'csv') => {
  try {
    const dateStr = new Date().toISOString().substring(0, 10);
    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Account'];
    const rows = transactions.map(t => {
      const acc = accounts.find((a: any) => a.id === t.accountId);
      return [
        new Date(t.date).toLocaleString(),
        t.description,
        t.type,
        t.category,
        t.amount,
        acc ? acc.name : 'Unknown'
      ];
    });

    if (format === 'csv') {
      const csvContent = [headers.join(','), ...rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(','))].join('\n');
      downloadBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), 'CoinBurst_Statement_' + dateStr + '.csv');
    } else if (format === 'json') {
      const jsonData = transactions.map(t => { const acc = accounts.find((a: any) => a.id === t.accountId); return { date: t.date, description: t.description, type: t.type, category: t.category, amount: t.amount, account: acc?.name || 'Unknown' }; });
      downloadBlob(new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' }), 'CoinBurst_Statement_' + dateStr + '.json');
    } else if (format === 'txt') {
      let txt = 'COINBURST FINANCIAL STATEMENT\n' + '='.repeat(60) + '\nGenerated: ' + new Date().toLocaleString() + '\n' + '='.repeat(60) + '\n\n';
      rows.forEach(r => { txt += r[0] + ' | ' + r[2].toUpperCase() + ' | ' + r[3] + ' | ' + r[1] + ' | ' + r[4] + ' | ' + r[5] + '\n'; });
      const totalInc = transactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);
      const totalExp = transactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);
      txt += '\n' + '='.repeat(60) + '\nTotal Income: ' + totalInc + '\nTotal Expense: ' + totalExp + '\nNet: ' + (totalInc - totalExp) + '\n';
      downloadBlob(new Blob([txt], { type: 'text/plain' }), 'CoinBurst_Statement_' + dateStr + '.txt');
    } else if (format === 'html') {
      let html = '<!DOCTYPE html><html><head><title>CoinBurst Statement</title><style>body{font-family:sans-serif;padding:40px;background:#0B0B0F;color:#fff}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:10px;text-align:left;border-bottom:1px solid #1E1E26}th{background:#1E1E26;color:#00FF88;text-transform:uppercase;font-size:12px;letter-spacing:2px}.income{color:#10B981}.expense{color:#EF4444}h1{background:linear-gradient(90deg,#FF007F,#00FF88,#00E5FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px}</style></head><body><h1>CoinBurst Statement</h1><p style="color:#9CA3AF">Generated: ' + new Date().toLocaleString() + '</p><table><tr>';
      headers.forEach(h => { html += '<th>' + h + '</th>'; });
      html += '</tr>';
      rows.forEach(r => { html += '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td class="' + r[2] + '">' + r[2] + '</td><td>' + r[3] + '</td><td class="' + r[2] + '">' + (r[2] === 'income' ? '+' : '-') + r[4] + '</td><td>' + r[5] + '</td></tr>'; });
      html += '</table></body></html>';
      downloadBlob(new Blob([html], { type: 'text/html' }), 'CoinBurst_Statement_' + dateStr + '.html');
    }
  } catch (err) {
    console.error("Statement download failed:", err);
  }
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ── Markdown-to-JSX Custom Renderer ──────────────────────────────────────────
const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 font-sans">
      {lines.map((line, lineIdx) => {
        let currentLine = line;
        
        // Check if header
        if (currentLine.startsWith('### ')) {
          return (
            <h4 key={lineIdx} className="text-sm font-black tracking-wide text-white mt-3 mb-1 uppercase text-opacity-90">
              {currentLine.substring(4)}
            </h4>
          );
        }
        
        // Check if list item
        let isListItem = false;
        if (currentLine.startsWith('- ')) {
          isListItem = true;
          currentLine = currentLine.substring(2);
        }
        
        // Simple markdown parsing for bold (**) and italic (*)
        const parts: React.ReactNode[] = [];
        let remaining = currentLine;
        let key = 0;
        
        while (remaining.length > 0) {
          const boldIdx = remaining.indexOf('**');
          const italicIdx = remaining.indexOf('*');
          
          if (boldIdx === -1 && italicIdx === -1) {
            parts.push(<span key={key++}>{remaining}</span>);
            break;
          }
          
          if (boldIdx !== -1 && (italicIdx === -1 || boldIdx <= italicIdx)) {
            if (boldIdx > 0) {
              parts.push(<span key={key++}>{remaining.substring(0, boldIdx)}</span>);
            }
            const nextBoldIdx = remaining.indexOf('**', boldIdx + 2);
            if (nextBoldIdx !== -1) {
              parts.push(
                <strong key={key++} className="font-extrabold text-emerald-400">
                  {remaining.substring(boldIdx + 2, nextBoldIdx)}
                </strong>
              );
              remaining = remaining.substring(nextBoldIdx + 2);
            } else {
              parts.push(<span key={key++}>{remaining.substring(boldIdx)}</span>);
              break;
            }
          } else {
            if (italicIdx > 0) {
              parts.push(<span key={key++}>{remaining.substring(0, italicIdx)}</span>);
            }
            const nextItalicIdx = remaining.indexOf('*', italicIdx + 1);
            if (nextItalicIdx !== -1) {
              parts.push(
                <em key={key++} className="italic text-gray-300">
                  {remaining.substring(italicIdx + 1, nextItalicIdx)}
                </em>
              );
              remaining = remaining.substring(nextItalicIdx + 1);
            } else {
              parts.push(<span key={key++}>{remaining.substring(italicIdx)}</span>);
              break;
            }
          }
        }
        
        if (isListItem) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-2">
              <span className="text-emerald-400 select-none">•</span>
              <span className="flex-1">{parts}</span>
            </div>
          );
        }
        
        return <p key={lineIdx} className="leading-relaxed">{parts}</p>;
      })}
    </div>
  );
};

// --- Main Multipage Dashboard Web Component ---
export const DashboardWeb: React.FC<{ 
  onNavigate: (page: 'dashboard' | 'transactions' | 'budgets' | 'settings' | 'ai' | 'about' | 'burn-rate' | 'split-bills') => void;
  activePage: 'dashboard' | 'transactions' | 'budgets' | 'settings' | 'ai' | 'about' | 'burn-rate' | 'split-bills';
  onOpenForm?: () => void;
  onEditTransaction?: (tx: Transaction) => void;
}> = ({ onNavigate, activePage, onOpenForm, onEditTransaction }) => {
  const cStyles = useThemeStyles();
  const theme = useFinanceStore((state) => state.theme);
  const setTheme = useFinanceStore((state) => state.setTheme);
  const currency = useFinanceStore((state) => state.currency);
  const setCurrency = useFinanceStore((state) => state.setCurrency);

  // Convenience formatter for the active currency
  const fmt = (amount: number) => formatCurrency(amount, currency);

  const accounts = useFinanceStore((state) => state.accounts);
  const transactions = useFinanceStore((state) => state.transactions);
  const budgets = useFinanceStore((state) => state.budgets);
  const selectedAccountId = useFinanceStore((state) => state.selectedAccountId);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const addAccount = useFinanceStore((state) => state.addAccount);
  const deleteAccount = useFinanceStore((state) => state.deleteAccount);
  const addBudget = useFinanceStore((state) => state.addBudget);
  const deleteBudget = useFinanceStore((state) => state.deleteBudget);

  const user = useFinanceStore((state) => state.user);
  const updateUserProfile = useFinanceStore((state) => state.updateUserProfile);

  const exportData = useFinanceStore((state) => state.exportData);
  const importData = useFinanceStore((state) => state.importData);
  const syncWithFirebase = useFinanceStore((state) => state.syncWithFirebase);
  const loading = useFinanceStore((state) => state.loading);

  const customNotificationTime = useFinanceStore((state) => state.customNotificationTime) || '20:00';
  const notificationIntervalHours = useFinanceStore((state) => state.notificationIntervalHours) || 1;
  const isAdminUnlocked = useFinanceStore((state) => state.isAdminUnlocked);
  const setCustomNotificationTime = useFinanceStore((state) => state.setCustomNotificationTime);
  const setNotificationIntervalHours = useFinanceStore((state) => state.setNotificationIntervalHours);

  const [backupMessage, setBackupMessage] = useState('');
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [notifPermState, setNotifPermState] = useState<string>('Checking...');
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    if (activePage === 'settings') {
      checkNotificationPermissions().then((granted) => {
        setNotifPermState(granted ? 'Granted' : 'Not Granted');
      });
    }
  }, [activePage]);

  // Profile editing
  const [editName, setEditName] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Add Account modal state
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'cash' | 'bank' | 'credit'>('cash');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccColor, setNewAccColor] = useState('#10B981');

  // Add Budget modal state
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState('Food');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');
  const [newBudgetMonth, setNewBudgetMonth] = useState(new Date().toISOString().substring(0, 7));


  // Ledger Filters
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [ledgerFilterType, setLedgerFilterType] = useState('all');
  const [ledgerFilterCategory, setLedgerFilterCategory] = useState('all');
  const [ledgerSortBy, setLedgerSortBy] = useState('date-newest');

  const [confirmDeleteBudgetId, setConfirmDeleteBudgetId] = useState<string | null>(null);

  // AI Advisor Chat State
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: "👋 **Hey! I'm your CoinBurst AI assistant.** I can *read and take action* on your finances.\n\nTry saying:\n- *\"Add expense 500 Food\"*\n- *\"Log income 10000 Salary\"*\n- *\"Create account HDFC Bank\"*\n- *\"Set budget 3000 for Groceries\"*\n- *\"Delete last transaction\"*\n- *\"Switch to cyberpunk theme\"*\n- *\"Show my spending\"* / *\"Check budgets\"*\n\nWhat would you like me to do?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever chat updates
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, aiTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim()) return;

    // Add user message
    const newHistory = [...chatHistory, { sender: 'user' as const, text: messageText }];
    setChatHistory(newHistory);
    if (!textToSend) setChatInput('');

    // Play send sound
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}

    // Trigger AI response
    setAiTyping(true);
    try {
      const result = await generateAIResponse(
        messageText,
        { accounts, transactions, budgets },
        currency,
        {
          addTransaction,
          deleteTransaction,
          addAccount,
          deleteAccount,
          addBudget,
          deleteBudget,
          setTheme,
          setCurrency,
          onNavigate,
        }
      );

      // Display the reply
      setChatHistory(prev => [...prev, { sender: 'ai' as const, text: result.text }]);
      
      // Execute the action (mutates store / navigates) after a tiny delay so reply renders first
      if (result.action) {
        setTimeout(result.action, 150);
      }

      // Play reply sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav');
        audio.volume = 0.35;
        audio.play().catch(() => {});
      } catch {}
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { sender: 'ai' as const, text: "⚠️ Error contacting AI Core." }]);
    } finally {
      setAiTyping(false);
    }
  };

  // Local image file uploader (File -> Base64) — stores in Firebase DB
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      alert('Please select an image smaller than 1.5MB.');
      return;
    }
    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditPhoto(reader.result as string);
      setPhotoUploading(false);
    };
    reader.onerror = () => {
      alert('Failed to read the image file.');
      setPhotoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (user) {
      setEditName(user.displayName);
      setEditPhoto(user.photoURL || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({ displayName: editName, photoURL: editPhoto });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save profile error:', err);
    }
  };

  // Add Account handler
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim() || !newAccBalance) return;
    addAccount({
      name: newAccName.trim(),
      type: newAccType,
      balance: parseFloat(newAccBalance),
      color: newAccColor,
    });
    setNewAccName('');
    setNewAccBalance('');
    setNewAccColor('#10B981');
    setNewAccType('cash');
    setShowAddAccount(false);
  };

  // Add Budget handler
  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetLimit || parseFloat(newBudgetLimit) <= 0) return;
    addBudget({
      category: newBudgetCategory,
      limit: parseFloat(newBudgetLimit),
      month: newBudgetMonth,
    });
    setNewBudgetLimit('');
    setShowAddBudget(false);
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const filteredTransactions = selectedAccountId 
    ? transactions.filter(t => t.accountId === selectedAccountId)
    : transactions;


  const ledgerTransactions = transactions
    .filter(t => {
      if (!ledgerSearch) return true;
      const q = ledgerSearch.toLowerCase();
      return t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || String(t.amount).includes(q);
    })
    .filter(t => ledgerFilterType === 'all' ? true : t.type === ledgerFilterType)
    .filter(t => ledgerFilterCategory === 'all' ? true : t.category === ledgerFilterCategory)
    .sort((a, b) => {
      if (ledgerSortBy === 'date-newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (ledgerSortBy === 'date-oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (ledgerSortBy === 'amount-high') return b.amount - a.amount;
      if (ledgerSortBy === 'amount-low') return a.amount - b.amount;
      return 0;
    });

  const PRESET_CATEGORIES = ['Food', 'Entertainment', 'Salary', 'Rent', 'Shopping', 'Utilities', 'Travel', 'Healthcare', 'Transport', 'Education', 'Other'];
  const uniqueCategories = Array.from(new Set([...PRESET_CATEGORIES, ...transactions.map(t => t.category)])).sort();

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  const chartData = filteredTransactions.slice().reverse().map(t => ({
    date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: t.amount,
    type: t.type,
  }));

  const overallBudget = budgets.find(b => b.category === 'all') || { spent: 0, limit: 1 };

  const getDailyFlowData = () => {
    const last7Days: Record<string, { date: string; income: number; expense: number }> = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      last7Days[dateStr] = { date: dateStr, income: 0, expense: 0 };
    }

    // Populate with actual transactions
    filteredTransactions.forEach(t => {
      const txDate = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (last7Days[txDate]) {
        if (t.type === 'income') {
          last7Days[txDate].income += t.amount;
        } else {
          last7Days[txDate].expense += t.amount;
        }
      }
    });

    return Object.values(last7Days);
  };

  const dailyFlowData = getDailyFlowData();

  return (
    <div className={`min-h-screen w-full ${cStyles.bg} ${theme === 'forest' ? 'forest-breath' : ''} font-sans transition-colors duration-500 flex flex-col md:flex-row relative overflow-hidden`}>
      {/* ── Background Theme Animations ──────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {theme === 'cyberpunk' && (
          <>
            {/* Cyber Grid */}
            <div 
              className="absolute inset-0 opacity-15 animate-cyber-grid" 
              style={{
                backgroundImage: 'linear-gradient(rgba(255, 0, 127, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 127, 0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            {/* Glitch Scanline */}
            <div className="absolute left-0 right-0 h-1 bg-pink-500/20 shadow-[0_0_10px_rgba(255,0,127,0.5)] animate-scanline" />
            {/* Flickering glow nodes */}
            <div className="absolute top-[20%] left-[30%] w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#FFE600] animate-flicker-slow" />
            <div className="absolute bottom-[25%] right-[20%] w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_10px_#FF007F] animate-flicker-slow" style={{ animationDelay: '1.5s' }} />
          </>
        )}

        {theme === 'synthwave' && (
          <>
            {/* Retro perspective neon grid lines */}
            <div 
              className="absolute inset-0 opacity-[0.12] animate-cyber-grid" 
              style={{
                backgroundImage: 'linear-gradient(rgba(255, 0, 160, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 160, 0.4) 1px, transparent 1px)',
                backgroundSize: '45px 45px',
              }}
            />
            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,5,36,0)_95%,rgba(0,0,0,0.35)_95%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
            {/* Vaporwave Glowing Orbs */}
            <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#B200FF]/15 blur-[120px] animate-float-light-blob" />
            <div className="absolute bottom-[-10%] left-[5%] w-[450px] h-[450px] rounded-full bg-[#FF007F]/15 blur-[110px] animate-float-light-blob" style={{ animationDelay: '-6s' }} />
            {/* Drifting digital star particles */}
            {[...Array(12)].map((_, i) => {
              const size = Math.random() * 4 + 2;
              const left = Math.random() * 100;
              const delay = Math.random() * 15;
              const duration = Math.random() * 8 + 12;
              return (
                <div 
                  key={i}
                  className="absolute bottom-[-20px] rounded-full bg-[#00E5FF] animate-float-particle"
                  style={{
                    width: size,
                    height: size,
                    left: `${left}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    filter: 'blur(0.5px) drop-shadow(0 0 3px rgba(0, 229, 255, 0.6))',
                  }}
                />
              );
            })}
          </>
        )}

        {theme === 'glass' && (
          <>
            {/* Ambient Moving Blobs */}
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#FF007F]/20 blur-[100px] animate-float-light-blob" />
            <div className="absolute bottom-40 right-20 w-[450px] h-[450px] rounded-full bg-[#7B2CBF]/20 blur-[120px] animate-float-light-blob" style={{ animationDelay: '-10s' }} />
            <div className="absolute top-[60%] left-[40%] w-[350px] h-[350px] rounded-full bg-[#00F0FF]/15 blur-[100px] animate-float-light-blob" style={{ animationDelay: '-18s' }} />
            {/* Scrolling Synth grid */}
            <div 
              className="absolute inset-0 opacity-[0.06] animate-cyber-grid" 
              style={{
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }}
            />
          </>
        )}

        {theme === 'forest' && (
          <>
            {/* Ambient warm forest glow */}
            <div className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full bg-[#E5B842]/5 blur-[150px] animate-pulse-glow" />
            
            {/* Drifting Fireflies / Gold particles */}
            {[...Array(15)].map((_, i) => {
              const size = Math.random() * 6 + 3;
              const left = Math.random() * 100;
              const delay = Math.random() * 15;
              const duration = Math.random() * 10 + 12;
              return (
                <div 
                  key={i}
                  className="absolute bottom-[-20px] rounded-full bg-gradient-to-tr from-[#E5B842] to-yellow-200 animate-float-particle"
                  style={{
                    width: size,
                    height: size,
                    left: `${left}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    filter: 'blur(1px) drop-shadow(0 0 4px rgba(229, 184, 66, 0.8))',
                  }}
                />
              );
            })}
          </>
        )}

        {theme === 'light' && (
          <>
            {/* Organic shifting light pastel gradients */}
            <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-indigo-200/40 blur-[90px] animate-float-light-blob" />
            <div className="absolute bottom-[10%] right-[15%] w-[450px] h-[450px] rounded-full bg-pink-100/50 blur-[100px] animate-float-light-blob" style={{ animationDelay: '-8s' }} />
            <div className="absolute top-[50%] right-[40%] w-[350px] h-[350px] rounded-full bg-emerald-100/30 blur-[80px] animate-float-light-blob" style={{ animationDelay: '-16s' }} />
          </>
        )}

        {theme === 'dark' && (
          <>
            {/* Subtle floating digital emerald dots */}
            {[...Array(10)].map((_, i) => {
              const size = Math.random() * 4 + 2;
              const left = Math.random() * 100;
              const delay = Math.random() * 18;
              const duration = Math.random() * 12 + 15;
              return (
                <div 
                  key={i}
                  className="absolute bottom-[-20px] rounded-full bg-[#00FF88] animate-float-particle"
                  style={{
                    width: size,
                    height: size,
                    left: `${left}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    filter: 'blur(0.5px) drop-shadow(0 0 3px rgba(0, 255, 136, 0.6))',
                  }}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full relative z-10">
        {/* Header Banner */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-gray-400 font-black">Workspace Ledger</span>
            <h2 className="text-3xl font-black tracking-tight mt-1">
              {activePage === 'dashboard' && 'Financial Nexus'}
              {activePage === 'transactions' && 'Vault Transaction Ledger'}
              {activePage === 'budgets' && 'Dynamic Limit Enforcers'}
              {activePage === 'settings' && 'User Settings'}
              {activePage === 'ai' && 'AI Portfolio Advisor'}
              {activePage === 'about' && 'About Wealth Nexus'}
              {activePage === 'burn-rate' && 'AI Burn-Rate Forecast'}
              {activePage === 'split-bills' && 'Group Bill Splitter'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowReceiptScanner(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow-lg cursor-pointer transition-all"
              title="Scan Receipt Bill with AI OCR"
            >
              <Camera className="w-4 h-4" /> Scan Receipt
            </button>
            <button
              onClick={() => setShowAddAccount(true)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold ${cStyles.primaryBtn}`}
              title="Create New Wallet Node"
            >
              <Plus className="w-4 h-4" /> Add Wallet
            </button>
            <div className={`flex items-center gap-4 p-2 rounded-xl border ${cStyles.headerAccent}`}>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase tracking-widest">Aggregate Net Worth</span>
                <span className="text-xl font-mono font-black text-emerald-400">
                  {fmt(totalBalance)}
                </span>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* PAGE RENDER SWITCH */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {activePage === 'dashboard' && (
              <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
                <div className="flex-1 space-y-8 w-full">
                  {/* Profit & Loss Sentinel Widget */}
                  <ProfitLossWidget />

                  {/* Cards */}
                  <section>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                    <motion.div whileHover={{ scale: 1.02 }} className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Ledger Focus Balance</p>
                      <h4 className="text-3xl font-black font-mono mt-2 tracking-tight">
                        {fmt(selectedAccount ? selectedAccount.balance : totalBalance)}
                      </h4>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Inbound Capital (Income)</p>
                      <h4 className="text-3xl font-black font-mono mt-2 tracking-tight text-emerald-400">
                        +{fmt(totalIncome)}
                      </h4>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Outbound Burn (Expenses)</p>
                      <h4 className="text-3xl font-black font-mono mt-2 tracking-tight text-pink-500">
                        -{fmt(totalExpense)}
                      </h4>
                    </motion.div>
                  </div>
                </section>

                {/* Plot and Liquid */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className={`lg:col-span-2 p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                    <h3 className="text-lg font-black tracking-wide">Liquidity Trend Analysis</h3>
                    <div className="h-72 w-full mt-4">
                      {chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500">No chart data yet.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={cStyles.chartColors[0]} stopOpacity={0.4}/>
                                <stop offset="95%" stopColor={cStyles.chartColors[0]} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={cStyles.gridColor} />
                            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                            <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0B0B0F', borderColor: '#1E1E26', color: '#fff', borderRadius: '12px' }} />
                            <Area type="monotone" dataKey="amount" stroke={cStyles.chartColors[0]} fill="url(#colorValue)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} flex flex-col justify-between items-center`}>
                    <h3 className="text-lg font-black tracking-wide text-center">Overall Budget Sentinel</h3>
                    <LiquidProgressBar spent={overallBudget.spent} limit={overallBudget.limit} />
                    <div className="mt-6 text-center w-full space-y-2">
                      <div className="flex justify-between text-xs px-4">
                        <span className="text-gray-400">Total Limit</span>
                        <span className={`font-mono font-bold ${cStyles.textNormal}`}>{fmt(overallBudget.limit)}</span>
                      </div>
                      <div className="flex justify-between text-xs px-4">
                        <span className="text-gray-400">Current Burn</span>
                        <span className="font-mono text-pink-500 font-bold">{fmt(overallBudget.spent)}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Spent vs Savings Daily Comparison Graph Section */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className={`lg:col-span-2 p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-black tracking-wide">Outflow vs. Inflow Analysis</h3>
                        <p className="text-xs text-gray-400">7-day cash flow comparison of expenses and savings</p>
                      </div>
                      <div className="flex gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-3 h-3 rounded bg-emerald-400" /> Inbound
                        </span>
                        <span className="flex items-center gap-1.5 text-pink-500">
                          <span className="w-3 h-3 rounded bg-pink-500" /> Outflow
                        </span>
                      </div>
                    </div>
                    
                    <div className="h-72 w-full mt-4">
                      {filteredTransactions.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500">No transaction flow data available.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dailyFlowData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={cStyles.gridColor} />
                            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                            <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0B0B0F', borderColor: '#1E1E26', color: '#fff', borderRadius: '12px' }} />
                            <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Inbound" />
                            <Bar dataKey="expense" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Outflow" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Flow Summary Card */}
                  <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} flex flex-col justify-between`}>
                    <div>
                      <h3 className="text-lg font-black tracking-wide mb-4">Flow Summary</h3>
                      <div className="space-y-4">
                        <div className={`p-4 rounded-xl ${cStyles.cardAccentBg} border border-white/5`}>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Net Savings (Inbound - Outflow)</span>
                          <span className={`text-2xl font-black font-mono ${totalIncome - totalExpense >= 0 ? 'text-emerald-400' : 'text-pink-500'}`}>
                            {totalIncome - totalExpense >= 0 ? '+' : '-'}{fmt(Math.abs(totalIncome - totalExpense))}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={`p-3.5 rounded-xl ${cStyles.cardAccentBg} border border-white/5`}>
                            <span className="text-[9px] text-gray-400 uppercase tracking-widest block mb-0.5">Savings Ratio</span>
                            <span className="text-base font-black font-mono text-white">
                              {totalIncome > 0 ? `${((totalIncome - totalExpense) / totalIncome * 100).toFixed(0)}%` : '0%'}
                            </span>
                          </div>
                          <div className={`p-3.5 rounded-xl ${cStyles.cardAccentBg} border border-white/5`}>
                            <span className="text-[9px] text-gray-400 uppercase tracking-widest block mb-0.5">Burn Rate</span>
                            <span className="text-base font-black font-mono text-pink-500">
                              {totalIncome > 0 ? `${(totalExpense / totalIncome * 100).toFixed(0)}%` : '0%'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`mt-6 p-4 rounded-xl ${theme === 'cyberpunk' ? 'bg-[#FF007F]/10 border border-[#FF007F]/20' : 'bg-emerald-500/5 border border-emerald-500/10'}`}>
                      <span className="text-[9px] uppercase tracking-widest font-black text-emerald-400 flex items-center gap-1 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> AI Insight
                      </span>
                      <p className="text-[11px] text-gray-400 leading-normal">
                        {totalIncome === 0 
                          ? "No capital inflow logged. Feed the ledger to unlock predictive analytics and burn rate forecasting."
                          : totalIncome > totalExpense
                            ? "Capital expansion is positive. Your reserves are compiling at a stable rate. Maintain current parameters."
                            : "⚠️ Deficit detected. Capital outflow exceeds harvest. Engage strict budget limiters immediately."}
                      </p>
                    </div>
                  </div>
                </section>

                {/* 🔮 AI Burn-Rate & Financial Runway Predictor */}
                <BurnRatePredictor />

                {/* 👥 Group Bill Splitter & Shared Ledger */}
                <GroupBillSplitter />

                {/* Ledger Feed */}
                <section className={`p-4 sm:p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-base sm:text-lg font-black tracking-wide">Activity Ledger Feed</h3>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => downloadStatement(filteredTransactions, accounts)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold ${cStyles.primaryBtnOutline}`}
                      >
                        <Download className="w-4 h-4" /> Statement
                      </button>
                      <button 
                        onClick={onOpenForm}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold ${cStyles.primaryBtn}`}
                      >
                        <Plus className="w-4 h-4" /> Add Transaction
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {filteredTransactions.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 text-sm font-semibold">
                        No transactions tracked for this scope.
                      </div>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const acc = accounts.find(a => a.id === tx.accountId);
                        return (
                          <div key={tx.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl gap-3 transition-colors ${cStyles.ledgerFeedBg} ${theme === 'light' ? 'soft-white-row' : ''}`}>
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                              <div className={`p-2.5 rounded-xl shrink-0 ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-pink-500/10 text-pink-500'}`}>
                                {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-sm truncate">{tx.description}</h4>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${cStyles.badgeBg}`}>{tx.category}</span>
                                  {acc && <span className="text-[10px] font-bold truncate" style={{ color: acc.color }}>• {acc.name}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-800/30">
                              <span className={`text-sm font-black font-mono ${tx.type === 'income' ? 'text-emerald-400' : 'text-pink-500'}`}>
                                {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                              </span>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => onEditTransaction?.(tx)} 
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer transition-colors"
                                  title="Edit Transaction"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => deleteTransaction(tx.id)} 
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                                  title="Delete Transaction"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>

              <CalendarChartColumn transactions={transactions} currency={currency} />
            </div>
          )}

            {activePage === 'transactions' && (
              <div className="space-y-8">
                {/* Dedicated Wallets Seekbar & Funds Section */}
                <section>
                  <WalletSlidebar onOpenAddWallet={() => setShowAddAccount(true)} />
                </section>

                <div className={`p-4 sm:p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-base sm:text-lg font-black">Full Transactions Vault Ledger</h3>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-none">
                        <button
                          onClick={() => setShowExportMenu(!showExportMenu)}
                          className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold ${cStyles.primaryBtnOutline}`}
                        >
                          <Download className="w-4 h-4" /> Export <ChevronDown className="w-3 h-3" />
                        </button>
                        {showExportMenu && (
                          <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl z-50 overflow-hidden ${cStyles.cardBg} ${cStyles.shadow}`}>
                            {[
                              { label: 'CSV Spreadsheet', icon: '📊', format: 'csv' },
                              { label: 'JSON Data', icon: '🔧', format: 'json' },
                              { label: 'Text Report', icon: '📄', format: 'txt' },
                              { label: 'HTML Document', icon: '🌐', format: 'html' },
                            ].map(opt => (
                              <button
                                key={opt.format}
                                onClick={() => { downloadStatement(ledgerTransactions, accounts, opt.format); setShowExportMenu(false); }}
                                className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer`}
                              >
                                <span>{opt.icon}</span> {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={onOpenForm} className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold ${cStyles.primaryBtn}`}>
                        <Plus className="w-4 h-4" /> Add Transaction
                      </button>
                    </div>
                  </div>


                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={ledgerSearch}
                      onChange={e => setLedgerSearch(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm ${cStyles.input}`}
                      style={{ border: '1.5px solid rgba(160,160,180,0.7)' }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <div style={{ border: '1.5px solid rgba(160,160,180,0.7)', borderRadius: '0.75rem', overflow: 'hidden' }}>
                      <select value={ledgerFilterType} onChange={e => setLedgerFilterType(e.target.value)} className={`w-full p-2.5 text-sm font-semibold cursor-pointer outline-none ${cStyles.input}`} style={{ border: 'none', borderRadius: 0 }}>
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </div>
                    <div style={{ border: '1.5px solid rgba(160,160,180,0.7)', borderRadius: '0.75rem', overflow: 'hidden' }}>
                      <select value={ledgerFilterCategory} onChange={e => setLedgerFilterCategory(e.target.value)} className={`w-full p-2.5 text-sm font-semibold cursor-pointer outline-none ${cStyles.input}`} style={{ border: 'none', borderRadius: 0 }}>
                        <option value="all">All Categories</option>
                        {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{ border: '1.5px solid rgba(160,160,180,0.7)', borderRadius: '0.75rem', overflow: 'hidden' }}>
                      <select value={ledgerSortBy} onChange={e => setLedgerSortBy(e.target.value)} className={`w-full p-2.5 text-sm font-semibold cursor-pointer outline-none ${cStyles.input}`} style={{ border: 'none', borderRadius: 0 }}>
                        <option value="date-newest">Date: Newest</option>
                        <option value="date-oldest">Date: Oldest</option>
                        <option value="amount-high">Amount: High to Low</option>
                        <option value="amount-low">Amount: Low to High</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {ledgerTransactions.map((tx) => {
                      const acc = accounts.find(a => a.id === tx.accountId);
                      return (
                        <div key={tx.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl gap-3 transition-colors ${cStyles.ledgerFeedBg}`}>
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className={`p-2.5 rounded-xl shrink-0 ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-pink-500/10 text-pink-500'}`}>
                              {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-sm truncate">{tx.description}</h4>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${cStyles.badgeBg}`}>{tx.category}</span>
                                {acc && <span className="text-[10px] font-bold truncate" style={{ color: acc.color }}>• {acc.name}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-800/30">
                            <span className={`text-sm font-black font-mono ${tx.type === 'income' ? 'text-emerald-400' : 'text-pink-500'}`}>
                              {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                            </span>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => onEditTransaction?.(tx)} 
                                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer transition-colors"
                                title="Edit Transaction"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => deleteTransaction(tx.id)} 
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                                title="Delete Transaction"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activePage === 'budgets' && (
              <div className="space-y-8">
                <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-black tracking-wide">Budget Limiters</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Set spending caps per category. Tracked automatically from transactions.</p>
                    </div>
                    <button
                      onClick={() => setShowAddBudget(true)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${cStyles.primaryBtn}`}
                    >
                      <Plus className="w-4 h-4" /> New Budget
                    </button>
                  </div>

                  {budgets.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-4 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                        <PiggyBank className="w-8 h-8" />
                      </div>
                      <p className="text-gray-400 text-sm">No budgets set up yet.</p>
                      <p className="text-gray-500 text-xs max-w-xs">Create category budget limits to automatically track your spending and get alerts when nearing your cap.</p>
                      <button
                        onClick={() => setShowAddBudget(true)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold ${cStyles.primaryBtn}`}
                      >
                        <Plus className="w-4 h-4 inline mr-1" /> Create First Budget
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                      {budgets.map(b => (
                        <div key={b.id} className={`flex flex-col items-center p-6 rounded-2xl w-full max-w-xs ${cStyles.cardAccentBg} relative group`}>
                          <div className="flex justify-between items-center w-full mb-4">
                            <span className="text-sm font-black uppercase tracking-wider">{b.category}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400">{b.month}</span>
                              {confirmDeleteBudgetId === b.id ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      deleteBudget(b.id);
                                      setConfirmDeleteBudgetId(null);
                                    }}
                                    className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-black hover:bg-red-500/30 transition-colors cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteBudgetId(null)}
                                    className="text-[10px] text-gray-400 hover:text-white transition-colors cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteBudgetId(b.id)}
                                  className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Delete Budget"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <LiquidProgressBar spent={b.spent} limit={b.limit} />
                          <div className="mt-4 w-full text-center">
                            <span className="text-xs text-gray-400">{fmt(b.spent)} / {fmt(b.limit)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePage === 'settings' && (
              <div className="space-y-8">
                {/* 👑 Admin User Telemetry Panel (Only visible when unlocked via secret 5-tap passcode) */}
                {isAdminUnlocked && <UserTelemetryPanel />}

                {/* 0. Wallet Nodes & Accounts Panel */}
                <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-black tracking-wide">Wallet Nodes & Accounts</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Manage your financial accounts, balances, and color tags.</p>
                    </div>
                    <button
                      onClick={() => setShowAddAccount(true)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${cStyles.primaryBtn}`}
                    >
                      <Plus className="w-4 h-4" /> Add Wallet
                    </button>
                  </div>

                  {accounts.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm font-semibold">
                      No wallet nodes configured. Click "Add Wallet" above to create your first account.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {accounts.map((acc) => (
                        <div key={acc.id} className={`p-4 rounded-xl border flex items-center justify-between ${cStyles.ledgerFeedBg}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: acc.color }} />
                            <div>
                              <h4 className="font-bold text-sm">{acc.name}</h4>
                              <span className="text-[10px] text-gray-400 uppercase font-bold">{acc.type} • {fmt(acc.balance)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteAccount(acc.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Wallet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 1. Profile Settings Panel */}
                <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-black tracking-wide">User Profile Settings</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Changes are saved directly to Firebase — visible instantly across all devices.</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (syncWithFirebase) {
                          setIsManualSyncing(true);
                          await syncWithFirebase();
                          setTimeout(() => setIsManualSyncing(false), 800);
                        }
                      }}
                      disabled={isManualSyncing || loading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${cStyles.primaryBtnOutline} disabled:opacity-50 shrink-0`}
                      title="Force full bidirectional synchronization with Firebase"
                    >
                      <RefreshCw className={`w-4 h-4 ${isManualSyncing || loading ? 'animate-spin text-emerald-400' : ''}`} />
                      <span>{isManualSyncing || loading ? 'Syncing...' : 'Sync Full Data'}</span>
                    </button>
                  </div>
                  <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">

                    {/* Avatar section */}
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Live avatar preview */}
                      <div className="relative group shrink-0">
                        <label htmlFor="profilePhotoFile" className="cursor-pointer block">
                          {editPhoto ? (
                            <img
                              src={editPhoto}
                              alt="Profile"
                              className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/40 shadow-xl"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl border-4 border-emerald-500/40 shadow-xl">
                              {editName ? editName.substring(0, 2).toUpperCase() : 'CB'}
                            </div>
                          )}
                          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            {photoUploading ? (
                              <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <span className="text-white text-xs font-bold text-center leading-tight px-2">📷 Change</span>
                            )}
                          </div>
                        </label>
                        {editPhoto && (
                          <button
                            type="button"
                            onClick={() => setEditPhoto('')}
                            title="Remove photo"
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold cursor-pointer hover:bg-red-400 transition-colors"
                          >✕</button>
                        )}
                      </div>

                      <div className="flex-1 space-y-3 w-full">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Upload from Device (max 1.5MB)
                          </label>
                          <input
                            id="profilePhotoFile"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className={`w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest ${theme === 'cyberpunk' ? 'file:bg-[#FFE600] file:text-[#12042C]' : 'file:bg-emerald-500/20 file:text-emerald-400'} file:cursor-pointer cursor-pointer rounded-xl border p-2 ${cStyles.input}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            Or paste photo URL (Google Drive / Cloud)
                          </label>
                          <input
                            type="text"
                            value={editPhoto}
                            onChange={(e) => setEditPhoto(e.target.value)}
                            placeholder="https://drive.google.com/uc?id=..."
                            className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-300 ${cStyles.input}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Display Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Display Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Your Name"
                        className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-300 ${cStyles.input}`}
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={photoUploading}
                        className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${cStyles.primaryBtn} disabled:opacity-50`}
                      >
                        {photoUploading ? 'Processing Photo...' : 'Save Profile Changes'}
                      </button>
                      {saveSuccess && (
                        <span className="text-xs text-emerald-400 font-bold animate-pulse">
                          ✓ Profile updated and synced!
                        </span>
                      )}
                    </div>
                  </form>
                </div>

                {/* 2. Theme Switcher */}
                <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                  <h3 className="text-lg font-black mb-2">Dynamic Theme Switcher</h3>
                  <p className="text-xs text-gray-400 mb-6">Instantly swap the global user interface aesthetic with integrated audio feedback.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { id: 'dark', title: 'True Dark', desc: 'AMOLED Black & neon emerald.' },
                      { id: 'light', title: 'Soft Light', desc: 'Pastel palettes & clean shadows.' },
                      { id: 'cyberpunk', title: 'Retro Cyber', desc: 'High-contrast yellow & neon pink.' },
                      { id: 'glass', title: 'Glass Synth', desc: 'Sunset gradients & glassmorphism.' },
                      { id: 'forest', title: 'Forest Zen', desc: 'Deep evergreens & warm gold.' },
                      { id: 'synthwave', title: 'Neon Synthwave', desc: 'Vaporwave purples & glowing cyan accents.' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id as ThemeType);
                          playThemeSound(t.id);
                        }}
                        className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer flex flex-col justify-between h-36 ${
                          theme === t.id 
                            ? cStyles.settingsBtnSelected 
                            : cStyles.settingsBtnUnselected
                        }`}
                      >
                        <h4 className="font-black text-sm mb-2">{t.title}</h4>
                        <p className="text-[11px] text-gray-400 leading-normal">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Currency Selector */}
                <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                  <h3 className="text-lg font-black mb-2">Currency Preference</h3>
                  <p className="text-xs text-gray-400 mb-4">Changes are synced to Firebase and reflect instantly across all devices including the React Native app.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {SUPPORTED_CURRENCIES.map(c => (
                      <button
                        key={c.code}
                        onClick={() => setCurrency(c.code)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-300 cursor-pointer ${
                          currency === c.code ? cStyles.settingsBtnSelected : cStyles.settingsBtnUnselected
                        }`}
                      >
                        <span className="text-2xl font-black block mb-1">{c.symbol}</span>
                        <span className="text-xs font-bold block">{c.code}</span>
                        <span className="text-[10px] text-gray-400 leading-none">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>



                {/* 5. Data Backup & System Restore Panel */}
                <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        <Database className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black tracking-wide">Data Backup & System Restore</h3>
                        <p className="text-xs text-gray-400">Export your complete financial records to a JSON backup file or restore from a previous backup.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                    {/* Export Card */}
                    <div className={`p-5 rounded-xl border border-gray-800/60 ${cStyles.ledgerFeedBg} flex flex-col justify-between space-y-4`}>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-sm text-gray-200 mb-1">
                          <Download className="w-4 h-4 text-emerald-400" /> Export JSON Backup
                        </div>
                        <p className="text-xs text-gray-400">Download a full JSON file containing all accounts, transactions, budgets, currency, and theme settings.</p>
                      </div>
                      <button
                        onClick={() => {
                          if (exportData) {
                            const dataStr = exportData();
                            const blob = new Blob([dataStr], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `coinburst-backup-${new Date().toISOString().split('T')[0]}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                            setBackupMessage('✓ Backup exported successfully!');
                            setTimeout(() => setBackupMessage(''), 4000);
                          }
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${cStyles.primaryBtn}`}
                      >
                        <Download className="w-4 h-4" /> Download Backup File
                      </button>
                    </div>

                    {/* Import Card */}
                    <div className={`p-5 rounded-xl border border-gray-800/60 ${cStyles.ledgerFeedBg} flex flex-col justify-between space-y-4`}>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-sm text-gray-200 mb-1">
                          <Upload className="w-4 h-4 text-cyan-400" /> Restore from JSON Backup
                        </div>
                        <p className="text-xs text-gray-400">Select a CoinBurst backup JSON file to restore your accounts, ledger history, and budgets.</p>
                      </div>
                      <div>
                        <label className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer transition-colors`}>
                          <Upload className="w-4 h-4" /> Choose JSON File & Restore
                          <input
                            type="file"
                            accept=".json,application/json"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const content = event.target?.result as string;
                                if (content && importData) {
                                  importData(content);
                                  setBackupMessage('✓ Application state successfully restored!');
                                  setTimeout(() => setBackupMessage(''), 4000);
                                }
                              };
                              reader.readAsText(file);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {backupMessage && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                      <span>{backupMessage}</span>
                    </div>
                  )}
                </div>

                {/* 6. Local Notifications & Financial Alerts Panel */}
                <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <Bell className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black tracking-wide">Local Notifications & Financial Alerts</h3>
                        <p className="text-xs text-gray-400">Configure recurring timers, custom notification times, and custom audio sound effects.</p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        const granted = await requestNotificationPermissions();
                        setNotifPermState(granted ? 'Granted' : 'Not Granted');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                        notifPermState === 'Granted' 
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                          : 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
                      } cursor-pointer transition-colors`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Permission: {notifPermState}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 🕒 Card 1: Custom Scheduled Time Notification */}
                    <div className={`p-5 rounded-xl border border-gray-800/60 ${cStyles.ledgerFeedBg} flex flex-col justify-between space-y-4`}>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-sm text-gray-200 mb-1">
                          <Clock className="w-4 h-4 text-cyan-400" /> Custom Daily Reminder Time
                        </div>
                        <p className="text-xs text-gray-400 mb-3">Set your preferred daily check-in notification time.</p>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block">
                            Select Alert Time (HH:MM)
                          </label>
                          <input
                            type="time"
                            value={customNotificationTime}
                            onChange={(e) => {
                              const newTime = e.target.value;
                              setCustomNotificationTime(newTime);
                              const [h, m] = newTime.split(':').map(Number);
                              scheduleDailyFinanceReminder(h, m);
                            }}
                            className={`w-full p-2.5 rounded-xl text-sm font-bold border border-gray-700 ${cStyles.input} text-white focus:outline-none focus:border-cyan-400 transition-colors`}
                          />
                          <p className="text-[10px] text-cyan-400 font-medium">
                            ✓ Scheduled daily at {customNotificationTime}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          const [h, m] = customNotificationTime.split(':').map(Number);
                          await scheduleDailyFinanceReminder(h, m);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer transition-colors"
                      >
                        <Clock className="w-4 h-4" /> Save Daily Timer
                      </button>
                    </div>

                    {/* ⏱️ Card 2: Recurring Interval Notification Timer (Default 1-Hour) */}
                    <div className={`p-5 rounded-xl border border-gray-800/60 ${cStyles.ledgerFeedBg} flex flex-col justify-between space-y-4`}>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-sm text-gray-200 mb-1">
                          <RefreshCw className="w-4 h-4 text-emerald-400" /> Recurring Notification Frequency
                        </div>
                        <p className="text-xs text-gray-400 mb-3">Default frequency is set to Every 1 Hour with audio notification sound.</p>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block">
                            Interval Frequency
                          </label>
                          <select
                            value={notificationIntervalHours}
                            onChange={(e) => {
                              const hours = parseInt(e.target.value, 10) || 1;
                              setNotificationIntervalHours(hours);
                              scheduleIntervalFinanceReminder(hours);
                            }}
                            className={`w-full p-2.5 rounded-xl text-sm font-bold border border-gray-700 ${cStyles.input} text-white focus:outline-none focus:border-emerald-400 transition-colors`}
                          >
                            <option value={1} className="bg-[#0B0B0F]">Every 1 Hour (Default ⭐)</option>
                            <option value={2} className="bg-[#0B0B0F]">Every 2 Hours</option>
                            <option value={4} className="bg-[#0B0B0F]">Every 4 Hours</option>
                            <option value={6} className="bg-[#0B0B0F]">Every 6 Hours</option>
                            <option value={12} className="bg-[#0B0B0F]">Every 12 Hours</option>
                            <option value={24} className="bg-[#0B0B0F]">Every 24 Hours</option>
                          </select>
                          <p className="text-[10px] text-emerald-400 font-medium">
                            ✓ Active timer: Every {notificationIntervalHours} Hour(s)
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          await scheduleIntervalFinanceReminder(notificationIntervalHours);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${cStyles.primaryBtn}`}
                      >
                        <RefreshCw className="w-4 h-4" /> Activate Interval Timer
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-800/60 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
                    <span>CoinBurst Security & Legal Compliance Protocol</span>
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline font-semibold flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> View Terms & Conditions and Privacy Policy
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'about' && (
              <AboutWeb />
            )}

            {activePage === 'ai' && (
              <div className="space-y-6">
                <div className={`rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} flex flex-col border border-white/5 relative`} style={{ minHeight: '600px', maxHeight: 'calc(100vh - 200px)' }}>
                  {/* Background Decorative Glow */}
                  <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

                  {/* Terminal Header */}
                  <div className={`flex items-center justify-between px-5 py-4 border-b border-gray-800/60 relative z-10 rounded-t-2xl`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center border border-purple-500/30 text-purple-400 shrink-0">
                        <Bot className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm">CoinBurst Autonomous AI Advisor</h3>
                        <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Quantum Analysis Active</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] text-gray-400 font-mono">LIVE</span>
                    </div>
                  </div>

                  {/* Scrollable Chat Area */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 relative z-10" style={{ minHeight: '380px' }}>
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex items-end gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {/* AI avatar */}
                        {msg.sender === 'ai' && (
                          <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mb-1">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <div className={`max-w-[75%] rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? theme === 'cyberpunk'
                              ? 'bg-[#FFE600] text-[#12042C] font-mono border border-[#FFE600] px-4 py-3 rounded-br-sm'
                              : 'bg-emerald-500/20 text-white border border-emerald-500/30 px-4 py-3 rounded-br-sm'
                            : `${cStyles.cardAccentBg} text-gray-200 border border-white/8 px-4 py-3 rounded-bl-sm`
                        }`}>
                          <MarkdownText text={msg.text} />
                        </div>
                        {/* User avatar */}
                        {msg.sender === 'user' && (
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mb-1 text-[10px] font-black">
                            U
                          </div>
                        )}
                      </div>
                    ))}

                    {aiTyping && (
                      <div className="flex items-end gap-2.5 justify-start">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className={`px-4 py-3 rounded-2xl rounded-bl-sm text-sm ${cStyles.cardAccentBg} border border-white/8 flex items-center gap-2 text-gray-400`}>
                          <span className="text-[9px] font-bold uppercase tracking-widest">Thinking</span>
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Auto-scroll anchor */}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Bottom area: quick pills + input */}
                  <div className="px-5 pb-5 pt-3 border-t border-gray-800/40 space-y-3 relative z-10">
                    {/* Quick Analysis Pills */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '🔍 Analyze Spending', query: 'Analyze my expenses' },
                        { label: '⚠️ Budget Limits', query: 'Am I over budget?' },
                        { label: '📈 Savings Ratio', query: 'How are my savings doing?' },
                        { label: '💼 Vault Holdings', query: 'Summarize my accounts' }
                      ].map((pill, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(pill.query)}
                          disabled={aiTyping}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer disabled:opacity-50 ${cStyles.walletBtnUnselected}`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>

                    {/* Chat input form */}
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                      className="flex gap-2 items-center"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        disabled={aiTyping}
                        placeholder="Ask the advisor... (e.g. 'how are my budgets?', 'give me savings tips')"
                        className={`flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none transition-all duration-300 disabled:opacity-50 ${cStyles.input}`}
                        style={{ border: '1.5px solid rgba(160,160,180,0.3)' }}
                      />
                      <button
                        type="submit"
                        disabled={aiTyping || !chatInput.trim()}
                        className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer disabled:opacity-40 shrink-0 ${cStyles.primaryBtn}`}
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'burn-rate' && <BurnRatePredictor />}

            {activePage === 'split-bills' && <GroupBillSplitter />}
          </motion.div>
        </AnimatePresence>
      </main>



      {/* ── Add Account Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddAccount && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddAccount(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className={`relative z-10 w-full max-w-md my-auto p-6 sm:p-8 rounded-3xl ${cStyles.cardBg} ${cStyles.shadow}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">Add Wallet Node</h3>
                <button onClick={() => setShowAddAccount(false)} className={`p-2 rounded-full cursor-pointer ${cStyles.closeBtn}`}>
                  <ArrowDownRight className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Wallet Name</label>
                  <input
                    required value={newAccName} onChange={e => setNewAccName(e.target.value)}
                    placeholder="e.g. Chase Savings"
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none ${cStyles.input}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Type</label>
                    <select value={newAccType} onChange={e => setNewAccType(e.target.value as any)} className={`w-full px-4 py-3 rounded-xl focus:outline-none ${cStyles.input}`}>
                      <option value="cash">Cash</option>
                      <option value="bank">Bank</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Initial Balance</label>
                    <input
                      required type="number" step="0.01"
                      value={newAccBalance} onChange={e => setNewAccBalance(e.target.value)}
                      placeholder="0.00"
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none font-mono ${cStyles.input}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Color Tag</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={newAccColor} onChange={e => setNewAccColor(e.target.value)}
                      className="w-12 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {['#10B981','#3B82F6','#EC4899','#8B5CF6','#F59E0B','#EF4444'].map(c => (
                        <button type="button" key={c} onClick={() => setNewAccColor(c)}
                          className="w-7 h-7 rounded-full cursor-pointer border-2 transition-all"
                          style={{ backgroundColor: c, borderColor: newAccColor === c ? 'white' : 'transparent' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <button type="submit" className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider ${cStyles.primaryBtn}`}>
                  Create Wallet Node
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add Budget Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddBudget && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddBudget(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className={`relative z-10 w-full max-w-md my-auto p-6 sm:p-8 rounded-3xl ${cStyles.cardBg} ${cStyles.shadow}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">Set Budget Limit</h3>
                <button onClick={() => setShowAddBudget(false)} className={`p-2 rounded-full cursor-pointer ${cStyles.closeBtn}`}>
                  <ArrowDownRight className="w-5 h-5 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleAddBudget} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Category</label>
                  <select value={newBudgetCategory} onChange={e => setNewBudgetCategory(e.target.value)} className={`w-full px-4 py-3 rounded-xl focus:outline-none ${cStyles.input}`}>
                    {['Food', 'Entertainment', 'Shopping', 'Rent', 'Utilities', 'Travel', 'Healthcare', 'Transport', 'Education', 'Other', 'all'].map(cat => (
                      <option key={cat} value={cat}>{cat === 'all' ? '📊 All Categories (Overall)' : cat}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Monthly Limit</label>
                    <input
                      required type="number" step="0.01" min="1"
                      value={newBudgetLimit} onChange={e => setNewBudgetLimit(e.target.value)}
                      placeholder="500.00"
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none font-mono ${cStyles.input}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Month (YYYY-MM)</label>
                    <input
                      required type="month"
                      value={newBudgetMonth} onChange={e => setNewBudgetMonth(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl focus:outline-none ${cStyles.input}`}
                    />
                  </div>
                </div>
                <button type="submit" className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider ${cStyles.primaryBtn}`}>
                  Activate Budget Limiter
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terms & Conditions Modal */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />

      {/* 📷 AI Smart Receipt & Bill Scanner Modal */}
      <ReceiptScannerModal isOpen={showReceiptScanner} onClose={() => setShowReceiptScanner(false)} />
    </div>
  );
};
