import React, { useState, useEffect } from 'react';
import coinburstLogo from '../assets/coinburst_logo.png';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { sendLocalNotification } from '../shared/nativeNotifications';
import { database } from '../shared/firebase';
import { ref, onValue } from 'firebase/database';
import { useFinanceStore } from '../shared/useFinanceStore';

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.coinburst.app';

// Global helper to trigger compulsory update popup manually or via events
export const triggerAppUpdateModal = (reason = 'New version update available') => {
  window.dispatchEvent(new CustomEvent('coinburst-trigger-update', { detail: reason }));
};

// Global helper to query current app update status
export const checkAppUpdateStatus = async (): Promise<{
  isUpdateAvailable: boolean;
  currentVersion: string;
  latestVersion?: string;
  buildTime?: number | string;
  reason?: string;
}> => {
  const currentVersion = localStorage.getItem('coinburst_installed_ver') || '2.28.0';
  const currentBuildTime = localStorage.getItem('coinburst_installed_build_time');

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
      const isNewVer = Boolean(data.version && data.version !== currentVersion);
      const isNewTime = Boolean(currentBuildTime && data.buildTime && Number(data.buildTime) > Number(currentBuildTime));

      if (isNewVer || isNewTime) {
        return {
          isUpdateAvailable: true,
          currentVersion,
          latestVersion: data.version || '2.28.0',
          buildTime: data.buildTime,
          reason: `Build v${data.version || '2.28.0'} Code ${data.versionCode || 41}`
        };
      }
    }
  } catch (err) {
    console.warn('[AutoUpdate] Build meta status fetch error:', err);
  }

  return {
    isUpdateAvailable: false,
    currentVersion,
    latestVersion: currentVersion,
  };
};

export const UpdatePromptModal: React.FC = () => {
  const user = useFinanceStore((state) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [isUpdatingDirectly, setIsUpdatingDirectly] = useState(false);
  const [updateReason, setUpdateReason] = useState<string>('New build deployment available');
  const pendingMetaRef = React.useRef<{ version?: string; buildTime?: number | string }>({});

  // PWA Service Worker auto-detection hook
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onNeedRefresh() {
      console.log('[PWA] Service worker update available!');
      setShowModal(true);
      setUpdateReason('New Service Worker build cached');
      sendLocalNotification({
        id: 99991,
        title: '🚀 CoinBurst App Update Required!',
        body: 'A critical update is ready. Update directly in-app or via Google Play Store.',
      });
    },
    onOfflineReady() {
      console.log('[PWA] Application is ready for offline usage.');
    },
  });

  // Listen to custom update triggers, build-meta polling, and Firebase Realtime version sentinel
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

          if (data.version && data.buildTime) {
            // First time running app: seed current version and build time
            if (!lastBuildTime && !lastVersion) {
              localStorage.setItem('coinburst_installed_ver', data.version);
              localStorage.setItem('coinburst_installed_build_time', String(data.buildTime));
              return;
            }

            const isNewVer = lastVersion && data.version !== lastVersion;
            const isNewTime = lastBuildTime && Number(data.buildTime) > Number(lastBuildTime);

            if (isNewVer || isNewTime) {
              pendingMetaRef.current = { version: data.version, buildTime: data.buildTime };
              console.log('[AutoUpdate] Deployment update detected:', data.version, data.buildTime);
              setShowModal(true);
              setUpdateReason(`Build v${data.version} (Code ${data.versionCode || 41}) deployed`);
              sendLocalNotification({
                id: 99992,
                title: `🚀 CoinBurst v${data.version} Mandatory Update!`,
                body: 'A critical update was deployed. Please update directly in-app or via Google Play Store.',
              });
            } else {
              localStorage.setItem('coinburst_installed_ver', data.version);
              localStorage.setItem('coinburst_installed_build_time', String(data.buildTime));
            }
          }
        }
      } catch (err) {
        console.warn('[AutoUpdate] Build meta fetch error:', err);
      }
    };

    // Run check immediately on mount
    checkBuildMeta();

    // 15-second polling interval
    const interval = setInterval(checkBuildMeta, 15000);
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
          pendingMetaRef.current = { version: remoteVer, buildTime: remoteTime };
          console.log('[FirebaseAutoUpdate] Live WebSocket update broadcast received:', remoteVer, remoteTime);
          setShowModal(true);
          setUpdateReason(`Live Broadcast v${remoteVer || '2.28.0'} active`);
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

  // 1. Functional Action 1: Update Directly in App (Instant Reload & Service Worker Refresh)
  const handleDirectAppUpdate = async () => {
    setIsUpdatingDirectly(true);
    if (pendingMetaRef.current.version) {
      localStorage.setItem('coinburst_installed_ver', String(pendingMetaRef.current.version));
    }
    if (pendingMetaRef.current.buildTime) {
      localStorage.setItem('coinburst_installed_build_time', String(pendingMetaRef.current.buildTime));
    }

    try {
      if (updateServiceWorker) {
        await updateServiceWorker(true);
      }
    } catch {}

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
    } catch (err) {
      console.warn('[AutoUpdate] Cache reset notice:', err);
    }

    const baseUrl = (window.location.origin && window.location.origin !== 'null') 
      ? (window.location.origin + window.location.pathname) 
      : window.location.pathname;
    window.location.href = baseUrl;
  };

  // 2. Functional Action 2: Update via Google Play Store Link
  const handlePlayStoreLinkUpdate = () => {
    if (pendingMetaRef.current.version) {
      localStorage.setItem('coinburst_installed_ver', String(pendingMetaRef.current.version));
    }
    if (pendingMetaRef.current.buildTime) {
      localStorage.setItem('coinburst_installed_build_time', String(pendingMetaRef.current.buildTime));
    }
    window.location.href = PLAY_STORE_URL;
  };

  if (!user || (!showModal && !needRefresh)) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-md p-6 rounded-3xl bg-gradient-to-b from-[#120B29] via-[#0F0C20] to-[#07050F] border border-emerald-500/50 shadow-[0_0_80px_rgba(0,255,136,0.5)] text-white font-sans overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#00FF88]/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#FF007F]/25 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00FF88] via-[#00E5FF] to-[#FF007F] p-[2px] shrink-0">
              <div className="w-full h-full bg-[#0B0B0F] rounded-2xl flex items-center justify-center p-1.5 overflow-hidden">
                <img src={coinburstLogo} alt="CoinBurst Logo" className="w-full h-full object-contain rounded-xl" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
                <Zap className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span>Mandatory App Update Required</span>
              </div>
              <h3 className="text-xl font-black font-['Poppins'] tracking-wide mt-0.5">
                Update CoinBurst Now
              </h3>
            </div>
          </div>

          {/* Body Content */}
          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            A critical update is available (<span className="text-emerald-400 font-mono font-bold">{updateReason}</span>). Please select an update option below to apply the latest build and security patches.
          </p>

          {/* Feature Badges */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 mb-6 text-[11px] text-emerald-300">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Includes Latest Features, Security & Speed Fixes</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Zero data loss — accounts and ledgers remain 100% intact</span>
            </div>
          </div>

          {/* Action Buttons: 2 Functional Update Options */}
          <div className="flex flex-col gap-3">
            {/* Button 1: Update Directly in App */}
            <button
              onClick={handleDirectAppUpdate}
              disabled={isUpdatingDirectly}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-[#07050F] font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_4px_25px_rgba(0,255,136,0.4)] cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdatingDirectly ? 'animate-spin' : ''}`} />
              <span>{isUpdatingDirectly ? 'Applying Direct Update...' : '1. Update Directly in App'}</span>
            </button>

            {/* Button 2: Update via Google Play Link */}
            <button
              onClick={handlePlayStoreLinkUpdate}
              disabled={isUpdatingDirectly}
              className="w-full py-3.5 px-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-cyan-500/40 text-cyan-300 font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>2. Update via Google Play Link</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400 ml-1" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


