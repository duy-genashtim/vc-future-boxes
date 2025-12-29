/**
 * CreateCapsuleScreen.tsx
 * F4: Create Capsule - Main form for creating new capsule
 *
 * User inputs: text content, images (optional, max 3), reflection question (conditional),
 * and unlock time. Then previews before locking.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

import { RootStackParamList, CapsuleType } from '../types';
import { CAPSULE_TYPES, MAX_CONTENT_LENGTH, MAX_IMAGES_PER_CAPSULE, DATE_PRESETS } from '../constants';
import { formatUnlockDate, getCountdownPreview, getDateFromPreset, isFutureDate } from '../utils/formatDate';

type Props = StackScreenProps<RootStackParamList, 'CreateCapsule'>;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function CreateCapsuleScreen({ route, navigation }: Props) {
  const { type } = route.params;
  const typeConfig = CAPSULE_TYPES[type];

  // Form state
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [reflectionQuestion, setReflectionQuestion] = useState('');
  const [unlockTime, setUnlockTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');

  // Scroll ref for keyboard avoidance
  const scrollViewRef = useRef<ScrollView>(null);

  // Derived state
  const characterCount = content.length;
  const canAddImage = images.length < MAX_IMAGES_PER_CAPSULE;
  const hasReflectionQuestion = type !== 'memory';
  const isValid = content.trim().length > 0 && content.length <= MAX_CONTENT_LENGTH && unlockTime !== null;

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        // Permission will be requested again when user taps image picker
      }
    })();
  }, []);

  // Handle back button with unsaved changes warning
  const handleBack = () => {
    if (content.length > 0 || images.length > 0 || reflectionQuestion.length > 0 || unlockTime !== null) {
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // Handle content text change
  const handleContentChange = (text: string) => {
    if (text.length <= MAX_CONTENT_LENGTH) {
      setContent(text);
    } else {
      // Truncate and show warning
      setContent(text.substring(0, MAX_CONTENT_LENGTH));
      Alert.alert('Character limit reached', `Maximum ${MAX_CONTENT_LENGTH} characters allowed.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  // Handle image picker
  const handleAddImage = async () => {
    if (!canAddImage) {
      Alert.alert('Maximum images', `You can only add up to ${MAX_IMAGES_PER_CAPSULE} images.`);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages([...images, result.assets[0].uri]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Handle remove image
  const handleRemoveImage = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setImages(images.filter((_, i) => i !== index));
  };

  // Handle date preset selection
  const handlePresetSelect = (days: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const date = getDateFromPreset(days);
    setUnlockTime(date);
  };

  // Handle custom date picker
  const handleCustomDatePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDatePickerMode('date');
    setShowDatePicker(true);
  };

  // Handle date picker change
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      if (datePickerMode === 'date') {
        // Date selected, now show time picker
        if (Platform.OS === 'ios') {
          // iOS: combined date+time picker, just set
          setUnlockTime(selectedDate);
        } else {
          // Android: show time picker next
          setDatePickerMode('time');
          setShowDatePicker(true);
          setUnlockTime(selectedDate); // Set date part
        }
      } else {
        // Time selected
        setUnlockTime(selectedDate);
        if (Platform.OS === 'ios') {
          setShowDatePicker(false);
        }
      }

      // Validate future date (at least 45 minutes from now)
      if (!isFutureDate(selectedDate)) {
        Alert.alert('Invalid date', 'Please select a time at least 45 minutes from now.');
        setUnlockTime(null);
      }
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  // Handle preview button
  const handlePreview = () => {
    if (!isValid) {
      // Show specific validation errors
      if (content.trim().length === 0) {
        Alert.alert('Missing content', 'Please enter your message.');
        return;
      }
      if (!unlockTime) {
        Alert.alert('Missing unlock time', 'Please select when this capsule should unlock.');
        return;
      }
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Navigate to Preview screen
    navigation.navigate('PreviewCapsule', {
      capsule: {
        type,
        content,
        reflectionQuestion: reflectionQuestion.trim() || undefined,
        reflectionType: typeConfig.reflectionType,
        createdAt: Math.floor(Date.now() / 1000),
        unlockAt: Math.floor(unlockTime!.getTime() / 1000),
      },
      images,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color="#1B160D" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name={typeConfig.icon as any} size={20} color={typeConfig.color} />
          <Text style={styles.headerTitle}>Create {typeConfig.label}</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Main Content */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Content Input Section */}
          <ContentInputSection
            content={content}
            characterCount={characterCount}
            onContentChange={handleContentChange}
            typeColor={typeConfig.color}
          />

          {/* Image Picker Section */}
          <ImagePickerSection
            images={images}
            canAddImage={canAddImage}
            onAddImage={handleAddImage}
            onRemoveImage={handleRemoveImage}
          />

          {/* Reflection Question Section (Conditional) */}
          {hasReflectionQuestion && (
            <ReflectionQuestionSection
              reflectionQuestion={reflectionQuestion}
              onReflectionChange={setReflectionQuestion}
              placeholder={typeConfig.reflectionPrompt}
              typeColor={typeConfig.color}
            />
          )}

          {/* Unlock Time Picker Section */}
          <UnlockTimePickerSection
            unlockTime={unlockTime}
            onPresetSelect={handlePresetSelect}
            onCustomDatePress={handleCustomDatePress}
            typeColor={typeConfig.color}
          />

          {/* Bottom spacing for preview button */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Date/Time Picker Modal (iOS/Android) */}
        {showDatePicker && (
          <DateTimePicker
            value={unlockTime || new Date()}
            mode={Platform.OS === 'ios' ? 'datetime' : datePickerMode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}
      </KeyboardAvoidingView>

      {/* Preview Button - Fixed at bottom */}
      <PreviewButtonFooter isValid={isValid} onPress={handlePreview} typeConfig={typeConfig} />
    </SafeAreaView>
  );
}

// ===========================
// Section Components
// ===========================

// Content Input Section
interface ContentInputSectionProps {
  content: string;
  characterCount: number;
  onContentChange: (text: string) => void;
  typeColor: string;
}

function ContentInputSection({ content, characterCount, onContentChange, typeColor }: ContentInputSectionProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = isFocused ? typeColor : '#E5E7EB';
  const counterColor = characterCount > 1900 ? (characterCount === MAX_CONTENT_LENGTH ? '#EF4444' : '#F59E0B') : '#9CA3AF';

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.section}>
      <Text style={styles.sectionLabel}>What's on your mind?</Text>
      <View style={[styles.textInputContainer, { borderColor }]}>
        <TextInput
          style={styles.textInput}
          placeholder="What do you want to tell your future self?"
          placeholderTextColor="#9CA3AF"
          multiline
          value={content}
          onChangeText={onContentChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={MAX_CONTENT_LENGTH}
          textAlignVertical="top"
        />
      </View>
      <Text style={[styles.characterCounter, { color: counterColor }]}>
        {characterCount}/{MAX_CONTENT_LENGTH}
      </Text>
    </Animated.View>
  );
}

// Image Picker Section
interface ImagePickerSectionProps {
  images: string[];
  canAddImage: boolean;
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
}

function ImagePickerSection({ images, canAddImage, onAddImage, onRemoveImage }: ImagePickerSectionProps) {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.section}>
      <Text style={styles.sectionLabel}>Add photos (optional, max {MAX_IMAGES_PER_CAPSULE})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScrollContent}>
        {images.map((uri, index) => (
          <ImageSlot key={index} uri={uri} onRemove={() => onRemoveImage(index)} />
        ))}
        {canAddImage && <AddImageSlot onPress={onAddImage} />}
      </ScrollView>
    </Animated.View>
  );
}

// Image Slot Component
interface ImageSlotProps {
  uri: string;
  onRemove: () => void;
}

function ImageSlot({ uri, onRemove }: ImageSlotProps) {
  return (
    <Animated.View entering={FadeInDown.duration(300).springify()} style={styles.imageSlot}>
      <Image source={{ uri }} style={styles.imagePreview} />
      <TouchableOpacity style={styles.removeImageButton} onPress={onRemove} activeOpacity={0.7}>
        <MaterialIcons name="close" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// Add Image Slot Component
interface AddImageSlotProps {
  onPress: () => void;
}

function AddImageSlot({ onPress }: AddImageSlotProps) {
  return (
    <TouchableOpacity style={styles.addImageSlot} onPress={onPress} activeOpacity={0.7}>
      <MaterialIcons name="add-a-photo" size={32} color="#9CA3AF" />
      <Text style={styles.addImageText}>Add Photo</Text>
    </TouchableOpacity>
  );
}

// Reflection Question Section
interface ReflectionQuestionSectionProps {
  reflectionQuestion: string;
  onReflectionChange: (text: string) => void;
  placeholder?: string;
  typeColor: string;
}

function ReflectionQuestionSection({
  reflectionQuestion,
  onReflectionChange,
  placeholder,
  typeColor,
}: ReflectionQuestionSectionProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = isFocused ? typeColor : '#E5E7EB';

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.section}>
      <Text style={styles.sectionLabel}>Reflection Question</Text>
      <View style={[styles.reflectionInputContainer, { borderColor }]}>
        <TextInput
          style={styles.reflectionInput}
          placeholder={placeholder || 'What will you ask yourself?'}
          placeholderTextColor="#9CA3AF"
          value={reflectionQuestion}
          onChangeText={onReflectionChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </Animated.View>
  );
}

// Unlock Time Picker Section
interface UnlockTimePickerSectionProps {
  unlockTime: Date | null;
  onPresetSelect: (days: number) => void;
  onCustomDatePress: () => void;
  typeColor: string;
}

function UnlockTimePickerSection({ unlockTime, onPresetSelect, onCustomDatePress, typeColor }: UnlockTimePickerSectionProps) {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.section}>
      <Text style={styles.sectionLabel}>When should this unlock?</Text>

      {/* Date Presets */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScrollContent}>
        {DATE_PRESETS.map((preset) => (
          <DatePresetChip key={preset.label} label={preset.label} days={preset.days} onPress={onPresetSelect} typeColor={typeColor} />
        ))}
      </ScrollView>

      {/* Custom Date Button */}
      <TouchableOpacity style={styles.customDateButton} onPress={onCustomDatePress} activeOpacity={0.7}>
        <MaterialIcons name="event" size={20} color="#6B7280" />
        <Text style={styles.customDateButtonText}>Custom Date & Time</Text>
      </TouchableOpacity>

      {/* Selected Date Display */}
      {unlockTime && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateLabel}>Unlocks on:</Text>
          <Text style={[styles.selectedDate, { color: typeColor }]}>{formatUnlockDate(unlockTime)}</Text>
          <Text style={styles.countdownPreview}>{getCountdownPreview(unlockTime)}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// Date Preset Chip Component
interface DatePresetChipProps {
  label: string;
  days: number;
  onPress: (days: number) => void;
  typeColor: string;
}

function DatePresetChip({ label, days, onPress, typeColor }: DatePresetChipProps) {
  return (
    <TouchableOpacity style={[styles.presetChip, { borderColor: typeColor }]} onPress={() => onPress(days)} activeOpacity={0.7}>
      <Text style={[styles.presetChipText, { color: typeColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// Preview Button Footer
interface PreviewButtonFooterProps {
  isValid: boolean;
  onPress: () => void;
  typeConfig: typeof CAPSULE_TYPES.emotion;
}

function PreviewButtonFooter({ isValid, onPress, typeConfig }: PreviewButtonFooterProps) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.previewButton} onPress={onPress} disabled={!isValid} activeOpacity={0.8}>
        {isValid ? (
          <LinearGradient colors={typeConfig.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.previewButtonGradient}>
            <Text style={styles.previewButtonText}>Preview Capsule</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.previewButtonGradient, styles.previewButtonDisabled]}>
            <Text style={[styles.previewButtonText, styles.previewButtonTextDisabled]}>Preview Capsule</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B160D',
    letterSpacing: -0.3,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B160D',
    marginBottom: 12,
  },

  // Content Input
  textInputContainer: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 120,
    maxHeight: 200,
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    color: '#1B160D',
    lineHeight: 24,
    minHeight: 88,
  },
  characterCounter: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'right',
  },

  // Image Picker
  imageScrollContent: {
    gap: 12,
  },
  imageSlot: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageSlot: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addImageText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Reflection Question
  reflectionInputContainer: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  reflectionInput: {
    fontSize: 16,
    color: '#1B160D',
  },

  // Unlock Time Picker
  presetsScrollContent: {
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  presetChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customDateButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedDateContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedDateLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  countdownPreview: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // Preview Button Footer
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
  previewButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  previewButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  previewButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
