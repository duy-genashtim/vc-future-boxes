/**
 * Notifications Service
 * Handles push notifications for capsule unlock times
 *
 * @module services/notifications
 * @requires expo-notifications
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CapsuleType } from '../types';
import { CAPSULE_TYPES } from '../constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions from user
 *
 * @returns True if permission granted, false otherwise
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Only ask if permissions have not already been determined
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    console.log('Notification permission granted');

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('capsule-unlock', {
        name: 'Capsule Unlock',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B9D',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * Schedule notification for capsule unlock time
 *
 * @param capsuleId - Capsule ID
 * @param type - Capsule type
 * @param unlockTime - Date when capsule should unlock
 * @returns Notification ID if scheduled successfully, null otherwise
 */
export async function scheduleNotification(
  capsuleId: string,
  type: CapsuleType,
  unlockTime: Date
): Promise<string | null> {
  try {
    const typeConfig = CAPSULE_TYPES[type];
    const now = new Date();

    // Validate unlock time is in the future
    if (unlockTime <= now) {
      console.warn('Cannot schedule notification for past time');
      return null;
    }

    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time Capsule Ready! 🎁',
        body: `Your ${typeConfig.label} capsule is ready to open.`,
        data: { capsuleId, type },
        sound: 'default',
        ...(Platform.OS === 'ios' && {
          badge: 1,
          subtitle: 'Tap to open',
        }),
        ...(Platform.OS === 'android' && {
          priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
      },
      trigger: {
        date: unlockTime,
        channelId: Platform.OS === 'android' ? 'capsule-unlock' : undefined,
      },
    });

    console.log(`Notification scheduled for capsule ${capsuleId} at ${unlockTime.toISOString()}`);
    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 *
 * @param notificationId - Notification ID to cancel
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Notification ${notificationId} cancelled`);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 *
 * @returns Array of scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
}

/**
 * Setup notification received listener
 * Call this in App.tsx to handle notifications when app is in foreground
 *
 * @param handler - Function to call when notification is received
 * @returns Subscription object (call .remove() to unsubscribe)
 */
export function setupNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(handler);
}

/**
 * Setup notification response listener
 * Call this in App.tsx to handle user tapping on notification
 *
 * @param handler - Function to call when notification is tapped
 * @returns Subscription object (call .remove() to unsubscribe)
 */
export function setupNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

/**
 * Get the last notification response (for when app was opened from notification)
 *
 * @returns Last notification response or null
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    return response;
  } catch (error) {
    console.error('Failed to get last notification response:', error);
    return null;
  }
}

/**
 * Clear all delivered notifications (badge count)
 */
export async function clearAllDeliveredNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();

    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(0);
    }

    console.log('All delivered notifications cleared');
  } catch (error) {
    console.error('Failed to clear delivered notifications:', error);
  }
}

/**
 * Check if notification permissions are granted
 *
 * @returns True if granted, false otherwise
 */
export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to check notification permission:', error);
    return false;
  }
}

/**
 * Setup notification handlers for foreground and tap events
 * Call this in App.tsx to handle notification interactions
 *
 * @param onNotificationTap - Callback when user taps notification (receives capsuleId)
 * @returns Cleanup function to remove listeners
 */
export function setupNotificationHandlers(
  onNotificationTap: (capsuleId: string) => void
): () => void {
  // Handle notification received when app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received (foreground):', notification);
    // In foreground, we can show in-app banner or update UI
    // For now, just log it - the notification will still show
  });

  // Handle notification tap (when user taps on notification)
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification tapped, response:', response);

    const capsuleId = response.notification.request.content.data.capsuleId as string | undefined;

    if (capsuleId) {
      console.log('Navigating to capsule:', capsuleId);
      onNotificationTap(capsuleId);
    } else {
      console.warn('Notification tapped but no capsuleId in data');
    }
  });

  // Return cleanup function
  return () => {
    console.log('Removing notification listeners');
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}
