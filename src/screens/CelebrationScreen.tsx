/**
 * CelebrationScreen.tsx
 * F10: Celebration Effects - Magical celebration moment after opening capsule
 *
 * Features:
 * - Type-specific celebration animations (confetti, sparkles, etc.)
 * - Display capsule summary (type, dates, content preview)
 * - Show reflection answer if applicable
 * - Action buttons: View in Archive, Create Another, Done
 * - Auto-mark capsule as 'opened' status
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  ScrollView,
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
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  runOnJS,
} from 'react-native-reanimated';

import { RootStackParamList } from '../types';
import { CAPSULE_TYPES, ANIMATIONS } from '../constants';
import { getCapsule, updateCapsuleStatus } from '../services/database';
import type { Capsule } from '../types';

type Props = StackScreenProps<RootStackParamList, 'Celebration'>;

const { width, height } = Dimensions.get('window');

// Celebration effect types based on reflection answer
type EffectType = 'celebration' | 'encouraging' | 'neutral' | 'nostalgic';

// Particle configuration
const PARTICLE_COUNT = 50;
const PARTICLE_SIZE = 12;

export default function CelebrationScreen({ route, navigation }: Props) {
  const { capsuleId, reflectionAnswer } = route.params;

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [loading, setLoading] = useState(true);
  const [effectType, setEffectType] = useState<EffectType>('celebration');
  const [statusUpdated, setStatusUpdated] = useState(false);

  // Animation trigger
  const animationStarted = useRef(false);

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

        setCapsule(capsuleData);

        // Determine effect type based on capsule type and answer
        const effect = determineEffectType(capsuleData.type, reflectionAnswer);
        setEffectType(effect);

        setLoading(false);
      } catch (error) {
        console.error('Failed to load capsule:', error);
        navigation.replace('Home');
      }
    }

    loadCapsule();
  }, [capsuleId, reflectionAnswer, navigation]);

  // Trigger haptic feedback at start of celebration
  useEffect(() => {
    if (!loading && !animationStarted.current) {
      animationStarted.current = true;

      // Haptic feedback based on effect type
      if (effectType === 'celebration') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  }, [loading, effectType]);

  // Update capsule status to 'opened' in background
  useEffect(() => {
    if (!capsule || statusUpdated) return;

    async function markAsOpened() {
      try {
        await updateCapsuleStatus(capsuleId, 'opened');
        setStatusUpdated(true);
      } catch (error) {
        console.error('Failed to update capsule status:', error);
      }
    }

    // Update after a short delay to ensure smooth animation
    const timer = setTimeout(markAsOpened, 1000);
    return () => clearTimeout(timer);
  }, [capsule, capsuleId, statusUpdated]);

  // Handlers
  const handleViewInArchive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to Archive screen
    navigation.navigate('Archive');
  };

  const handleCreateAnother = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to Type Selection
    navigation.navigate('TypeSelection');
  };

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate back to Home
    navigation.navigate('Home');
  };

  if (loading || !capsule) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EE9D2B" />
        <Text style={styles.loadingText}>Preparing celebration...</Text>
      </View>
    );
  }

  const typeConfig = CAPSULE_TYPES[capsule.type];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background Gradient based on capsule type */}
      <LinearGradient
        colors={[...typeConfig.gradient, '#1F2937']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Celebration Animation Layer */}
      <CelebrationAnimation effectType={effectType} typeColor={typeConfig.color} />

      {/* Content Layer */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon & Message */}
        <CelebrationHeader
          effectType={effectType}
          typeIcon={typeConfig.icon}
          typeColor={typeConfig.color}
        />

        {/* Capsule Summary Card */}
        <CapsuleSummary
          capsule={capsule}
          typeConfig={typeConfig}
          reflectionAnswer={reflectionAnswer}
        />
      </ScrollView>

      {/* Action Buttons */}
      <ActionButtons
        onViewArchive={handleViewInArchive}
        onCreateAnother={handleCreateAnother}
        onDone={handleDone}
        typeGradient={typeConfig.gradient}
      />
    </SafeAreaView>
  );
}

// ===========================
// Celebration Animation Component
// ===========================
interface CelebrationAnimationProps {
  effectType: EffectType;
  typeColor: string;
}

function CelebrationAnimation({ effectType, typeColor }: CelebrationAnimationProps) {
  // Generate random particle positions and animations
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
    id: index,
    // Random X position across screen width
    startX: Math.random() * width,
    // Random delay for staggered effect
    delay: Math.random() * 1000,
    // Random rotation
    rotation: Math.random() * 360,
    // Random fall speed (for confetti)
    duration: 2000 + Math.random() * 1000,
  }));

  if (effectType === 'celebration') {
    return (
      <View style={styles.animationLayer} pointerEvents="none">
        {particles.map((particle) => (
          <ConfettiParticle
            key={particle.id}
            startX={particle.startX}
            delay={particle.delay}
            rotation={particle.rotation}
            duration={particle.duration}
          />
        ))}
      </View>
    );
  }

  if (effectType === 'encouraging') {
    return (
      <View style={styles.animationLayer} pointerEvents="none">
        {particles.slice(0, 10).map((particle) => (
          <FloatingHeart
            key={particle.id}
            startX={particle.startX}
            delay={particle.delay}
          />
        ))}
      </View>
    );
  }

  if (effectType === 'nostalgic') {
    return (
      <View style={styles.animationLayer} pointerEvents="none">
        <SepiaTint />
        {particles.slice(0, 8).map((particle) => (
          <FloatingFrame
            key={particle.id}
            startX={particle.startX}
            delay={particle.delay}
            rotation={particle.rotation}
          />
        ))}
      </View>
    );
  }

  // Neutral effect - subtle shimmer
  return (
    <View style={styles.animationLayer} pointerEvents="none">
      <ShimmerWave />
    </View>
  );
}

// ===========================
// Confetti Particle (Celebration)
// ===========================
interface ConfettiParticleProps {
  startX: number;
  delay: number;
  rotation: number;
  duration: number;
}

function ConfettiParticle({ startX, delay, rotation, duration }: ConfettiParticleProps) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Random color for confetti
  const colors = ['#FFD700', '#22C55E', '#3B82F6', '#EF4444', '#A855F7', '#F59E0B'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  useEffect(() => {
    // Fall animation with slight horizontal drift
    translateY.value = withDelay(
      delay,
      withTiming(height + 50, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );

    // Horizontal drift (sine wave)
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(30, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );

    // Rotation
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(rotation + 360, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      )
    );

    // Fade out near bottom
    opacity.value = withDelay(
      delay + duration - 500,
      withTiming(0, { duration: 500 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiParticle,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

// ===========================
// Floating Heart (Encouraging)
// ===========================
interface FloatingHeartProps {
  startX: number;
  delay: number;
}

function FloatingHeart({ startX, delay }: FloatingHeartProps) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Float upward
    translateY.value = withDelay(
      delay,
      withTiming(-height * 0.8, {
        duration: 3000,
        easing: Easing.out(Easing.ease),
      })
    );

    // Scale in then fade out
    scale.value = withDelay(delay, withSpring(1, { damping: 10 }));
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(0.8, { duration: 300 }),
        withTiming(0.8, { duration: 2200 }),
        withTiming(0, { duration: 500 })
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX },
      { translateY: height * 0.6 + translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingHeart, animatedStyle]}>
      <MaterialIcons name="favorite" size={32} color="#FF6B9D" />
    </Animated.View>
  );
}

// ===========================
// Floating Frame (Nostalgic)
// ===========================
interface FloatingFrameProps {
  startX: number;
  delay: number;
  rotation: number;
}

function FloatingFrame({ startX, delay, rotation }: FloatingFrameProps) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Float slowly upward
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-30, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );

    // Gentle rotation
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(rotation + 10, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );

    // Fade in
    opacity.value = withDelay(delay, withTiming(0.4, { duration: 800 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingFrame, animatedStyle]}>
      <MaterialIcons name="crop-portrait" size={40} color="#F59E0B" />
    </Animated.View>
  );
}

// ===========================
// Sepia Tint (Nostalgic)
// ===========================
function SepiaTint() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(0.3, { duration: 800 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.sepiaTint, animatedStyle]} />
  );
}

// ===========================
// Shimmer Wave (Neutral)
// ===========================
function ShimmerWave() {
  const translateX = useSharedValue(-width);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(width, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.shimmerWave, animatedStyle]}>
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}

// ===========================
// Celebration Header Component
// ===========================
interface CelebrationHeaderProps {
  effectType: EffectType;
  typeIcon: string;
  typeColor: string;
}

function CelebrationHeader({ effectType, typeIcon, typeColor }: CelebrationHeaderProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.3, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Messages based on effect type
  const messages = {
    celebration: {
      title: 'Well Done!',
      subtitle: 'You achieved your goal!',
    },
    encouraging: {
      title: "It's Okay!",
      subtitle: 'Every experience is a lesson.',
    },
    neutral: {
      title: 'Interesting!',
      subtitle: 'Life is full of nuances.',
    },
    nostalgic: {
      title: 'A Beautiful Memory',
      subtitle: 'Cherish these moments forever.',
    },
  };

  const message = messages[effectType];

  return (
    <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.header}>
      <Animated.View
        style={[
          styles.successIconContainer,
          { backgroundColor: `${typeColor}30` },
          iconAnimatedStyle,
        ]}
      >
        <MaterialIcons
          name={effectType === 'celebration' ? 'celebration' : typeIcon as any}
          size={64}
          color="#FFFFFF"
        />
      </Animated.View>

      <Text style={styles.successTitle}>{message.title}</Text>
      <Text style={styles.successSubtitle}>{message.subtitle}</Text>
    </Animated.View>
  );
}

// ===========================
// Capsule Summary Component
// ===========================
interface CapsuleSummaryProps {
  capsule: Capsule;
  typeConfig: typeof CAPSULE_TYPES[keyof typeof CAPSULE_TYPES];
  reflectionAnswer: string | number;
}

function CapsuleSummary({ capsule, typeConfig, reflectionAnswer }: CapsuleSummaryProps) {
  const createdDate = new Date(capsule.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const unlockDate = new Date(capsule.unlockAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate time capsule duration
  const durationMs = capsule.unlockAt - capsule.createdAt;
  const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));

  // Content preview (first 100 chars)
  const contentPreview =
    capsule.content.length > 100
      ? capsule.content.substring(0, 100) + '...'
      : capsule.content;

  return (
    <Animated.View entering={FadeInUp.duration(600).delay(400)} style={styles.summaryCard}>
      {/* Type Badge */}
      <View style={styles.typeBadge}>
        <View style={[styles.typeIconSmall, { backgroundColor: `${typeConfig.color}20` }]}>
          <MaterialIcons name={typeConfig.icon as any} size={24} color={typeConfig.color} />
        </View>
        <Text style={styles.typeLabel}>{typeConfig.label} Capsule</Text>
      </View>

      {/* Dates */}
      <View style={styles.datesContainer}>
        <View style={styles.dateRow}>
          <MaterialIcons name="create" size={16} color="#9CA3AF" />
          <Text style={styles.dateLabel}>Created:</Text>
          <Text style={styles.dateValue}>{createdDate}</Text>
        </View>
        <View style={styles.dateRow}>
          <MaterialIcons name="event" size={16} color="#9CA3AF" />
          <Text style={styles.dateLabel}>Unlocked:</Text>
          <Text style={styles.dateValue}>{unlockDate}</Text>
        </View>
        <View style={styles.durationBadge}>
          <MaterialIcons name="schedule" size={14} color={typeConfig.color} />
          <Text style={[styles.durationText, { color: typeConfig.color }]}>
            {durationDays} days journey
          </Text>
        </View>
      </View>

      {/* Content Preview */}
      <View style={styles.contentPreview}>
        <Text style={styles.contentPreviewLabel}>Your message:</Text>
        <Text style={styles.contentPreviewText}>{contentPreview}</Text>
      </View>

      {/* Reflection Answer (if applicable) */}
      {reflectionAnswer !== 'none' && capsule.reflectionType !== 'none' && (
        <ReflectionDisplay
          reflectionType={capsule.reflectionType}
          reflectionAnswer={reflectionAnswer}
          typeColor={typeConfig.color}
        />
      )}
    </Animated.View>
  );
}

// ===========================
// Reflection Display Component
// ===========================
interface ReflectionDisplayProps {
  reflectionType: 'yes_no' | 'rating';
  reflectionAnswer: string | number;
  typeColor: string;
}

function ReflectionDisplay({ reflectionType, reflectionAnswer, typeColor }: ReflectionDisplayProps) {
  if (reflectionType === 'yes_no') {
    const isYes = reflectionAnswer === 'yes';
    return (
      <Animated.View entering={FadeIn.duration(400).delay(600)} style={styles.reflectionContainer}>
        <Text style={styles.reflectionLabel}>Your reflection:</Text>
        <View style={styles.yesNoDisplay}>
          <MaterialIcons
            name={isYes ? 'check-circle' : 'cancel'}
            size={24}
            color={isYes ? '#22C55E' : '#EF4444'}
          />
          <Text style={[styles.yesNoText, { color: isYes ? '#22C55E' : '#EF4444' }]}>
            {isYes ? 'Yes' : 'No'}
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Rating display
  const rating = reflectionAnswer as number;
  return (
    <Animated.View entering={FadeIn.duration(400).delay(600)} style={styles.reflectionContainer}>
      <Text style={styles.reflectionLabel}>Your reflection:</Text>
      <View style={styles.ratingDisplay}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialIcons
            key={star}
            name={star <= rating ? 'star' : 'star-border'}
            size={24}
            color={star <= rating ? '#FCD34D' : '#D1D5DB'}
          />
        ))}
        <Text style={styles.ratingText}>{rating} out of 5</Text>
      </View>
    </Animated.View>
  );
}

// ===========================
// Action Buttons Component
// ===========================
interface ActionButtonsProps {
  onViewArchive: () => void;
  onCreateAnother: () => void;
  onDone: () => void;
  typeGradient: readonly [string, string];
}

function ActionButtons({ onViewArchive, onCreateAnother, onDone, typeGradient }: ActionButtonsProps) {
  return (
    <Animated.View entering={FadeInUp.duration(600).delay(800)} style={styles.actionsContainer}>
      {/* Primary: View in Archive */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onViewArchive}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[...typeGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          <MaterialIcons name="archive" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>View in Archive</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Secondary Buttons Row */}
      <View style={styles.secondaryButtonsRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onCreateAnother}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.secondaryButtonText}>Create Another</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onDone}
          activeOpacity={0.7}
        >
          <MaterialIcons name="home" size={20} color="#6B7280" />
          <Text style={styles.secondaryButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ===========================
// Helper Functions
// ===========================

function determineEffectType(
  capsuleType: string,
  reflectionAnswer: string | number
): EffectType {
  // Memory type always gets nostalgic effect
  if (capsuleType === 'memory' || reflectionAnswer === 'none') {
    return 'nostalgic';
  }

  // Yes/No answers
  if (reflectionAnswer === 'yes') {
    return 'celebration';
  }
  if (reflectionAnswer === 'no') {
    return 'encouraging';
  }

  // Rating answers
  if (typeof reflectionAnswer === 'number') {
    if (reflectionAnswer >= 4) {
      return 'celebration';
    }
    if (reflectionAnswer === 3) {
      return 'neutral';
    }
    return 'encouraging';
  }

  return 'celebration';
}

// ===========================
// Styles
// ===========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#D1D5DB',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Animation Layer
  animationLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confettiParticle: {
    position: 'absolute',
    width: PARTICLE_SIZE,
    height: PARTICLE_SIZE,
    borderRadius: PARTICLE_SIZE / 2,
  },
  floatingHeart: {
    position: 'absolute',
  },
  floatingFrame: {
    position: 'absolute',
    top: height * 0.3,
  },
  sepiaTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#D4A574',
  },
  shimmerWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.5,
    height: height,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: 16,
    paddingBottom: 200,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#D1D5DB',
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B160D',
    letterSpacing: -0.2,
  },

  // Dates
  datesContainer: {
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    marginRight: 8,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B160D',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  durationText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Content Preview
  contentPreview: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginBottom: 16,
  },
  contentPreviewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentPreviewText: {
    fontSize: 16,
    color: '#1B160D',
    lineHeight: 24,
  },

  // Reflection Display
  reflectionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  reflectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  yesNoDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yesNoText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },

  // Action Buttons
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 12,
  },
  primaryButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    letterSpacing: -0.1,
  },
});
