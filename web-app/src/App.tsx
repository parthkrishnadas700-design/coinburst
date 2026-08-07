import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardWeb } from './components/DashboardWeb';
import { LandingPage } from './components/LandingPage';
import { AddTransactionWeb } from './components/AddTransactionWeb';
import { Layout } from './pages/Layout';
import { Dashboard } from './pages/Dashboard';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SecurityLockOverlay } from './components/SecurityLockOverlay';
import { auth } from './shared/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useFinanceStore } from './shared/useFinanceStore';
import type { Transaction } from './shared/useFinanceStore';

import { initNativeListeners, updateNativeStatusBar } from './shared/nativeBridge';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const setUser = useFinanceStore((state) => state.setUser);
  const user = useFinanceStore((state) => state.user);
  const theme = useFinanceStore((state) => state.theme);
  
  // Gamification + Recurring Backend Boot + Security Lock
  const processRecurringTransactions = useFinanceStore(state => state.processRecurringTransactions);
  const lockApp = useFinanceStore(state => state.lockApp);

  useEffect(() => {
    initNativeListeners();
  }, []);

  useEffect(() => {
    updateNativeStatusBar(theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Wealth Builder',
          photoURL: firebaseUser.photoURL || undefined,
          selectedTheme: useFinanceStore.getState().theme,
        });
        
        // Boot up systems & security lock
        processRecurringTransactions?.();
        lockApp();
        setShowWelcome(true);
      } else {
        await setUser(null);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [setUser, processRecurringTransactions, lockApp]);

  if (!authReady) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#07050F]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF007F] via-[#00FF88] to-[#00E5FF] p-[2px] animate-pulse">
            <div className="w-full h-full bg-[#0B0B0F] rounded-2xl flex items-center justify-center">
              <span className="font-['Poppins'] font-black text-2xl text-white">CB</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="w-6 h-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Initializing Nexus...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <BrowserRouter>
      <div className="w-full min-h-screen">
        {showWelcome && (
          <WelcomeScreen
            userName={user.displayName || user.email || 'Explorer'}
            onComplete={() => setShowWelcome(false)}
          />
        )}
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            {/* Map legacy routes back into DashboardWeb which acts as a sub-router container */}
            <Route path="transactions" element={<DashboardWeb activePage="transactions" onNavigate={() => {}} onOpenForm={() => { setIsFormOpen(true); setEditingTx(null); }} onEditTransaction={(tx) => { setEditingTx(tx); setIsFormOpen(true); }} />} />
            <Route path="budgets" element={<DashboardWeb activePage="budgets" onNavigate={() => {}} onOpenForm={() => {}} onEditTransaction={() => {}} />} />
            <Route path="settings" element={<DashboardWeb activePage="settings" onNavigate={() => {}} onOpenForm={() => {}} onEditTransaction={() => {}} />} />
            <Route path="ai" element={<DashboardWeb activePage="ai" onNavigate={() => {}} onOpenForm={() => {}} onEditTransaction={() => {}} />} />
            <Route path="about" element={<DashboardWeb activePage="about" onNavigate={() => {}} onOpenForm={() => {}} onEditTransaction={() => {}} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        
        <AddTransactionWeb
          isOpen={isFormOpen}
          transactionToEdit={editingTx}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTx(null);
          }}
        />

        <SecurityLockOverlay />
      </div>
    </BrowserRouter>
  );
}

export default App;
