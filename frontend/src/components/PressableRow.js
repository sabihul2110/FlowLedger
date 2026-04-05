// frontend/src/components/PressableRow.js
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { C, S } from '../constants';

const PressableRow = React.memo(({ onPress, style, children }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[styles.row, style]}
  >
    {children}
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  row: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: S.base,
    marginBottom: S.sm,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default PressableRow;