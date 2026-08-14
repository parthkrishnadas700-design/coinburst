import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './src/shared/firebase';
import { useFinanceStore } from './src/shared/useFinanceStore';
import { LoginScreen } from './src/screens/LoginScreen';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const [authReady, setAuthReady] = useState(false);

  const setUser = useFinanceStore(state => state.setUser);
  const user = useFinanceStore(state => state.user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Wealth Builder',
          photoURL: firebaseUser.photoURL || undefined,
        });
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [setUser]);

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
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <AppNavigator />
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
