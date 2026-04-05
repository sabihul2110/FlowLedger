// frontend/src/components/LoadingScreen.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { C } from '../constants';

const LoadingScreen = React.memo(() => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={C.green} />
  </View>
));

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
});

export default LoadingScreen;