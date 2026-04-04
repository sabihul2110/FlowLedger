/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        HomeScreen.js
*/

import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const MOCK = {
  name: 'Mohammad',
  totalOwed: 2450,
  totalLent: 5800,
  net: 3350,
  recent: [
    { id: 1, name: 'Arjun', amount: 800, type: 'lent', date: 'Apr 3' },
    { id: 2, name: 'Priya', amount: 500, type: 'owed', date: 'Apr 2' },
    { id: 3, name: 'Rahul', amount: 1200, type: 'lent', date: 'Mar 30' },
  ],
};

export default function HomeScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Good morning 👋</Text>
            <Text style={s.name}>{MOCK.name}</Text>
          </View>
          <TouchableOpacity style={s.avatar}>
            <Text style={s.avatarText}>M</Text>
          </TouchableOpacity>
        </View>

        {/* Net Balance Card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Net Balance</Text>
          <Text style={s.cardAmount}>₹{MOCK.net.toLocaleString()}</Text>
          <Text style={s.cardSub}>You are owed this overall</Text>
          <View style={s.cardRow}>
            <View style={s.cardStat}>
              <Ionicons name="arrow-up-circle" size={18} color="#00e5a0" />
              <Text style={s.cardStatLabel}>You lent</Text>
              <Text style={s.cardStatGreen}>₹{MOCK.totalLent.toLocaleString()}</Text>
            </View>
            <View style={s.divider} />
            <View style={s.cardStat}>
              <Ionicons name="arrow-down-circle" size={18} color="#ff6b6b" />
              <Text style={s.cardStatLabel}>You owe</Text>
              <Text style={s.cardStatRed}>₹{MOCK.totalOwed.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={s.actions}>
          {[
            { label: 'Add Loan', icon: 'add-circle-outline', color: '#00e5a0' },
            { label: 'Add Expense', icon: 'receipt-outline', color: '#7c6aff' },
            { label: 'Pay via UPI', icon: 'qr-code-outline', color: '#ffb347' },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={s.actionBtn}>
              <Ionicons name={a.icon} size={24} color={a.color} />
              <Text style={s.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={s.sectionTitle}>Recent Activity</Text>
        {MOCK.recent.map((item) => (
          <View key={item.id} style={s.activityRow}>
            <View style={s.activityAvatar}>
              <Text style={s.activityAvatarText}>{item.name[0]}</Text>
            </View>
            <View style={s.activityInfo}>
              <Text style={s.activityName}>{item.name}</Text>
              <Text style={s.activityDate}>{item.date}</Text>
            </View>
            <Text style={item.type === 'lent' ? s.amountGreen : s.amountRed}>
              {item.type === 'lent' ? '+' : '-'}₹{item.amount}
            </Text>
          </View>
        ))}

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
  cardLabel: { color: '#666', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
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
  activityRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1f1f1f' },
  activityAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1f1f1f', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityAvatarText: { color: '#00e5a0', fontWeight: '700' },
  activityInfo: { flex: 1 },
  activityName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  activityDate: { color: '#444', fontSize: 12, marginTop: 2 },
  amountGreen: { color: '#00e5a0', fontWeight: '700', fontSize: 15 },
  amountRed: { color: '#ff6b6b', fontWeight: '700', fontSize: 15 },
});