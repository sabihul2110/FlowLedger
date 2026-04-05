// frontend/src/store/authStore.js

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'flowledger_token';
const USER_KEY = 'flowledger_user';

export async function saveAuth(token, user) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearAuth() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export async function isLoggedIn() {
  const token = await getToken();
  return !!token;
}