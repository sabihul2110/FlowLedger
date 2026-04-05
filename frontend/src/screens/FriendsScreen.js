/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        FriendsScreen.js
*/

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView, StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addFriend, deleteFriend, getFriends } from '../store/friendStore';
import { getLoans } from '../store/loanStore';
import { C, S, T } from '../constants';
import FilterPill from '../components/FilterPill';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';

const EMPTY_FORM = { name: '', phone: '', upi: '' };

export default function FriendsScreen() {
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [loanMap, setLoanMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const f = await getFriends();
    setFriends(f);

    // Build net balance per friend name from loans
    const loans = await getLoans();
    const map = {};
    loans.filter(l => l.status === 'pending').forEach(l => {
      const key = l.name.toLowerCase();
      if (!map[key]) map[key] = 0;
      map[key] += l.type === 'lent' ? l.amount : -l.amount;
    });
    setLoanMap(map);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <LoadingScreen />;

  const handleAdd = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Enter a name');
    try {
      await addFriend(form);
      setForm(EMPTY_FORM);
      setShowModal(false);
      load();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Remove Friend', 'Remove this friend?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await deleteFriend(id); load(); } },
    ]);
  };

  const handleUPI = (friend, amount) => {
    if (!friend.upi) return Alert.alert('No UPI', 'No UPI ID saved for this friend.');
    const url = `upi://pay?pa=${friend.upi}&pn=${encodeURIComponent(friend.name)}&am=${Math.abs(amount)}&cu=INR`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'No UPI app found'));
  };

  const filtered = friends.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const getBalance = (friend) => loanMap[friend.name.toLowerCase()] || 0;

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Friends</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)} activeOpacity={0.75}>
          <Ionicons name="add" size={22} color={C.bg} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchBox}>
        <Ionicons name="search-outline" size={16} color="#444" style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Search friends..."
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Summary */}
      <View style={s.summaryRow}>
        <Text style={s.summaryText}>{friends.length} friends</Text>
        <Text style={s.summaryText}>
          {friends.filter(f => getBalance(f) !== 0).length} with balance
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={s.list}>
        {filtered.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="people-outline" size={48} color="#222" />
            <Text style={s.emptyText}>No friends yet</Text>
          </View>
        )}
        {filtered.map(friend => {
          const bal = getBalance(friend);
          return (
            <View key={friend.id} style={s.card}>
              <View style={s.cardLeft}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{friend.name[0].toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={s.friendName}>{friend.name}</Text>
                  <Text style={s.friendSub}>
                    {friend.upi || friend.phone || 'No UPI / phone'}
                  </Text>
                  {bal !== 0 && (
                    <Text style={bal > 0 ? s.balGreen : s.balRed}>
                      {bal > 0 ? `Owes you ₹${bal}` : `You owe ₹${Math.abs(bal)}`}
                    </Text>
                  )}
                </View>
              </View>

              <View style={s.cardActions}>
                {bal < 0 && friend.upi && (
                  <TouchableOpacity
                    style={s.upiBtn}
                    onPress={() => handleUPI(friend, bal)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="qr-code-outline" size={14} color={C.yellow} />
                    <Text style={s.upiBtnText}>Pay</Text>
                  </TouchableOpacity>
                )}
                {bal > 0 && friend.upi && (
                  <TouchableOpacity
                    style={s.remindBtn}
                    onPress={() => Alert.alert('Remind', `Send a reminder to ${friend.name}?`)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="notifications-outline" size={14} color={C.purple} />
                    <Text style={s.remindBtnText}>Remind</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(friend.id)} activeOpacity={0.75}>
                  <Ionicons name="trash-outline" size={16} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Add Friend Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Add Friend</Text>
            <TextInput
              style={s.input}
              placeholder="Name *"
              placeholderTextColor="#444"
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
            />
            <TextInput
              style={s.input}
              placeholder="Phone number (optional)"
              placeholderTextColor="#444"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={v => setForm(f => ({ ...f, phone: v }))}
            />
            <TextInput
              style={s.input}
              placeholder="UPI ID (optional, for payments)"
              placeholderTextColor="#444"
              autoCapitalize="none"
              value={form.upi}
              onChangeText={v => setForm(f => ({ ...f, upi: v }))}
            />
            <Text style={s.hint}>UPI ID is used to send payments directly from this app</Text>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowModal(false); setForm(EMPTY_FORM); }} activeOpacity={0.75}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleAdd} activeOpacity={0.75}>
                <Text style={s.saveBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: S.lg, paddingTop: 16, paddingBottom: 12 },
  title: { color: '#fff', fontSize: T.xl, fontWeight: '800' },
  addBtn: { backgroundColor: C.yellow, borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, marginHorizontal: S.lg, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: S.lg, marginBottom: 12 },
  summaryText: { color: '#444', fontSize: 12 },
  list: { flex: 1, paddingHorizontal: S.lg },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#333', fontSize: 14 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.border, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: C.yellow, fontWeight: '700', fontSize: 16 },
  friendName: { color: '#fff', fontWeight: '600', fontSize: 15 },
  friendSub: { color: '#444', fontSize: 12, marginTop: 2 },
  balGreen: { color: C.green, fontSize: 12, marginTop: 2, fontWeight: '600' },
  balRed: { color: C.red, fontSize: 12, marginTop: 2, fontWeight: '600' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  upiBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${C.yellow}20`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.yellow },
  upiBtnText: { color: C.yellow, fontSize: 11, fontWeight: '600' },
  remindBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${C.purple}20`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.purple },
  remindBtnText: { color: C.purple, fontSize: 11, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalBox: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: S.lg },
  input: { backgroundColor: C.input, borderRadius: 12, padding: 14, color: '#fff', marginBottom: 12, fontSize: 15 },
  hint: { color: '#333', fontSize: 11, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: C.border, alignItems: 'center' },
  cancelBtnText: { color: '#555', fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: C.yellow, alignItems: 'center' },
  saveBtnText: { color: C.bg, fontWeight: '800' },
});