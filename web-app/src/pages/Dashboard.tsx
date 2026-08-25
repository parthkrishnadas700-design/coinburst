import React, { useEffect, useState } from 'react';
import { useFinanceStore, formatCurrency } from '../shared/useFinanceStore';

import { ResponsivePie } from '@nivo/pie';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Brush } from 'recharts';
import { PieChart, Calendar as CalendarIcon, Activity, ArrowUpRight, ArrowDownRight, X, TrendingUp } from 'lucide-react';
import { useThemeStyles } from '../components/DashboardWeb';

export const Dashboard: React.FC = () => {
  const { transactions, accounts, checkStreak, currency } = useFinanceStore();
  const cStyles = useThemeStyles();

  // Run streak check on mount
  useEffect(() => {
    checkStreak?.();
  }, [checkStreak]);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const fmt = (val: number) => formatCurrency(val, currency);

  // Calendar day detail popup
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const selectedDayTxs = selectedDay
    ? transactions.filter(t => t.date.split('T')[0] === selectedDay)
    : [];


  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  const pieData = [
    { id: 'Income', label: 'Income', value: totalIncome, color: '#10B981' },
    { id: 'Expense', label: 'Expense', value: totalExpense, color: '#EF4444' }
  ];

  const transactionDayTypes = new Map<string, Set<string>>();
  transactions.forEach(t => {
    const day = t.date.split('T')[0];
    if (!transactionDayTypes.has(day)) transactionDayTypes.set(day, new Set());
    transactionDayTypes.get(day)!.add(t.type);
  });

  const chartData = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => ({
    date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: t.type === 'income' ? t.amount : -t.amount,
  }));
  
  // Compute rolling balance
  let currentBalance = 0;
  const areaData = chartData.map(d => {
    currentBalance += d.amount;
    return { date: d.date, balance: currentBalance };
  });

    return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-widest mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Realtime Vault Sync
          </div>
          <h2 className="text-3xl font-black tracking-tight mt-1 font-['Poppins']">Financial Nexus</h2>
        </div>
        <div className={`flex items-center gap-4 p-3 rounded-2xl border ${cStyles.headerAccent} shadow-lg`}>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block uppercase tracking-widest font-bold">Aggregate Net Worth</span>
            <span className="text-2xl font-mono font-black text-emerald-400">
              {fmt(totalBalance)}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 transition-transform duration-300 hover:scale-110 border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Summary Micro Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5`}>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Total Income</span>
            <p className="text-lg font-mono font-black text-emerald-400 mt-0.5">+{fmt(totalIncome)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5`}>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Total Expense</span>
            <p className="text-lg font-mono font-black text-red-400 mt-0.5">-{fmt(totalExpense)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5`}>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Net Retention</span>
            <p className="text-lg font-mono font-black text-cyan-400 mt-0.5">
              {totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0}% Saved
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Income vs Expense Pie Chart */}
        <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} h-[400px] flex flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" /> Income vs Expense
          </h3>
          <div className="flex-1 relative min-h-0">
            <ResponsivePie
              data={pieData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.6}
              padAngle={2}
              cornerRadius={5}
              activeOuterRadiusOffset={8}
              colors={{ datum: 'data.color' }}
              borderWidth={0}
              enableArcLinkLabels={true}
              arcLinkLabelsTextColor="#9CA3AF"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#fff"
              theme={{
                tooltip: { container: { background: '#1e1e26', color: '#fff', fontSize: '13px', borderRadius: '8px' } }
              }}
            />
          </div>
        </div>

        {/* Transaction Calendar */}
        <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} h-[400px] flex flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl relative`}>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-400" /> Activity Calendar
          </h3>
          <div className="flex-1 relative min-h-0 overflow-y-auto custom-calendar-wrapper">
            <Calendar 
              tileContent={({ date, view }) => {
                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                const types = transactionDayTypes.get(localDate);
                if (view !== 'month' || !types) return null;
                const hasIncome = types.has('income');
                const hasExpense = types.has('expense');
                if (hasIncome && hasExpense) {
                  return <div className="w-3 h-3 rounded-full mx-auto mt-1" style={{ background: 'linear-gradient(135deg, #10B981 0%, #EF4444 100%)' }} />;
                }
                if (hasIncome) {
                  return <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mx-auto mt-1 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />;
                }
                return <div className="w-2.5 h-2.5 rounded-full bg-red-400 mx-auto mt-1 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />;
              }}
              onClickDay={(value: Date) => {
                const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                setSelectedDay(localDate);
              }}
              className={`w-full bg-transparent border-none text-white rounded-xl`}
            />

            {/* Day Detail Popup */}
            {selectedDay && (
              <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col p-5 overflow-y-auto animate-in fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-gray-300">
                    {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h4>
                  <button onClick={() => setSelectedDay(null)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {selectedDayTxs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No transactions on this day.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayTxs.map(tx => (
                      <div key={tx.id} className={`flex items-center justify-between p-3 rounded-xl ${tx.type === 'income' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{tx.description}</p>
                            <p className="text-[10px] text-gray-400 uppercase">{tx.category}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-black font-mono ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Movable Analytics Graph */}
        <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} h-[400px] flex flex-col lg:col-span-2 transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl`}>
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" /> Net Worth Timeline
          </h3>
          <div className="flex-1 relative min-h-0 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val: number) => String(val)} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e1e26', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBalance)" />
                <Brush dataKey="date" height={30} stroke="#4b5563" fill="#1e1e26" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
