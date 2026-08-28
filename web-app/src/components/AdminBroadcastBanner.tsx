import React, { useEffect, useState } from 'react';
import { database } from '../shared/firebase';
import { ref, onValue } from 'firebase/database';
import { Megaphone, X, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface BroadcastMessage {
  id?: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  active: boolean;
}

export const AdminBroadcastBanner: React.FC = () => {
  const [broadcast, setBroadcast] = useState<BroadcastMessage | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const broadcastRef = ref(database, 'admin_broadcast');
    const unsubscribe = onValue(broadcastRef, (snapshot) => {
      const val = snapshot.val();
      if (val && val.active) {
        setBroadcast(val);
        setDismissed(false);
      } else {
        setBroadcast(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!broadcast || !broadcast.active || dismissed) return null;

  const bgGradient = broadcast.type === 'warning'
    ? 'from-amber-600 via-orange-600 to-red-600 border-amber-400/40'
    : broadcast.type === 'success'
    ? 'from-emerald-600 via-teal-600 to-cyan-600 border-emerald-400/40'
    : 'from-purple-600 via-indigo-600 to-cyan-600 border-purple-400/40';

  const IconComponent = broadcast.type === 'warning' 
    ? AlertCircle 
    : broadcast.type === 'success' 
    ? CheckCircle2 
    : Megaphone;

  return (
    <div className="w-full relative z-40 animate-slideDown">
      <div className={`w-full pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 px-4 sm:px-6 bg-gradient-to-r ${bgGradient} text-white shadow-xl border-b flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-medium`}>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-1.5 rounded-xl bg-white/20 shrink-0 animate-bounce">
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded-full text-white/90">
                Official Announcement
              </span>
              <span className="font-black tracking-wide text-white">{broadcast.title}</span>
            </div>
            <p className="text-white/90 text-xs mt-0.5 leading-snug">{broadcast.message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          {broadcast.actionUrl && (
            <a
              href={broadcast.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white text-gray-900 hover:bg-white/90 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <span>{broadcast.actionText || 'Learn More'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Dismiss Announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
