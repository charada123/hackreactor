import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { useTheme } from './src/theme';
import type { RootStackParamList } from './src/navigation';
import HomeScreen from './src/screens/HomeScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import MockInterviewScreen from './src/screens/MockInterviewScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import TipsScreen from './src/screens/TipsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function tabIcon(emoji: string) {
  return ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

function Tabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: tabIcon('🏛️') }}
      />
      <Tab.Screen
        name="Topics"
        component={CategoriesScreen}
        options={{ tabBarIcon: tabIcon('🗂️') }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ tabBarIcon: tabIcon('📈') }}
      />
      <Tab.Screen
        name="Tips"
        component={TipsScreen}
        options={{ tabBarIcon: tabIcon('💡') }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const navTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          ...navTheme,
          colors: {
            ...navTheme.colors,
            primary: theme.primary,
            background: theme.bg,
            card: theme.card,
            text: theme.text,
            border: theme.border,
          },
        }}
      >
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: theme.card },
            headerTintColor: theme.text,
            headerTitleStyle: { fontWeight: '800' },
            contentStyle: { backgroundColor: theme.bg },
          }}
        >
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="Practice"
            component={PracticeScreen}
            options={{ title: 'Practice', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="MockInterview"
            component={MockInterviewScreen}
            options={{ title: 'Mock Interview', headerBackTitle: 'Back' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
