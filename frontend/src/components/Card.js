// frontend/src/components/Card.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { C, S } from '../constants';

const Card = React.memo(({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
));

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: S.lg,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Card;