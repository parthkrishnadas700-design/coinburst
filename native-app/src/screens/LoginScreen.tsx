import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signInAsGuest } from '../shared/firebase';

export const LoginScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuestEntry = async () => {
    setLoading(true);
    try {
      await signInAsGuest(name.trim() || 'Wealth Builder');
    } catch (e: any) {
      Alert.alert('Access Error', e.message || 'Failed to enter vault. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <LinearGradient colors={['#FF007F', '#00FF88', '#00E5FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoGradient}>
          <View style={styles.logoInner}>
            <Text style={styles.logoText}>CB</Text>
          </View>
        </LinearGradient>

        <Text style={styles.title}>CoinBurst</Text>
        <Text style={styles.subtitle}>Your Financial Nexus</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Unlock Your Vault</Text>
          <Text style={styles.cardSubtitle}>Direct guest access • Real-time cloud sync</Text>

          <TextInput
            style={styles.input}
            placeholder="Operative Name (e.g. Wealth Builder)"
            placeholderTextColor="#4B5563"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TouchableOpacity onPress={handleGuestEntry} disabled={loading} activeOpacity={0.8} style={{ width: '100%' }}>
            <LinearGradient colors={['#00FF88', '#00E5FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
              {loading ? (
                <ActivityIndicator color="#07050F" />
              ) : (
                <Text style={styles.btnText}>Enter Vault as Guest</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            No passwords or external accounts required. An encrypted ledger will be established for this device.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07050F' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  logoGradient: { width: 80, height: 80, borderRadius: 20, padding: 3 },
  logoInner: { flex: 1, backgroundColor: '#0B0B0F', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 16 },
  subtitle: { fontSize: 12, color: '#9CA3AF', letterSpacing: 3, textTransform: 'uppercase', marginTop: 4, marginBottom: 28 },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F0C20',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  cardSubtitle: { fontSize: 11, color: '#9CA3AF', marginBottom: 20, textAlign: 'center' },
  input: { 
    width: '100%', 
    backgroundColor: '#07050F', 
    borderWidth: 1, 
    borderColor: '#1E1E26', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    color: '#fff', 
    fontSize: 14, 
    marginBottom: 16 
  },
  btn: { width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#07050F', fontWeight: '900', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5 },
  footerNote: { fontSize: 10, color: '#6B7280', textAlign: 'center', marginTop: 16, lineHeight: 15 },
});
