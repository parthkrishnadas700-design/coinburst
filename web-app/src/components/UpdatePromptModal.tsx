import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles, ShieldCheck, X, Zap } from 'lucide-react';
import { sendLocalNotification } from '../shared/nativeNotifications';
import { database } from '../shared/firebase';
import { ref, onValue } from 'firebase/database';

// Global helper to trigger update popup manually or via events
export const triggerAppUpdateModal = (reason = 'New version update available') => {
  window.dispatchEvent(new CustomEvent('coinburst-trigger-update', { detail: reason }));
};

export const UpdatePromptModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [updateReason, setUpdateReason] = useState<string>('New build deployment available');

  // PWA Service Worker auto-detection hook
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onNeedRefresh() {
      console.log('[PWA] Service worker update available!');
      setShowModal(true);
      setUpdateReason('New Service Worker build cached');
      sendLocalNotification({
        id: 99991,
        title: '🚀 CoinBurst App Update Available!',
        body: 'A new update is ready. Restart the application to apply the latest build.',
      });
    },
    onOfflineReady() {
      console.log('[PWA] Application is ready for offline usage.');
    },
  });

  // Listen to custom update triggers, 3-second build-meta polling, and Firebase Realtime version sentinel
  useEffect(() => {
    const handleCustomTrigger = (e: Event) => {
      const customEvt = e as CustomEvent;
      setUpdateReason(customEvt.detail || 'New feature release available');
      setShowModal(true);
    };

    window.addEventListener('coinburst-trigger-update', handleCustomTrigger);

    // Build Metadata Checker function (Cache-busted)
    const checkBuildMeta = async () => {
      try {
        const res = await fetch(`/build-meta.json?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });

        if (res.ok) {
          const data = await res.json();
          const lastVersion = localStorage.getItem('coinburst_installed_ver');
          const lastBuildTime = localStorage.getItem('coinburst_installed_build_time');

          if (data.version) {
            const hasNewVer = lastVersion && data.version !== lastVersion;
            const hasNewTime = lastBuildTime && data.buildTime && Number(data.buildTime) > Number(lastBuildTime);

            if (hasNewVer || hasNewTime) {
              console.log('[AutoUpdate] Ultra-fast deployment update detected:', data.version, data.buildTime);
              setShowModal(true);
              setUpdateReason(`Build v${data.version} (Code ${data.versionCode || 24}) deployed`);
              sendLocalNotification({
                id: 99992,
                title: `🚀 CoinBurst v${data.version} Update!`,
                body: 'A new update was deployed. Restart the app now to apply.',
              });
            } else {
              localStorage.setItem('coinburst_installed_ver', data.version);
              if (data.buildTime) {
                localStorage.setItem('coinburst_installed_build_time', String(data.buildTime));
              }
            }
          }
        }
      } catch (err) {
        console.warn('[AutoUpdate] Build meta fetch error:', err);
      }
    };

    // Run check immediately on mount
    checkBuildMeta();

    // Ultra-fast 3-second polling interval
    const interval = setInterval(checkBuildMeta, 3000);
    window.addEventListener('focus', checkBuildMeta);

    // Live Firebase Realtime Database Build & Version Sentinel (< 1 Sec WebSocket Push)
    const remoteMetaRef = ref(database, 'app_config/build_meta');
    const unsubscribeFirebase = onValue(remoteMetaRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.val();
        const remoteVer = remoteData?.version || remoteData;
        const remoteTime = remoteData?.buildTime;
        const lastVersion = localStorage.getItem('coinburst_installed_ver');
        const lastBuildTime = localStorage.getItem('coinburst_installed_build_time');

        const isNewVer = remoteVer && lastVersion && remoteVer !== lastVersion;
        const isNewTime = remoteTime && lastBuildTime && Number(remoteTime) > Number(lastBuildTime);

        if (isNewVer || isNewTime) {
          console.log('[FirebaseAutoUpdate] Live WebSocket update broadcast received:', remoteVer, remoteTime);
          setShowModal(true);
          setUpdateReason(`Live Broadcast v${remoteVer || '2.10.0'} active`);
        }
      }
    });

    return () => {
      window.removeEventListener('coinburst-trigger-update', handleCustomTrigger);
      window.removeEventListener('focus', checkBuildMeta);
      clearInterval(interval);
      unsubscribeFirebase();
    };
  }, []);

  const handleRestart = async () => {
    try {
      if (updateServiceWorker) {
        await updateServiceWorker(true);
      }
    } catch {}

    // Clear caches & force reload application
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      } catch {}
    }

    // Hard reload with cache clear
    window.location.href = window.location.pathname + '?t=' + Date.now();
  };

  if (!showModal && !needRefresh) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-md p-6 rounded-3xl bg-gradient-to-b from-[#120B29] via-[#0F0C20] to-[#07050F] border border-emerald-500/50 shadow-[0_0_60px_rgba(0,255,136,0.4)] text-white font-sans overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#00FF88]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#FF007F]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={() => {
              setShowModal(false);
              setNeedRefresh(false);
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00FF88] via-[#00E5FF] to-[#FF007F] p-[2px]">
              <div className="w-full h-full bg-[#0B0B0F] rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg">
                <RefreshCw className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
                <Zap className="w-3 h-3 text-emerald-400 animate-bounce" />
                <span>Instant Auto-Update Sentinel</span>
              </div>
              <h3 className="text-lg font-black font-['Poppins'] tracking-wide">
                Restart App to Apply Update
              </h3>
            </div>
          </div>

          {/* Body Content */}
          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            A new application deployment is ready for CoinBurst (<span className="text-emerald-400 font-mono font-bold">{updateReason}</span>). Please restart the application to apply the latest build, features, and security patches.
          </p>

          {/* Feature Badges */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 mb-6 text-[11px] text-emerald-300">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Includes Savings & Crazy Spenders Badges System</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-cyan-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Zero data loss — accounts and ledgers remain 100% intact</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-[#07050F] font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_20px_rgba(0,255,136,0.4)] cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Restart App Now
            </button>
            <button
              onClick={() => {
                setShowModal(false);
                setNeedRefresh(false);
              }}
              className="py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer text-center"
            >
              Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
