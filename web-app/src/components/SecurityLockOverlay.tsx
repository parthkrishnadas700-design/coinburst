import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Delete } from 'lucide-react';
import { useFinanceStore } from '../shared/useFinanceStore';
import { triggerHaptic } from '../shared/nativeBridge';

export const SecurityLockOverlay: React.FC = () => {
  const { isLocked, verifyAndUnlock, user } = useFinanceStore();

  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [errorShake, setErrorShake] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (pinDigits.length >= 4) return;
    triggerHaptic('light');

    const newPin = [...pinDigits, num];
    setPinDigits(newPin);
    setErrorMessage('');

    if (newPin.length === 4) {
      const pinStr = newPin.join('');
      setTimeout(() => {
        const success = verifyAndUnlock(pinStr);
        if (!success) {
          setErrorShake(true);
          setErrorMessage('Invalid Security PIN');
          setPinDigits([]);
          setTimeout(() => setErrorShake(false), 500);
        }
      }, 150);
    }
  };

  const handleDelete = () => {
    if (pinDigits.length > 0) {
      triggerHaptic('light');
      setPinDigits(prev => prev.slice(0, -1));
      setErrorMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07050F]/95 backdrop-blur-2xl">
      <motion.div
        animate={errorShake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm p-8 rounded-3xl bg-[#0B0B0F] border border-gray-800 shadow-2xl flex flex-col items-center text-center space-y-6"
      >
        {/* App Logo & Lock Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF007F] via-[#00FF88] to-[#00E5FF] p-[2px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0B0B0F] rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-xs">
            <Shield className="w-3.5 h-3.5 fill-black" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black text-white tracking-tight">CoinBurst Security Lock</h2>
          <p className="text-xs text-gray-400 mt-1">
            Logged in as <strong className="text-emerald-400">{user?.displayName || 'Explorer'}</strong>
          </p>
        </div>

        {/* 4 PIN Indicators */}
        <div className="flex gap-4 my-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = idx < pinDigits.length;
            return (
              <motion.div
                key={idx}
                animate={{ scale: isFilled ? 1.2 : 1 }}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  isFilled
                    ? 'bg-emerald-400 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                    : 'bg-white/5 border-gray-700'
                }`}
              />
            );
          })}
        </div>

        {errorMessage && (
          <p className="text-xs font-bold text-red-400 font-mono tracking-wide animate-pulse">
            {errorMessage}
          </p>
        )}

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-4 w-full pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-white/5 hover:bg-white/15 text-white font-mono font-black text-xl border border-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/15 text-white font-mono font-black text-xl border border-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            title="Delete digit"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold pt-2">
          Protected with Passcode Hashing
        </p>
      </motion.div>
    </div>
  );
};
