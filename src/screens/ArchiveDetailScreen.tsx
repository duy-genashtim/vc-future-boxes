/**
 * ArchiveDetailScreen.tsx
 * F12: Delete Opened Capsule - View archived capsule with delete option
 *
 * Displays full content of opened capsule (read-only) with option to delete.
 * Includes confirmation dialog to prevent accidental deletion.
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
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';

import { RootStackParamList } from '../types';
import { CAPSULE_TYPES } from '../constants';
import { formatUnlockDate } from '../utils/formatDate';
import { getCapsule, getCapsuleImages, deleteCapsule } from '../services/database';
import type { Capsule, CapsuleImage } from '../types';
import * as FileSystem from 'expo-file-system/legacy';

type Props = StackScreenProps<RootStackParamList, 'ArchiveDetail'>;

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 64) / 3;

export default function ArchiveDetailScreen({ route, navigation }: Props) {
  const { capsuleId } = route.params;

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [images, setImages] = useState<CapsuleImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load capsule data
  useEffect(() => {
    async function loadCapsule() {
      try {
        const capsuleData = await getCapsule(capsuleId);
        if (!capsuleData) {
          console.error('Capsule not found:', capsuleId);
          navigation.replace('Archive');
          return;
        }

        // Verify capsule is opened
        if (capsuleData.status !== 'opened') {
          console.warn('Capsule is not opened:', capsuleData.status);
          navigation.replace('Archive');
          return;
        }

        const capsuleImages = await getCapsuleImages(capsuleId);

        setCapsule(capsuleData);
        setImages(capsuleImages);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load capsule:', error);
        navigation.replace('Archive');
      }
    }

    loadCapsule();
  }, [capsuleId, navigation]);

  // Handlers
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleDeletePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    // Heavy haptic for destructive action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setDeleting(true);
    setShowDeleteConfirm(false);

    try {
      // Step 1: Get image URIs before deleting (for filesystem cleanup)
      const capsuleImages = await getCapsuleImages(capsuleId);

      // Step 2: Delete capsule from database
      // This will CASCADE delete image records automatically
      await deleteCapsule(capsuleId);

      // Step 3: Delete image files from filesystem
      // Note: File deletion failures are non-blocking per activity diagram
      for (const image of capsuleImages) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(image.uri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(image.uri, { idempotent: true });
            console.log(`Deleted image file: ${image.uri}`);
          }
        } catch (fileError) {
          // Non-blocking error: log warning and continue
          console.warn(`Failed to delete image file: ${image.uri}`, fileError);
          // Orphan files may remain (acceptable per requirements)
        }
      }

      // Step 4: Try to delete the capsule images folder
      // Folder path: {documentDirectory}/capsule_images/{capsuleId}/
      if (capsuleImages.length > 0) {
        try {
          // Extract folder path from first image URI
          const firstImageUri = capsuleImages[0].uri;
          const folderPath = firstImageUri.substring(0, firstImageUri.lastIndexOf('/'));

          const folderInfo = await FileSystem.getInfoAsync(folderPath);
          if (folderInfo.exists) {
            await FileSystem.deleteAsync(folderPath, { idempotent: true });
            console.log(`Deleted capsule folder: ${folderPath}`);
          }
        } catch (folderError) {
          console.warn('Failed to delete capsule folder:', folderError);
        }
      }

      // Step 5: Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate back BEFORE showing alert (better UX)
      navigation.goBack();

      // Show success message after navigation
      setTimeout(() => {
        Alert.alert('Success', 'Capsule deleted successfully');
      }, 300);

    } catch (error) {
      console.error('Failed to delete capsule:', error);

      // Reset UI state on error
      setDeleting(false);

      // Error haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Show error message
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to delete capsule. Please try again.';

      Alert.alert('Error', errorMessage);
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
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading capsule...</Text>
      </View>
    );
  }

  const typeConfig = CAPSULE_TYPES[capsule.type];
  const createdDate = new Date(capsule.createdAt * 1000);
  const openedDate = capsule.openedAt ? new Date(capsule.openedAt * 1000) : null;
  const hasReflection = capsule.reflectionQuestion && capsule.reflectionQuestion.length > 0;

  // Format reflection answer for display
  const formatReflectionAnswer = () => {
    if (!capsule.reflectionAnswer) return null;

    if (capsule.reflectionType === 'yes_no') {
      const isYes = capsule.reflectionAnswer === 'yes';
      return {
        text: isYes ? 'Yes' : 'No',
        icon: isYes ? 'checkmark-circle' : 'close-circle',
        color: isYes ? '#10B981' : '#EF4444',
      };
    }

    if (capsule.reflectionType === 'rating') {
      const rating = Number(capsule.reflectionAnswer);
      const labels = {
        1: 'Poor decision',
        2: 'Below expectations',
        3: 'Neutral / Okay',
        4: 'Good decision',
        5: 'Excellent decision',
      };
      return {
        rating,
        label: labels[rating as keyof typeof labels] || '',
        color: rating >= 4 ? '#10B981' : rating === 3 ? '#F59E0B' : '#EF4444',
      };
    }

    return null;
  };

  const reflectionDisplay = formatReflectionAnswer();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1B160D" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{typeConfig.label} Capsule</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleDeletePress}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
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
              size={60}
              color={typeConfig.color}
            />
          </View>
        </Animated.View>

        {/* Date Info */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(150)}
          style={styles.dateSection}
        >
          <Text style={styles.dateLabel}>
            Created: <Text style={styles.dateValue}>{formatUnlockDate(createdDate)}</Text>
          </Text>
          {openedDate && (
            <Text style={styles.dateLabel}>
              Opened: <Text style={styles.dateValue}>{formatUnlockDate(openedDate)}</Text>
            </Text>
          )}
        </Animated.View>

        {/* Content Card */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.contentSection}
        >
          <Text style={styles.sectionLabel}>Message</Text>
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

        {/* Reflection Section */}
        {hasReflection && reflectionDisplay && (
          <Animated.View
            entering={FadeInDown.duration(400).delay(400)}
            style={styles.reflectionSection}
          >
            <View style={styles.reflectionDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>REFLECTION</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Question */}
            <View
              style={[
                styles.reflectionQuestionBox,
                { backgroundColor: `${typeConfig.color}10` },
              ]}
            >
              <MaterialIcons name="help-outline" size={20} color={typeConfig.color} />
              <Text style={styles.reflectionQuestionText}>
                {capsule.reflectionQuestion}
              </Text>
            </View>

            {/* Answer */}
            <View style={styles.reflectionAnswerContainer}>
              <Text style={styles.reflectionAnswerLabel}>Your Answer:</Text>

              {capsule.reflectionType === 'yes_no' && reflectionDisplay && (
                <View style={styles.yesNoAnswer}>
                  <Ionicons
                    name={reflectionDisplay.icon as any}
                    size={24}
                    color={reflectionDisplay.color}
                  />
                  <Text style={[styles.yesNoText, { color: reflectionDisplay.color }]}>
                    {reflectionDisplay.text}
                  </Text>
                </View>
              )}

              {capsule.reflectionType === 'rating' && reflectionDisplay && (
                <View style={styles.ratingAnswer}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= reflectionDisplay.rating ? 'star' : 'star-outline'}
                        size={28}
                        color={star <= reflectionDisplay.rating ? '#F59E0B' : '#D1D5DB'}
                      />
                    ))}
                  </View>
                  <Text style={[styles.ratingLabel, { color: reflectionDisplay.color }]}>
                    {reflectionDisplay.rating} out of 5 - {reflectionDisplay.label}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteConfirm}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
      />
    </SafeAreaView>
  );
}

// ===========================
// Delete Confirmation Modal Component
// ===========================

interface DeleteConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

function DeleteConfirmationModal({
  visible,
  onCancel,
  onConfirm,
  deleting,
}: DeleteConfirmationModalProps) {
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      modalScale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      modalOpacity.value = withSpring(1);
    } else {
      modalScale.value = 0.9;
      modalOpacity.value = 0;
    }
  }, [visible]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onCancel}
      animationType="none"
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel}
        />

        <Animated.View style={[styles.modalContent, modalAnimatedStyle]}>
          {/* Warning Icon */}
          <View style={styles.warningIconContainer}>
            <Ionicons name="warning" size={48} color="#EF4444" />
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>Delete this capsule?</Text>

          {/* Message */}
          <Text style={styles.modalMessage}>
            This action cannot be undone. The capsule and all its photos will be permanently deleted.
          </Text>

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.8}
              disabled={deleting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F7F6',
  },
  headerButton: {
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

  // Content
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
    marginBottom: 16,
    paddingVertical: 16,
  },
  typeIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Date Section
  dateSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateValue: {
    fontWeight: '600',
    color: '#374151',
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
  reflectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  reflectionQuestionBox: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reflectionQuestionText: {
    flex: 1,
    fontSize: 16,
    color: '#1B160D',
    lineHeight: 24,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  reflectionAnswerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reflectionAnswerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },

  // Yes/No Answer
  yesNoAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yesNoText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // Rating Answer
  ratingAnswer: {
    alignItems: 'flex-start',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
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
    height: '100%',
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

  // Delete Confirmation Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B160D',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
