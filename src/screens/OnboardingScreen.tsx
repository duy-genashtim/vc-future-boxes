import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ViewToken,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { CAPSULE_TYPES } from '../constants';
import { updateAppSettings } from '../services/database';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

type Slide = {
  id: number;
  title: string;
  description: string;
  illustration: 'capsule' | 'types' | 'lock' | 'celebrate';
};

const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Welcome to\nFutureBoxes',
    description: 'Send messages to your future self. Create time capsules that unlock when you are ready.',
    illustration: 'capsule',
  },
  {
    id: 2,
    title: 'Four Types of\nCapsules',
    description: 'Choose from Emotion, Goal, Memory, or Decision to perfectly capture your moment.',
    illustration: 'types',
  },
  {
    id: 3,
    title: 'Lock Now,\nUnlock Later',
    description: 'Set an unlock date, add reflection questions, then wait for the magic moment.',
    illustration: 'lock',
  },
  {
    id: 4,
    title: 'Ready to\nBegin?',
    description: 'Create your first time capsule and start your journey of self-discovery.',
    illustration: 'celebrate',
  },
];

// Illustration Components
const CapsuleIllustration = ({ scrollX, index }: { scrollX: Animated.SharedValue<number>; index: number }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.illustrationContainer, animatedStyle]}>
      <View style={styles.capsuleBox}>
        <MaterialIcons name="card-giftcard" size={100} color="#6366F1" />
      </View>
    </Animated.View>
  );
};

const TypesIllustration = ({ scrollX, index }: { scrollX: Animated.SharedValue<number>; index: number }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const types = Object.values(CAPSULE_TYPES);

  return (
    <Animated.View style={[styles.illustrationContainer, animatedStyle]}>
      <View style={styles.typesGrid}>
        {types.map((type, idx) => {
          const delay = idx * 100;
          const iconScale = useSharedValue(0);

          React.useEffect(() => {
            iconScale.value = withSpring(1, { damping: 12, stiffness: 100, delay });
          }, []);

          const iconStyle = useAnimatedStyle(() => ({
            transform: [{ scale: iconScale.value }],
          }));

          return (
            <Animated.View key={type.id} style={[styles.typeCard, iconStyle]}>
              <LinearGradient
                colors={type.gradient}
                style={styles.typeIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name={type.icon as any} size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.typeLabel}>{type.label}</Text>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
};

const LockIllustration = ({ scrollX, index }: { scrollX: Animated.SharedValue<number>; index: number }) => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withTiming(360, { duration: 2000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { rotate: `${rotation.value}deg` }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.illustrationContainer, animatedStyle]}>
      <View style={styles.lockContainer}>
        <MaterialIcons name="lock" size={100} color="#6366F1" />
      </View>
    </Animated.View>
  );
};

const CelebrateIllustration = ({ scrollX, index }: { scrollX: Animated.SharedValue<number>; index: number }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.illustrationContainer, animatedStyle]}>
      <View style={styles.celebrateContainer}>
        <MaterialIcons name="celebration" size={100} color="#10B981" />
      </View>
    </Animated.View>
  );
};

const SlideItem = ({ item, scrollX }: { item: Slide; scrollX: Animated.SharedValue<number> }) => {
  const renderIllustration = () => {
    const index = item.id - 1;
    switch (item.illustration) {
      case 'capsule':
        return <CapsuleIllustration scrollX={scrollX} index={index} />;
      case 'types':
        return <TypesIllustration scrollX={scrollX} index={index} />;
      case 'lock':
        return <LockIllustration scrollX={scrollX} index={index} />;
      case 'celebrate':
        return <CelebrateIllustration scrollX={scrollX} index={index} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.slide}>
      {/* Illustration Area */}
      <View style={styles.illustrationArea}>
        {renderIllustration()}
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

const PaginationDots = ({ scrollX }: { scrollX: Animated.SharedValue<number> }) => {
  return (
    <View style={styles.pagination}>
      {SLIDES.map((_, index) => {
        const animatedStyle = useAnimatedStyle(() => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const width = interpolate(
            scrollX.value,
            inputRange,
            [8, 24, 8],
            Extrapolate.CLAMP
          );

          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.3, 1, 0.3],
            Extrapolate.CLAMP
          );

          return {
            width,
            opacity,
          };
        });

        return (
          <Animated.View
            key={index}
            style={[styles.dot, animatedStyle]}
          />
        );
      })}
    </View>
  );
};

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const isNavigatingRef = useRef(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && !isNavigatingRef.current) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleSkip = async () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    try {
      // Mark onboarding as completed
      await updateAppSettings({ onboardingCompleted: true });

      console.log('Onboarding skipped - marked as completed');

      // Navigate to Home
      navigation.replace('Home');
    } catch (error) {
      console.error('Failed to mark onboarding complete:', error);

      // Still navigate even if settings update fails (graceful degradation)
      navigation.replace('Home');
    }
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1 && !isNavigatingRef.current) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleGetStarted = async () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    try {
      // Haptic feedback for success
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Mark onboarding as completed
      await updateAppSettings({ onboardingCompleted: true });

      console.log('Onboarding completed - marked as completed');

      // Navigate to Home
      navigation.replace('Home');
    } catch (error) {
      console.error('Failed to mark onboarding complete:', error);

      // Still navigate even if settings update fails (graceful degradation)
      navigation.replace('Home');
    }
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button - Hide on last slide */}
      {!isLastSlide && (
        <View style={styles.skipContainer}>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipButton}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item }) => <SlideItem item={item} scrollX={scrollX} />}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <PaginationDots scrollX={scrollX} />

        {isLastSlide ? (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.getStartedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.nextGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextText}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  illustrationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  illustrationContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capsuleBox: {
    width: 200,
    height: 200,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    gap: 16,
  },
  typeCard: {
    width: 112,
    alignItems: 'center',
    gap: 8,
  },
  typeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  lockContainer: {
    width: 200,
    height: 200,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrateContainer: {
    width: 200,
    height: 200,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentArea: {
    paddingHorizontal: 32,
    paddingBottom: 120,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 320,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
    gap: 24,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    height: 8,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  nextButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  getStartedButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  getStartedGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
