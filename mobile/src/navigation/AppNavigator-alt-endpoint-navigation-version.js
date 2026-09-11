import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CustomerHomeScreen from '../screens/CustomerHomeScreen';
import WorkerListScreen from '../screens/WorkerListScreen';
import BookingScreen from '../screens/BookingScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import WorkerDashboardScreen from '../screens/WorkerDashboardScreen';
import WorkerProfileScreen from '../screens/WorkerProfileScreen';
import VoiceToTextConverter from '../screens/VoiceToTextConverter';
import Demand_forecast from '../screens/demand_forecast'

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 1. Web Link Configuration mapping URLs to Screen Names
const linking = {
  prefixes: ['http://localhost:8081'],
  config: {
    screens: {
      vttc: 'vttc',
      forecast:'forecast',
      Login: 'login',
      Register: 'register',
      CustomerTabs: {
        path: 'customer',
        screens: {
          HomeTab: {
            path: 'flow',
            screens: {
              CustomerHome: 'home',
              WorkerList: 'workers',
              Booking: 'booking',
              
            }
          },
          MyBookings: 'bookings',
        }
      },
      WorkerTabs: {
        path: 'worker',
        screens: {
          Dashboard: 'dashboard',
          Profile: 'profile',
        },
      },
    },
  },
};

// Customer Tab Flow
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

// Worker Tab Flow
function WorkerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true, tabBarActiveTintColor: '#1B5E3C' }}>
      <Tab.Screen name="Dashboard" component={WorkerDashboardScreen} options={{ title: 'Booking Requests' }} />
      <Tab.Screen name="Profile" component={WorkerProfileScreen} options={{ title: 'My Profile' }} />
    </Tab.Navigator>
  );
}

// Main Navigator containing EVERYTHING with NO auth barrier
export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="vttc" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
        <Stack.Screen name="WorkerTabs" component={WorkerTabs} />
        <Stack.Screen name="vttc" component={VoiceToTextConverter} />
        <Stack.Screen name="forecast" component={Demand_forecast} />
        
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
