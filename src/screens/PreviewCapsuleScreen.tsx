/**
 * PreviewCapsuleScreen.tsx
 * F4: Create Capsule - Preview screen before locking
 *
 * Displays full capsule content for user review before final lock
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { RootStackParamList } from '../types';
import { CAPSULE_TYPES } from '../constants';
import { formatUnlockDate, getCountdownPreview } from '../utils/formatDate';
import {
  createCapsule,
  addCapsuleImage,
  getCapsule,
} from '../services/database';
import {
  copyImageToPermanentStorage,
  initializeImageStorage,
} from '../services/imageStorage';
import {
  scheduleNotification,
  checkNotificationPermission,
  requestNotificationPermission,
} from '../services/notifications';

type Props = StackScreenProps<RootStackParamList, 'PreviewCapsule'>;

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 64) / 3;

export default function PreviewCapsuleScreen({ route, navigation }: Props) {
  const { capsule, images } = route.params;
  const typeConfig = CAPSULE_TYPES[capsule.type];

  const [isLocking, setIsLocking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const unlockDate = new Date(capsule.unlockAt * 1000);
  const hasReflection = capsule.reflectionQuestion && capsule.reflectionQuestion.length > 0;

  // Handle back to edit
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  // Handle lock capsule
  const handleLockCapsule = async () => {
    // Show confirmation dialog
    Alert.alert(
      'Lock Capsule?',
      'Once locked, you cannot view, edit, or delete this capsule until it unlocks.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Lock',
          style: 'default',
          onPress: () => performLock(),
        },
      ]
    );
  };

  const performLock = async () => {
    setIsLocking(true);

    try {
      // 1. Initialize image storage
      await initializeImageStorage();

      // 2. Create capsule in database
      const capsuleId = await createCapsule({
        type: capsule.type,
        content: capsule.content,
        createdAt: capsule.createdAt,
        unlockAt: capsule.unlockAt,
        status: 'locked',
        reflectionQuestion: capsule.reflectionQuestion,
        reflectionType: capsule.reflectionType,
      });

      console.log('Capsule created with ID:', capsuleId);

      // 3. Store images to permanent location
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          try {
            const permanentUri = await copyImageToPermanentStorage(
              images[i],
              capsuleId,
              i
            );

            await addCapsuleImage({
              capsuleId,
              uri: permanentUri,
              order: i,
            });

            console.log(`Image ${i} saved:`, permanentUri);
          } catch (error) {
            console.error(`Failed to save image ${i}:`, error);
            // Continue with other images even if one fails
          }
        }
      }

      // 4. Schedule notification
      const hasPermission = await checkNotificationPermission();

      if (hasPermission) {
        await scheduleNotification(capsuleId, capsule.type, unlockDate);
      } else {
        // Request permission
        const granted = await requestNotificationPermission();

        if (granted) {
          await scheduleNotification(capsuleId, capsule.type, unlockDate);
        } else {
          // Show warning but continue
          Alert.alert(
            'Notification Disabled',
            'Capsule created successfully, but you will not receive notifications. You can enable notifications in your device settings.',
            [{ text: 'OK' }]
          );
        }
      }

      // 5. Verify capsule was created
      const savedCapsule = await getCapsule(capsuleId);

      if (!savedCapsule) {
        throw new Error('Failed to verify capsule creation');
      }

      // 6. Navigate to Lock Animation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      navigation.replace('LockAnimation', { capsuleId });
    } catch (error) {
      console.error('Failed to lock capsule:', error);

      setIsLocking(false);

      Alert.alert(
        'Error',
        'Failed to create capsule. Please try again.',
        [{ text: 'OK' }]
      );
    }
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
          disabled={isLocking}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1B160D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Type Indicator */}
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
              size={32}
              color={typeConfig.color}
            />
          </View>
          <Text style={[styles.typeLabel, { color: typeConfig.color }]}>
            {typeConfig.label} Capsule
          </Text>
        </Animated.View>

        {/* Content Text */}
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
              {images.map((uri, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.imageContainer}
                  activeOpacity={0.8}
                  onPress={() => setCurrentImageIndex(index)}
                >
                  <Image source={{ uri }} style={styles.imagePreview} />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Reflection Question */}
        {hasReflection && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(400)}
            style={styles.reflectionSection}
          >
            <Text style={styles.sectionLabel}>Reflection Question</Text>
            <View style={styles.reflectionBox}>
              <MaterialIcons name="help-outline" size={20} color="#6B7280" />
              <Text style={styles.reflectionText}>
                {capsule.reflectionQuestion}
              </Text>
            </View>
            <Text style={styles.reflectionHint}>
              You'll answer this when the capsule unlocks
            </Text>
          </Animated.View>
        )}

        {/* Unlock Date Info */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(500)}
          style={styles.unlockSection}
        >
          <Text style={styles.sectionLabel}>Unlocks On</Text>
          <View style={[styles.unlockBox, { borderColor: typeConfig.color }]}>
            <MaterialIcons
              name="schedule"
              size={24}
              color={typeConfig.color}
            />
            <View style={styles.unlockTextContainer}>
              <Text style={[styles.unlockDate, { color: typeConfig.color }]}>
                {formatUnlockDate(unlockDate)}
              </Text>
              <Text style={styles.countdown}>
                {getCountdownPreview(unlockDate)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Bottom spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Lock Button - Fixed at bottom */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.lockButton}
          onPress={handleLockCapsule}
          disabled={isLocking}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={typeConfig.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.lockButtonGradient}
          >
            {isLocking ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="lock" size={20} color="#FFFFFF" />
                <Text style={styles.lockButtonText}>Lock Capsule</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
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
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },

  // Reflection Section
  reflectionSection: {
    marginBottom: 24,
  },
  reflectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  reflectionText: {
    flex: 1,
    fontSize: 16,
    color: '#1B160D',
    lineHeight: 24,
  },
  reflectionHint: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Unlock Section
  unlockSection: {
    marginBottom: 24,
  },
  unlockBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  unlockTextContainer: {
    flex: 1,
  },
  unlockDate: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  countdown: {
    fontSize: 14,
    color: '#9CA3AF',
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
  lockButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  lockButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  lockButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
