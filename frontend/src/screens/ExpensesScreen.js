/*
Project Structure:
flowledger/
  frontend/
    src/
      screens/
        ExpensesScreen.js
*/

import { View, Text, StyleSheet } from 'react-native';

export default function ExpensesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  text: { color: '#fff', fontSize: 18 },
});