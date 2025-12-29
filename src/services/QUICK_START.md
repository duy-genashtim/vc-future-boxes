# Database Service - Quick Start Guide

## 🚀 Setup (1 minute)

### Step 1: Initialize Database

Add to your `App.tsx`:

```typescript
import { initializeDatabase } from './services';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    initializeDatabase()
      .then(() => console.log('✓ Database ready'))
      .catch((err) => console.error('✗ DB init failed:', err));
  }, []);

  return (
    // Your app components
  );
}
```

## 📝 Common Operations

### Create a Capsule

```typescript
import { createCapsule } from '@/services';

const capsuleId = await createCapsule({
  type: 'emotion',
  content: 'Your text here...',
  createdAt: Math.floor(Date.now() / 1000),
  unlockAt: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
  status: 'locked',
  reflectionType: 'yes_no',
  reflectionQuestion: 'Did you overcome these emotions?',
});
```

### Load Home Screen Capsules

```typescript
import { getCapsulesByStatus } from '@/services';

const capsules = await getCapsulesByStatus(['locked', 'ready'], 6);
// Returns max 6 capsules sorted by unlock time
```

### Add Images to Capsule

```typescript
import { addCapsuleImage } from '@/services';

// Add up to 3 images
await addCapsuleImage({ capsuleId, uri: imageUri1, order: 0 });
await addCapsuleImage({ capsuleId, uri: imageUri2, order: 1 });
await addCapsuleImage({ capsuleId, uri: imageUri3, order: 2 });
```

### Open a Capsule

```typescript
import { updateCapsuleStatus, updateCapsuleReflection } from '@/services';

// Mark as opened
await updateCapsuleStatus(capsuleId, 'opened');

// Save reflection answer
await updateCapsuleReflection(capsuleId, 'yes'); // or 1-5 for rating
```

### Load Archive

```typescript
import { getOpenedCapsules } from '@/services';

const archived = await getOpenedCapsules();
// Returns all opened capsules sorted by opened_at DESC
```

### Delete Capsule (Archive only)

```typescript
import { deleteCapsule } from '@/services';

try {
  await deleteCapsule(capsuleId); // Only works for opened capsules
} catch (error) {
  console.error('Cannot delete locked/ready capsules');
}
```

## ⏰ Timer Implementation

```typescript
import { checkAndUpdateReadyCapsules } from '@/services';

// In your root component
useEffect(() => {
  const interval = setInterval(async () => {
    const count = await checkAndUpdateReadyCapsules();
    if (count > 0) {
      // Refresh UI to show newly ready capsules
      refreshCapsules();
    }
  }, 60000); // Check every minute

  return () => clearInterval(interval);
}, []);
```

## 💾 Settings

```typescript
import { setSetting, getSetting } from '@/services';

// Save
await setSetting('onboardingCompleted', true);

// Load
const completed = await getSetting('onboardingCompleted');
```

## ⚠️ Error Handling

Always wrap in try-catch:

```typescript
try {
  const capsule = await getCapsule(id);
} catch (error) {
  console.error('Database error:', error);
  // Show error UI to user
}
```

## 🎯 Data Types

```typescript
// Capsule Types
type CapsuleType = 'emotion' | 'goal' | 'memory' | 'decision';
type CapsuleStatus = 'locked' | 'ready' | 'opened';
type ReflectionType = 'yes_no' | 'rating' | 'none';

// Capsule Interface
interface Capsule {
  id: string;
  type: CapsuleType;
  title?: string;
  content: string;
  createdAt: number; // Unix timestamp (seconds)
  unlockAt: number; // Unix timestamp (seconds)
  openedAt?: number; // Unix timestamp (seconds)
  status: CapsuleStatus;
  reflectionQuestion?: string;
  reflectionType: ReflectionType;
  reflectionAnswer?: string | number;
}
```

## 📚 Full Documentation

See `README.md` for complete API documentation.

## 🧪 Testing

```typescript
import { runAllTests } from '@/services/__tests__/database.test';

// Run all manual tests
await runAllTests();
```

---

**That's it! You're ready to use the database service.**
