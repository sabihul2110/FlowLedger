/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        InsightsScreen.js
*/

import { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getLoans, getBalanceSummary } from '../store/loanStore';
import { getExpenses, CATEGORIES } from '../store/expenseStore';
import { getMonthOptions } from '../utils/dateHelpers';

export default function InsightsScreen() {
  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const monthOptions = getMonthOptions(6);

  const load = async () => {
    const balance = await getBalanceSummary();
    const allExpenses = await getExpenses();
    const allLoans = await getLoans();

    // Filter expenses by selected month
    const monthExpenses = allExpenses.filter(e => {
      const d = new Date(e.created_at || e.createdAt);
      return d.getMonth() === selMonth && d.getFullYear() === selYear;
    });

    const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const byCategory = {};
    CATEGORIES.forEach(c => { byCategory[c] = 0; });
    monthExpenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    const count = monthExpenses.length;

    const topCat = CATEGORIES.reduce((a, b) => (byCategory[a] || 0) > (byCategory[b] || 0) ? a : b);
    const avg = count > 0 ? (total / count).toFixed(0) : 0;
    const settled = allLoans.filter(l => l.status === 'settled').length;
    const pending = allLoans.filter(l => l.status === 'pending').length;
    const biggest = monthExpenses.reduce((a, b) => a.amount > b.amount ? a : b, { amount: 0, title: 'N/A' });

    const lentMap = {};
    allLoans.filter(l => l.type === 'lent' && l.status === 'pending').forEach(l => {
      lentMap[l.name] = (lentMap[l.name] || 0) + (l.amount - (l.paid || 0));
    });
    const topDebtor = Object.entries(lentMap).sort((a, b) => b[1] - a[1])[0];

    setData({ balance, monthTotal: total, monthCount: count, byCategory, topCat, avg, settled, pending, biggest, topDebtor });
  };

  useFocusEffect(useCallback(() => { load(); }, []));
  useEffect(() => { load(); }, [selMonth, selYear]);

  if (!data) return (
    <SafeAreaView style={s.safe}>
      <Text style={s.loading}>Loading...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={s.title}>Insights</Text>

        {/* Month Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.monthRow}>
          {monthOptions.map(opt => (
            <TouchableOpacity
              key={`${opt.month}-${opt.year}`}
              style={[s.filterTab, selMonth === opt.month && selYear === opt.year && s.filterActive]}
              onPress={() => { setSelMonth(opt.month); setSelYear(opt.year); }}
            >
              <Text style={[s.filterText, selMonth === opt.month && selYear === opt.year && s.filterTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Balance Overview */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>BALANCE OVERVIEW</Text>
          <Row icon="trending-up-outline" color="#34d399" label="Total Lent" value={`₹${data.balance.totalLent.toLocaleString()}`} />
          <Row icon="trending-down-outline" color="#f87171" label="Total Owed" value={`₹${data.balance.totalOwed.toLocaleString()}`} />
          <Row icon="wallet-outline" color={data.balance.net >= 0 ? '#34d399' : '#f87171'} label="Net Balance" value={`${data.balance.net >= 0 ? '+' : ''}₹${data.balance.net.toLocaleString()}`} highlight />
        </View>

        {/* Loans */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>LOANS</Text>
          <Row icon="checkmark-circle-outline" color="#34d399" label="Settled" value={`${data.settled}`} />
          <Row icon="time-outline" color="#fbbf24" label="Pending" value={`${data.pending}`} />
          {data.topDebtor && (
            <Row icon="person-outline" color="#818cf8" label="Owes you most" value={`${data.topDebtor[0]} · ₹${data.topDebtor[1].toLocaleString()}`} />
          )}
        </View>

        {/* Monthly Expenses */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>EXPENSES · {monthOptions.find(o => o.month === selMonth && o.year === selYear)?.label}</Text>
          <Row icon="receipt-outline" color="#818cf8" label="Total spent" value={`₹${data.monthTotal.toLocaleString()}`} />
          <Row icon="list-outline" color="#818cf8" label="Transactions" value={`${data.monthCount}`} />
          <Row icon="calculator-outline" color="#818cf8" label="Avg per expense" value={`₹${data.avg}`} />
          {data.biggest.amount > 0 && (
            <Row icon="arrow-up-outline" color="#f87171" label="Biggest" value={`${data.biggest.title} · ₹${data.biggest.amount}`} />
          )}
          {data.monthTotal > 0 && (
            <Row icon="star-outline" color="#fbbf24" label="Top category" value={`${data.topCat} · ₹${data.byCategory[data.topCat]}`} />
          )}
        </View>

        {/* Category Breakdown */}
        {data.monthTotal > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>CATEGORY BREAKDOWN</Text>
            {CATEGORIES.filter(c => data.byCategory[c] > 0)
              .sort((a, b) => data.byCategory[b] - data.byCategory[a])
              .map(c => {
                const pct = Math.round((data.byCategory[c] / data.monthTotal) * 100);
                return (
                  <View key={c} style={s.catRow}>
                    <Text style={s.catLabel}>{c}</Text>
                    <View style={s.barTrack}>
                      <View style={[s.barFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={s.catValue}>{pct}%</Text>
                  </View>
                );
              })}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, color, label, value, highlight }) {
  return (
    <View style={[s.row, highlight && s.rowHighlight]}>
      <Ionicons name={icon} size={18} color={color} style={s.rowIcon} />
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, { color }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d0d' },
  loading: { color: '#555', textAlign: 'center', marginTop: 40 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  monthRow: { paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#262626' },
  filterActive: { backgroundColor: '#818cf8', borderColor: '#818cf8' },
  filterText: { color: '#555', fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  section: { backgroundColor: '#1a1a1a', marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#262626' },
  sectionTitle: { color: '#444', fontSize: 11, letterSpacing: 1, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#262626' },
  rowHighlight: { backgroundColor: '#34d39908', borderRadius: 8, paddingHorizontal: 8 },
  rowIcon: { marginRight: 12 },
  rowLabel: { color: '#888', fontSize: 14, flex: 1 },
  rowValue: { fontSize: 14, fontWeight: '700' },
  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  catLabel: { color: '#888', fontSize: 13, width: 70 },
  barTrack: { flex: 1, height: 6, backgroundColor: '#262626', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: '#818cf8', borderRadius: 3 },
  catValue: { color: '#555', fontSize: 12, width: 36, textAlign: 'right' },
});