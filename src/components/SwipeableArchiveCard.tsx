/**
 * SwipeableArchiveCard.tsx
 * Swipeable Archive Capsule Card with delete action
 *
 * Allows user to swipe left to reveal delete button.
 * Optional enhancement for F12: Delete Opened Capsule
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Capsule } from '../types';
import { CAPSULE_TYPES } from '../constants';

interface SwipeableArchiveCardProps {
  capsule: Capsule;
  onPress: () => void;
  onDelete: () => void;
}

const SWIPE_THRESHOLD = -80; // Swipe left 80px to reveal delete
const DELETE_BUTTON_WIDTH = 80;

export default function SwipeableArchiveCard({
  capsule,
  onPress,
  onDelete,
}: SwipeableArchiveCardProps) {
  const { type, content, createdAt, openedAt, reflectionAnswer } = capsule;

  const translateX = useSharedValue(0);
  const deleteButtonOpacity = useSharedValue(0);

  const typeConfig = CAPSULE_TYPES[type];

  // Format dates
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Truncate content preview
  const contentPreview =
    content.length > 60 ? content.substring(0, 60) + '...' : content;

  // Check if has reflection
  const hasReflection =
    reflectionAnswer !== null && reflectionAnswer !== undefined;

  // Haptic feedback
  const triggerHaptic = useCallback((style: 'light' | 'medium') => {
    if (style === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  // Pan gesture for swipe
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow swipe left (negative translation)
      const newTranslateX = Math.min(0, event.translationX);
      translateX.value = newTranslateX;

      // Show delete button when swiped beyond threshold
      if (newTranslateX < SWIPE_THRESHOLD) {
        deleteButtonOpacity.value = withSpring(1);
      } else {
        deleteButtonOpacity.value = withSpring(0);
      }
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD) {
        // Swipe past threshold - reveal delete button
        translateX.value = withSpring(-DELETE_BUTTON_WIDTH);
        deleteButtonOpacity.value = withSpring(1);
        runOnJS(triggerHaptic)('light');
      } else {
        // Swipe not enough - snap back
        translateX.value = withSpring(0);
        deleteButtonOpacity.value = withSpring(0);
      }
    });

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: deleteButtonOpacity.value,
  }));

  // Handlers
  const handleCardPress = useCallback(() => {
    if (translateX.value < 0) {
      // Card is swiped, close it first
      translateX.value = withSpring(0);
      deleteButtonOpacity.value = withSpring(0);
    } else {
      // Card is closed, trigger onPress
      triggerHaptic('light');
      onPress();
    }
  }, [onPress, triggerHaptic]);

  const handleDeletePress = useCallback(() => {
    triggerHaptic('medium');
    onDelete();
  }, [onDelete, triggerHaptic]);

  return (
    <View style={styles.container}>
      {/* Delete Button (underneath, revealed on swipe) */}
      <Animated.View
        style={[styles.deleteButtonContainer, deleteButtonAnimatedStyle]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePress}
          activeOpacity={0.7}
        >
          <Ionicons name="trash" size={24} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Swipeable Card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={cardAnimatedStyle}>
          <Pressable
            onPress={handleCardPress}
            style={({ pressed }) => [
              styles.cardContainer,
              pressed && styles.cardPressed,
            ]}
          >
            {/* Left accent border */}
            <View
              style={[styles.cardAccent, { backgroundColor: typeConfig.color }]}
            />

            {/* Card content */}
            <View style={styles.cardContent}>
              {/* Header row: Type + Chevron */}
              <View style={styles.cardHeader}>
                <View style={styles.cardTypeContainer}>
                  <View
                    style={[
                      styles.cardTypeIconContainer,
                      { backgroundColor: typeConfig.color + '20' },
                    ]}
                  >
                    <Ionicons
                      name={
                        type === 'emotion'
                          ? 'heart'
                          : type === 'goal'
                          ? 'flag'
                          : type === 'memory'
                          ? 'camera'
                          : 'scale' // decision
                      }
                      size={18}
                      color={typeConfig.color}
                    />
                  </View>
                  <Text style={styles.cardTypeLabel}>{typeConfig.label}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>

              {/* Dates */}
              <View style={styles.cardDates}>
                <Text style={styles.cardDateLabel}>
                  Created:{' '}
                  <Text style={styles.cardDateValue}>
                    {formatDate(createdAt)}
                  </Text>
                </Text>
                {openedAt && (
                  <Text style={styles.cardDateLabel}>
                    Opened:{' '}
                    <Text style={styles.cardDateValue}>
                      {formatDate(openedAt)}
                    </Text>
                  </Text>
                )}
              </View>

              {/* Content preview */}
              <Text style={styles.cardContentPreview} numberOfLines={2}>
                {contentPreview}
              </Text>

              {/* Reflection indicator */}
              {hasReflection && (
                <View style={styles.cardReflectionBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color="#10B981"
                  />
                  <Text style={styles.cardReflectionText}>
                    Reflection answered
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  // Delete Button (underneath)
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    width: DELETE_BUTTON_WIDTH,
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  // Card Container
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardAccent: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTypeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardDates: {
    marginBottom: 8,
  },
  cardDateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  cardDateValue: {
    fontWeight: '500',
    color: '#374151',
  },
  cardContentPreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardReflectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
  },
  cardReflectionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
});
