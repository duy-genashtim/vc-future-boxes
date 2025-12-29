/**
 * LockAnimationScreen.tsx
 * F5: Lock Capsule - Animation screen
 *
 * Beautiful "magical moment" animation when capsule is locked
 * Auto-plays animation then navigates to Home screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import { RootStackParamList } from '../types';
import { CAPSULE_TYPES, ANIMATIONS } from '../constants';
import { getCapsule } from '../services/database';

type Props = StackScreenProps<RootStackParamList, 'LockAnimation'>;

const { width, height } = Dimensions.get('window');
const ICON_SIZE = 150;
const LOCK_SIZE = 80;

export default function LockAnimationScreen({ route, navigation }: Props) {
  const { capsuleId } = route.params;

  const [capsuleType, setCapsuleType] = useState<keyof typeof CAPSULE_TYPES>('emotion');
  const [reduceMotion, setReduceMotion] = useState(false);

  // Animated values
  const capsuleScale = useSharedValue(0.5);
  const capsuleOpacity = useSharedValue(0);
  const lockScale = useSharedValue(0);
  const lockRotation = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const sceneOpacity = useSharedValue(1);

  // Load capsule data
  useEffect(() => {
    async function loadCapsule() {
      try {
        const capsule = await getCapsule(capsuleId);
        if (!capsule) {
          // Capsule not found - navigate to Home immediately
          console.error('Capsule not found:', capsuleId);
          navigation.replace('Home');
          return;
        }
        setCapsuleType(capsule.type);
      } catch (error) {
        console.error('Failed to load capsule:', error);
        // On error, also navigate to Home
        navigation.replace('Home');
      }
    }

    loadCapsule();
  }, [capsuleId, navigation]);

  // Check accessibility reduce motion
  useEffect(() => {
    async function checkReduceMotion() {
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      setReduceMotion(isReduceMotionEnabled);

      if (isReduceMotionEnabled) {
        // Skip animation, go straight to Home
        setTimeout(() => {
          navigation.replace('Home');
        }, 300);
      }
    }

    checkReduceMotion();
  }, [navigation]);

  // Start animation sequence
  useEffect(() => {
    if (reduceMotion) return;

    // Phase 1: Capsule appear (0-300ms)
    capsuleOpacity.value = withTiming(1, { duration: 300 });
    capsuleScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });

    // Phase 2: Lock close (300-800ms)
    lockScale.value = withDelay(
      300,
      withSpring(1, {
        damping: 12,
        stiffness: 150,
      })
    );

    lockRotation.value = withDelay(
      300,
      withTiming(360, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Haptic at lock close moment (500ms)
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 500);

    // Phase 3: Success checkmark (800-1200ms)
    checkScale.value = withDelay(
      800,
      withSequence(
        withSpring(1.2, {
          damping: 8,
          stiffness: 200,
        }),
        withSpring(1, {
          damping: 10,
          stiffness: 150,
        })
      )
    );

    textOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 300 })
    );

    // Haptic at success moment (1000ms)
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1000);

    // Phase 4: Fade out (1200-1500ms)
    sceneOpacity.value = withDelay(
      1200,
      withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      })
    );

    // Phase 5: Navigate to Home (1500ms)
    const navigateTimer = setTimeout(() => {
      navigation.replace('Home');
    }, ANIMATIONS.LOCK_DURATION);

    return () => {
      clearTimeout(navigateTimer);
    };
  }, [reduceMotion, navigation]);

  // Animated styles
  const capsuleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: capsuleScale.value }],
    opacity: capsuleOpacity.value,
  }));

  const lockAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: lockScale.value },
      { rotate: `${lockRotation.value}deg` },
    ],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const sceneAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sceneOpacity.value,
  }));

  const typeConfig = CAPSULE_TYPES[capsuleType];

  if (reduceMotion) {
    return null; // Will navigate away immediately
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={typeConfig.gradient[0]} />

      {/* Background Gradient */}
      <LinearGradient
        colors={[...typeConfig.gradient, typeConfig.gradient[0]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Animation Scene */}
      <Animated.View style={[styles.scene, sceneAnimatedStyle]}>
        {/* Capsule Icon */}
        <Animated.View style={[styles.capsuleContainer, capsuleAnimatedStyle]}>
          <View style={styles.capsuleIconBackground}>
            <MaterialIcons
              name={typeConfig.icon as any}
              size={ICON_SIZE * 0.6}
              color="#FFFFFF"
            />
          </View>
        </Animated.View>

        {/* Lock Icon */}
        <Animated.View style={[styles.lockContainer, lockAnimatedStyle]}>
          <View style={styles.lockBackground}>
            <MaterialIcons name="lock" size={LOCK_SIZE * 0.5} color="#FFFFFF" />
          </View>
        </Animated.View>

        {/* Success Checkmark */}
        <Animated.View style={[styles.checkContainer, checkAnimatedStyle]}>
          <View style={styles.checkBackground}>
            <MaterialIcons name="check-circle" size={100} color="#4CAF50" />
          </View>
        </Animated.View>

        {/* Success Text */}
        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          <Text style={styles.successTitle}>Capsule Locked!</Text>
          <Text style={styles.successSubtitle}>
            Your capsule is safe and sound
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ===========================
// Styles
// ===========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366F1',
  },
  scene: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Capsule Icon
  capsuleContainer: {
    position: 'absolute',
  },
  capsuleIconBackground: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },

  // Lock Icon
  lockContainer: {
    position: 'absolute',
  },
  lockBackground: {
    width: LOCK_SIZE,
    height: LOCK_SIZE,
    borderRadius: LOCK_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  // Checkmark
  checkContainer: {
    position: 'absolute',
  },
  checkBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    padding: 0,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  // Text
  textContainer: {
    position: 'absolute',
    bottom: height * 0.25,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});
