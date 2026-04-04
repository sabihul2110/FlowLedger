/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        HomeScreen.js
*/

import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getLoans, getBalanceSummary } from '../store/loanStore';

export default function HomeScreen({ navigation }) {
  const [summary, setSummary] = useState({ totalLent: 0, totalOwed: 0, net: 0 });
  const [recent, setRecent] = useState([]);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      const bal = await getBalanceSummary();
      setSummary(bal);
      const all = await getLoans();
      setRecent(all.filter(l => l.status === 'pending').slice(0, 5));
    };
    load();
  }, []));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting} 👋</Text>
            <Text style={s.name}>Mohammad</Text>
          </View>
          <TouchableOpacity style={s.avatar}>
            <Text style={s.avatarText}>M</Text>
          </TouchableOpacity>
        </View>

        {/* Net Balance Card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>NET BALANCE</Text>
          <Text style={[s.cardAmount, summary.net < 0 && { color: '#ff6b6b' }]}>
            ₹{Math.abs(summary.net).toLocaleString()}
          </Text>
          <Text style={s.cardSub}>
            {summary.net >= 0 ? 'Overall you are owed' : 'Overall you owe'}
          </Text>
          <View style={s.cardRow}>
            <View style={s.cardStat}>
              <Ionicons name="arrow-up-circle" size={18} color="#00e5a0" />
              <Text style={s.cardStatLabel}>You lent</Text>
              <Text style={s.cardStatGreen}>₹{summary.totalLent.toLocaleString()}</Text>
            </View>
            <View style={s.divider} />
            <View style={s.cardStat}>
              <Ionicons name="arrow-down-circle" size={18} color="#ff6b6b" />
              <Text style={s.cardStatLabel}>You owe</Text>
              <Text style={s.cardStatRed}>₹{summary.totalOwed.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={s.actions}>
          {[
            { label: 'Add Loan', icon: 'add-circle-outline', color: '#00e5a0', tab: 'Loans' },
            { label: 'Add Expense', icon: 'receipt-outline', color: '#7c6aff', tab: 'Expenses' },
            { label: 'Friends', icon: 'people-outline', color: '#ffb347', tab: 'Friends' },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={s.actionBtn}
              onPress={() => navigation.navigate(a.tab)}
            >
              <Ionicons name={a.icon} size={24} color={a.color} />
              <Text style={s.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={s.sectionTitle}>Recent Activity</Text>
        {recent.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyText}>No active loans yet</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Loans')}>
              <Text style={s.emptyLink}>Add your first loan →</Text>
            </TouchableOpacity>
          </View>
        )}
        {recent.map((item) => (
          <View key={item.id} style={s.activityRow}>
            <View style={s.activityAvatar}>
              <Text style={s.activityAvatarText}>{item.name[0].toUpperCase()}</Text>
            </View>
            <View style={s.activityInfo}>
              <Text style={s.activityName}>{item.name}</Text>
              <Text style={s.activityDate}>
                {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                {item.note ? ` · ${item.note}` : ''}
              </Text>
            </View>
            <Text style={item.type === 'lent' ? s.amountGreen : s.amountRed}>
              {item.type === 'lent' ? '+' : '-'}₹{item.amount.toLocaleString()}
            </Text>
          </View>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 24 },
  greeting: { color: '#666', fontSize: 13 },
  name: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#00e5a0', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#0a0a0a', fontWeight: '800', fontSize: 16 },
  card: { backgroundColor: '#141414', borderRadius: 20, padding: 22, marginBottom: 24, borderWidth: 1, borderColor: '#1f1f1f' },
  cardLabel: { color: '#666', fontSize: 12, letterSpacing: 1 },
  cardAmount: { color: '#00e5a0', fontSize: 38, fontWeight: '800', marginTop: 6 },
  cardSub: { color: '#444', fontSize: 12, marginTop: 2, marginBottom: 20 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-around' },
  cardStat: { alignItems: 'center', gap: 4 },
  cardStatLabel: { color: '#666', fontSize: 11 },
  cardStatGreen: { color: '#00e5a0', fontWeight: '700', fontSize: 15 },
  cardStatRed: { color: '#ff6b6b', fontWeight: '700', fontSize: 15 },
  divider: { width: 1, backgroundColor: '#1f1f1f' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  actionBtn: { flex: 1, backgroundColor: '#141414', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#1f1f1f', gap: 6 },
  actionLabel: { color: '#ccc', fontSize: 11 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  empty: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { color: '#333', fontSize: 14 },
  emptyLink: { color: '#00e5a0', fontSize: 13 },
  activityRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1f1f1f' },
  activityAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1f1f1f', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityAvatarText: { color: '#00e5a0', fontWeight: '700' },
  activityInfo: { flex: 1 },
  activityName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  activityDate: { color: '#444', fontSize: 12, marginTop: 2 },
  amountGreen: { color: '#00e5a0', fontWeight: '700', fontSize: 15 },
  amountRed: { color: '#ff6b6b', fontWeight: '700', fontSize: 15 },
});