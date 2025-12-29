import { CapsuleType } from '../types';

// Capsule Type Configuration based on PRD
export const CAPSULE_TYPES = {
  emotion: {
    id: 'emotion' as CapsuleType,
    label: 'Emotion',
    description: 'Capture your current feelings and thoughts',
    icon: 'favorite', // MaterialIcons
    color: '#E91E63', // Pink
    gradient: ['#FF6B9D', '#C2185B'],
    reflectionType: 'yes_no' as const,
    reflectionPrompt: 'Did you overcome these emotions?',
  },
  goal: {
    id: 'goal' as CapsuleType,
    label: 'Goal',
    description: 'Set goals and track your progress',
    icon: 'flag', // MaterialIcons
    color: '#4CAF50', // Green
    gradient: ['#66BB6A', '#388E3C'],
    reflectionType: 'yes_no' as const,
    reflectionPrompt: 'Did you achieve this goal?',
  },
  memory: {
    id: 'memory' as CapsuleType,
    label: 'Memory',
    description: 'Preserve memorable moments',
    icon: 'photo-camera', // MaterialIcons
    color: '#FF9800', // Orange
    gradient: ['#FFB74D', '#F57C00'],
    reflectionType: 'none' as const,
  },
  decision: {
    id: 'decision' as CapsuleType,
    label: 'Decision',
    description: 'Record important decisions to evaluate later',
    icon: 'balance', // MaterialIcons
    color: '#2196F3', // Blue
    gradient: ['#42A5F5', '#1976D2'],
    reflectionType: 'rating' as const,
    reflectionPrompt: 'How would you rate this decision?',
  },
} as const;

// Date Presets for Unlock Time (Create Capsule Screen)
export const DATE_PRESETS = [
  { label: '1 Week', days: 7 },
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
] as const;

// Database Configuration
export const DB_NAME = 'futureboxes.db';
export const DB_VERSION = 1;

// UI Constants
export const MAX_IMAGES_PER_CAPSULE = 3;
export const MAX_CONTENT_LENGTH = 2000;
export const HOME_CAPSULES_LIMIT = 6; // 3x2 grid

// Timeouts and Intervals
export const COUNTDOWN_UPDATE_INTERVAL = 60000; // 1 minute
export const BACKGROUND_CHECK_INTERVAL = 300000; // 5 minutes

// Animation Durations (ms)
export const ANIMATIONS = {
  LOCK_DURATION: 1500,
  OPEN_DURATION: 2000,
  CELEBRATION_DURATION: 3000,
  TRANSITION_DURATION: 300,
} as const;

// Haptic Feedback Patterns
export const HAPTICS = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
  SUCCESS: 'notificationSuccess',
  WARNING: 'notificationWarning',
  ERROR: 'notificationError',
} as const;
