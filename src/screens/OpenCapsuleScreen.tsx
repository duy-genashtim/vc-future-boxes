/**
 * OpenCapsuleScreen.tsx
 * F8: Open Capsule - Unlock animation + content display
 *
 * Two-phase design:
 * 1. Unlock Animation (0-2000ms) - "magical moment" when capsule unlocks
 * 2. Content Display - Show capsule content with Continue button
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  AccessibilityInfo,
  ActivityIndicator,
  Modal,
  Platform,
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
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';

import { RootStackParamList } from '../types';
import { CAPSULE_TYPES, ANIMATIONS } from '../constants';
import { formatUnlockDate } from '../utils/formatDate';
import { getCapsule, getCapsuleImages } from '../services/database';
import type { Capsule, CapsuleImage } from '../types';

type Props = StackScreenProps<RootStackParamList, 'OpenCapsule'>;

const { width, height } = Dimensions.get('window');
const CAPSULE_ICON_SIZE = 120;
const LOCK_SIZE = 60;
const IMAGE_SIZE = (width - 64) / 3;

export default function OpenCapsuleScreen({ route, navigation }: Props) {
  const { capsuleId } = route.params;

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [images, setImages] = useState<CapsuleImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Animated values for unlock animation
  const capsuleScale = useSharedValue(0.8);
  const capsuleOpacity = useSharedValue(0);
  const lockRotation = useSharedValue(0);
  const lockScale = useSharedValue(1);
  const unlockScale = useSharedValue(0);
  const lightBurstOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const animationSceneOpacity = useSharedValue(1);

  // Load capsule data
  useEffect(() => {
    async function loadCapsule() {
      try {
        const capsuleData = await getCapsule(capsuleId);
        if (!capsuleData) {
          console.error('Capsule not found:', capsuleId);
          navigation.replace('Home');
          return;
        }

        // Verify capsule is ready to open
        if (capsuleData.status !== 'ready') {
          console.warn('Capsule is not ready:', capsuleData.status);
          navigation.replace('Home');
          return;
        }

        const capsuleImages = await getCapsuleImages(capsuleId);

        setCapsule(capsuleData);
        setImages(capsuleImages);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load capsule:', error);
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
        // Skip animation, show content immediately
        setShowContent(true);
      }
    }

    checkReduceMotion();
  }, []);

  // Start unlock animation
  useEffect(() => {
    if (loading || reduceMotion || !capsule) return;

    // Phase 1: Capsule Appear (0-500ms)
    capsuleOpacity.value = withTiming(1, { duration: 300 });
    capsuleScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });

    // Haptic at capsule appear
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 100);

    // Phase 2: Unlock Sequence (500-1200ms)
    // Lock shake animation (unlocking motion)
    lockRotation.value = withDelay(
      500,
      withSequence(
        withTiming(15, { duration: 100 }),
        withTiming(-15, { duration: 100 }),
        withTiming(15, { duration: 100 }),
        withTiming(0, { duration: 100 })
      )
    );

    // Lock breaks open at 800ms
    lockScale.value = withDelay(
      800,
      withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      })
    );

    // Haptic Heavy Impact at lock break moment
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 800);

    // Unlock icon appears
    unlockScale.value = withDelay(
      1000,
      withSpring(1, {
        damping: 10,
        stiffness: 150,
      })
    );

    // Phase 3: Reveal Effect (1200-1800ms)
    // Light burst / particle effects
    lightBurstOpacity.value = withDelay(
      1200,
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      )
    );

    // Haptic Success at light burst
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);

    // Phase 4: Transition to Content (1800-2000ms)
    animationSceneOpacity.value = withDelay(
      1800,
      withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      })
    );

    // Show content screen
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, ANIMATIONS.OPEN_DURATION);

    return () => {
      clearTimeout(contentTimer);
    };
  }, [loading, reduceMotion, capsule]);

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

  const unlockAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: unlockScale.value }],
    opacity: unlockScale.value,
  }));

  const lightBurstAnimatedStyle = useAnimatedStyle(() => ({
    opacity: lightBurstOpacity.value,
  }));

  const animationSceneAnimatedStyle = useAnimatedStyle(() => ({
    opacity: animationSceneOpacity.value,
  }));

  // Handlers
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!capsule) return;

    // Navigate to Reflection or Archive based on capsule type
    if (capsule.reflectionType !== 'none') {
      navigation.navigate('Reflection', { capsuleId });
    } else {
      // Memory type - no reflection, go to celebration directly
      navigation.navigate('Celebration', {
        capsuleId,
        reflectionAnswer: 'none', // Memory has no reflection
      });
    }
  };

  const handleImagePress = (uri: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFullscreenImage(uri);
    setCurrentImageIndex(index);
  };

  const handleCloseFullscreen = () => {
    setFullscreenImage(null);
  };

  if (loading || !capsule) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EE9D2B" />
        <Text style={styles.loadingText}>Opening capsule...</Text>
      </View>
    );
  }

  const typeConfig = CAPSULE_TYPES[capsule.type];
  const createdDate = new Date(capsule.createdAt * 1000);
  const hasReflection = capsule.reflectionQuestion && capsule.reflectionQuestion.length > 0;

  // ===========================
  // Animation Phase (0-2000ms)
  // ===========================
  if (!showContent) {
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
        <Animated.View style={[styles.animationScene, animationSceneAnimatedStyle]}>
          {/* Capsule Icon */}
          <Animated.View style={[styles.capsuleContainer, capsuleAnimatedStyle]}>
            <View style={styles.capsuleIconBackground}>
              <MaterialIcons
                name={typeConfig.icon as any}
                size={CAPSULE_ICON_SIZE * 0.5}
                color="#FFFFFF"
              />
            </View>
          </Animated.View>

          {/* Lock Icon (will scale to 0) */}
          <Animated.View style={[styles.lockContainer, lockAnimatedStyle]}>
            <View style={styles.lockBackground}>
              <MaterialIcons name="lock" size={LOCK_SIZE * 0.5} color="#FFFFFF" />
            </View>
          </Animated.View>

          {/* Unlock Icon (appears after lock disappears) */}
          <Animated.View style={[styles.unlockContainer, unlockAnimatedStyle]}>
            <View style={styles.unlockBackground}>
              <MaterialIcons name="lock-open" size={60} color="#4CAF50" />
            </View>
          </Animated.View>

          {/* Light Burst Effect */}
          <Animated.View style={[styles.lightBurst, lightBurstAnimatedStyle]}>
            <View style={styles.lightRay1} />
            <View style={styles.lightRay2} />
            <View style={styles.lightRay3} />
            <View style={styles.lightRay4} />
          </Animated.View>

          {/* Skip hint */}
          <TouchableOpacity
            style={styles.skipHint}
            onPress={() => setShowContent(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Tap to skip</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // ===========================
  // Content Display Phase
  // ===========================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1B160D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Open Capsule</Text>
        <View style={styles.backButton} />
      </View>

      {/* Content ScrollView */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Type Badge */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.typeIndicator}
        >
          <View
            style={[
              styles.typeIconContainer,
              { backgroundColor: `${typeConfig.color}20` },
            ]}
          >
            <MaterialIcons
              name={typeConfig.icon as any}
              size={48}
              color={typeConfig.color}
            />
          </View>
          <Text style={[styles.typeLabel, { color: typeConfig.color }]}>
            {typeConfig.label}
          </Text>
          <Text style={styles.createdDate}>
            Created on {formatUnlockDate(createdDate)}
          </Text>
          <Text style={styles.openedDate}>Opened today</Text>
        </Animated.View>

        {/* Content Card */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.contentSection}
        >
          <Text style={styles.sectionLabel}>Your Message</Text>
          <View style={styles.contentBox}>
            <Text style={styles.contentText}>{capsule.content}</Text>
          </View>
        </Animated.View>

        {/* Images Gallery */}
        {images.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(300)}
            style={styles.imagesSection}
          >
            <Text style={styles.sectionLabel}>Photos ({images.length})</Text>
            <View style={styles.imagesGrid}>
              {images.map((image, index) => (
                <TouchableOpacity
                  key={image.id}
                  style={styles.imageContainer}
                  activeOpacity={0.8}
                  onPress={() => handleImagePress(image.uri, index)}
                >
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <View style={styles.imageOverlay}>
                    <MaterialIcons name="zoom-in" size={24} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Reflection Question Display (if has) */}
        {hasReflection && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(400)}
            style={styles.reflectionSection}
          >
            <Text style={styles.sectionLabel}>Reflection Question</Text>
            <View
              style={[
                styles.reflectionBox,
                { backgroundColor: `${typeConfig.color}10` },
              ]}
            >
              <MaterialIcons name="help-outline" size={20} color={typeConfig.color} />
              <Text style={styles.reflectionText}>
                {capsule.reflectionQuestion}
              </Text>
            </View>
            <Text style={styles.reflectionHint}>
              Tap Continue to answer this question
            </Text>
          </Animated.View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Continue Button - Fixed at bottom */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={typeConfig.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>
              {capsule.reflectionType !== 'none' ? 'Answer Reflection' : 'Continue'}
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Fullscreen Image Viewer Modal */}
      {fullscreenImage && (
        <Modal
          visible={true}
          transparent={true}
          onRequestClose={handleCloseFullscreen}
          animationType="fade"
        >
          <View style={styles.fullscreenContainer}>
            <TouchableOpacity
              style={styles.fullscreenCloseButton}
              onPress={handleCloseFullscreen}
              activeOpacity={0.8}
            >
              <MaterialIcons name="close" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            <Image
              source={{ uri: fullscreenImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />

            {images.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1} of {images.length}
                </Text>
              </View>
            )}
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// ===========================
// Styles
// ===========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F6',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F7F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },

  // ===========================
  // Animation Phase Styles
  // ===========================
  animationScene: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Capsule Icon
  capsuleContainer: {
    position: 'absolute',
  },
  capsuleIconBackground: {
    width: CAPSULE_ICON_SIZE,
    height: CAPSULE_ICON_SIZE,
    borderRadius: CAPSULE_ICON_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },

  // Lock Icon (closing)
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

  // Unlock Icon (opening)
  unlockContainer: {
    position: 'absolute',
  },
  unlockBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    padding: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  // Light Burst Effect
  lightBurst: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightRay1: {
    position: 'absolute',
    width: 4,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
  },
  lightRay2: {
    position: 'absolute',
    width: 150,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
  },
  lightRay3: {
    position: 'absolute',
    width: 4,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  lightRay4: {
    position: 'absolute',
    width: 4,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
  },

  // Skip hint
  skipHint: {
    position: 'absolute',
    bottom: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },

  // ===========================
  // Content Display Styles
  // ===========================
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F7F6',
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B160D',
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Type Indicator
  typeIndicator: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 16,
  },
  typeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  createdDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  openedDate: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

  // Content Section
  contentSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B160D',
    marginBottom: 12,
  },
  contentBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contentText: {
    fontSize: 16,
    color: '#1B160D',
    lineHeight: 24,
  },

  // Images Section
  imagesSection: {
    marginBottom: 24,
  },
  imagesGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },

  // Reflection Section
  reflectionSection: {
    marginBottom: 24,
  },
  reflectionBox: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  reflectionText: {
    flex: 1,
    fontSize: 18,
    color: '#1B160D',
    lineHeight: 26,
    fontWeight: '500',
  },
  reflectionHint: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: 'rgba(248, 247, 246, 0.95)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  // Fullscreen Image Viewer
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
  },
  fullscreenImage: {
    width: width,
    height: height,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
