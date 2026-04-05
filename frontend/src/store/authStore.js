// frontend/src/store/authStore.js

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'flowledger_token';
const USER_KEY = 'flowledger_user';
const PROFILE_KEY = 'flowledger_profile';

export async function saveAuth(token, user) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  // Seed profile from registration/login data (only if no profile exists)
  const existing = await AsyncStorage.getItem(PROFILE_KEY);
  if (!existing) {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({
      name: user.name || '',
      upi: user.upi || '',
      phone: user.phone || '',
    }));
  } else {
    // Always update name from auth source
    const p = JSON.parse(existing);
    if (p.name !== user.name) {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ ...p, name: user.name }));
    }
  }
}

export async function getToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearAuth() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, PROFILE_KEY]);
}

export async function isLoggedIn() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return !!token;
}