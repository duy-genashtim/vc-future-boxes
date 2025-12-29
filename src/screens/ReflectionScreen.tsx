/**
 * ReflectionScreen.tsx
 * F9: Reflection Response - Answer reflection question
 *
 * Two reflection types:
 * 1. Yes/No (Emotion, Goal) - Large Yes/No buttons
 * 2. Rating 1-5 (Decision) - Star rating selector
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
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
  withSequence,
  Easing,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';

import { RootStackParamList } from '../types';
import { CAPSULE_TYPES } from '../constants';
import { getCapsule, updateCapsuleReflection } from '../services/database';
import type { Capsule } from '../types';

type Props = StackScreenProps<RootStackParamList, 'Reflection'>;

const { width } = Dimensions.get('window');
const BUTTON_HEIGHT = 64;
const STAR_SIZE = 48;
const STAR_SPACING = 8;

// Rating labels mapping
const RATING_LABELS = {
  1: { text: 'Poor decision', color: '#EF4444' },
  2: { text: 'Below expectations', color: '#F59E0B' },
  3: { text: 'Neutral / Okay', color: '#FCD34D' },
  4: { text: 'Good decision', color: '#84CC16' },
  5: { text: 'Excellent decision', color: '#22C55E' },
} as const;

export default function ReflectionScreen({ route, navigation }: Props) {
  const { capsuleId } = route.params;

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Animated values
  const buttonScale = useSharedValue(1);
  const continueOpacity = useSharedValue(0.5);

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

        // Verify capsule has reflection question
        if (!capsuleData.reflectionQuestion || capsuleData.reflectionType === 'none') {
          console.warn('Capsule has no reflection question');
          // Skip to celebration directly
          navigation.replace('Celebration', {
            capsuleId,
            reflectionAnswer: 'none',
          });
          return;
        }

        setCapsule(capsuleData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load capsule:', error);
        navigation.replace('Home');
      }
    }

    loadCapsule();
  }, [capsuleId, navigation]);

  // Enable continue button when answer selected
  useEffect(() => {
    if (selectedAnswer !== null) {
      continueOpacity.value = withTiming(1, { duration: 200 });
    } else {
      continueOpacity.value = withTiming(0.5, { duration: 200 });
    }
  }, [selectedAnswer]);

  // Handlers
  const handleYesNoSelect = (answer: 'yes' | 'no') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Clear error message when changing answer
    if (saveError) {
      setSaveError(null);
    }

    // Toggle selection: if same answer clicked again, deselect
    if (selectedAnswer === answer) {
      setSelectedAnswer(null);
    } else {
      setSelectedAnswer(answer);
    }
  };

  const handleRatingSelect = (rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Clear error message when changing answer
    if (saveError) {
      setSaveError(null);
    }

    setSelectedAnswer(rating);
  };

  const handleContinue = async () => {
    // Validation: answer must be selected
    if (selectedAnswer === null) {
      setSaveError('Please select an answer before continuing');
      return;
    }

    // Prevent multiple saves
    if (saving) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      setSaving(true);
      setSaveError(null);

      // Save reflection answer to database
      await updateCapsuleReflection(capsuleId, selectedAnswer);

      // Navigate to Celebration with answer
      navigation.navigate('Celebration', {
        capsuleId,
        reflectionAnswer: selectedAnswer,
      });
    } catch (error) {
      console.error('Failed to save reflection answer:', error);
      setSaveError('Failed to save your answer. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  // Animated styles
  const continueButtonStyle = useAnimatedStyle(() => ({
    opacity: continueOpacity.value,
  }));

  if (loading || !capsule) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EE9D2B" />
        <Text style={styles.loadingText}>Loading reflection...</Text>
      </View>
    );
  }

  const typeConfig = CAPSULE_TYPES[capsule.type];
  const isYesNo = capsule.reflectionType === 'yes_no';
  const isRating = capsule.reflectionType === 'rating';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F6" />

      {/* Background gradient overlay (subtle) */}
      <LinearGradient
        colors={[`${typeConfig.color}10`, '#F8F7F600']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
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
        <Text style={styles.headerTitle}>
          Reflect on your {typeConfig.label}
        </Text>
      </Animated.View>

      {/* Reflection Question Card */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        style={[
          styles.questionCard,
          { backgroundColor: `${typeConfig.color}15` },
        ]}
      >
        <Text style={styles.questionText}>
          "{capsule.reflectionQuestion}"
        </Text>
      </Animated.View>

      {/* Answer Options */}
      <View style={styles.answerContainer}>
        {isYesNo && (
          <YesNoButtons
            selectedAnswer={selectedAnswer as 'yes' | 'no' | null}
            onSelect={handleYesNoSelect}
            typeColor={typeConfig.color}
          />
        )}

        {isRating && (
          <RatingSelector
            selectedRating={selectedAnswer as number | null}
            onSelect={handleRatingSelect}
            typeColor={typeConfig.color}
          />
        )}
      </View>

      {/* Continue Button - Fixed at bottom */}
      <Animated.View style={[styles.footer, continueButtonStyle]}>
        {/* Error Message */}
        {saveError && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{saveError}</Text>
          </Animated.View>
        )}

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={selectedAnswer === null || saving}
        >
          <LinearGradient
            colors={selectedAnswer !== null && !saving ? typeConfig.gradient : ['#D1D5DB', '#9CA3AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButtonGradient}
          >
            {saving ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.continueButtonText}>Saving...</Text>
              </>
            ) : (
              <>
                <Text style={styles.continueButtonText}>Continue</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// ===========================
// Yes/No Buttons Component
// ===========================
interface YesNoButtonsProps {
  selectedAnswer: 'yes' | 'no' | null;
  onSelect: (answer: 'yes' | 'no') => void;
  typeColor: string;
}

function YesNoButtons({ selectedAnswer, onSelect, typeColor }: YesNoButtonsProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(200)}
      style={styles.yesNoContainer}
    >
      {/* Yes Button */}
      <TouchableOpacity
        style={styles.yesNoButton}
        onPress={() => onSelect('yes')}
        activeOpacity={0.7}
      >
        <Animated.View style={{ flex: 1 }}>
          {selectedAnswer === 'yes' ? (
            <LinearGradient
              colors={['#22C55E', '#16A34A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.yesNoButtonFilled}
            >
              <MaterialIcons name="check-circle" size={32} color="#FFFFFF" />
              <Text style={styles.yesNoButtonTextFilled}>Yes</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.yesNoButtonOutlined, { borderColor: '#D1D5DB' }]}>
              <MaterialIcons name="check-circle-outline" size={32} color="#9CA3AF" />
              <Text style={styles.yesNoButtonTextOutlined}>Yes</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* No Button */}
      <TouchableOpacity
        style={styles.yesNoButton}
        onPress={() => onSelect('no')}
        activeOpacity={0.7}
      >
        <Animated.View style={{ flex: 1 }}>
          {selectedAnswer === 'no' ? (
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.yesNoButtonFilled}
            >
              <MaterialIcons name="cancel" size={32} color="#FFFFFF" />
              <Text style={styles.yesNoButtonTextFilled}>No</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.yesNoButtonOutlined, { borderColor: '#D1D5DB' }]}>
              <MaterialIcons name="cancel" size={32} color="#9CA3AF" />
              <Text style={styles.yesNoButtonTextOutlined}>No</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ===========================
// Rating Selector Component
// ===========================
interface RatingSelectorProps {
  selectedRating: number | null;
  onSelect: (rating: number) => void;
  typeColor: string;
}

function RatingSelector({ selectedRating, onSelect, typeColor }: RatingSelectorProps) {
  const [animatingRating, setAnimatingRating] = useState<number | null>(null);

  const handleStarPress = (rating: number) => {
    setAnimatingRating(rating);
    onSelect(rating);

    // Reset animation trigger after animation completes
    setTimeout(() => {
      setAnimatingRating(null);
    }, 300);
  };

  const ratingLabel = selectedRating ? RATING_LABELS[selectedRating as keyof typeof RATING_LABELS] : null;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.ratingContainer}>
      {/* Stars Row */}
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((rating) => {
          const isSelected = selectedRating !== null && rating <= selectedRating;
          const isAnimating = animatingRating === rating;

          return (
            <StarButton
              key={rating}
              rating={rating}
              isSelected={isSelected}
              isAnimating={isAnimating}
              onPress={() => handleStarPress(rating)}
            />
          );
        })}
      </View>

      {/* Rating Label */}
      {ratingLabel && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.ratingLabelContainer}>
          <Text style={[styles.ratingLabelText, { color: ratingLabel.color }]}>
            {ratingLabel.text}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ===========================
// Star Button Component
// ===========================
interface StarButtonProps {
  rating: number;
  isSelected: boolean;
  isAnimating: boolean;
  onPress: () => void;
}

function StarButton({ rating, isSelected, isAnimating, onPress }: StarButtonProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isAnimating) {
      scale.value = withSequence(
        withTiming(1.3, { duration: 150, easing: Easing.out(Easing.ease) }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    }
  }, [isAnimating]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      style={styles.starButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={animatedStyle}>
        <MaterialIcons
          name={isSelected ? 'star' : 'star-border'}
          size={STAR_SIZE}
          color={isSelected ? '#FCD34D' : '#D1D5DB'}
        />
      </Animated.View>
    </TouchableOpacity>
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
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  typeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B160D',
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  // Question Card
  questionCard: {
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
    borderRadius: 16,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1B160D',
    textAlign: 'center',
    lineHeight: 30,
    fontStyle: 'italic',
  },

  // Answer Container
  answerContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Yes/No Buttons
  yesNoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  yesNoButton: {
    flex: 1,
    height: BUTTON_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
  },
  yesNoButtonFilled: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  yesNoButtonOutlined: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  yesNoButtonTextFilled: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  yesNoButtonTextOutlined: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: -0.2,
  },

  // Rating Selector
  ratingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  starsRow: {
    flexDirection: 'row',
    gap: STAR_SPACING,
    marginBottom: 24,
  },
  starButton: {
    width: STAR_SIZE + 8,
    height: STAR_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingLabelContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingLabelText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 34,
    backgroundColor: 'rgba(248, 247, 246, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
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
});
