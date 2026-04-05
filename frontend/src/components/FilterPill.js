// frontend/src/components/FilterPill.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { C, S, T } from '../constants';

const FilterPill = React.memo(({ label, active, onPress, activeColor }) => {
  const color = activeColor || C.green;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.pill, active && { backgroundColor: color, borderColor: color }]}
    >
      <Text style={[styles.text, active && { color: '#0a0a0a', fontWeight: T.bold }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: S.base,
    paddingVertical: S.sm - 1,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  text: { color: C.textMuted, fontSize: T.sm },
});

export default FilterPill;