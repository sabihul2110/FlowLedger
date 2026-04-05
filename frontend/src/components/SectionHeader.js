// frontend/src/components/SectionHeader.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { C, S, T } from '../constants';

const SectionHeader = React.memo(({ title }) => (
  <Text style={styles.text}>{title}</Text>
));

const styles = StyleSheet.create({
  text: {
    color: C.textMuted,
    fontSize: T.xs,
    fontWeight: T.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: S.md,
  },
});

export default SectionHeader;