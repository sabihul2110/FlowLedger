// frontend/src/hooks/useExpenses.js
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getExpenses } from '../store/expenseStore';

export default function useExpenses(month, year) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await getExpenses();
    const filtered = all.filter(e => {
      const d = new Date(e.created_at || e.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    setExpenses(filtered);
    setLoading(false);
  }, [month, year]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { load(); }, [month, year]);

  return { expenses, loading, reload: load };
}