import React, { useState } from 'react';
import { ShieldAlert, KeyRound, CheckCircle, X, Lock } from 'lucide-react';
import { useFinanceStore } from '../shared/useFinanceStore';
import { triggerHapticNotification, showNativeToast } from '../shared/nativeBridge';
import { useScrollLock } from '../shared/useScrollLock';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // 🔒 Lock background scrolling completely when passcode modal is active
  useScrollLock(isOpen);

  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const currentUser = useFinanceStore(state => state.user);
  const setIsAdminUnlocked = useFinanceStore(state => state.setIsAdminUnlocked);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim();
    const email = (currentUser?.email || '').toLowerCase().trim();

    if (email !== 'parthkrishnadas700@gmail.com') {
      setError(true);
      setErrorMsg('Access Denied: Only parthkrishnadas700@gmail.com is authorized as Administrator.');
      triggerHapticNotification('error');
      return;
    }

    if (clean === 'cb1412') {
      setError(false);
      setErrorMsg('');
      setSuccess(true);
      setIsAdminUnlocked(true);
      triggerHapticNotification('success');
      showNativeToast('Admin Telemetry Console Unlocked');

      setTimeout(() => {
        setSuccess(false);
        setPasscode('');
        onSuccess();
        onClose();
      }, 600);
    } else {
      setError(true);
      setErrorMsg('Incorrect admin passcode. Access denied.');
      triggerHapticNotification('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0F0F17] border border-purple-500/40 shadow-2xl shadow-purple-500/10 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[2px] shadow-lg">
            <div className="w-full h-full bg-[#0B0B0F] rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Admin Passcode Required</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Enter the secret administrator passcode to unlock the <strong className="text-purple-400">Live User Directory & Telemetry Console</strong>.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">
              Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="password"
                required
                autoFocus
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(false);
                }}
                placeholder="Enter admin passcode..."
                className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm font-mono font-bold bg-[#141420] text-white border transition-all focus:outline-none ${
                  error 
                    ? 'border-red-500 text-red-400 animate-shake' 
                    : 'border-purple-500/40 focus:border-purple-400'
                }`}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg || 'Incorrect admin passcode. Access denied.'}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-pulse">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>✓ Passcode Accepted! Admin Console Unlocked.</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-xs font-bold text-gray-400 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg cursor-pointer"
            >
              Unlock Console
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
