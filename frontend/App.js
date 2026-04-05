/*
Project Structure:
flowledger/
  frontend/
    App.js
*/

import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { isLoggedIn } from './src/store/authStore';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    isLoggedIn().then(v => { setLoggedIn(v); setChecking(false); });
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0d0d0d', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#34d399" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {loggedIn ? (
        <AppNavigator onLogout={() => setLoggedIn(false)} />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} onLogin={() => setLoggedIn(true)} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {props => <RegisterScreen {...props} onLogin={() => setLoggedIn(true)} />}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}