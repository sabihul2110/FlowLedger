/*
Project Structure:
flowledger/
  frontend/
    src/
      navigation/
        AppNavigator.js
*/

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import LoansScreen from '../screens/LoansScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import FriendsScreen from '../screens/FriendsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: ['home', 'home-outline'],
  Loans: ['wallet', 'wallet-outline'],
  Expenses: ['receipt', 'receipt-outline'],
  Friends: ['people', 'people-outline'],
  Profile: ['person', 'person-outline'],
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f0f0f',
          borderTopColor: '#1a1a1a',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#00e5a0',
        tabBarInactiveTintColor: '#444',
        tabBarIcon: ({ focused, size }) => {
          const [active, inactive] = ICONS[route.name];
          return (
            <Ionicons
              name={focused ? active : inactive}
              size={size}
              color={focused ? '#00e5a0' : '#444'}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Loans" component={LoansScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}