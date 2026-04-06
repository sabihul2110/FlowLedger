/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        RegisterScreen.js
*/

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveAuth } from '../store/authStore';

// const BASE_URL = 'http://10.20.8.129:8000';
const BASE_URL = "https://flowledger-c272.onrender.com";

export default function RegisterScreen({ navigation, onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', upi: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return Alert.alert('Error', 'Name, email and password are required');
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');
      await saveAuth(data.access_token, {
        id: data.user_id,
        name: data.name,
        upi: data.upi || '',
        phone: data.phone || '',
      });
      onLogin();
    } catch (e) {
      Alert.alert('Registration Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <Text style={s.logo}>₹</Text>
          <Text style={s.appName}>Create Account</Text>
          <Text style={s.tagline}>Start tracking your money</Text>

          <View style={s.form}>
            <TextInput style={s.input} placeholder="Full name *" placeholderTextColor="#444" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
            <TextInput style={s.input} placeholder="Email *" placeholderTextColor="#444" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} />
            <TextInput style={s.input} placeholder="Password *" placeholderTextColor="#444" secureTextEntry value={form.password} onChangeText={v => setForm(f => ({ ...f, password: v }))} />
            <TextInput style={s.input} placeholder="UPI ID (optional)" placeholderTextColor="#444" autoCapitalize="none" value={form.upi} onChangeText={v => setForm(f => ({ ...f, upi: v }))} />
            <TextInput style={s.input} placeholder="Phone (optional)" placeholderTextColor="#444" keyboardType="phone-pad" value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} />
            <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
              <Text style={s.btnText}>{loading ? 'Creating account...' : 'Register'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.link} onPress={() => navigation.navigate('Login')}>
              <Text style={s.linkText}>Already have an account? <Text style={s.linkHighlight}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d0d' },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  logo: { color: '#34d399', fontSize: 48, fontWeight: '800', textAlign: 'center' },
  appName: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  tagline: { color: '#444', fontSize: 14, textAlign: 'center', marginBottom: 32 },
  form: { gap: 12 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#262626' },
  btn: { backgroundColor: '#34d399', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#0d0d0d', fontWeight: '800', fontSize: 16 },
  link: { alignItems: 'center', marginTop: 8 },
  linkText: { color: '#444', fontSize: 14 },
  linkHighlight: { color: '#34d399', fontWeight: '600' },
});