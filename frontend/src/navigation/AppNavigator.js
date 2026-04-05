/*
Project Structure:
flowledger/
  frontend/
    src/
      navigation/
        AppNavigator.js
*/

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import LoansScreen from '../screens/LoansScreen';
import LoanDetailScreen from '../screens/LoanDetailScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import FriendsScreen from '../screens/FriendsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import InsightsScreen from '../screens/InsightsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function LoansStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoansList" component={LoansScreen} />
      <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack({ onLogout }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain">
        {props => <ProfileScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const ICONS = {
  Home: ['home', 'home-outline'],
  Loans: ['wallet', 'wallet-outline'],
  Expenses: ['receipt', 'receipt-outline'],
  Friends: ['people', 'people-outline'],
  Insights: ['bar-chart', 'bar-chart-outline'],
  Profile: ['person', 'person-outline'],
};

export default function AppNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0d0d0d', borderTopColor: '#1a1a1a', height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: '#34d399',
        tabBarInactiveTintColor: '#444',
        tabBarIcon: ({ focused, size }) => {
          const [active, inactive] = ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size} color={focused ? '#34d399' : '#444'} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Loans" component={LoansStack} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Profile">
        {() => <ProfileStack onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}