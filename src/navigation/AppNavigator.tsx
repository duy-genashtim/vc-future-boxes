/**
 * AppNavigator.tsx
 * Root navigation configuration for FutureBoxes app
 * Uses Stack Navigator for screen transitions
 */

import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import TypeSelectionScreen from '../screens/TypeSelectionScreen';
import CreateCapsuleScreen from '../screens/CreateCapsuleScreen';
import PreviewCapsuleScreen from '../screens/PreviewCapsuleScreen';
import LockAnimationScreen from '../screens/LockAnimationScreen';
import OpenCapsuleScreen from '../screens/OpenCapsuleScreen';
import ReflectionScreen from '../screens/ReflectionScreen';
import CelebrationScreen from '../screens/CelebrationScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import ArchiveDetailScreen from '../screens/ArchiveDetailScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

const Stack = createStackNavigator<RootStackParamList>();

// Navigation reference for deep linking and notification handling
export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

// Default screen options
const defaultScreenOptions: StackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  cardStyleInterpolator: ({ current: { progress } }) => ({
    cardStyle: {
      opacity: progress,
    },
  }),
};

interface AppNavigatorProps {
  initialRouteName?: keyof RootStackParamList;
}

export default function AppNavigator({ initialRouteName = 'Home' }: AppNavigatorProps) {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={defaultScreenOptions}
      >
        {/* F2: Home Screen */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        {/* F3: Type Selection */}
        <Stack.Screen
          name="TypeSelection"
          component={TypeSelectionScreen}
        />

        {/* F4: Create Capsule */}
        <Stack.Screen
          name="CreateCapsule"
          component={CreateCapsuleScreen}
        />

        {/* F4: Preview Capsule */}
        <Stack.Screen
          name="PreviewCapsule"
          component={PreviewCapsuleScreen}
        />

        {/* F5: Lock Animation */}
        <Stack.Screen
          name="LockAnimation"
          component={LockAnimationScreen}
        />

        {/* F8: Open Capsule */}
        <Stack.Screen
          name="OpenCapsule"
          component={OpenCapsuleScreen}
        />

        {/* F9: Reflection Response */}
        <Stack.Screen
          name="Reflection"
          component={ReflectionScreen}
        />

        {/* F10: Celebration Effects */}
        <Stack.Screen
          name="Celebration"
          component={CelebrationScreen}
        />

        {/* F11: Archive Screen */}
        <Stack.Screen
          name="Archive"
          component={ArchiveScreen}
        />

        {/* F12: Archive Detail Screen */}
        <Stack.Screen
          name="ArchiveDetail"
          component={ArchiveDetailScreen}
        />

        {/* F13: Onboarding Screen */}
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
        />

        {/* Other screens - Placeholder */}
        <Stack.Screen
          name="CapsuleDetail"
          component={PlaceholderScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
