/**
 * TypeSelectionScreen.tsx
 * F3: Capsule Type Selection
 *
 * Allows user to choose one of 4 capsule types before creating content.
 * Beautiful card-based selection with animations and haptic feedback.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { RootStackParamList, CapsuleType } from '../types';
import { CAPSULE_TYPES } from '../constants';

type Props = StackScreenProps<RootStackParamList, 'TypeSelection'>;

// Animated TouchableOpacity for better animations
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function TypeSelectionScreen({ navigation }: Props) {
  const [selectedType, setSelectedType] = useState<CapsuleType | null>(null);

  // Handle type card tap
  const handleTypeSelect = (type: CapsuleType) => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Toggle selection (tap same card deselects)
    if (selectedType === type) {
      setSelectedType(null);
    } else {
      setSelectedType(type);
    }
  };

  // Handle continue button
  const handleContinue = () => {
    if (!selectedType) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Navigate to CreateCapsule with selected type
    navigation.navigate('CreateCapsule', { type: selectedType });
  };

  // Handle back button
  const handleBack = () => {
    navigation.goBack();
  };

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
        <Text style={styles.headerTitle}>Choose Capsule Type</Text>
        <View style={styles.backButton} />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Instruction Text */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.instructionContainer}
        >
          <Text style={styles.instructionText}>
            What kind of message are you sending?
          </Text>
        </Animated.View>

        {/* Type Cards */}
        <View style={styles.cardsContainer}>
          {Object.values(CAPSULE_TYPES).map((typeConfig, index) => (
            <TypeCard
              key={typeConfig.id}
              typeConfig={typeConfig}
              isSelected={selectedType === typeConfig.id}
              onPress={() => handleTypeSelect(typeConfig.id)}
              delay={index * 100}
            />
          ))}
        </View>
      </ScrollView>

      {/* Continue Button - Fixed at bottom */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedType && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedType}
          activeOpacity={0.8}
        >
          {selectedType ? (
            <LinearGradient
              colors={['#EE9D2B', '#E67E22']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          ) : (
            <View style={styles.continueButtonGradient}>
              <Text style={[styles.continueButtonText, styles.continueButtonTextDisabled]}>
                Continue
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// TypeCard Component
interface TypeCardProps {
  typeConfig: typeof CAPSULE_TYPES.emotion;
  isSelected: boolean;
  onPress: () => void;
  delay: number;
}

function TypeCard({ typeConfig, isSelected, onPress, delay }: TypeCardProps) {
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(0);

  // Update animated values when selection changes
  React.useEffect(() => {
    if (isSelected) {
      scale.value = withSpring(1.02, {
        damping: 15,
        stiffness: 200,
      });
      borderOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.ease,
      });
    } else {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      borderOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.ease,
      });
    }
  }, [isSelected]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedBorderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  return (
    <AnimatedTouchable
      entering={FadeInDown.duration(400).delay(delay)}
      style={[styles.typeCard, animatedCardStyle]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[typeConfig.gradient[0] + '15', typeConfig.gradient[1] + '10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.typeCardGradient}
      >
        {/* Selection Border */}
        <Animated.View
          style={[
            styles.selectionBorder,
            {
              borderColor: typeConfig.color,
              shadowColor: typeConfig.color,
            },
            animatedBorderStyle,
          ]}
        />

        {/* Icon Circle */}
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: typeConfig.gradient[0] + '20' },
          ]}
        >
          <MaterialIcons
            name={typeConfig.icon as any}
            size={40}
            color={typeConfig.color}
          />
        </View>

        {/* Text Content */}
        <View style={styles.typeCardContent}>
          <Text style={styles.typeLabel}>{typeConfig.label}</Text>
          <Text style={styles.typeDescription}>{typeConfig.description}</Text>
        </View>

        {/* Checkmark (visible when selected) */}
        {isSelected && (
          <Animated.View
            entering={FadeInDown.duration(200).springify()}
            style={[
              styles.checkmarkContainer,
              { backgroundColor: typeConfig.color },
            ]}
          >
            <MaterialIcons name="check" size={18} color="#FFFFFF" />
          </Animated.View>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F6',
  },
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
    paddingBottom: 120, // Space for footer
  },
  instructionContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1B160D',
    opacity: 0.7,
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  typeCard: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  typeCardGradient: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectionBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 3,
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    zIndex: 2,
  },
  typeCardContent: {
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  typeLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B160D',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  typeDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1B160D',
    opacity: 0.6,
    lineHeight: 20,
    textAlign: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 40,
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
  continueButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  continueButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  continueButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
