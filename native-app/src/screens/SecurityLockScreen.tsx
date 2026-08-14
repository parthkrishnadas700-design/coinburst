import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useFinanceStore } from '../shared/useFinanceStore';

export const SecurityLockScreen: React.FC = () => {
  const { isLocked, verifyAndUnlock, unlockWithBiometric, isBiometricEnabled, user } = useFinanceStore();
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFingerprintAuth = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to access CoinBurst',
          fallbackLabel: 'Use PIN',
          cancelLabel: 'Cancel',
        });

        if (result.success) {
          unlockWithBiometric();
        }
      } else {
        // Simulated biometric unlock for emulator/dev
        unlockWithBiometric();
      }
    } catch (e) {
      console.log('Biometric auth error:', e);
      setErrorMessage('Biometric scan failed');
    }
  }, [unlockWithBiometric]);

  useEffect(() => {
    if (isLocked && isBiometricEnabled) {
      const timer = setTimeout(() => {
        handleFingerprintAuth();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLocked, isBiometricEnabled, handleFingerprintAuth]);

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (pinDigits.length >= 4) return;
    const newPin = [...pinDigits, num];
    setPinDigits(newPin);
    setErrorMessage('');

    if (newPin.length === 4) {
      const pinStr = newPin.join('');
      setTimeout(() => {
        const success = verifyAndUnlock(pinStr);
        if (!success) {
          setErrorMessage('Invalid Security PIN');
          setPinDigits([]);
        }
      }, 150);
    }
  };

  const handleDelete = () => {
    if (pinDigits.length > 0) {
      setPinDigits(prev => prev.slice(0, -1));
      setErrorMessage('');
    }
  };

  return (
    <Modal visible={isLocked} animationType="fade" transparent={false}>
      <View style={styles.container}>
        <LinearGradient colors={['#FF007F', '#00FF88', '#00E5FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoGradient}>
          <View style={styles.logoInner}>
            <Text style={styles.logoText}>CB</Text>
          </View>
        </LinearGradient>

        <Text style={styles.title}>CoinBurst Security Lock</Text>
        <Text style={styles.subtitle}>
          Logged in as <Text style={styles.userText}>{user?.displayName || 'Wealth Builder'}</Text>
        </Text>

        {/* 4 PIN Indicators */}
        <View style={styles.pinContainer}>
          {[0, 1, 2, 3].map((idx) => (
            <View
              key={idx}
              style={[
                styles.pinDot,
                idx < pinDigits.length ? styles.pinDotFilled : styles.pinDotEmpty
              ]}
            />
          ))}
        </View>

        {errorMessage !== '' && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        {/* Keypad Grid */}
        <View style={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <TouchableOpacity key={num} onPress={() => handleKeyPress(num)} style={styles.keyBtn} activeOpacity={0.7}>
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}

          {/* Fingerprint Scanner Button */}
          <TouchableOpacity onPress={handleFingerprintAuth} style={styles.fingerprintBtn} activeOpacity={0.7}>
            <Text style={styles.fingerprintIconText}>👆</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleKeyPress('0')} style={styles.keyBtn} activeOpacity={0.7}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} activeOpacity={0.7}>
            <Text style={styles.deleteText}>⌫</Text>
          </TouchableOpacity>
        </View>

        {/* Scan Fingerprint Bar */}
        <TouchableOpacity onPress={handleFingerprintAuth} style={styles.bioBar} activeOpacity={0.8}>
          <Text style={styles.bioBarText}>Scan Fingerprint to Unlock</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07050F', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  logoGradient: { width: 72, height: 72, borderRadius: 20, padding: 3 },
  logoInner: { flex: 1, backgroundColor: '#0B0B0F', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  title: { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 16 },
  subtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 4, marginBottom: 24 },
  userText: { color: '#00FF88', fontWeight: 'bold' },
  pinContainer: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  pinDot: { width: 16, height: 16, borderRadius: 8 },
  pinDotFilled: { backgroundColor: '#00FF88', shadowColor: '#00FF88', shadowRadius: 8, elevation: 4 },
  pinDotEmpty: { backgroundColor: '#1E1E26', borderWidth: 1, borderColor: '#374151' },
  errorText: { color: '#EF4444', fontSize: 13, fontWeight: 'bold', marginBottom: 12 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', width: 280, justifyContent: 'space-between', gap: 16 },
  keyBtn: { width: 75, height: 60, borderRadius: 16, backgroundColor: '#121218', borderWidth: 1, borderColor: '#2A2A36', justifyContent: 'center', alignItems: 'center' },
  keyText: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  fingerprintBtn: { width: 75, height: 60, borderRadius: 16, backgroundColor: 'rgba(0,255,136,0.15)', borderWidth: 1, borderColor: '#00FF88', justifyContent: 'center', alignItems: 'center' },
  fingerprintIconText: { fontSize: 24 },
  deleteBtn: { width: 75, height: 60, borderRadius: 16, backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  deleteText: { fontSize: 20, color: '#EF4444', fontWeight: 'bold' },
  bioBar: { marginTop: 28, width: 280, paddingVertical: 14, borderRadius: 14, backgroundColor: 'rgba(0,255,136,0.1)', borderWidth: 1, borderColor: 'rgba(0,255,136,0.3)', alignItems: 'center' },
  bioBarText: { color: '#00FF88', fontSize: 13, fontWeight: 'bold' },
});
