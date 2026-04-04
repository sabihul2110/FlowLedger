/*
Project Structure:
flowledger/
  frontend/
    src/
      store/
        expenseStore.js
*/

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'flowledger_expenses';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Other'];
export { CATEGORIES };

export async function getExpenses() {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveExpense(expense) {
  const expenses = await getExpenses();
  const newExpense = {
    ...expense,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  expenses.unshift(newExpense);
  await AsyncStorage.setItem(KEY, JSON.stringify(expenses));
  return newExpense;
}

export async function deleteExpense(id) {
  const expenses = await getExpenses();
  const filtered = expenses.filter(e => e.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(filtered));
}

// Returns total spent this month + breakdown by category
export async function getMonthSummary() {
  const expenses = await getExpenses();
  const now = new Date();
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const total = thisMonth.reduce((s, e) => s + e.amount, 0);
  const byCategory = {};
  CATEGORIES.forEach(c => { byCategory[c] = 0; });
  thisMonth.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });
  return { total, byCategory, count: thisMonth.length };
}