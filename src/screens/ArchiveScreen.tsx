/**
 * ArchiveScreen.tsx
 * F11: Archive/History Screen - Display all opened capsules
 *
 * Displays list of capsules with status='opened', sorted by openedAt DESC
 * User can tap to view details in ArchiveDetail screen
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { StackScreenProps } from '@react-navigation/stack';

import { Capsule, RootStackParamList } from '../types';
import { getOpenedCapsules } from '../services';
import { CAPSULE_TYPES } from '../constants';
import SwipeableArchiveCard from '../components/SwipeableArchiveCard';

const { width } = Dimensions.get('window');

type Props = StackScreenProps<RootStackParamList, 'Archive'>;

export default function ArchiveScreen({ navigation }: Props) {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Toggle swipeable cards feature (set to true to enable swipe-to-delete)
  const [enableSwipe] = useState<boolean>(false); // Change to true to enable swipe-to-delete

  /**
   * Load opened capsules from database
   */
  const loadCapsules = useCallback(async () => {
    try {
      const data = await getOpenedCapsules();
      setCapsules(data);
    } catch (error) {
      console.error('Failed to load archive capsules:', error);
      Alert.alert('Error', 'Failed to load archive. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCapsules();
  }, [loadCapsules]);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    loadCapsules();
  }, [loadCapsules]);

  /**
   * Handle back navigation
   */
  const handleBackPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  /**
   * Handle capsule item tap
   * Navigate to ArchiveDetail screen
   */
  const handleCapsuleTap = useCallback((capsuleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ArchiveDetail', { capsuleId });
  }, [navigation]);

  /**
   * Handle delete capsule (from swipe action)
   */
  const handleDeleteCapsule = useCallback((capsuleId: string) => {
    // Navigate to ArchiveDetail which has full delete confirmation UI
    navigation.navigate('ArchiveDetail', { capsuleId });
  }, [navigation]);

  /**
   * Render empty state when no opened capsules
   */
  const renderEmptyState = () => (
    <Animated.View entering={FadeIn} style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="folder-open-outline" size={80} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No opened capsules yet</Text>
      <Text style={styles.emptyDescription}>
        Your opened capsules will appear here. Create a capsule and wait for it to unlock!
      </Text>
    </Animated.View>
  );

  /**
   * Render individual capsule list item
   */
  const renderCapsuleItem = ({ item, index }: { item: Capsule; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      {enableSwipe ? (
        <SwipeableArchiveCard
          capsule={item}
          onPress={() => handleCapsuleTap(item.id)}
          onDelete={() => handleDeleteCapsule(item.id)}
        />
      ) : (
        <ArchiveCapsuleCard
          capsule={item}
          onPress={() => handleCapsuleTap(item.id)}
        />
      )}
    </Animated.View>
  );

  /**
   * Item separator
   */
  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBackPress}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>

        <Text style={styles.headerTitle}>Archive</Text>

        {/* Placeholder for symmetry */}
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Section Header with count */}
      {capsules.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>YOUR OPENED CAPSULES</Text>
          <Text style={styles.sectionCount}>{capsules.length} memories</Text>
        </View>
      )}

      {/* Capsule List or Empty State */}
      <FlatList
        data={capsules}
        keyExtractor={(item) => item.id}
        renderItem={renderCapsuleItem}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          capsules.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
            colors={['#6366F1']}
          />
        }
      />
    </SafeAreaView>
  );
}

/**
 * ArchiveCapsuleCard Component
 * List item displaying opened capsule summary
 */
interface ArchiveCapsuleCardProps {
  capsule: Capsule;
  onPress: () => void;
}

function ArchiveCapsuleCard({ capsule, onPress }: ArchiveCapsuleCardProps) {
  const { type, content, createdAt, openedAt, reflectionAnswer } = capsule;

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
  const contentPreview = content.length > 60
    ? content.substring(0, 60) + '...'
    : content;

  // Check if has reflection
  const hasReflection = reflectionAnswer !== null && reflectionAnswer !== undefined;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Left accent border */}
      <View style={[styles.cardAccent, { backgroundColor: typeConfig.color }]} />

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
              {/* Map icons to Ionicons */}
              <Ionicons
                name={
                  type === 'emotion' ? 'heart' :
                  type === 'goal' ? 'flag' :
                  type === 'memory' ? 'camera' :
                  'scale' // decision
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
            Created: <Text style={styles.cardDateValue}>{formatDate(createdAt)}</Text>
          </Text>
          {openedAt && (
            <Text style={styles.cardDateLabel}>
              Opened: <Text style={styles.cardDateValue}>{formatDate(openedAt)}</Text>
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
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={styles.cardReflectionText}>Reflection answered</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButton: {
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerPlaceholder: {
    width: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  // Archive Capsule Card styles
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
    transform: [{ scale: 0.98 }],
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
