// frontend/src/hooks/useLoans.js
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getLoans, getBalanceSummary } from '../store/loanStore';

export default function useLoans() {
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState({ totalLent: 0, totalOwed: 0, net: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getLoans();
    const bal = await getBalanceSummary();
    setLoans(data);
    setSummary(bal);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  return { loans, summary, loading, reload: load };
}