/**
 * CapsuleCard.tsx
 * Reusable capsule card component for Home Screen grid
 * Displays locked state with countdown OR ready state with "Ready to open!" badge
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

import { Capsule, CapsuleType } from '../types';
import { CAPSULE_TYPES } from '../constants';
import { formatCountdown, getCountdownInterval } from '../utils/formatCountdown';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (width - (CARD_MARGIN * 2) - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.25; // 4:5 aspect ratio

interface CapsuleCardProps {
  capsule: Capsule;
  onPress: (capsule: Capsule) => void;
}

export default function CapsuleCard({ capsule, onPress }: CapsuleCardProps) {
  const { type, status, unlockAt } = capsule;
  const typeConfig = CAPSULE_TYPES[type];

  // Countdown state for locked capsules
  const [countdown, setCountdown] = useState<string>(
    status === 'locked' ? formatCountdown(unlockAt) : 'Ready!'
  );

  // Animation values
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Update countdown for locked capsules
  useEffect(() => {
    if (status !== 'locked') return;

    const interval = setInterval(() => {
      setCountdown(formatCountdown(unlockAt));
    }, getCountdownInterval(unlockAt));

    return () => clearInterval(interval);
  }, [status, unlockAt]);

  // Pulse animation for ready capsules
  useEffect(() => {
    if (status === 'ready') {
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.02, { damping: 3, stiffness: 100 }),
          withSpring(1.0, { damping: 3, stiffness: 100 })
        ),
        -1, // infinite repeat
        false
      );
    }
  }, [status]);

  // Press animation
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    // Haptic feedback
    if (status === 'ready') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress(capsule);
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      ...(status === 'ready' ? [{ scale: pulseScale.value }] : []),
    ],
  }));

  const isReady = status === 'ready';

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <LinearGradient
          colors={typeConfig.gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Ready state glow effect */}
          {isReady && (
            <View style={styles.glowOverlay} />
          )}

          {/* Content */}
          <View style={styles.content}>
            {/* Header: Icon and Badge */}
            <View style={styles.header}>
              {/* Type Icon */}
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name={typeConfig.icon as any}
                  size={24}
                  color="white"
                />
              </View>

              {/* Status Badge */}
              {isReady ? (
                <View style={styles.readyBadge}>
                  <Text style={styles.readyBadgeText}>READY!</Text>
                </View>
              ) : (
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedBadgeText}>{countdown}</Text>
                </View>
              )}
            </View>

            {/* Footer: Type Label and Lock/Unlock Icon */}
            <View style={styles.footer}>
              <Text style={styles.typeLabel}>{typeConfig.label}</Text>

              {isReady ? (
                <MaterialIcons name="lock-open" size={20} color="white" style={styles.lockIcon} />
              ) : (
                <MaterialIcons name="lock" size={20} color="rgba(255,255,255,0.5)" style={styles.lockIcon} />
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Ready state border glow */}
        {isReady && (
          <View style={[styles.borderGlow, { borderColor: typeConfig.color }]} />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginBottom: 12,
  },
  pressable: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readyBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  readyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6366F1', // Primary color
    letterSpacing: 0.5,
  },
  lockedBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 8,
  },
  lockIcon: {
    alignSelf: 'flex-start',
  },
  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderRadius: 16,
    borderColor: '#FFFFFF',
    opacity: 0.3,
  },
});
