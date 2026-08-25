import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, AlertTriangle } from 'lucide-react';
import { useScrollLock } from '../shared/useScrollLock';
import { triggerHapticNotification, showNativeToast } from '../shared/nativeBridge';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({ isOpen, onClose }) => {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const handleConfirmExit = () => {
    triggerHapticNotification('warning');
    showNativeToast('Exiting CoinBurst...');
    
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.exitApp();
    } else {
      window.location.href = '/landing';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-sm p-6 rounded-3xl bg-[#0F0F17] border border-red-500/40 shadow-2xl shadow-red-500/10 space-y-5 text-center modal-scroll-lock"
          >
            {/* Warning Icon */}
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-7 h-7 animate-pulse" />
            </div>

            {/* Header Text */}
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white tracking-tight">Exit CoinBurst?</h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                Are you sure you want to leave your active financial workspace? Your local ledger & sync state remain safe.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/20 cursor-pointer transition-all"
              >
                <LogOut className="w-4 h-4" /> Exit App
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
