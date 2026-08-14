import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useFinanceStore, SUPPORTED_CURRENCIES, ThemeType } from '../shared/useFinanceStore';
import { getThemeColors } from '../theme/colors';
import { signOutUser } from '../shared/firebase';

export const SettingsScreen: React.FC = () => {
  const { 
    user, theme, setTheme, currency, setCurrency,
    isPinEnabled, isBiometricEnabled, setSecurityPin, setBiometricEnabled, lockApp
  } = useFinanceStore();
  const c = getThemeColors(theme);

  const [pinInput, setPinInput] = useState('');

  const themes: { id: ThemeType; label: string; desc: string }[] = [
    { id: 'dark', label: 'Cyber Dark', desc: 'Sleek dark theme with neon emerald accents' },
    { id: 'cyberpunk', label: 'Cyberpunk 2077', desc: 'High contrast yellow & hot pink neon vibe' },
    { id: 'synthwave', label: 'Synthwave 80s', desc: 'Retro neon cyan & purple palette' },
  ];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOutUser() }
    ]);
  };

  const handleSavePin = () => {
    if (pinInput.length === 4) {
      setSecurityPin(pinInput);
      setPinInput('');
      Alert.alert('Success', '4-Digit Security PIN saved successfully!');
    } else {
      Alert.alert('Error', 'Please enter a 4-digit PIN');
    }
  };

  const handleDisablePin = () => {
    setSecurityPin(null);
    setPinInput('');
    Alert.alert('Disabled', 'Security PIN has been removed.');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.bg }]} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={[styles.headerLabel, { color: c.textMuted }]}>PREFERENCES</Text>
        <Text style={[styles.headerTitle, { color: c.text }]}>Settings</Text>
      </View>

      {/* User Info */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>👤 Account Profile</Text>
        <Text style={[styles.userText, { color: c.text }]}>{user?.displayName || 'Wealth Builder'}</Text>
        <Text style={{ color: c.textMuted, fontSize: 12 }}>{user?.email}</Text>
      </View>

      {/* Security & Fingerprint Lock */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>🛡️ Security & Biometrics</Text>
          {(isPinEnabled || isBiometricEnabled) && (
            <TouchableOpacity onPress={lockApp} style={styles.lockNowBtn}>
              <Text style={styles.lockNowText}>Lock App Now</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Fingerprint Lock Toggle */}
        <TouchableOpacity 
          onPress={() => setBiometricEnabled(!isBiometricEnabled)}
          style={[styles.secRow, { backgroundColor: isBiometricEnabled ? c.accent + '20' : c.input, borderColor: isBiometricEnabled ? c.accent : 'transparent' }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.secLabel, { color: isBiometricEnabled ? c.accent : c.text }]}>
              👆 Fingerprint / Biometric Lock
            </Text>
            <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 2 }}>
              Automatically prompt fingerprint scan on app open/resume
            </Text>
          </View>
          <Text style={{ color: isBiometricEnabled ? c.accent : c.textMuted, fontWeight: '900', fontSize: 12 }}>
            {isBiometricEnabled ? '✓ ENABLED' : 'DISABLED'}
          </Text>
        </TouchableOpacity>

        {/* PIN Lock Setup */}
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
            4-Digit Passcode: {isPinEnabled ? '✓ ENABLED' : 'NOT SET'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={[styles.pinInput, { backgroundColor: c.input, color: c.text }]}
              placeholder="4-digit PIN"
              placeholderTextColor={c.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={pinInput}
              onChangeText={text => setPinInput(text.replace(/\D/g, ''))}
            />
            <TouchableOpacity onPress={handleSavePin} style={[styles.pinBtn, { backgroundColor: c.accent }]}>
              <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 12 }}>
                {isPinEnabled ? 'Update' : 'Set PIN'}
              </Text>
            </TouchableOpacity>
            {isPinEnabled && (
              <TouchableOpacity onPress={handleDisablePin} style={[styles.pinBtn, { backgroundColor: '#EF444420' }]}>
                <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 12 }}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Theme Selector */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>🎨 Theme Engine</Text>
        {themes.map(t => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setTheme(t.id)}
            style={[
              styles.themeOption,
              { backgroundColor: theme === t.id ? c.accent + '20' : c.input, borderColor: theme === t.id ? c.accent : 'transparent' }
            ]}
          >
            <View>
              <Text style={[styles.themeLabel, { color: theme === t.id ? c.accent : c.text }]}>{t.label}</Text>
              <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 2 }}>{t.desc}</Text>
            </View>
            {theme === t.id && <Text style={{ color: c.accent, fontWeight: 'bold' }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Currency Selector */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>💱 Preferred Currency</Text>
        <View style={styles.currencyGrid}>
          {SUPPORTED_CURRENCIES.map(curr => (
            <TouchableOpacity
              key={curr.code}
              onPress={() => setCurrency(curr.code)}
              style={[
                styles.currBtn,
                { backgroundColor: currency === curr.code ? c.accent : c.input }
              ]}
            >
              <Text style={{ color: currency === curr.code ? '#000' : c.text, fontWeight: '900', fontSize: 14 }}>
                {curr.symbol} {curr.code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Sign Out of Nexus</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 16, paddingBottom: 8 },
  headerLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase' },
  headerTitle: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  card: { borderRadius: 16, padding: 20, borderWidth: 1, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 12 },
  userText: { fontSize: 18, fontWeight: '800' },
  secRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1 },
  secLabel: { fontSize: 13, fontWeight: '800' },
  lockNowBtn: { backgroundColor: '#00FF8820', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  lockNowText: { color: '#00FF88', fontWeight: 'bold', fontSize: 11 },
  pinInput: { flex: 1, height: 42, borderRadius: 10, paddingHorizontal: 12, fontSize: 14, fontWeight: 'bold' },
  pinBtn: { height: 42, paddingHorizontal: 14, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  themeOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  themeLabel: { fontSize: 14, fontWeight: '800' },
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  currBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, flex: 1, minWidth: 100, alignItems: 'center' },
  logoutBtn: { backgroundColor: '#EF444420', borderWidth: 1, borderColor: '#EF4444', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  logoutText: { color: '#EF4444', fontWeight: '900', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2 },
});
