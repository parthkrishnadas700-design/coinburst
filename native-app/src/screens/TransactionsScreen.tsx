import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Modal, ScrollView, Alert, Platform
} from 'react-native';
import { useFinanceStore, formatCurrency } from '../shared/useFinanceStore';
import { getThemeColors } from '../theme/colors';

export const TransactionsScreen: React.FC = () => {
  const { transactions, accounts, addTransaction, deleteTransaction, addAccount, theme, currency } = useFinanceStore();
  const c = getThemeColors(theme);
  const fmt = (val: number) => formatCurrency(val, currency);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-newest' | 'date-oldest' | 'amount-high' | 'amount-low'>('date-newest');

  // Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Food');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');

  // Add Wallet Modal State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState<'cash' | 'bank' | 'credit'>('bank');
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const [newWalletColor, setNewWalletColor] = useState('#00FF88');

  const categories = ['Food', 'Bills', 'Shopping', 'Salary', 'Investment', 'Entertainment', 'Transport', 'Other'];
  const walletTypes: ('cash' | 'bank' | 'credit')[] = ['bank', 'cash', 'credit'];
  const walletColors = ['#00FF88', '#00E5FF', '#FF007F', '#FFE600', '#A855F7', '#F97316'];
  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category)));

  // Computed & filtered transactions
  const filteredTxs = transactions
    .filter(t => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || String(t.amount).includes(q);
    })
    .filter(t => filterType === 'all' ? true : t.type === filterType)
    .filter(t => filterCategory === 'all' ? true : t.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'date-newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-oldest') return new Date(a.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'amount-high') return b.amount - a.amount;
      if (sortBy === 'amount-low') return a.amount - b.amount;
      return 0;
    });

  const handleAddTransaction = () => {
    if (!description || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return Alert.alert('Invalid Input', 'Please enter a valid description and positive amount.');
    }
    const targetAccountId = accountId || accounts[0]?.id;
    if (!targetAccountId) {
      return Alert.alert('No Account', 'Please create a wallet first.');
    }

    addTransaction({
      description,
      amount: Number(amount),
      type: txType,
      category,
      accountId: targetAccountId,
      date: new Date().toISOString(),
    });

    setDescription('');
    setAmount('');
    setIsModalOpen(false);
  };

  const handleCreateWallet = () => {
    if (!newWalletName.trim()) {
      return Alert.alert('Invalid Input', 'Please enter a wallet name.');
    }
    const balanceNum = parseFloat(newWalletBalance) || 0;
    addAccount({
      name: newWalletName.trim(),
      type: newWalletType,
      balance: balanceNum,
      color: newWalletColor,
    });
    setNewWalletName('');
    setNewWalletBalance('');
    setIsWalletModalOpen(false);
    Alert.alert('Success', `Wallet "${newWalletName.trim()}" created successfully!`);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerLabel, { color: c.textMuted }]}>LEDGER FEED</Text>
        <Text style={[styles.headerTitle, { color: c.text }]}>Transactions</Text>
      </View>

      {/* Search Input */}
      <View style={[styles.searchBox, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
        <Text style={{ color: c.textMuted, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: c.text }]}
          placeholder="Search entries..."
          placeholderTextColor={c.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters Bar */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
          {['all', 'income', 'expense'].map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilterType(type as any)}
              style={[
                styles.chip,
                { backgroundColor: filterType === type ? c.accent : c.card, borderColor: c.cardBorder }
              ]}
            >
              <Text style={[styles.chipText, { color: filterType === type ? '#000' : c.text }]}>
                {type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Categories Filter */}
      {uniqueCategories.length > 0 && (
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
            <TouchableOpacity
              onPress={() => setFilterCategory('all')}
              style={[styles.chip, { backgroundColor: filterCategory === 'all' ? c.accent : c.card }]}
            >
              <Text style={[styles.chipText, { color: filterCategory === 'all' ? '#000' : c.text }]}>ALL CATS</Text>
            </TouchableOpacity>
            {uniqueCategories.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setFilterCategory(cat)}
                style={[styles.chip, { backgroundColor: filterCategory === cat ? c.accent : c.card }]}
              >
                <Text style={[styles.chipText, { color: filterCategory === cat ? '#000' : c.text }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Transaction List */}
      <FlatList
        data={filteredTxs}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const acc = accounts.find(a => a.id === item.accountId);
          return (
            <View style={[styles.txCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <View style={[styles.iconBox, { backgroundColor: item.type === 'income' ? c.income + '20' : c.expense + '20' }]}>
                <Text style={{ fontSize: 16 }}>{item.type === 'income' ? '↗' : '↘'}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.txTitle, { color: c.text }]}>{item.description}</Text>
                <Text style={[styles.txSub, { color: c.textMuted }]}>
                  {item.category} {acc ? `• ${acc.name}` : ''}
                </Text>
              </View>

              <Text style={[styles.txAmt, { color: item.type === 'income' ? c.income : c.expense }]}>
                {item.type === 'income' ? '+' : '-'}{fmt(item.amount)}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Delete Entry', 'Remove this transaction?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(item.id) }
                  ]);
                }}
                style={styles.delBtn}
              >
                <Text style={{ color: c.expense, fontSize: 14 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            <Text style={{ color: c.textMuted, fontSize: 14 }}>No matching transactions found.</Text>
          </View>
        )}
      />

      {/* Add Transaction Floating Button */}
      <TouchableOpacity
        onPress={() => setIsModalOpen(true)}
        style={[styles.fab, { backgroundColor: c.accent }]}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>Add Transaction</Text>

            <View style={styles.typeToggle}>
              <TouchableOpacity
                onPress={() => setTxType('expense')}
                style={[styles.toggleBtn, { backgroundColor: txType === 'expense' ? c.expense : c.input }]}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTxType('income')}
                style={[styles.toggleBtn, { backgroundColor: txType === 'income' ? c.income : c.input }]}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Income</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.modalInput, { backgroundColor: c.input, color: c.text }]}
              placeholder="Description (e.g. Grocery)"
              placeholderTextColor={c.textMuted}
              value={description}
              onChangeText={setDescription}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: c.input, color: c.text }]}
              placeholder="Amount ($)"
              placeholderTextColor={c.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            {/* Wallet Selection with + Add Wallet Link */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.label, { color: c.textMuted }]}>Wallet Account</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsModalOpen(false);
                  setIsWalletModalOpen(true);
                }}
              >
                <Text style={{ color: c.accent, fontSize: 12, fontWeight: 'bold' }}>+ Add Wallet</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginVertical: 8 }}>
              {accounts.length === 0 ? (
                <TouchableOpacity
                  onPress={() => {
                    setIsModalOpen(false);
                    setIsWalletModalOpen(true);
                  }}
                  style={[styles.chip, { backgroundColor: c.accent }]}
                >
                  <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 11 }}>+ Create First Wallet</Text>
                </TouchableOpacity>
              ) : (
                accounts.map(acc => (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => setAccountId(acc.id)}
                    style={[styles.chip, { backgroundColor: (accountId || accounts[0]?.id) === acc.id ? c.accent : c.input }]}
                  >
                    <Text style={{ color: (accountId || accounts[0]?.id) === acc.id ? '#000' : c.text, fontWeight: 'bold', fontSize: 11 }}>{acc.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <Text style={[styles.label, { color: c.textMuted }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginVertical: 8 }}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.chip, { backgroundColor: category === cat ? c.accent : c.input }]}
                >
                  <Text style={{ color: category === cat ? '#000' : c.text, fontWeight: 'bold', fontSize: 11 }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={[styles.actionBtn, { backgroundColor: c.input }]}>
                <Text style={{ color: c.textMuted, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleAddTransaction} style={[styles.actionBtn, { backgroundColor: c.accent }]}>
                <Text style={{ color: '#000', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Wallet Modal */}
      <Modal visible={isWalletModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>Add New Wallet</Text>

            <TextInput
              style={[styles.modalInput, { backgroundColor: c.input, color: c.text }]}
              placeholder="Wallet Name (e.g. HDFC Bank, Cash)"
              placeholderTextColor={c.textMuted}
              value={newWalletName}
              onChangeText={setNewWalletName}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: c.input, color: c.text }]}
              placeholder="Initial Balance ($)"
              placeholderTextColor={c.textMuted}
              keyboardType="numeric"
              value={newWalletBalance}
              onChangeText={setNewWalletBalance}
            />

            <Text style={[styles.label, { color: c.textMuted }]}>Account Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
              {walletTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setNewWalletType(type)}
                  style={[styles.typeBtn, { backgroundColor: newWalletType === type ? c.accent : c.input }]}
                >
                  <Text style={{ color: newWalletType === type ? '#000' : c.text, fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' }}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: c.textMuted }]}>Theme Tag Color</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginVertical: 10 }}>
              {walletColors.map(color => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setNewWalletColor(color)}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color, borderWidth: newWalletColor === color ? 3 : 0, borderColor: '#fff' }
                  ]}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setIsWalletModalOpen(false)} style={[styles.actionBtn, { backgroundColor: c.input }]}>
                <Text style={{ color: c.textMuted, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCreateWallet} style={[styles.actionBtn, { backgroundColor: c.accent }]}>
                <Text style={{ color: '#000', fontWeight: 'bold' }}>Create Wallet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, paddingBottom: 8 },
  headerLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase' },
  headerTitle: { fontSize: 28, fontWeight: '900', marginTop: 4 },
  addWalletBtnHeader: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  addWalletBtnText: { fontSize: 11, fontWeight: '800' },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginVertical: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { marginVertical: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  chipText: { fontSize: 10, fontWeight: '800' },
  txCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8, gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  txTitle: { fontSize: 14, fontWeight: '700' },
  txSub: { fontSize: 10, textTransform: 'uppercase', marginTop: 2 },
  txAmt: { fontSize: 14, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  delBtn: { padding: 4 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  fab: { position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { fontSize: 28, fontWeight: '300', color: '#000' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', paddingHorizontal: 20 },
  modalContent: { borderRadius: 16, padding: 20, borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '900', marginBottom: 16 },
  typeToggle: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  modalInput: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 12 },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  typeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
});
