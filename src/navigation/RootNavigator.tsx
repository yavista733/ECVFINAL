import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../context/AuthContext';
import { RootStackParamList } from './types';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import FeedScreen from '../screens/feed/FeedScreen';
import CreatePostScreen from '../screens/feed/CreatePostScreen';
import InboxScreen from '../screens/chat/InboxScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopColor: '#374151',
          borderTopWidth: 0.5,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'home-outline';
          if (route.name === 'HomeFeed') iconName = 'home-outline';
          else if (route.name === 'Inbox') iconName = 'chatbubbles-outline';
          else if (route.name === 'Create') iconName = 'add-circle-outline';
          else if (route.name === 'MyProfile') iconName = 'person-outline';
          else if (route.name === 'SettingsTab') iconName = 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeFeed" component={FeedScreen} options={{ tabBarLabel: 'Home Feed' }} />
      <Tab.Screen name="Inbox" component={InboxScreen} options={{ tabBarLabel: 'Inbox' }} />
      <Tab.Screen name="Create" component={CreatePostScreen} options={{ tabBarLabel: 'Create' }} />
      <Tab.Screen name="MyProfile" component={ProfileScreen} options={{ tabBarLabel: 'My Profile' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
