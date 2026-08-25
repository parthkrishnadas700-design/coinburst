import React, { useState } from 'react';
import { Users, Plus, Trash2, MessageCircle } from 'lucide-react';
import { useFinanceStore } from '../shared/useFinanceStore';
import { useThemeStyles } from './DashboardWeb';
import { triggerHapticNotification, showNativeToast } from '../shared/nativeBridge';

export interface SplitMember {
  id: string;
  name: string;
  paidAmount: number;
}

export const GroupBillSplitter: React.FC = () => {
  const cStyles = useThemeStyles();
  const currency = useFinanceStore(state => state.currency);

  const [groupTitle, setGroupTitle] = useState('Goa Vacation 🌴');
  const [members, setMembers] = useState<SplitMember[]>([
    { id: '1', name: 'Parth (You)', paidAmount: 3000 },
    { id: '2', name: 'Rahul', paidAmount: 1000 },
    { id: '3', name: 'Aman', paidAmount: 500 }
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newPaidAmount, setNewPaidAmount] = useState('');

  const totalBill = members.reduce((sum, m) => sum + (m.paidAmount || 0), 0);
  const perPersonShare = members.length > 0 ? Math.round(totalBill / members.length) : 0;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember: SplitMember = {
      id: 'm_' + Math.random().toString(36).substring(2, 7),
      name: newMemberName.trim(),
      paidAmount: parseFloat(newPaidAmount) || 0
    };

    setMembers([...members, newMember]);
    setNewMemberName('');
    setNewPaidAmount('');
    triggerHapticNotification('success');
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    triggerHapticNotification('warning');
  };

  const handleShareWhatsApp = () => {
    let summaryText = `*${groupTitle} - Bill Split Summary* 🧾\n`;
    summaryText += `Total Bill: ${currency} ${totalBill.toLocaleString()}\n`;
    summaryText += `Per Person Share (${members.length} people): ${currency} ${perPersonShare.toLocaleString()}\n\n`;
    summaryText += `*Member Breakdown:*\n`;

    members.forEach(m => {
      const balance = m.paidAmount - perPersonShare;
      if (balance > 0) {
        summaryText += `• ${m.name}: Paid ${currency} ${m.paidAmount} → *Receives ${currency} ${balance}*\n`;
      } else if (balance < 0) {
        summaryText += `• ${m.name}: Paid ${currency} ${m.paidAmount} → *Owes ${currency} ${Math.abs(balance)}*\n`;
      } else {
        summaryText += `• ${m.name}: Paid ${currency} ${m.paidAmount} → *Settled ✓*\n`;
      }
    });

    summaryText += `\n_Calculated using CoinBurst AI Ledger_ 🚀`;

    const encoded = encodeURIComponent(summaryText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    triggerHapticNotification('success');
    showNativeToast('WhatsApp Settlement Summary Opened!');
  };

  return (
    <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} border border-cyan-500/20 space-y-6`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-lg shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400">
              Shared Expense Sentinel
            </span>
            <h3 className="text-lg font-black text-white tracking-wide mt-0.5">
              Group Bill Splitter & Settlement Calculator
            </h3>
          </div>
        </div>

        <button
          onClick={handleShareWhatsApp}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" /> Share Summary via WhatsApp
        </button>
      </div>

      {/* Group Title Input */}
      <div>
        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Group / Event Name</label>
        <input
          type="text"
          value={groupTitle}
          onChange={(e) => setGroupTitle(e.target.value)}
          className={`w-full p-3 rounded-xl border border-gray-700 ${cStyles.input} font-bold text-white text-sm focus:outline-none focus:border-cyan-400`}
        />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Group Bill</span>
          <span className="font-mono font-black text-lg text-emerald-400">{currency} {totalBill.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Group Size</span>
          <span className="font-mono font-black text-lg text-white">{members.length} People</span>
        </div>

        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
          <span className="text-[10px] uppercase font-bold text-cyan-300 block">Equal Share / Person</span>
          <span className="font-mono font-black text-lg text-cyan-400">{currency} {perPersonShare.toLocaleString()}</span>
        </div>
      </div>

      {/* Add Member Form */}
      <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Friend's Name (e.g. Rahul)"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          className={`flex-1 p-3 rounded-xl border border-gray-700 ${cStyles.input} font-bold text-white text-xs focus:outline-none focus:border-cyan-400`}
        />
        <input
          type="number"
          placeholder={`Amount Paid (${currency})`}
          value={newPaidAmount}
          onChange={(e) => setNewPaidAmount(e.target.value)}
          className={`w-full sm:w-44 p-3 rounded-xl border border-gray-700 ${cStyles.input} font-bold text-white text-xs focus:outline-none focus:border-cyan-400`}
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-bold text-white text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Person
        </button>
      </form>

      {/* Members Settlement List */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Group Settlement Breakdown</h4>
        {members.map(m => {
          const balance = m.paidAmount - perPersonShare;
          return (
            <div key={m.id} className={`p-4 rounded-xl flex items-center justify-between gap-4 ${cStyles.ledgerFeedBg}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">{m.name}</h5>
                  <span className="text-xs text-gray-400">Paid: {currency} {m.paidAmount}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Status</span>
                  {balance > 0 ? (
                    <span className="font-mono text-emerald-400 font-bold text-xs">Receives {currency} {balance}</span>
                  ) : balance < 0 ? (
                    <span className="font-mono text-pink-500 font-bold text-xs">Owes {currency} {Math.abs(balance)}</span>
                  ) : (
                    <span className="font-mono text-gray-400 font-bold text-xs">Settled ✓</span>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveMember(m.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Remove Member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
