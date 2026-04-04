// frontend/src/hooks/useExpenses.js
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getExpenses } from '../store/expenseStore';

export default function useExpenses(month, year) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const all = await getExpenses();
    const filtered = all.filter(e => {
      const d = new Date(e.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    setExpenses(filtered);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { load(); }, [month, year]));

  return { expenses, loading, reload: load };
}