/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        LoginScreen.js
*/

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveAuth } from '../store/authStore';

// const BASE_URL = 'http://10.20.8.129:8000';
const BASE_URL = 'https://flowledger-c272.onrender.com'

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return Alert.alert('Error', 'Fill all fields');
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      await saveAuth(data.access_token, {
        id: data.user_id,
        name: data.name,
        upi: data.upi || '',
        phone: data.phone || '',
      });
      onLogin();
    } catch (e) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
        <Text style={s.logo}>₹</Text>
        <Text style={s.appName}>FlowLedger</Text>
        <Text style={s.tagline}>Track. Settle. Move on.</Text>

        <View style={s.form}>
          <TextInput style={s.input} placeholder="Email" placeholderTextColor="#444" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={s.input} placeholder="Password" placeholderTextColor="#444" secureTextEntry value={password} onChangeText={setPassword} />
          <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
            <Text style={s.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.link} onPress={() => navigation.navigate('Register')}>
            <Text style={s.linkText}>Don't have an account? <Text style={s.linkHighlight}>Register</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d0d' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logo: { color: '#34d399', fontSize: 56, fontWeight: '800', textAlign: 'center' },
  appName: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  tagline: { color: '#444', fontSize: 14, textAlign: 'center', marginBottom: 40 },
  form: { gap: 12 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#262626' },
  btn: { backgroundColor: '#34d399', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#0d0d0d', fontWeight: '800', fontSize: 16 },
  link: { alignItems: 'center', marginTop: 8 },
  linkText: { color: '#444', fontSize: 14 },
  linkHighlight: { color: '#34d399', fontWeight: '600' },
});