import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CustomerHomeScreen from '../screens/CustomerHomeScreen';
import WorkerListScreen from '../screens/WorkerListScreen';
import BookingScreen from '../screens/BookingScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import WorkerDashboardScreen from '../screens/WorkerDashboardScreen';
import WorkerProfileScreen from '../screens/WorkerProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Customer: bottom tabs (Home, My Bookings) with a stack for Home -> WorkerList -> Booking
function CustomerHomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} options={{ title: 'Home', headerShown: false }} />
      <Stack.Screen name="WorkerList" component={WorkerListScreen} options={{ title: 'Available Workers' }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'New Booking' }} />
    </Stack.Navigator>
  );
}

function CustomerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1B5E3C' }}>
      <Tab.Screen name="HomeTab" component={CustomerHomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Bookings', headerShown: true }} />
    </Tab.Navigator>
  );
}

function WorkerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true, tabBarActiveTintColor: '#1B5E3C' }}>
      <Tab.Screen name="Dashboard" component={WorkerDashboardScreen} options={{ title: 'Booking Requests' }} />
      <Tab.Screen name="Profile" component={WorkerProfileScreen} options={{ title: 'My Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1B5E3C" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? <AuthStack /> : user.role === 'customer' ? <CustomerTabs /> : <WorkerTabs />}
    </NavigationContainer>
  );
}
