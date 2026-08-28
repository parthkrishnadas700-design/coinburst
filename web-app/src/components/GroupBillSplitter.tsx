import React, { useState, useEffect } from 'react';
import { Users, Trash2, MessageCircle, Copy, Key, RefreshCw, CheckCircle2, Edit3, Sparkles, UserPlus } from 'lucide-react';
import { database } from '../shared/firebase';
import { ref, onValue, set as firebaseSet } from 'firebase/database';
import { useFinanceStore } from '../shared/useFinanceStore';
import { useThemeStyles } from './DashboardWeb';
import { triggerHapticNotification, showNativeToast } from '../shared/nativeBridge';
import { sendLocalNotification } from '../shared/nativeNotifications';

export interface SplitMember {
  id: string;
  name: string;
  paidAmount: number;
}

export interface SharedGroupData {
  groupCode: string;
  groupTitle: string;
  settlementNotes: string;
  members: SplitMember[];
  updatedAt: string;
}

export const GroupBillSplitter: React.FC = () => {
  const cStyles = useThemeStyles();
  const currency = useFinanceStore(state => state.currency);
  const currentUser = useFinanceStore(state => state.user);

  const myName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'App User';
  const myUid = currentUser?.uid || 'user_' + Math.random().toString(36).substring(2, 7);

  // Group Unique Code System
  const [groupCode, setGroupCode] = useState<string>('CB-7890');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  
  // Group Event & Settlement Section Customization
  const [groupTitle, setGroupTitle] = useState('Group Vacation 🌴');
  const [settlementNotes, setSettlementNotes] = useState('Group Settlement Breakdown & Payment Balances');

  // Members (NO dummy/random default members!)
  const [members, setMembers] = useState<SplitMember[]>([
    { id: myUid, name: myName, paidAmount: 0 }
  ]);

  const [newMemberName, setNewMemberName] = useState('');
  const [newPaidAmount, setNewPaidAmount] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // 1. Listen to Real-time Firebase Sync & Auto-Add Joining User to Group
  useEffect(() => {
    if (!groupCode) return;

    const groupRef = ref(database, `shared_groups/${groupCode}`);
    const unsubscribe = onValue(groupRef, (snapshot) => {
      const val = snapshot.val() as SharedGroupData;
      if (val && val.groupTitle) {
        setGroupTitle(val.groupTitle);
        if (val.settlementNotes) setSettlementNotes(val.settlementNotes);
        
        let currentMembers: SplitMember[] = Array.isArray(val.members) ? val.members : [];
        
        // AUTO-JOIN: Check if current user is in members list. If not, auto-add!
        const existingMember = currentMembers.find(m => m.id === myUid || m.name.toLowerCase() === myName.toLowerCase());
        
        if (!existingMember && myName) {
          const autoJoinedMember: SplitMember = {
            id: myUid,
            name: myName,
            paidAmount: 0
          };
          currentMembers = [...currentMembers, autoJoinedMember];
          // Write updated members to Firebase
          firebaseSet(groupRef, {
            ...val,
            members: currentMembers,
            updatedAt: new Date().toISOString()
          }).catch(() => {});
          
          sendLocalNotification({
            title: '👥 Auto-Joined Group!',
            body: `You (${myName}) joined Group Code ${groupCode}`
          });
        }

        setMembers(currentMembers);
        setIsCloudSynced(true);
      } else {
        // Group Code doesn't exist in Firebase yet -> Initialize it with current user
        const initialMembers = [{ id: myUid, name: myName, paidAmount: 0 }];
        setMembers(initialMembers);
        firebaseSet(groupRef, {
          groupCode,
          groupTitle,
          settlementNotes,
          members: initialMembers,
          updatedAt: new Date().toISOString()
        }).catch(() => {});
        setIsCloudSynced(true);
      }
    });

    return () => unsubscribe();
  }, [groupCode, myUid, myName]);

  // Sync Local Changes to Firebase RTDB
  const syncToCloud = async (updatedTitle: string, updatedNotes: string, updatedMembers: SplitMember[]) => {
    if (!groupCode) return;
    try {
      const groupRef = ref(database, `shared_groups/${groupCode}`);
      await firebaseSet(groupRef, {
        groupCode,
        groupTitle: updatedTitle,
        settlementNotes: updatedNotes,
        members: updatedMembers,
        updatedAt: new Date().toISOString()
      });
      setIsCloudSynced(true);
    } catch (err) {
      console.error('[CoinBurst Group] Cloud Sync error:', err);
    }
  };

  const handleGenerateNewCode = () => {
    const freshCode = 'CB-' + Math.floor(1000 + Math.random() * 9000);
    const initialMembers = [{ id: myUid, name: myName, paidAmount: 0 }];
    setGroupCode(freshCode);
    setGroupTitle('New Group Event 🎉');
    setMembers(initialMembers);
    syncToCloud('New Group Event 🎉', settlementNotes, initialMembers);
    triggerHapticNotification('success');
    sendLocalNotification({
      title: '🔑 New Group Code Created!',
      body: `Group Code: ${freshCode}`
    });
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinCodeInput.trim().toUpperCase();
    if (!clean) return;

    const targetCode = clean.startsWith('CB-') ? clean : `CB-${clean}`;
    setGroupCode(targetCode);
    setJoinCodeInput('');
    triggerHapticNotification('success');
    sendLocalNotification({
      title: '🔑 Joined Group Code',
      body: `Switched active group to ${targetCode}`
    });
  };

  const handleTitleChange = (val: string) => {
    setGroupTitle(val);
    syncToCloud(val, settlementNotes, members);
  };

  const handleNotesChange = (val: string) => {
    setSettlementNotes(val);
    syncToCloud(groupTitle, val, members);
  };

  const handleMemberAmountChange = (memberId: string, newAmountStr: string) => {
    const val = parseFloat(newAmountStr) || 0;
    const targetMember = members.find(m => m.id === memberId);
    const updated = members.map(m => m.id === memberId ? { ...m, paidAmount: val } : m);
    setMembers(updated);
    syncToCloud(groupTitle, settlementNotes, updated);

    if (targetMember) {
      sendLocalNotification({
        title: '👥 Group Payment Updated',
        body: `${targetMember.name}: ${currency} ${val.toLocaleString()} recorded for ${groupCode}`
      });
    }
  };

  const handleAddManualMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember: SplitMember = {
      id: 'm_' + Math.random().toString(36).substring(2, 7),
      name: newMemberName.trim(),
      paidAmount: parseFloat(newPaidAmount) || 0
    };

    const updated = [...members, newMember];
    setMembers(updated);
    setNewMemberName('');
    setNewPaidAmount('');
    syncToCloud(groupTitle, settlementNotes, updated);
    triggerHapticNotification('success');

    sendLocalNotification({
      title: '👥 Friend Added to Group',
      body: `Added ${newMember.name} (Paid ${currency} ${newMember.paidAmount}) to ${groupCode}`
    });
  };

  const handleRemoveMember = (id: string) => {
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    syncToCloud(groupTitle, settlementNotes, updated);
    triggerHapticNotification('warning');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(groupCode);
    setCopiedCode(true);
    triggerHapticNotification('success');
    showNativeToast(`Group Code ${groupCode} copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWhatsApp = async () => {
    const appReferralUrl = 'https://coinburst-5bdc5.web.app';
    let summaryText = `*${groupTitle} - Group Bill Split* 🧾\n`;
    summaryText += `🔑 *Group Code:* \`${groupCode}\` (Enter in CoinBurst App to auto-join)\n`;
    summaryText += `💰 *Total Bill:* ${currency} ${totalBill.toLocaleString()}\n`;
    summaryText += `👤 *Per Person Share (${members.length} people):* ${currency} ${perPersonShare.toLocaleString()}\n\n`;
    summaryText += `*${settlementNotes}:*\n`;

    members.forEach(m => {
      const balance = m.paidAmount - perPersonShare;
      if (balance > 0) {
        summaryText += `• ${m.name}: Paid ${currency} ${m.paidAmount.toLocaleString()} → *Receives ${currency} ${balance.toLocaleString()}*\n`;
      } else if (balance < 0) {
        summaryText += `• ${m.name}: Paid ${currency} ${m.paidAmount.toLocaleString()} → *Owes ${currency} ${Math.abs(balance).toLocaleString()}*\n`;
      } else {
        summaryText += `• ${m.name}: Paid ${currency} ${m.paidAmount.toLocaleString()} → *Settled ✓*\n`;
      }
    });

    summaryText += `\n🚀 *Auto-Join Group in CoinBurst:* ${appReferralUrl}\n`;
    summaryText += `✨ *Referral Link (Track & Split Finances Free):* ${appReferralUrl}`;

    // Try Web Share API first for Android/iOS mobile devices (bypasses WebView ERR_UNKNOWN_URL_SCHEME)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${groupTitle} - Bill Split`,
          text: summaryText,
        });
        triggerHapticNotification('success');
        showNativeToast('Settlement summary shared successfully!');
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    // Fallback: Use wa.me link which works seamlessly in mobile browsers & WebViews
    const encoded = encodeURIComponent(summaryText);
    const whatsappWaUrl = `https://wa.me/?text=${encoded}`;
    const whatsappApiUrl = `https://api.whatsapp.com/send?text=${encoded}`;

    try {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = whatsappWaUrl;
      } else {
        window.open(whatsappApiUrl, '_blank');
      }
    } catch {
      window.open(whatsappApiUrl, '_blank');
    }

    triggerHapticNotification('success');
    showNativeToast('WhatsApp Settlement Summary Opened!');
  };

  const totalBill = members.reduce((sum, m) => sum + (m.paidAmount || 0), 0);
  const perPersonShare = members.length > 0 ? Math.round(totalBill / members.length) : 0;

  return (
    <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow} border border-cyan-500/20 space-y-6 select-none`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white shadow-lg shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400">
                Shared Expense Sentinel
              </span>
              {isCloudSynced && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3" /> Realtime Auto-Join Synced
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-white tracking-wide mt-0.5">
              Group Bill Splitter & Auto-Join Code System
            </h3>
          </div>
        </div>
      </div>

      {/* 🔑 Unique Group Code Bar */}
      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Active Group Code</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xl text-cyan-300 tracking-wider">{groupCode}</span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-400 transition-colors cursor-pointer"
                title="Copy Code"
              >
                {copiedCode ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Join Form */}
          <form onSubmit={handleJoinByCode} className="flex items-center gap-2 w-full">
            <input
              type="text"
              placeholder="Enter Code (e.g. CB-1234)"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              className="p-2.5 rounded-xl border border-gray-700 bg-[#0F0F17] font-mono font-bold text-white text-xs focus:outline-none focus:border-cyan-400 w-full sm:w-44 uppercase"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-bold text-white text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              Join Group
            </button>
          </form>

          <button
            onClick={handleGenerateNewCode}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors cursor-pointer shrink-0"
            title="Create New Group Code"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editable Group Title & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Group Event Title</label>
          <div className="relative">
            <Edit3 className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={groupTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-700 ${cStyles.input} font-bold text-white text-xs focus:outline-none focus:border-cyan-400`}
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Settlement Description</label>
          <input
            type="text"
            value={settlementNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className={`w-full px-3 py-2.5 rounded-xl border border-gray-700 ${cStyles.input} font-bold text-white text-xs focus:outline-none focus:border-cyan-400`}
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Group Expense</span>
          <span className="font-mono font-black text-lg text-emerald-400">{currency} {totalBill.toLocaleString()}</span>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Members</span>
          <span className="font-mono font-black text-lg text-cyan-400">{members.length} People</span>
        </div>

        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
          <span className="text-[10px] font-bold text-cyan-300 uppercase block">Fair Per-Person Share</span>
          <span className="font-mono font-black text-xl text-cyan-400">{currency} {perPersonShare.toLocaleString()}</span>
        </div>
      </div>

      {/* Add New Member Input Form */}
      <form onSubmit={handleAddManualMember} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          placeholder="Friend Name (e.g. Rahul)"
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
          <UserPlus className="w-4 h-4" /> Add Friend
        </button>
      </form>

      {/* Auto-Joined Members Settlement List */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase text-gray-300 tracking-wider flex items-center justify-between">
          <span>{settlementNotes}</span>
          <span className="text-[10px] text-cyan-400 font-mono font-bold">Live Auto-Joined Code: {groupCode}</span>
        </h4>

        {members.map(m => {
          const balance = m.paidAmount - perPersonShare;
          const isMe = m.id === myUid || m.name.toLowerCase() === myName.toLowerCase();
          return (
            <div key={m.id} className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${cStyles.ledgerFeedBg} ${isMe ? 'border border-cyan-500/40 bg-cyan-500/5' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center ${isMe ? 'bg-cyan-500 text-white shadow-md' : 'bg-white/10 text-cyan-400'}`}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-white">{m.name}</h5>
                    {isMe && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-black uppercase border border-cyan-500/30">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">Auto-joined via Code {groupCode}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-between sm:justify-end">
                {/* Editable Payment Input */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Paid:</span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{currency}</span>
                    <input
                      type="number"
                      step="any"
                      value={m.paidAmount || ''}
                      onChange={(e) => handleMemberAmountChange(m.id, e.target.value)}
                      placeholder="0"
                      className="w-24 pl-6 pr-2 py-1.5 rounded-lg border border-gray-700 bg-[#0F0F17] font-mono font-bold text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Status</span>
                  {balance > 0 ? (
                    <span className="font-mono text-emerald-400 font-bold text-xs">Receives {currency} {balance.toLocaleString()}</span>
                  ) : balance < 0 ? (
                    <span className="font-mono text-pink-500 font-bold text-xs">Owes {currency} {Math.abs(balance).toLocaleString()}</span>
                  ) : (
                    <span className="font-mono text-gray-400 font-bold text-xs">Settled ✓</span>
                  )}
                </div>

                {!isMe && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Remove Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* WhatsApp Share & Referral Action Footer Bar */}
      <div className="pt-4 border-t border-gray-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-xs text-gray-400">
          Total Bill: <strong className="text-white font-mono">{currency} {totalBill.toLocaleString()}</strong> ({members.length} members)
        </div>
        <button
          onClick={handleShareWhatsApp}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#07050F] font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,255,136,0.3)] transition-all cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-current" /> Share Summary & Referral Link via WhatsApp
        </button>
      </div>
    </div>
  );
};
