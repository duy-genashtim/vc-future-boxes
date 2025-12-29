/**
 * App.tsx
 * Root component of FutureBoxes app
 * Handles database initialization, notification setup, and navigation
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator, { navigationRef } from './navigation/AppNavigator';
import { initializeDatabase, getAppSettings } from './services/database';
import { initializeImageStorage } from './services/imageStorage';
import {
  requestNotificationPermission,
  setupNotificationHandlers,
  getLastNotificationResponse,
} from './services/notifications';
import type { RootStackParamList } from './types';

export default function App() {
  const [dbReady, setDbReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Home');

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURN

  useEffect(() => {
    async function setup() {
      try {
        console.log('Initializing app...');

        // 1. Initialize database
        console.log('Initializing database...');
        await initializeDatabase();
        console.log('Database initialized successfully');

        // 2. Initialize image storage
        console.log('Initializing image storage...');
        await initializeImageStorage();
        console.log('Image storage initialized successfully');

        // 3. Check onboarding status
        console.log('Checking onboarding status...');
        const settings = await getAppSettings();

        if (!settings.onboardingCompleted) {
          console.log('First launch detected - showing onboarding');
          setInitialRoute('Onboarding');
        } else {
          console.log('Return user - going to Home');
          setInitialRoute('Home');
        }

        // 4. Request notification permission
        console.log('Requesting notification permission...');
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied (will ask again when creating capsule)');
        }

        setDbReady(true);
        console.log('App initialization complete');
      } catch (err) {
        console.error('App initialization failed:', err);
        setError('Failed to initialize app. Please restart the app.');
      }
    }

    setup();
  }, []);

  // Setup notification handlers
  useEffect(() => {
    if (!dbReady) return;

    console.log('Setting up notification handlers...');

    // Handle notification tap
    const cleanup = setupNotificationHandlers((capsuleId: string) => {
      console.log('Notification tap handler called with capsuleId:', capsuleId);

      // Navigate to OpenCapsule screen
      // Need to wait a bit to ensure navigation is ready
      setTimeout(() => {
        if (navigationRef.current) {
          navigationRef.current.navigate('OpenCapsule', { capsuleId });
          console.log('Navigated to OpenCapsule screen');
        } else {
          console.warn('Navigation ref not ready');
        }
      }, 100);
    });

    return cleanup;
  }, [dbReady]);

  // Check if app was launched from notification
  useEffect(() => {
    if (!dbReady) return;

    async function checkLastNotification() {
      console.log('Checking if app was launched from notification...');

      const response = await getLastNotificationResponse();
      if (response) {
        const capsuleId = response.notification.request.content.data.capsuleId as string | undefined;

        if (capsuleId) {
          console.log('App launched from notification, capsuleId:', capsuleId);

          // Navigate after app is fully initialized
          setTimeout(() => {
            if (navigationRef.current) {
              navigationRef.current.navigate('OpenCapsule', { capsuleId });
              console.log('Navigated to OpenCapsule from killed state');
            }
          }, 1000);
        }
      } else {
        console.log('App not launched from notification');
      }
    }

    checkLastNotification();
  }, [dbReady]);

  // RENDER - All hooks called above, now safe to do conditional rendering

  // Loading screen while app initializes
  if (!dbReady && !error) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Initializing FutureBoxes...</Text>
      </View>
    );
  }

  // Error screen if initialization fails
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="dark" />
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Initialization Failed</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Main app with navigation
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" />
      <AppNavigator initialRouteName={initialRoute} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
