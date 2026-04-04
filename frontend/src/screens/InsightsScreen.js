/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        InsightsScreen.js
*/

import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getLoans, getBalanceSummary } from '../store/loanStore';
import { getExpenses, getMonthSummary, CATEGORIES } from '../store/expenseStore';

export default function InsightsScreen() {
  const [data, setData] = useState(null);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      const balance = await getBalanceSummary();
      const { total, byCategory, count } = await getMonthSummary();
      const allExpenses = await getExpenses();
      const allLoans = await getLoans();

      // Top category
      const topCat = CATEGORIES.reduce((a, b) =>
        (byCategory[a] || 0) > (byCategory[b] || 0) ? a : b
      );

      // Average expense
      const avg = count > 0 ? (total / count).toFixed(0) : 0;

      // Settled vs pending loans
      const settled = allLoans.filter(l => l.status === 'settled').length;
      const pending = allLoans.filter(l => l.status === 'pending').length;

      // Biggest single expense this month
      const now = new Date();
      const thisMonth = allExpenses.filter(e => {
        const d = new Date(e.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const biggest = thisMonth.reduce((a, b) => a.amount > b.amount ? a : b, { amount: 0, title: 'N/A' });

      // Most lent to person
      const lentMap = {};
      allLoans.filter(l => l.type === 'lent' && l.status === 'pending').forEach(l => {
        lentMap[l.name] = (lentMap[l.name] || 0) + (l.amount - (l.paid || 0));
      });
      const topDebtor = Object.entries(lentMap).sort((a, b) => b[1] - a[1])[0];

      setData({
        balance,
        monthTotal: total,
        monthCount: count,
        byCategory,
        topCat,
        avg,
        settled,
        pending,
        biggest,
        topDebtor,
      });
    };
    load();
  }, []));

  if (!data) return (
    <SafeAreaView style={s.safe}>
      <Text style={s.loading}>Loading...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={s.title}>Insights</Text>

        {/* Net Balance */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>BALANCE OVERVIEW</Text>
          <Row icon="trending-up-outline" color="#34d399" label="Total Lent" value={`₹${data.balance.totalLent.toLocaleString()}`} />
          <Row icon="trending-down-outline" color="#f87171" label="Total Owed" value={`₹${data.balance.totalOwed.toLocaleString()}`} />
          <Row
            icon="wallet-outline"
            color={data.balance.net >= 0 ? '#34d399' : '#f87171'}
            label="Net Balance"
            value={`${data.balance.net >= 0 ? '+' : ''}₹${data.balance.net.toLocaleString()}`}
            highlight
          />
        </View>

        {/* Loans Summary */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>LOANS</Text>
          <Row icon="checkmark-circle-outline" color="#34d399" label="Settled loans" value={`${data.settled}`} />
          <Row icon="time-outline" color="#fbbf24" label="Pending loans" value={`${data.pending}`} />
          {data.topDebtor && (
            <Row icon="person-outline" color="#818cf8" label="Owes you most" value={`${data.topDebtor[0]} · ₹${data.topDebtor[1].toLocaleString()}`} />
          )}
        </View>

        {/* This Month Expenses */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>THIS MONTH</Text>
          <Row icon="receipt-outline" color="#818cf8" label="Total spent" value={`₹${data.monthTotal.toLocaleString()}`} />
          <Row icon="list-outline" color="#818cf8" label="Transactions" value={`${data.monthCount}`} />
          <Row icon="calculator-outline" color="#818cf8" label="Avg per expense" value={`₹${data.avg}`} />
          {data.biggest.amount > 0 && (
            <Row icon="arrow-up-outline" color="#f87171" label="Biggest expense" value={`${data.biggest.title} · ₹${data.biggest.amount}`} />
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
  title: { color: '#fff', fontSize: 24, fontWeight: '800', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
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