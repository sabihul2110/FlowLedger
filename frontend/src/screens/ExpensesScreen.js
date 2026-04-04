/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        ExpensesScreen.js
*/

import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, deleteExpense, saveExpense } from '../store/expenseStore';
import { getMonthOptions } from '../utils/dateHelpers';
import useExpenses from '../hooks/useExpenses';

const CATEGORY_ICONS = {
  Food: 'fast-food-outline',
  Travel: 'car-outline',
  Shopping: 'bag-outline',
  Bills: 'flash-outline',
  Health: 'medkit-outline',
  Other: 'ellipsis-horizontal-outline',
};

const CATEGORY_COLORS = {
  Food: '#f87171',
  Travel: '#fbbf24',
  Shopping: '#818cf8',
  Bills: '#34d399',
  Health: '#ff85a1',
  Other: '#888',
};

const EMPTY_FORM = { title: '', amount: '', category: 'Food', note: '' };

export default function ExpensesScreen() {
  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [filterCat, setFilterCat] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const monthOptions = getMonthOptions(6);
  const { expenses, reload } = useExpenses(selMonth, selYear);

  // Compute summary from hook data
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = {};
  CATEGORIES.forEach(c => { byCategory[c] = 0; });
  expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });

  const filtered = filterCat === 'All' ? expenses : expenses.filter(e => e.category === filterCat);

  const handleAdd = async () => {
    if (!form.title.trim()) return Alert.alert('Error', 'Enter a title');
    if (!form.amount || isNaN(form.amount)) return Alert.alert('Error', 'Enter valid amount');
    await saveExpense({ ...form, amount: parseFloat(form.amount) });
    setForm(EMPTY_FORM);
    setShowModal(false);
    reload();
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteExpense(id); reload(); } },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Expenses</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color="#0d0d0d" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Month Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.monthRow}>
          {monthOptions.map(opt => (
            <TouchableOpacity
              key={`${opt.month}-${opt.year}`}
              style={[s.filterTab, selMonth === opt.month && selYear === opt.year && s.monthActive]}
              onPress={() => { setSelMonth(opt.month); setSelYear(opt.year); }}
            >
              <Text style={[s.filterText, selMonth === opt.month && selYear === opt.year && s.filterTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary Card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>TOTAL SPENT</Text>
          <Text style={s.cardAmount}>₹{total.toLocaleString()}</Text>
          <Text style={s.cardSub}>{expenses.length} transactions</Text>
          <View style={s.catGrid}>
            {CATEGORIES.filter(c => byCategory[c] > 0).map(c => (
              <View key={c} style={s.catChip}>
                <Ionicons name={CATEGORY_ICONS[c]} size={13} color={CATEGORY_COLORS[c]} />
                <Text style={s.catChipText}>{c}</Text>
                <Text style={[s.catChipAmt, { color: CATEGORY_COLORS[c] }]}>₹{byCategory[c].toLocaleString()}</Text>
              </View>
            ))}
            {CATEGORIES.every(c => !byCategory[c]) && (
              <Text style={s.noData}>No expenses this period</Text>
            )}
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catFilterRow}>
          {['All', ...CATEGORIES].map(c => (
            <TouchableOpacity
              key={c}
              style={[s.filterTab, filterCat === c && s.filterActive]}
              onPress={() => setFilterCat(c)}
            >
              <Text style={[s.filterText, filterCat === c && s.filterTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        <View style={s.list}>
          {filtered.length === 0 && (
            <View style={s.empty}>
              <Ionicons name="receipt-outline" size={48} color="#222" />
              <Text style={s.emptyText}>No expenses</Text>
            </View>
          )}
          {filtered.map(exp => (
            <View key={exp.id} style={s.expRow}>
              <View style={[s.expIcon, { backgroundColor: CATEGORY_COLORS[exp.category] + '20' }]}>
                <Ionicons name={CATEGORY_ICONS[exp.category]} size={18} color={CATEGORY_COLORS[exp.category]} />
              </View>
              <View style={s.expInfo}>
                <Text style={s.expTitle}>{exp.title}</Text>
                <Text style={s.expMeta}>
                  {exp.category}{exp.note ? ` · ${exp.note}` : ''} · {new Date(exp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              <View style={s.expRight}>
                <Text style={s.expAmount}>₹{exp.amount.toLocaleString()}</Text>
                <TouchableOpacity onPress={() => handleDelete(exp.id)}>
                  <Ionicons name="trash-outline" size={14} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Add Expense</Text>
            <TextInput style={s.input} placeholder="Title" placeholderTextColor="#444" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
            <TextInput style={s.input} placeholder="Amount (₹)" placeholderTextColor="#444" keyboardType="numeric" value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} />
            <Text style={s.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[s.catBtn, form.category === c && { borderColor: CATEGORY_COLORS[c], backgroundColor: CATEGORY_COLORS[c] + '20' }]}
                    onPress={() => setForm(f => ({ ...f, category: c }))}
                  >
                    <Ionicons name={CATEGORY_ICONS[c]} size={14} color={form.category === c ? CATEGORY_COLORS[c] : '#555'} />
                    <Text style={[s.catBtnText, form.category === c && { color: CATEGORY_COLORS[c] }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
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
  addBtn: { backgroundColor: '#818cf8', borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  monthRow: { paddingHorizontal: 20, gap: 8, marginBottom: 14 },
  catFilterRow: { paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#262626' },
  filterActive: { backgroundColor: '#818cf8', borderColor: '#818cf8' },
  monthActive: { backgroundColor: '#34d399', borderColor: '#34d399' },
  filterText: { color: '#555', fontSize: 13 },
  filterTextActive: { color: '#0d0d0d', fontWeight: '700' },
  card: { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 22, marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderColor: '#262626' },
  cardLabel: { color: '#666', fontSize: 12, letterSpacing: 1 },
  cardAmount: { color: '#818cf8', fontSize: 36, fontWeight: '800', marginTop: 6 },
  cardSub: { color: '#444', fontSize: 12, marginTop: 2, marginBottom: 16 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#262626', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  catChipText: { color: '#888', fontSize: 11 },
  catChipAmt: { fontSize: 11, fontWeight: '700' },
  noData: { color: '#333', fontSize: 13 },
  list: { paddingHorizontal: 20 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { color: '#333', fontSize: 14 },
  expRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#262626' },
  expIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  expInfo: { flex: 1 },
  expTitle: { color: '#fff', fontWeight: '600', fontSize: 14 },
  expMeta: { color: '#444', fontSize: 12, marginTop: 2 },
  expRight: { alignItems: 'flex-end', gap: 6 },
  expAmount: { color: '#fff', fontWeight: '700', fontSize: 15 },
  inputLabel: { color: '#555', fontSize: 12, marginBottom: 8 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalBox: { backgroundColor: '#1a1a1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  input: { backgroundColor: '#262626', borderRadius: 12, padding: 14, color: '#fff', marginBottom: 12, fontSize: 15 },
  catBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#262626', borderWidth: 1, borderColor: '#333' },
  catBtnText: { color: '#555', fontSize: 12 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#262626', alignItems: 'center' },
  cancelBtnText: { color: '#555', fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#818cf8', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800' },
});