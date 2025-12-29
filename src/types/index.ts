// Capsule Types based on PRD.md
export type CapsuleType = 'emotion' | 'goal' | 'memory' | 'decision';
export type CapsuleStatus = 'locked' | 'ready' | 'opened';
export type ReflectionType = 'yes_no' | 'rating' | 'none';

// Capsule Data Structure
export interface Capsule {
  id: string;
  type: CapsuleType;
  title?: string;
  content: string;
  createdAt: number; // timestamp
  unlockAt: number; // timestamp
  openedAt?: number; // timestamp
  status: CapsuleStatus;
  reflectionQuestion?: string;
  reflectionType: ReflectionType;
  reflectionAnswer?: string | number; // Yes/No or Rating 1-5
}

// Capsule Image
export interface CapsuleImage {
  id: string;
  capsuleId: string;
  uri: string; // local file path
  order: number; // 0, 1, 2 (max 3 images)
}

// App Settings
export interface AppSettings {
  onboardingCompleted: boolean;
  notificationsEnabled: boolean;
  lastNotificationCheck?: number;
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  TypeSelection: undefined;
  CreateCapsule: { type: CapsuleType };
  PreviewCapsule: {
    capsule: Omit<Capsule, 'id' | 'status'>;
    images: string[]; // URIs of selected images
  };
  LockAnimation: { capsuleId: string };
  CapsuleDetail: { capsuleId: string };
  OpenCapsule: { capsuleId: string };
  Reflection: { capsuleId: string };
  Celebration: { capsuleId: string; reflectionAnswer: string | number };
  Archive: undefined;
  ArchiveDetail: { capsuleId: string };
};
