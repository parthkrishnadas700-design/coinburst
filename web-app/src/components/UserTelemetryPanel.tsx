import React, { useEffect, useState } from 'react';
import { database } from '../shared/firebase';
import { ref, onValue, set as firebaseSet, update as firebaseUpdate, remove as firebaseRemove } from 'firebase/database';
import { Users, Smartphone, Globe, RefreshCw, Search, Clock, Megaphone, Send, Trash2, UserX, CheckCircle2 } from 'lucide-react';
import { useThemeStyles } from './DashboardWeb';
import { useFinanceStore } from '../shared/useFinanceStore';
import { triggerHapticNotification, showNativeToast } from '../shared/nativeBridge';

export interface TelemetryUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  theme?: string;
  currency?: string;
  accountCount?: number;
  txCount?: number;
  totalBalance?: number;
  lastActive?: string;
  platform?: string;
  status?: string;
}

export const UserTelemetryPanel: React.FC = () => {
  const cStyles = useThemeStyles();
  const [users, setUsers] = useState<TelemetryUser[]>([]);
  const [bannedMap, setBannedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = useFinanceStore(state => state.user);
  const accounts = useFinanceStore(state => state.accounts);
  const transactions = useFinanceStore(state => state.transactions);

  useEffect(() => {
    // 0. Immediately push current user to telemetry node if not banned
    if (currentUser) {
      const telemetryRef = ref(database, `user_telemetry/${currentUser.uid}`);
      const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
      const isAndroid = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform();
      firebaseUpdate(telemetryRef, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'CoinBurst User',
        email: currentUser.email || 'Registered User',
        photoURL: currentUser.photoURL || '',
        accountCount: accounts.length,
        txCount: transactions.length,
        totalBalance,
        lastActive: new Date().toISOString(),
        platform: isAndroid ? 'Android App' : 'Web Browser'
      }).catch(() => {});
    }

    // 1. Listen to user_telemetry node
    const telemetryRef = ref(database, 'user_telemetry');
    const unsubscribeTelemetry = onValue(telemetryRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const userList: TelemetryUser[] = Object.values(val);
        setUsers(userList);
      } else if (currentUser) {
        const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
        const isAndroid = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform();
        setUsers([{
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'CoinBurst User',
          email: currentUser.email || 'Registered User',
          photoURL: currentUser.photoURL || '',
          accountCount: accounts.length,
          txCount: transactions.length,
          totalBalance,
          lastActive: new Date().toISOString(),
          platform: isAndroid ? 'Android App' : 'Web Browser'
        }]);
      }
      setLoading(false);
    });

    // 2. Listen to banned_users node in Realtime DB
    const bannedRef = ref(database, 'banned_users');
    const unsubscribeBanned = onValue(bannedRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const map: Record<string, boolean> = {};
        Object.keys(val).forEach((uid) => {
          if (val[uid]?.banned) {
            map[uid] = true;
          }
        });
        setBannedMap(map);
      } else {
        setBannedMap({});
      }
    });

    return () => {
      unsubscribeTelemetry();
      unsubscribeBanned();
    };
  }, [currentUser, accounts, transactions]);

  // Admin Action: Remove & Revoke User Access
  const handleRemoveUser = async (targetUser: TelemetryUser) => {
    if (window.confirm(`Are you sure you want to REMOVE and REVOKE access for user:\n\n${targetUser.displayName} (${targetUser.email})\n\nThey will be forcibly logged out and banned from CoinBurst.`)) {
      try {
        // Mark as banned in Firebase banned_users node
        const userBannedRef = ref(database, `banned_users/${targetUser.uid}`);
        await firebaseSet(userBannedRef, {
          banned: true,
          bannedAt: new Date().toISOString(),
          displayName: targetUser.displayName,
          email: targetUser.email,
          revokedBy: currentUser?.email || 'Admin'
        });

        // Remove from active user_telemetry node
        const telemetryUserRef = ref(database, `user_telemetry/${targetUser.uid}`);
        await firebaseRemove(telemetryUserRef);

        triggerHapticNotification('success');
        showNativeToast(`User ${targetUser.displayName} access revoked!`);
      } catch (err) {
        console.error('User removal error:', err);
        showNativeToast('User removal error');
      }
    }
  };

  // Admin Action: Restore / Unban User Access
  const handleRestoreUser = async (targetUser: TelemetryUser) => {
    try {
      const userBannedRef = ref(database, `banned_users/${targetUser.uid}`);
      await firebaseRemove(userBannedRef);

      triggerHapticNotification('success');
      showNativeToast(`User ${targetUser.displayName} access restored!`);
    } catch (err) {
      console.error('User restore error:', err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.platform && u.platform.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const androidCount = users.filter(u => u.platform === 'Android App').length;
  const webCount = users.filter(u => u.platform !== 'Android App').length;

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Recently Active';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className={`p-6 rounded-2xl ${cStyles.cardBg} ${cStyles.shadow}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-wide">Live User Telemetry & Active Users Directory</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold uppercase border border-emerald-500/20">
                Admin Console
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Live monitoring, access control, user revocation & remote broadcast.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user name or email..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-bold border border-gray-700 ${cStyles.input} focus:outline-none focus:border-purple-400`}
            />
          </div>
          <button
            onClick={() => useFinanceStore.getState().setIsAdminUnlocked(false)}
            className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-red-500/20 transition-colors cursor-pointer shrink-0"
            title="Hide & Lock Admin Telemetry Console"
          >
            🔒 Lock Console
          </button>
        </div>
      </div>

      {/* 📢 Admin Remote Broadcast Publisher */}
      <AdminBroadcastPublisher />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-xl border ${cStyles.ledgerFeedBg} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">Total Active Users</span>
            <span className="text-2xl font-mono font-black text-purple-400 mt-1 block">{users.length}</span>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${cStyles.ledgerFeedBg} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">Android Mobile Users</span>
            <span className="text-2xl font-mono font-black text-emerald-400 mt-1 block">{androidCount}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${cStyles.ledgerFeedBg} flex items-center justify-between`}>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">Web Browser Users</span>
            <span className="text-2xl font-mono font-black text-cyan-400 mt-1 block">{webCount}</span>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
            <Globe className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* User Directory Table / List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
          <span className="text-xs font-bold">Connecting to Firebase Live Telemetry...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-xs font-semibold">
          No matching active users found in directory.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => {
            const isUserBanned = Boolean(bannedMap[u.uid]);
            return (
              <div
                key={u.uid}
                className={`p-4 rounded-xl border transition-all duration-300 hover:border-purple-500/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  isUserBanned ? 'bg-red-950/20 border-red-500/40' : cStyles.ledgerFeedBg
                }`}
              >
                {/* User Avatar & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {u.photoURL ? (
                    <img
                      src={u.photoURL}
                      alt={u.displayName}
                      className="w-11 h-11 rounded-full object-cover border-2 border-purple-500/40 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm border-2 border-purple-500/40 shrink-0">
                      {u.displayName ? u.displayName.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-200 truncate">{u.displayName}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                        u.platform === 'Android App' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {u.platform === 'Android App' ? <Smartphone className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                        {u.platform || 'Web App'}
                      </span>

                      {isUserBanned && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 shrink-0 animate-pulse">
                          ⛔ Access Revoked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                </div>

                {/* Stats, Last Active & Admin Actions */}
                <div className="flex flex-wrap items-center gap-4 text-xs shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-800/60">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Ledger Stats</span>
                    <span className="font-mono font-bold text-gray-200">
                      {u.accountCount || 0} Wallets • {u.txCount || 0} Txns
                    </span>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Last Active</span>
                    <span className="font-mono text-purple-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 inline" /> {formatDate(u.lastActive)}
                    </span>
                  </div>

                  {/* Admin User Control Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isUserBanned ? (
                      <button
                        onClick={() => handleRestoreUser(u)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Restore User Access"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Restore Access
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRemoveUser(u)}
                        disabled={currentUser?.uid === u.uid}
                        className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title={currentUser?.uid === u.uid ? "Cannot revoke your own active admin session" : "Forcibly Revoke Access & Remove User"}
                      >
                        <UserX className="w-3.5 h-3.5" /> Remove User
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AdminBroadcastPublisher: React.FC = () => {
  const cStyles = useThemeStyles();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning'>('info');
  const [actionUrl, setActionUrl] = useState('');
  const [activeBroadcast, setActiveBroadcast] = useState<any>(null);

  useEffect(() => {
    const broadcastRef = ref(database, 'admin_broadcast');
    const unsubscribe = onValue(broadcastRef, (snapshot) => {
      const val = snapshot.val();
      setActiveBroadcast(val && val.active ? val : null);
    });
    return () => unsubscribe();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      const broadcastRef = ref(database, 'admin_broadcast');
      await firebaseSet(broadcastRef, {
        title: title.trim(),
        message: message.trim(),
        type,
        actionUrl: actionUrl.trim() || null,
        actionText: actionUrl.trim() ? 'Learn More' : null,
        createdAt: new Date().toISOString(),
        active: true
      });

      // Push real-time build sentinel update to trigger auto-update prompt on all devices
      const buildMetaRef = ref(database, 'app_config/build_meta');
      await firebaseSet(buildMetaRef, {
        version: '2.20.0',
        versionCode: 33,
        buildTime: Date.now()
      });

      triggerHapticNotification('success');
      showNativeToast('Broadcast Published to All App Users!');
      setTitle('');
      setMessage('');
      setActionUrl('');
    } catch (err) {
      console.error('Broadcast failed:', err);
      showNativeToast('Publish Error');
    }
  };

  const handleClear = async () => {
    try {
      const broadcastRef = ref(database, 'admin_broadcast');
      await firebaseSet(broadcastRef, { active: false });
      triggerHapticNotification('success');
      showNativeToast('Broadcast Cleared');
    } catch (err) {
      console.error('Clear failed:', err);
    }
  };

  return (
    <div className={`p-5 rounded-xl ${cStyles.ledgerFeedBg} border border-purple-500/30 mb-6 space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-purple-400 animate-bounce" />
          <h4 className="font-black text-sm text-white tracking-wide">Publish Global Remote Announcement</h4>
        </div>
        {activeBroadcast && (
          <button
            onClick={handleClear}
            className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1 hover:bg-red-500/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Live Notice
          </button>
        )}
      </div>

      {activeBroadcast && (
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
          <span className="font-bold text-white uppercase tracking-wider text-[10px] block">Currently Live on All App Devices:</span>
          <strong>{activeBroadcast.title}</strong>: {activeBroadcast.message}
        </div>
      )}

      <form onSubmit={handlePublish} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Announcement Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. System Maintenance / New Feature v2.6 Released!"
            className={`w-full p-2.5 rounded-lg border border-gray-700 ${cStyles.input} font-bold text-white focus:outline-none focus:border-purple-400`}
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Notice Banner Style</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className={`w-full p-2.5 rounded-lg border border-gray-700 ${cStyles.input} font-bold text-white focus:outline-none focus:border-purple-400`}
          >
            <option value="info">Purple Cyan Info Banner</option>
            <option value="success">Emerald Teal Success Banner</option>
            <option value="warning">Amber Red Alert Banner</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Announcement Message</label>
          <textarea
            required
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write the live message broadcast to be displayed to all online web & mobile users..."
            className={`w-full p-2.5 rounded-lg border border-gray-700 ${cStyles.input} font-bold text-white focus:outline-none focus:border-purple-400`}
          />
        </div>

        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Optional Action URL Link</label>
            <input
              type="url"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="https://coinburst-5bdc5.web.app (Optional link for Learn More button)"
              className={`w-full p-2.5 rounded-lg border border-gray-700 ${cStyles.input} font-bold text-white focus:outline-none focus:border-purple-400`}
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-white text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" /> Publish Broadcast Live
          </button>
        </div>
      </form>
    </div>
  );
};
