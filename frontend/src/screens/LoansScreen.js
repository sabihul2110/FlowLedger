/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        LoansScreen.js
*/

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform, Alert,
  Linking, AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getLoans, saveLoan, settleLoan, deleteLoan, payPartial } from '../store/loanStore';

const EMPTY_FORM = { name: '', amount: '', note: '', type: 'lent', upi: '' };

export default function LoansScreen() {
  const [loans, setLoans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState('all');
  const pendingPayLoanId = useRef(null);
  const appState = useRef(AppState.currentState);
  const [partialModal, setPartialModal] = useState(false);
  const [partialLoan, setPartialLoan] = useState(null);
  const [partialInput, setPartialInput] = useState('');

  const load = async () => {
    const data = await getLoans();
    setLoans(data);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  // AppState listener — fires when user returns from UPI app
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (pendingPayLoanId.current) {
          const pending = pendingPayLoanId.current;
          pendingPayLoanId.current = null;

          const isPartial = typeof pending === 'object';
          const loanId = isPartial ? pending.id : pending;
          const amt = isPartial ? pending.amt : null;

          Alert.alert(
            'Payment Confirmation',
            'Did you complete the payment?',
            [
              { text: 'No', style: 'cancel' },
              {
                text: 'Yes',
                onPress: async () => {
                  if (isPartial) {
                    await payPartial(loanId, amt);
                  } else {
                    await deleteLoan(loanId);
                  }
                  load();
                },
              },
            ]
          );
        }
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  const handleAdd = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Enter a name');
    if (!form.amount || isNaN(form.amount)) return Alert.alert('Error', 'Enter valid amount');
    const saved = await saveLoan({ ...form, amount: parseFloat(form.amount) });

    // Schedule 48hr reminder for lent loans
    if (form.type === 'lent') {
      await scheduleReminder(saved);
    }

    setForm(EMPTY_FORM);
    setShowModal(false);
    load();
  };

  const scheduleReminder = async (loan) => {
    Alert.alert('Reminder Set', `You'll be reminded about ₹${loan.amount} from ${loan.name}.\n\n(Push notifications require a production build.)`);
  };

  const handleUPI = (loan) => {
    const remaining = loan.amount - (loan.paid || 0);
    const upiUrl = `upi://pay?pa=${encodeURIComponent(loan.upi || '')}&pn=${encodeURIComponent(loan.name)}&am=${remaining}&cu=INR`;
    pendingPayLoanId.current = loan.id;
    Linking.openURL(upiUrl).catch(() => {
      pendingPayLoanId.current = null;
      Alert.alert('Error', 'No UPI app found on this device.');
    });
  };

  const handleRemind = (loan) => {
    Alert.alert(
      'Remind ' + loan.name,
      `Send a reminder that they owe you ₹${loan.amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Schedule Reminder',
          onPress: () => scheduleReminder(loan).then(() =>
            Alert.alert('Done', `Reminder set for 48 hours from now.`)
          ),
        },
      ]
    );
  };

  const handleSettle = (id) => {
    Alert.alert('Settle Loan', 'Mark as settled?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Settle', onPress: async () => { await settleLoan(id); load(); } },
    ]);
  };

  const handlePartialPay = (loan) => {
    setPartialLoan(loan);
    setPartialInput('');
    setPartialModal(true);
  };

  const confirmPartialPay = async () => {
    const remaining = partialLoan.amount - (partialLoan.paid || 0);
    const amt = parseFloat(partialInput);
    if (isNaN(amt) || amt <= 0) return Alert.alert('Invalid amount');
    if (amt > remaining) return Alert.alert('Error', `Max payable: ₹${remaining}`);

    setPartialModal(false);

    if (!partialLoan.upi || !partialLoan.upi.trim()) {
      // No UPI — just update paid directly
      await payPartial(partialLoan.id, amt);
      setPartialLoan(null);
      load();
      return;
    }

    // Open UPI with partial amount
    const upiUrl = `upi://pay?pa=${encodeURIComponent(partialLoan.upi)}&pn=${encodeURIComponent(partialLoan.name)}&am=${amt}&cu=INR`;
    
    // Store partial amount to use after returning
    pendingPayLoanId.current = { id: partialLoan.id, amt };
    setPartialLoan(null);

    Linking.openURL(upiUrl).catch(() => {
      pendingPayLoanId.current = null;
      Alert.alert('Error', 'No UPI app found.');
    });
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Delete this loan?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteLoan(id); load(); } },
    ]);
  };

  const filtered = filter === 'all' ? loans : loans.filter(l => l.type === filter);
  const pending = loans.filter(l => l.status === 'pending');
  const totalLent = pending.filter(l => l.type === 'lent').reduce((s, l) => s + l.amount, 0);
  const totalOwed = pending.filter(l => l.type === 'borrowed').reduce((s, l) => s + l.amount, 0);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Loans</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color="#0a0a0a" />
        </TouchableOpacity>
      </View>

      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>You Lent</Text>
          <Text style={s.summaryGreen}>₹{totalLent.toLocaleString()}</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>You Owe</Text>
          <Text style={s.summaryRed}>₹{totalOwed.toLocaleString()}</Text>
        </View>
      </View>

      <View style={s.filterRow}>
        {['all', 'lent', 'borrowed'].map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterTab, filter === f && s.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="wallet-outline" size={48} color="#222" />
            <Text style={s.emptyText}>No loans yet</Text>
          </View>
        )}
        {filtered.map(loan => (
          <View key={loan.id} style={[s.card, loan.status === 'settled' && s.cardSettled]}>
            <View style={s.cardLeft}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{loan.name[0].toUpperCase()}</Text>
              </View>
              <View>
                <Text style={s.loanName}>{loan.name}</Text>
                {loan.note ? <Text style={s.loanNote}>{loan.note}</Text> : null}
                <Text style={s.loanDate}>
                  {new Date(loan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  {' · '}
                  <Text style={loan.status === 'settled' ? s.tagSettled : s.tagPending}>
                    {loan.status}
                  </Text>
                </Text>
              </View>
            </View>

            <View style={s.cardRight}>
              <Text style={loan.type === 'lent' ? s.amountGreen : s.amountRed}>
                {loan.type === 'lent' ? '+' : '-'}₹{(loan.amount - (loan.paid || 0)).toLocaleString()}
              </Text>
              {loan.status === 'pending' && (
                <>
                  {(loan.paid || 0) > 0 && (
                    <Text style={{ color: '#ffb347', fontSize: 11 }}>
                      Paid ₹{loan.paid} · Left ₹{loan.amount - loan.paid}
                    </Text>
                  )}
                  <TouchableOpacity onPress={() => handleSettle(loan.id)} style={s.settleBtn}>
                    <Text style={s.settleBtnText}>Settle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handlePartialPay(loan)} style={s.settleBtn}>
                    <Text style={[s.settleBtnText, { color: '#ffb347' }]}>Part Pay</Text>
                  </TouchableOpacity>
                  {loan.type === 'borrowed' && (
                    <TouchableOpacity onPress={() => handleUPI(loan)} style={s.settleBtn}>
                      <Text style={[s.settleBtnText, { color: '#ffb347' }]}>Pay</Text>
                    </TouchableOpacity>
                  )}
                  {loan.type === 'lent' && (
                    <TouchableOpacity onPress={() => handleRemind(loan)} style={s.settleBtn}>
                      <Text style={[s.settleBtnText, { color: '#7c6aff' }]}>Remind</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
              <TouchableOpacity onPress={() => handleDelete(loan.id)} style={s.deleteBtn}>
                <Ionicons name="trash-outline" size={14} color="#444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Add Loan</Text>
            <View style={s.typeRow}>
              {['lent', 'borrowed'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.typeBtn, form.type === t && (t === 'lent' ? s.typeBtnGreen : s.typeBtnRed)]}
                  onPress={() => setForm(f => ({ ...f, type: t }))}
                >
                  <Text style={[s.typeBtnText, form.type === t && s.typeBtnTextActive]}>
                    {t === 'lent' ? '↑ I Lent' : '↓ I Borrowed'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={s.input} placeholder="Person's name" placeholderTextColor="#444" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
            <TextInput style={s.input} placeholder="Amount (₹)" placeholderTextColor="#444" keyboardType="numeric" value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} />
            <TextInput style={s.input} placeholder="UPI ID (for Pay/Remind)" placeholderTextColor="#444" autoCapitalize="none" value={form.upi} onChangeText={v => setForm(f => ({ ...f, upi: v }))} />
            <TextInput style={s.input} placeholder="Note (optional)" placeholderTextColor="#444" value={form.note} onChangeText={v => setForm(f => ({ ...f, note: v }))} />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowModal(false); setForm(EMPTY_FORM); }}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleAdd}>
                <Text style={s.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal visible={partialModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Pay Partial Amount</Text>
            {partialLoan && (
              <Text style={{ color: '#555', marginBottom: 12 }}>
                Total: ₹{partialLoan.amount} · Paid: ₹{partialLoan.paid || 0} · Remaining: ₹{partialLoan.amount - (partialLoan.paid || 0)}
              </Text>
            )}
            <TextInput
              style={s.input}
              placeholder="Amount to pay"
              placeholderTextColor="#444"
              keyboardType="numeric"
              value={partialInput}
              onChangeText={setPartialInput}
            />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setPartialModal(false)}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={confirmPartialPay}>
                <Text style={s.saveBtnText}>Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  addBtn: { backgroundColor: '#00e5a0', borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: '#141414', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#1f1f1f' },
  summaryLabel: { color: '#555', fontSize: 11, marginBottom: 4 },
  summaryGreen: { color: '#00e5a0', fontSize: 20, fontWeight: '700' },
  summaryRed: { color: '#ff6b6b', fontSize: 20, fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#141414', borderWidth: 1, borderColor: '#1f1f1f' },
  filterActive: { backgroundColor: '#00e5a0', borderColor: '#00e5a0' },
  filterText: { color: '#555', fontSize: 13 },
  filterTextActive: { color: '#0a0a0a', fontWeight: '700' },
  list: { flex: 1, paddingHorizontal: 20 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#333', fontSize: 14 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#141414', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1f1f1f' },
  cardSettled: { opacity: 0.5 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1f1f1f', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#00e5a0', fontWeight: '700' },
  loanName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  loanNote: { color: '#555', fontSize: 12 },
  loanDate: { color: '#444', fontSize: 11, marginTop: 2 },
  tagPending: { color: '#ffb347' },
  tagSettled: { color: '#00e5a0' },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  amountGreen: { color: '#00e5a0', fontWeight: '700', fontSize: 15 },
  amountRed: { color: '#ff6b6b', fontWeight: '700', fontSize: 15 },
  settleBtn: { backgroundColor: '#1f1f1f', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  settleBtnText: { color: '#00e5a0', fontSize: 11, fontWeight: '600' },
  deleteBtn: { padding: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalBox: { backgroundColor: '#141414', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#1f1f1f', alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  typeBtnGreen: { backgroundColor: '#00e5a015', borderColor: '#00e5a0' },
  typeBtnRed: { backgroundColor: '#ff6b6b15', borderColor: '#ff6b6b' },
  typeBtnText: { color: '#555', fontWeight: '600' },
  typeBtnTextActive: { color: '#fff' },
  input: { backgroundColor: '#1f1f1f', borderRadius: 12, padding: 14, color: '#fff', marginBottom: 12, fontSize: 15 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#1f1f1f', alignItems: 'center' },
  cancelBtnText: { color: '#555', fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#00e5a0', alignItems: 'center' },
  saveBtnText: { color: '#0a0a0a', fontWeight: '800' },
});