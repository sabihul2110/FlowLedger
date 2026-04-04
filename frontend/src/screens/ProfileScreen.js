/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        ProfileScreen.js
*/

import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Switch,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLoans, getBalanceSummary } from '../store/loanStore';
import { getExpenses, getMonthSummary } from '../store/expenseStore';
import { getFriends } from '../store/friendStore';

const PROFILE_KEY = 'flowledger_profile';

const DEFAULT_PROFILE = { name: 'Mohammad', upi: '', phone: '' };

export default function ProfileScreen() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(DEFAULT_PROFILE);
  const [stats, setStats] = useState({ loans: 0, expenses: 0, friends: 0, totalLent: 0, monthSpend: 0 });

  const load = async () => {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (raw) { const p = JSON.parse(raw); setProfile(p); setForm(p); }
    const loans = await getLoans();
    const { totalLent } = await getBalanceSummary();
    const expenses = await getExpenses();
    const { total } = await getMonthSummary();
    const friends = await getFriends();
    setStats({
      loans: loans.length,
      expenses: expenses.length,
      friends: friends.length,
      totalLent,
      monthSpend: total,
    });
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const saveProfile = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Name cannot be empty');
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(form));
    setProfile(form);
    setEditing(false);
  };

  const handleClearAll = () => {
    Alert.alert('Clear All Data', 'This will delete ALL loans, expenses, and friends. Cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear Everything', style: 'destructive', onPress: async () => {
          await AsyncStorage.multiRemove(['flowledger_loans', 'flowledger_expenses', 'flowledger_friends']);
          load();
          Alert.alert('Done', 'All data cleared.');
        }
      },
    ]);
  };

  const handleExport = async () => {
    try {
      const loans = await getLoans();
      const expenses = await getExpenses();
      const friends = await getFriends();

      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        loans,
        expenses,
        friends,
      };

      const json = JSON.stringify(exportData, null, 2);
      const fileUri = FileSystem.documentDirectory + 'flowledger_export.json';

      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: 'utf8',
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export FlowLedger Data',
      });
    } catch (e) {
      Alert.alert('Export Failed', e.message);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const raw = await FileSystem.readAsStringAsync(fileUri, { encoding: 'utf8' });
      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed.loans) || !Array.isArray(parsed.expenses) || !Array.isArray(parsed.friends)) {
        return Alert.alert('Invalid backup file', 'File structure is not valid.');
      }

      Alert.alert(
        'Import Data',
        'This will replace ALL existing data. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace', style: 'destructive', onPress: async () => {
              await AsyncStorage.setItem('flowledger_loans', JSON.stringify(parsed.loans));
              await AsyncStorage.setItem('flowledger_expenses', JSON.stringify(parsed.expenses));
              await AsyncStorage.setItem('flowledger_friends', JSON.stringify(parsed.friends));
              load();
              Alert.alert('Success', 'Data imported successfully.');
            }
          },
        ]
      );
    } catch (e) {
      Alert.alert('Import Failed', e.message);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Profile</Text>
          <TouchableOpacity onPress={() => editing ? saveProfile() : setEditing(true)}>
            <Text style={s.editBtn}>{editing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + Name */}
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{profile.name[0].toUpperCase()}</Text>
          </View>
          {editing ? (
            <View style={s.editFields}>
              <TextInput
                style={s.input}
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
                placeholder="Your name"
                placeholderTextColor="#444"
              />
              <TextInput
                style={s.input}
                value={form.upi}
                onChangeText={v => setForm(f => ({ ...f, upi: v }))}
                placeholder="Your UPI ID"
                placeholderTextColor="#444"
                autoCapitalize="none"
              />
              <TextInput
                style={s.input}
                value={form.phone}
                onChangeText={v => setForm(f => ({ ...f, phone: v }))}
                placeholder="Phone number"
                placeholderTextColor="#444"
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={s.cancelEdit} onPress={() => { setEditing(false); setForm(profile); }}>
                <Text style={s.cancelEditText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={s.profileName}>{profile.name}</Text>
              <Text style={s.profileSub}>{profile.upi || 'No UPI ID set'}</Text>
              {profile.phone ? <Text style={s.profileSub}>{profile.phone}</Text> : null}
            </>
          )}
        </View>

        {/* Stats Grid */}
        <View style={s.statsGrid}>
          {[
            { label: 'Total Loans', value: stats.loans, icon: 'wallet-outline', color: '#00e5a0' },
            { label: 'Expenses', value: stats.expenses, icon: 'receipt-outline', color: '#7c6aff' },
            { label: 'Friends', value: stats.friends, icon: 'people-outline', color: '#ffb347' },
            { label: 'Total Lent', value: `₹${stats.totalLent.toLocaleString()}`, icon: 'arrow-up-circle-outline', color: '#00e5a0' },
            { label: 'This Month', value: `₹${stats.monthSpend.toLocaleString()}`, icon: 'calendar-outline', color: '#7c6aff' },
          ].map(stat => (
            <View key={stat.label} style={s.statCard}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
              <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Info Section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>App Info</Text>
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Storage', value: 'Local (offline)' },
            { label: 'Built with', value: 'React Native + Expo' },
          ].map(item => (
            <View key={item.label} style={s.infoRow}>
              <Text style={s.infoLabel}>{item.label}</Text>
              <Text style={s.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Danger Zone */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity style={s.exportBtn} onPress={handleExport}>
            <Ionicons name="download-outline" size={16} color="#00e5a0" />
            <Text style={s.exportText}>Export All Data (JSON)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.exportBtn} onPress={handleImport}>
            <Ionicons name="upload-outline" size={16} color="#7c6aff" />
            <Text style={[s.exportText, { color: '#7c6aff' }]}>Import Data (JSON)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.dangerBtn} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
            <Text style={s.dangerText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  editBtn: { color: '#00e5a0', fontSize: 15, fontWeight: '600' },
  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#00e5a020', borderWidth: 2, borderColor: '#00e5a0', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarText: { color: '#00e5a0', fontSize: 28, fontWeight: '800' },
  profileName: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileSub: { color: '#444', fontSize: 13, marginTop: 4 },
  editFields: { width: '100%', paddingHorizontal: 20, gap: 10 },
  input: { backgroundColor: '#141414', borderRadius: 12, padding: 14, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#1f1f1f' },
  cancelEdit: { alignItems: 'center', paddingVertical: 10 },
  cancelEditText: { color: '#555', fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  statCard: { width: '30%', flex: 1, minWidth: '28%', backgroundColor: '#141414', borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#1f1f1f' },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#444', fontSize: 10, textAlign: 'center' },
  section: { marginHorizontal: 20, marginBottom: 20, backgroundColor: '#141414', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f1f1f' },
  sectionTitle: { color: '#555', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  infoLabel: { color: '#666', fontSize: 14 },
  infoValue: { color: '#fff', fontSize: 14 },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#ff6b6b15', borderRadius: 10, borderWidth: 1, borderColor: '#ff6b6b30' },
  dangerText: { color: '#ff6b6b', fontWeight: '600' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#00e5a015', borderRadius: 10, borderWidth: 1, borderColor: '#00e5a030', marginBottom: 10 },
  exportText: { color: '#00e5a0', fontWeight: '600' },
});