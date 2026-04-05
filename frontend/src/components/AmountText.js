// frontend/src/components/AmountText.js
import React from 'react';
import { Text } from 'react-native';
import { C, T } from '../constants';

const AmountText = React.memo(({ amount, positive, style }) => (
  <Text style={[{
    color: positive ? C.green : C.red,
    fontSize: T.md,
    fontWeight: T.bold,
  }, style]}>
    {positive ? '+' : '-'}₹{Math.abs(amount).toLocaleString()}
  </Text>
));

export default AmountText;