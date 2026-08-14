import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './src/shared/firebase';
import { useFinanceStore } from './src/shared/useFinanceStore';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SecurityLockScreen } from './src/screens/SecurityLockScreen';

export default function App() {
  const [authReady, setAuthReady] = useState(false);

  const setUser = useFinanceStore(state => state.setUser);
  const user = useFinanceStore(state => state.user);
  const lockApp = useFinanceStore(state => state.lockApp);
  const loadSecuritySettings = useFinanceStore(state => state.loadSecuritySettings);

  const appState = useRef(AppState.currentState);

  // Load security settings and lock app on initial boot
  useEffect(() => {
    const bootSecurity = async () => {
      await loadSecuritySettings();
      lockApp();
    };
    bootSecurity();
  }, [loadSecuritySettings, lockApp]);

  // Listen to App State change (re-opening / returning from background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        lockApp();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [lockApp]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Wealth Builder',
          photoURL: firebaseUser.photoURL || undefined,
        });
        lockApp();
      } else {
        await setUser(null);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [setUser, lockApp]);

  if (!authReady) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00FF88" />
        <StatusBar style="light" />
      </View>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen />
        <SecurityLockScreen />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <AppNavigator />
      <SecurityLockScreen />
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#07050F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
