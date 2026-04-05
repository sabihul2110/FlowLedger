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
import { Animated, TouchableOpacity } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import LoansScreen from '../screens/LoansScreen';
import LoanDetailScreen from '../screens/LoanDetailScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import FriendsScreen from '../screens/FriendsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import InsightsScreen from '../screens/InsightsScreen';
import { C } from '../constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom tab bar button with scale press animation
function AnimatedTabButton({ children, onPress, accessibilityState }) {
  const scale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Smooth stack transition config
const stackTransition = {
  gestureEnabled: true,
  cardStyleInterpolator: ({ current, next, layouts }) => {
    const translateX = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [layouts.screen.width * 0.3, 0],
    });
    const opacity = current.progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 1],
    });
    const scale = next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.95],
        })
      : 1;
    return {
      cardStyle: { transform: [{ translateX }, { scale }], opacity },
    };
  },
  transitionSpec: {
    open: {
      animation: 'spring',
      config: { stiffness: 280, damping: 28, mass: 0.8, overshootClamping: false },
    },
    close: {
      animation: 'spring',
      config: { stiffness: 280, damping: 28, mass: 0.8 },
    },
  },
};

// Modal transition (for LoanDetail)
const modalTransition = {
  gestureEnabled: true,
  gestureDirection: 'vertical',
  cardStyleInterpolator: ({ current, layouts }) => {
    const translateY = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [layouts.screen.height, 0],
    });
    const opacity = current.progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 1],
    });
    return {
      cardStyle: { transform: [{ translateY }], opacity },
      overlayStyle: { opacity: current.progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) },
    };
  },
  transitionSpec: {
    open: {
      animation: 'spring',
      config: { stiffness: 300, damping: 30, mass: 0.9 },
    },
    close: {
      animation: 'spring',
      config: { stiffness: 300, damping: 30, mass: 0.9 },
    },
  },
};

function LoansStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="LoansList"
        component={LoansScreen}
        options={stackTransition}
      />
      <Stack.Screen
        name="LoanDetail"
        component={LoanDetailScreen}
        options={modalTransition}
      />
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
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor: C.border,
          height: 62,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: C.green,
        tabBarInactiveTintColor: C.textDisabled,
        tabBarButton: (props) => <AnimatedTabButton {...props} />,
        tabBarIcon: ({ focused, size }) => {
          const [active, inactive] = ICONS[route.name];
          return (
            <Ionicons
              name={focused ? active : inactive}
              size={focused ? size + 1 : size}
              color={focused ? C.green : C.textDisabled}
            />
          );
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
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