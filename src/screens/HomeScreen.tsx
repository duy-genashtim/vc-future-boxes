/**
 * HomeScreen.tsx
 * Main home screen displaying 6 nearest unlocking capsules in 3x2 grid
 * F2: Home Screen feature implementation (UI/UX layer only)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
  Dimensions,
  RefreshControl,
  AppState,
  AppStateStatus,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';

import { Capsule, RootStackParamList } from '../types';
import CapsuleCard from '../components/CapsuleCard';
import { getCapsulesByStatus, checkAndUpdateReadyCapsules } from '../services';
import { formatCountdown } from '../utils/formatCountdown';

const { width } = Dimensions.get('window');

type Props = StackScreenProps<RootStackParamList, 'Home'>;

/**
 * EmptyStateComponent
 * Separate component to ensure hooks are called at top level
 * Fixes "Rendered fewer hooks than expected" error
 */
const EmptyStateComponent = ({ onCreatePress }: { onCreatePress: () => void }) => {
  // Create shared value for icon scale animation
  const iconScale = useSharedValue(1);

  // Start icon pulse animation on mount
  useEffect(() => {
    iconScale.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 3, stiffness: 100 }),
        withSpring(1.0, { damping: 3, stiffness: 100 })
      ),
      -1, // Infinite loop
      false
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <View style={styles.emptyState}>
      {/* Icon container - FadeIn 400ms delay 0ms */}
      <Animated.View
        entering={FadeIn.duration(400).delay(0)}
        style={[styles.emptyIconContainer, iconAnimatedStyle]}
      >
        <Ionicons name="cube-outline" size={80} color="#9CA3AF" />
      </Animated.View>

      {/* Title - FadeIn 300ms delay 200ms */}
      <Animated.Text
        entering={FadeIn.duration(300).delay(200)}
        style={styles.emptyTitle}
      >
        No time capsules yet
      </Animated.Text>

      {/* Description - FadeIn 300ms delay 300ms */}
      <Animated.Text
        entering={FadeIn.duration(300).delay(300)}
        style={styles.emptyDescription}
      >
        Create your first capsule to send a message to your future self!
      </Animated.Text>

      {/* CTA button - FadeIn 300ms delay 400ms */}
      <Animated.View entering={FadeIn.duration(300).delay(400)}>
        <Pressable
          style={({ pressed }) => [
            styles.emptyButton,
            pressed && styles.emptyButtonPressed,
          ]}
          onPress={onCreatePress}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyButtonGradient}
          >
            <Text style={styles.emptyButtonText}>Create First Capsule</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default function HomeScreen({ navigation }: Props) {
  // State for capsules (real data from database)
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // FAB animation
  const fabScale = useSharedValue(1);

  /**
   * Load capsules from database
   * Fetches locked and ready capsules, max 6, sorted by unlock time
   */
  const loadCapsules = useCallback(async () => {
    try {
      // Check and update ready capsules before loading
      await checkAndUpdateReadyCapsules();

      // Load 6 capsules: status = 'locked' or 'ready'
      // Sort by unlockAt ASC (soonest first)
      const data = await getCapsulesByStatus(['locked', 'ready'], 6);
      setCapsules(data);
    } catch (error) {
      console.error('Failed to load capsules:', error);
      Alert.alert('Error', 'Failed to load capsules. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCapsules();
  }, [loadCapsules]);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    loadCapsules();
  }, [loadCapsules]);

  /**
   * Real-time countdown update check
   * Check every 60 seconds if any capsule became ready
   */
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updated = await checkAndUpdateReadyCapsules();
        if (updated > 0) {
          // Some capsules became ready, reload the list
          await loadCapsules();
        }
      } catch (error) {
        console.error('Failed to check ready capsules:', error);
      }
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [loadCapsules]);

  /**
   * AppState listener - check capsule status when app comes to foreground
   * Handles scenario where app was backgrounded and timer reached unlock time
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, check if any capsule became ready
        try {
          const updated = await checkAndUpdateReadyCapsules();
          if (updated > 0) {
            await loadCapsules();
          }
        } catch (error) {
          console.error('Failed to check ready capsules on foreground:', error);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loadCapsules]);

  /**
   * FAB pulse animation
   */
  useEffect(() => {
    const interval = setInterval(() => {
      fabScale.value = withSpring(1.05, { damping: 5 });
      setTimeout(() => {
        fabScale.value = withSpring(1.0, { damping: 5 });
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Handle tap on capsule card
   * - Ready capsule: Navigate to Open Capsule screen
   * - Locked capsule: Show alert with time remaining
   */
  const handleCapsuleTap = useCallback((capsule: Capsule) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (capsule.status === 'ready') {
      // Navigate to Open Capsule Screen
      navigation.navigate('OpenCapsule', { capsuleId: capsule.id });
    } else {
      // Show "still locked" message with formatted countdown
      const formattedTime = formatCountdown(capsule.unlockAt);

      Alert.alert(
        'Still Locked',
        `This capsule will unlock in ${formattedTime}.`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [navigation]);

  /**
   * Handle FAB press
   * Navigate to Type Selection screen
   */
  const handleFABPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('TypeSelection');
  }, [navigation]);

  /**
   * Handle Archive button press
   * Navigate to Archive screen
   */
  const handleArchivePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Archive');
  }, [navigation]);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const renderCapsuleGrid = () => (
    <View style={styles.gridContainer}>
      {capsules.map((capsule, index) => (
        <Animated.View
          key={capsule.id}
          entering={FadeInDown.delay(index * 50).springify()}
        >
          <CapsuleCard capsule={capsule} onPress={handleCapsuleTap} />
        </Animated.View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FutureBoxes</Text>
        <Pressable
          onPress={handleArchivePress}
          style={({ pressed }) => [
            styles.archiveButton,
            pressed && styles.archiveButtonPressed,
          ]}
        >
          <Ionicons name="archive-outline" size={24} color="#6366F1" />
        </Pressable>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
            colors={['#6366F1']}
          />
        }
      >
        {/* Section Header */}
        {capsules.length > 0 && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>UNLOCKING SOON</Text>
            <Text style={styles.sectionCount}>{capsules.length} Capsules</Text>
          </View>
        )}

        {/* Capsule Grid or Empty State */}
        {capsules.length === 0 ? (
          <EmptyStateComponent onCreatePress={handleFABPress} />
        ) : (
          renderCapsuleGrid()
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, fabAnimatedStyle]}>
        <Pressable
          onPress={handleFABPress}
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed,
          ]}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={32} color="white" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  archiveButton: {
    padding: 8,
  },
  archiveButtonPressed: {
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // Space for FAB
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyButtonPressed: {
    opacity: 0.8,
  },
  emptyButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  fabPressed: {
    transform: [{ scale: 0.9 }],
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
