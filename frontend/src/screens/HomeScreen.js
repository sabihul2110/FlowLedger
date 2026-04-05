/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        HomeScreen.js
*/

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getLoans, getBalanceSummary } from '../store/loanStore';
import { C, S, T } from '../constants';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import FadeInView from '../components/FadeInView';

const QUICK_ACTIONS = [
  { label: 'Add Loan', icon: 'add-circle-outline', color: C.green, tab: 'Loans' },
  { label: 'Add Expense', icon: 'receipt-outline', color: C.purple, tab: 'Expenses' },
  { label: 'Friends', icon: 'people-outline', color: C.yellow, tab: 'Friends' },
];

const QuickAction = React.memo(({ item, onPress }) => (
  <TouchableOpacity style={s.actionBtn} onPress={() => onPress(item.tab)} activeOpacity={0.75}>
    <Ionicons name={item.icon} size={22} color={item.color} />
    <Text style={s.actionLabel}>{item.label}</Text>
  </TouchableOpacity>
));

const ActivityItem = React.memo(({ item }) => (
  <View style={s.activityRow}>
    <View style={s.activityAvatar}>
      <Text style={s.activityAvatarText}>{item.name[0].toUpperCase()}</Text>
    </View>
    <View style={s.activityInfo}>
      <Text style={s.activityName}>{item.name}</Text>
      <Text style={s.activityDate}>
        {new Date(item.createdAt || item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        {item.note ? ` · ${item.note}` : ''}
      </Text>
    </View>
    <Text style={item.type === 'lent' ? s.amountGreen : s.amountRed}>
      {item.type === 'lent' ? '+' : '-'}₹{(item.amount - (item.paid || 0)).toLocaleString()}
    </Text>
  </View>
));

export default function HomeScreen({ navigation }) {
  const [summary, setSummary] = useState({ totalLent: 0, totalOwed: 0, net: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const bal = await getBalanceSummary();
    setSummary(bal);
    const all = await getLoans();
    setRecent(all.filter(l => l.status === 'pending').slice(0, 5));
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleNav = useCallback((tab) => navigation.navigate(tab), [navigation]);
  const handleProfileNav = useCallback(() => navigation.navigate('Profile'), [navigation]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting} 👋</Text>
            <Text style={s.name}>Mohammad</Text>
          </View>
          <TouchableOpacity style={s.avatar} onPress={handleProfileNav} activeOpacity={0.75}>
            <Text style={s.avatarText}>M</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <Card style={s.balanceCard}>
          <Text style={s.balanceLabel}>NET BALANCE</Text>
          <Text style={[s.balanceAmount, { color: summary.net >= 0 ? C.green : C.red }]}>
            ₹{Math.abs(summary.net).toLocaleString()}
          </Text>
          <Text style={s.balanceSub}>
            {summary.net >= 0 ? 'Overall you are owed' : 'Overall you owe'}
          </Text>
          <View style={s.balanceRow}>
            <View style={s.balanceStat}>
              <Ionicons name="arrow-up-circle" size={16} color={C.green} />
              <Text style={s.balanceStatLabel}>You lent</Text>
              <Text style={[s.balanceStatValue, { color: C.green }]}>
                ₹{summary.totalLent.toLocaleString()}
              </Text>
            </View>
            <View style={s.divider} />
            <View style={s.balanceStat}>
              <Ionicons name="arrow-down-circle" size={16} color={C.red} />
              <Text style={s.balanceStatLabel}>You owe</Text>
              <Text style={[s.balanceStatValue, { color: C.red }]}>
                ₹{summary.totalOwed.toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={s.actions}>
          {QUICK_ACTIONS.map(item => (
            <QuickAction key={item.tab} item={item} onPress={handleNav} />
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={s.sectionTitle}>Recent Activity</Text>
        {recent.length === 0 ? (
          <EmptyState
            icon="wallet-outline"
            message="No active loans yet"
            subtext="Add your first loan →"
          />
        ) : (
          recent.map((item, index) => (
            <FadeInView key={item.id} delay={index * 50}>
              <ActivityItem item={item} />
            </FadeInView>
          ))
        )}

        <View style={{ height: S.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, paddingHorizontal: S.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: S.base, marginBottom: S.xl },
  greeting: { color: C.textMuted, fontSize: T.sm },
  name: { color: C.textPrimary, fontSize: T.xl, fontWeight: T.black, marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.green, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: C.bg, fontWeight: T.black, fontSize: T.md },
  balanceCard: { marginBottom: S.xl },
  balanceLabel: { color: C.textMuted, fontSize: T.xs, letterSpacing: 1.2, fontWeight: T.bold },
  balanceAmount: { fontSize: T.xxl + 6, fontWeight: T.black, marginTop: S.sm },
  balanceSub: { color: C.textMuted, fontSize: T.sm, marginTop: 2, marginBottom: S.lg },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-around' },
  balanceStat: { alignItems: 'center', gap: S.xs },
  balanceStatLabel: { color: C.textMuted, fontSize: T.xs },
  balanceStatValue: { fontSize: T.base, fontWeight: T.bold },
  divider: { width: 1, backgroundColor: C.border },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: S.xl, gap: S.sm },
  actionBtn: { flex: 1, backgroundColor: C.card, borderRadius: 14, paddingVertical: S.base, alignItems: 'center', borderWidth: 1, borderColor: C.border, gap: S.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  actionLabel: { color: C.textSecondary, fontSize: T.xs },
  sectionTitle: { color: C.textPrimary, fontSize: T.md, fontWeight: T.bold, marginBottom: S.md },
  activityRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: S.base, marginBottom: S.sm, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  activityAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.input, justifyContent: 'center', alignItems: 'center', marginRight: S.md },
  activityAvatarText: { color: C.green, fontWeight: T.bold },
  activityInfo: { flex: 1 },
  activityName: { color: C.textPrimary, fontWeight: T.semibold, fontSize: T.base },
  activityDate: { color: C.textMuted, fontSize: T.sm, marginTop: 2 },
  amountGreen: { color: C.green, fontWeight: T.bold, fontSize: T.base },
  amountRed: { color: C.red, fontWeight: T.bold, fontSize: T.base },
});