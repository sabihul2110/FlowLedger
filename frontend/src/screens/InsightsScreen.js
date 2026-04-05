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
import { C, S, T } from '../constants';
import FilterPill from '../components/FilterPill';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';

export default function InsightsScreen() {
  const now = new Date();
  const [loading, setLoading] = useState(true);
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const monthOptions = getMonthOptions(6);

  const load = useCallback(async () => {
    setLoading(true);
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
    setLoading(false);
  }, [selMonth, selYear]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const showLoader = loading && !data;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {showLoader && (
          <View style={{
            position: 'absolute',
            top: 80,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 1
          }}>
            <LoadingScreen />
          </View>
        )}

        {data && (
          <>
            <Text style={s.title}>Insights</Text>

            {/* Month Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.monthRow}>
              {monthOptions.map(opt => (
                <TouchableOpacity
                  key={`${opt.month}-${opt.year}`}
                  style={[s.filterTab, selMonth === opt.month && selYear === opt.year && s.filterActive]}
                  onPress={() => { setSelMonth(opt.month); setSelYear(opt.year); }}
                  activeOpacity={0.75}
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
              <Row icon="trending-up-outline" color={C.green} label="Total Lent" value={`₹${data.balance.totalLent.toLocaleString()}`} />
              <Row icon="trending-down-outline" color={C.red} label="Total Owed" value={`₹${data.balance.totalOwed.toLocaleString()}`} />
              <Row icon="wallet-outline" color={data.balance.net >= 0 ? C.green : C.red} label="Net Balance" value={`${data.balance.net >= 0 ? '+' : ''}₹${data.balance.net.toLocaleString()}`} highlight />
            </View>

            {/* Loans */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>LOANS</Text>
              <Row icon="checkmark-circle-outline" color={C.green} label="Settled" value={`${data.settled}`} />
              <Row icon="time-outline" color={C.yellow} label="Pending" value={`${data.pending}`} />
              {data.topDebtor && (
                <Row icon="person-outline" color={C.purple} label="Owes you most" value={`${data.topDebtor[0]} · ₹${data.topDebtor[1].toLocaleString()}`} />
              )}
            </View>

            {/* Monthly Expenses */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>EXPENSES · {monthOptions.find(o => o.month === selMonth && o.year === selYear)?.label}</Text>
              <Row icon="receipt-outline" color={C.purple} label="Total spent" value={`₹${data.monthTotal.toLocaleString()}`} />
              <Row icon="list-outline" color={C.purple} label="Transactions" value={`${data.monthCount}`} />
              <Row icon="calculator-outline" color={C.purple} label="Avg per expense" value={`₹${data.avg}`} />
              {data.biggest.amount > 0 && (
                <Row icon="arrow-up-outline" color={C.red} label="Biggest" value={`${data.biggest.title} · ₹${data.biggest.amount}`} />
              )}
              {data.monthTotal > 0 && (
                <Row icon="star-outline" color={C.yellow} label="Top category" value={`${data.topCat} · ₹${data.byCategory[data.topCat]}`} />
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
          </>
        )}
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
  safe: { flex: 1, backgroundColor: C.bg },
  loading: { color: '#555', textAlign: 'center', marginTop: 40 },
  title: { color: '#fff', fontSize: T.xl, fontWeight: '800', paddingHorizontal: S.lg, paddingTop: 16, paddingBottom: 12 },
  monthRow: { paddingHorizontal: S.lg, gap: 8, marginBottom: 16 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  filterActive: { backgroundColor: C.purple, borderColor: C.purple },
  filterText: { color: '#555', fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  section: { backgroundColor: C.card, marginHorizontal: S.lg, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  sectionTitle: { color: '#444', fontSize: 11, letterSpacing: 1, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  rowHighlight: { backgroundColor: `${C.green}08`, borderRadius: 8, paddingHorizontal: 8 },
  rowIcon: { marginRight: 12 },
  rowLabel: { color: '#888', fontSize: 14, flex: 1 },
  rowValue: { fontSize: 14, fontWeight: '700' },
  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  catLabel: { color: '#888', fontSize: 13, width: 70 },
  barTrack: { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: C.purple, borderRadius: 3 },
  catValue: { color: '#555', fontSize: 12, width: 36, textAlign: 'right' },
});