// frontend/src/components/EmptyState.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, S, T } from '../constants';

const EmptyState = React.memo(({ icon, message, subtext }) => (
  <View style={styles.container}>
    <Ionicons name={icon} size={48} color={C.textDisabled} />
    <Text style={styles.message}>{message}</Text>
    {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
  </View>
));

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48, gap: S.md },
  message: { color: C.textMuted, fontSize: T.base, fontWeight: T.medium },
  subtext: { color: C.textDisabled, fontSize: T.sm },
});

export default EmptyState;