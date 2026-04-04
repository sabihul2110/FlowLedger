/*
Project Structure:
flowledger/
  frontend/
    src/
      store/
        loanStore.js
*/

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'flowledger_loans';

export async function getLoans() {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveLoan(loan) {
  const loans = await getLoans();
  const newLoan = {
    ...loan,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    status: 'pending', // pending | settled
  };
  loans.unshift(newLoan);
  await AsyncStorage.setItem(KEY, JSON.stringify(loans));
  return newLoan;
}

export async function settleLoan(id) {
  const loans = await getLoans();
  const updated = loans.map(l => l.id === id ? { ...l, status: 'settled' } : l);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function deleteLoan(id) {
  const loans = await getLoans();
  const filtered = loans.filter(l => l.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(filtered));
}

// Returns { totalLent, totalOwed, net }
export async function getBalanceSummary() {
  const loans = await getLoans();
  const active = loans.filter(l => l.status === 'pending');
  const totalLent = active.filter(l => l.type === 'lent').reduce((s, l) => s + l.amount, 0);
  const totalOwed = active.filter(l => l.type === 'borrowed').reduce((s, l) => s + l.amount, 0);
  return { totalLent, totalOwed, net: totalLent - totalOwed };
}

export async function payPartial(id, amount) {
  const loans = await getLoans();
  const updated = loans.map(l => {
    if (l.id !== id) return l;
    const paid = (l.paid || 0) + amount;
    const remaining = l.amount - paid;
    return {
      ...l,
      paid,
      status: remaining <= 0 ? 'settled' : 'pending',
    };
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}