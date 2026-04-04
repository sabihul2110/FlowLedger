/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        LoanDetailScreen.js
*/

import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  TextInput, Modal, KeyboardAvoidingView, Platform,
  Linking, AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { settleLoan, deleteLoan, payPartial } from '../store/loanStore';

export default function LoanDetailScreen({ route, navigation }) {
  const { loan: initial } = route.params;
  const [loan, setLoan] = useState(initial);
  const [partialModal, setPartialModal] = useState(false);
  const [partialInput, setPartialInput] = useState('');
  const pendingAmt = useRef(null);
  const appState = useRef(AppState.currentState);

  const remaining = loan.amount - (loan.paid || 0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (pendingAmt.current !== null) {
          const amt = pendingAmt.current;
          pendingAmt.current = null;
          Alert.alert(
            'Payment Confirmation',
            'Did you complete the payment?',
            [
              { text: 'No', style: 'cancel' },
              {
                text: 'Yes',
                onPress: async () => {
                  if (amt === 'full') {
                    await deleteLoan(loan.id);
                    navigation.goBack();
                  } else {
                    await payPartial(loan.id, amt);
                    const updated = { ...loan, paid: (loan.paid || 0) + amt };
                    updated.status = updated.amount - updated.paid <= 0 ? 'settled' : 'pending';
                    setLoan(updated);
                  }
                },
              },
            ]
          );
        }
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [loan]);

  const openUPI = (amt) => {
    if (!loan.upi || !loan.upi.trim()) {
      return Alert.alert('No UPI ID', 'This loan has no UPI ID saved.');
    }
    const url = `upi://pay?pa=${encodeURIComponent(loan.upi)}&pn=${encodeURIComponent(loan.name)}&am=${amt}&cu=INR`;
    pendingAmt.current = amt === remaining ? 'full' : amt;
    Linking.openURL(url).catch(() => {
      pendingAmt.current = null;
      Alert.alert('Error', 'No UPI app found.');
    });
  };

  const handleSettle = () => {
    Alert.alert('Settle Loan', 'Mark as fully settled?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Settle', onPress: async () => {
          await settleLoan(loan.id);
          navigation.goBack();
        }
      },
    ]);
  };

  const handlePartialConfirm = () => {
    const amt = parseFloat(partialInput);
    if (isNaN(amt) || amt <= 0) return Alert.alert('Invalid amount');
    if (amt > remaining) return Alert.alert('Error', `Max: ₹${remaining}`);
    setPartialModal(false);
    if (loan.upi && loan.upi.trim()) {
      openUPI(amt);
    } else {
      Alert.alert('No UPI', 'No UPI ID — marking payment directly.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm', onPress: async () => {
            await payPartial(loan.id, amt);
            const updated = { ...loan, paid: (loan.paid || 0) + amt };
            updated.status = updated.amount - updated.paid <= 0 ? 'settled' : 'pending';
            setLoan(updated);
          }
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.title}>Loan Detail</Text>
        <TouchableOpacity onPress={() => {
          Alert.alert('Delete', 'Delete this loan?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => { await deleteLoan(loan.id); navigation.goBack(); } },
          ]);
        }}>
          <Ionicons name="trash-outline" size={20} color="#f87171" />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={s.card}>
        <View style={s.avatarRow}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{loan.name[0].toUpperCase()}</Text>
          </View>
          <View>
            <Text style={s.name}>{loan.name}</Text>
            <Text style={s.meta}>
              {loan.type === 'lent' ? 'You lent' : 'You borrowed'} · {loan.status}
            </Text>
            {loan.note ? <Text style={s.note}>{loan.note}</Text> : null}
          </View>
        </View>

        <View style={s.amountRow}>
          <View style={s.amountBlock}>
            <Text style={s.amountLabel}>Total</Text>
            <Text style={s.amountValue}>₹{loan.amount.toLocaleString()}</Text>
          </View>
          <View style={s.amountBlock}>
            <Text style={s.amountLabel}>Paid</Text>
            <Text style={[s.amountValue, { color: '#34d399' }]}>₹{(loan.paid || 0).toLocaleString()}</Text>
          </View>
          <View style={s.amountBlock}>
            <Text style={s.amountLabel}>Remaining</Text>
            <Text style={[s.amountValue, { color: '#f87171' }]}>₹{remaining.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      {loan.status === 'pending' && (
        <View style={s.actions}>
          {loan.type === 'borrowed' && (
            <TouchableOpacity style={[s.btn, { borderColor: '#34d399' }]} onPress={() => openUPI(remaining)}>
              <Ionicons name="qr-code-outline" size={20} color="#34d399" />
              <Text style={[s.btnText, { color: '#34d399' }]}>Pay Full ₹{remaining}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[s.btn, { borderColor: '#fbbf24' }]} onPress={() => { setPartialInput(''); setPartialModal(true); }}>
            <Ionicons name="git-branch-outline" size={20} color="#fbbf24" />
            <Text style={[s.btnText, { color: '#fbbf24' }]}>Part Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btn, { borderColor: '#818cf8' }]} onPress={handleSettle}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#818cf8" />
            <Text style={[s.btnText, { color: '#818cf8' }]}>Mark Settled</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Partial Pay Modal */}
      <Modal visible={partialModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Pay Partial Amount</Text>
            <Text style={{ color: '#555', marginBottom: 12 }}>
              Remaining: ₹{remaining}
            </Text>
            <TextInput
              style={s.input}
              placeholder="Amount"
              placeholderTextColor="#444"
              keyboardType="numeric"
              value={partialInput}
              onChangeText={setPartialInput}
            />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setPartialModal(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handlePartialConfirm}>
                <Text style={s.saveText}>Pay</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  card: { backgroundColor: '#1a1a1a', marginHorizontal: 20, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#262626', marginBottom: 24 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#262626', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#34d399', fontWeight: '700', fontSize: 18 },
  name: { color: '#fff', fontSize: 18, fontWeight: '700' },
  meta: { color: '#555', fontSize: 13, marginTop: 2 },
  note: { color: '#444', fontSize: 12, marginTop: 2 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  amountBlock: { alignItems: 'center', flex: 1 },
  amountLabel: { color: '#555', fontSize: 11, marginBottom: 4 },
  amountValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
  actions: { paddingHorizontal: 20, gap: 12 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 14, backgroundColor: '#1a1a1a', borderWidth: 1 },
  btnText: { fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalBox: { backgroundColor: '#1a1a1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: { backgroundColor: '#262626', borderRadius: 12, padding: 14, color: '#fff', marginBottom: 16, fontSize: 15 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#262626', alignItems: 'center' },
  cancelText: { color: '#555', fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#34d399', alignItems: 'center' },
  saveText: { color: '#0d0d0d', fontWeight: '800' },
});