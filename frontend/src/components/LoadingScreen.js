// frontend/src/components/LoadingScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { C } from '../constants';

// const LoadingScreen = React.memo(() => {
//   const opacity = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(opacity, {
//       toValue: 1,
//       duration: 200,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   return (
//     <Animated.View style={[styles.container, { opacity }]}>
//       <View style={styles.dot} />
//     </Animated.View>
//   );
// });

// Pulsing dot loader
function PulsingDot() {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 500, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.dot, { transform: [{ scale }] }]} />
  );
}

export default function LoadingScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <PulsingDot />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.green },
});