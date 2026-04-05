// frontend/src/store/expenseStore.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';
import { withFallback } from '../utils/withFallback';

const KEY = 'flowledger_expenses';
export const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Other'];

async function getLocal() {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

async function saveLocal(expenses) {
  await AsyncStorage.setItem(KEY, JSON.stringify(expenses));
}

export async function getExpenses() {
  return withFallback(
    async () => {
      const expenses = await api.get('/expenses/');
      await saveLocal(expenses);
      return expenses;
    },
    getLocal
  );
}

export async function saveExpense(expense) {
  return withFallback(
    async () => {
      const saved = await api.post('/expenses/', expense);
      const local = await getLocal();
      local.unshift(saved);
      await saveLocal(local);
      return saved;
    },
    async () => {
      const local = await getLocal();
      const newExp = { ...expense, id: Date.now().toString(), createdAt: new Date().toISOString() };
      local.unshift(newExp);
      await saveLocal(local);
      return newExp;
    }
  );
}

export async function deleteExpense(id) {
  return withFallback(
    async () => {
      await api.del(`/expenses/${id}`);
      const local = await getLocal();
      await saveLocal(local.filter(e => e.id != id));
    },
    async () => {
      const local = await getLocal();
      await saveLocal(local.filter(e => e.id != id));
    }
  );
}

export async function getMonthSummary() {
  const expenses = await getExpenses();
  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.created_at || e.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const total = thisMonth.reduce((s, e) => s + e.amount, 0);
  const byCategory = {};
  CATEGORIES.forEach(c => { byCategory[c] = 0; });
  thisMonth.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
  return { total, byCategory, count: thisMonth.length };
}