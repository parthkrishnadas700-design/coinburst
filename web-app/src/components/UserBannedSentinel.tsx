import React, { useEffect, useState } from 'react';
import { database, signOutUser } from '../shared/firebase';
import { ref, onValue } from 'firebase/database';
import { useFinanceStore } from '../shared/useFinanceStore';
import { ShieldAlert, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UserBannedSentinel: React.FC = () => {
  const user = useFinanceStore((state) => state.user);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState<string>('Account access revoked by system administrator');

  useEffect(() => {
    if (!user?.uid) {
      setIsBanned(false);
      return;
    }

    const bannedRef = ref(database, `banned_users/${user.uid}`);
    const unsubscribe = onValue(bannedRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val && val.banned) {
          setIsBanned(true);
          if (val.reason) setBanReason(val.reason);
        } else {
          setIsBanned(false);
        }
      } else {
        setIsBanned(false);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      window.location.reload();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (!isBanned || !user) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl select-none pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1E080A] via-[#140608] to-[#0A0304] border border-red-500/50 shadow-[0_0_90px_rgba(239,68,68,0.4)] text-white text-center space-y-6 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-600/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Header */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-500 shadow-xl shadow-red-500/20 animate-bounce">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
              Access Revoked by Administrator
            </span>
            <h3 className="text-2xl font-black font-['Poppins'] tracking-tight text-white pt-1">
              Account Suspended
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed px-2">
              Your account access (<strong className="text-red-400 font-mono">{user.email}</strong>) has been removed by the CoinBurst system administrator.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-[11px] text-red-300 text-left space-y-1 font-mono">
            <div className="text-[10px] uppercase font-bold text-red-400">Notice Details:</div>
            <div>• Reason: {banReason}</div>
            <div>• Status: Forcibly Logged Out</div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-400 text-white font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_25px_rgba(239,68,68,0.5)] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
