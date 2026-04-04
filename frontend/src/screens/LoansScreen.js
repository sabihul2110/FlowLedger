/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        LoansScreen.js
*/

import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getLoans, saveLoan } from '../store/loanStore';

const EMPTY_FORM = { name: '', amount: '', note: '', type: 'lent', upi: '' };

export default function LoansScreen({ navigation }) {
  const [loans, setLoans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    const data = await getLoans();
    setLoans(data);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleAdd = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Enter a name');
    if (!form.amount || isNaN(form.amount)) return Alert.alert('Error', 'Enter valid amount');
    await saveLoan({ ...form, amount: parseFloat(form.amount) });
    setForm(EMPTY_FORM);
    setShowModal(false);
    load();
  };

  const filtered = filter === 'all' ? loans : loans.filter(l => l.type === filter);
  const pending = loans.filter(l => l.status === 'pending');
  const totalLent = pending.filter(l => l.type === 'lent').reduce((s, l) => s + (l.amount - (l.paid || 0)), 0);
  const totalOwed = pending.filter(l => l.type === 'borrowed').reduce((s, l) => s + (l.amount - (l.paid || 0)), 0);

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Loans</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color="#0d0d0d" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
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

      {/* Filter */}
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

      {/* List */}
      <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="wallet-outline" size={48} color="#222" />
            <Text style={s.emptyText}>No loans yet</Text>
          </View>
        )}
        {filtered.map(loan => {
          const remaining = loan.amount - (loan.paid || 0);
          return (
            <TouchableOpacity
              key={loan.id}
              style={[s.card, loan.status === 'settled' && s.cardSettled]}
              onPress={() => navigation.navigate('LoanDetail', { loan })}
              activeOpacity={0.7}
            >
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
                  {(loan.paid || 0) > 0 && (
                    <Text style={s.paidHint}>
                      Paid ₹{loan.paid} · Left ₹{remaining}
                    </Text>
                  )}
                </View>
              </View>
              <View style={s.cardRight}>
                <Text style={loan.type === 'lent' ? s.amountGreen : s.amountRed}>
                  {loan.type === 'lent' ? '+' : '-'}₹{remaining.toLocaleString()}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#333" />
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Add Loan Modal */}
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
            <TextInput style={s.input} placeholder="UPI ID (for Pay)" placeholderTextColor="#444" autoCapitalize="none" value={form.upi} onChangeText={v => setForm(f => ({ ...f, upi: v }))} />
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

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d0d' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  addBtn: { backgroundColor: '#34d399', borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#262626' },
  summaryLabel: { color: '#555', fontSize: 11, marginBottom: 4 },
  summaryGreen: { color: '#34d399', fontSize: 20, fontWeight: '700' },
  summaryRed: { color: '#f87171', fontSize: 20, fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#262626' },
  filterActive: { backgroundColor: '#34d399', borderColor: '#34d399' },
  filterText: { color: '#555', fontSize: 13 },
  filterTextActive: { color: '#0d0d0d', fontWeight: '700' },
  list: { flex: 1, paddingHorizontal: 20 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#333', fontSize: 14 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#262626' },
  cardSettled: { opacity: 0.4 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#262626', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#34d399', fontWeight: '700' },
  loanName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  loanNote: { color: '#555', fontSize: 12 },
  loanDate: { color: '#444', fontSize: 11, marginTop: 2 },
  tagPending: { color: '#fbbf24' },
  tagSettled: { color: '#34d399' },
  paidHint: { color: '#fbbf24', fontSize: 11, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  amountGreen: { color: '#34d399', fontWeight: '700', fontSize: 15 },
  amountRed: { color: '#f87171', fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalBox: { backgroundColor: '#1a1a1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#262626', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  typeBtnGreen: { backgroundColor: '#34d39915', borderColor: '#34d399' },
  typeBtnRed: { backgroundColor: '#f8717115', borderColor: '#f87171' },
  typeBtnText: { color: '#555', fontWeight: '600' },
  typeBtnTextActive: { color: '#fff' },
  input: { backgroundColor: '#262626', borderRadius: 12, padding: 14, color: '#fff', marginBottom: 12, fontSize: 15 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#262626', alignItems: 'center' },
  cancelBtnText: { color: '#555', fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#34d399', alignItems: 'center' },
  saveBtnText: { color: '#0d0d0d', fontWeight: '800' },
});