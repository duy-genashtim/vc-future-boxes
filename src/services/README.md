# Database Service Documentation

## Overview

Database service cho FutureBoxes app sử dụng **expo-sqlite** để lưu trữ capsules, images và settings trên local device.

## Initialization

Database phải được initialize **một lần** khi app khởi động:

```typescript
import { initializeDatabase } from './services/database';

// In App.tsx hoặc app entry point
useEffect(() => {
  initializeDatabase()
    .then(() => console.log('Database ready'))
    .catch((error) => console.error('Database init failed:', error));
}, []);
```

## Capsule Operations

### Create Capsule

```typescript
import { createCapsule } from './services/database';

const capsuleId = await createCapsule({
  type: 'emotion',
  title: 'My Emotion',
  content: 'Feeling happy today...',
  createdAt: Math.floor(Date.now() / 1000),
  unlockAt: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
  status: 'locked',
  reflectionQuestion: 'Did you overcome these emotions?',
  reflectionType: 'yes_no',
});
```

### Get Capsule

```typescript
import { getCapsule } from './services/database';

const capsule = await getCapsule(capsuleId);
if (capsule) {
  console.log(capsule.content);
}
```

### Get All Capsules

```typescript
import { getAllCapsules } from './services/database';

const allCapsules = await getAllCapsules();
```

### Get Capsules by Status (Home Screen)

```typescript
import { getCapsulesByStatus } from './services/database';

// Get up to 6 locked/ready capsules for Home Screen
const homeCapsules = await getCapsulesByStatus(['locked', 'ready'], 6);
```

### Get Opened Capsules (Archive Screen)

```typescript
import { getOpenedCapsules } from './services/database';

const archivedCapsules = await getOpenedCapsules();
```

### Update Capsule Status

```typescript
import { updateCapsuleStatus } from './services/database';

// Mark capsule as ready when unlock time is reached
await updateCapsuleStatus(capsuleId, 'ready');

// Mark capsule as opened when user opens it
await updateCapsuleStatus(capsuleId, 'opened');
```

### Update Reflection Answer

```typescript
import { updateCapsuleReflection } from './services/database';

// For yes/no reflection
await updateCapsuleReflection(capsuleId, 'yes');

// For rating reflection
await updateCapsuleReflection(capsuleId, 4);
```

### Check and Update Ready Capsules

Call này periodically (mỗi phút) để check xem có capsule nào đến thời gian mở chưa:

```typescript
import { checkAndUpdateReadyCapsules } from './services/database';

// Set interval to check every minute
setInterval(async () => {
  const updatedCount = await checkAndUpdateReadyCapsules();
  if (updatedCount > 0) {
    // Refresh UI
    console.log(`${updatedCount} capsules are now ready!`);
  }
}, 60000);
```

### Delete Capsule

**Chỉ có thể xóa capsules đã mở (status = 'opened'):**

```typescript
import { deleteCapsule } from './services/database';

try {
  await deleteCapsule(capsuleId);
  console.log('Capsule deleted');
} catch (error) {
  // Error: Can only delete opened capsules
  console.error(error);
}
```

## Image Operations

### Add Image to Capsule

```typescript
import { addCapsuleImage } from './services/database';

await addCapsuleImage({
  capsuleId: capsuleId,
  uri: 'file:///path/to/image.jpg',
  order: 0, // 0, 1, or 2 (max 3 images)
});
```

### Get Capsule Images

```typescript
import { getCapsuleImages } from './services/database';

const images = await getCapsuleImages(capsuleId);
// Returns array sorted by order: [image0, image1, image2]
```

### Delete All Images for a Capsule

```typescript
import { deleteCapsuleImages } from './services/database';

await deleteCapsuleImages(capsuleId);
```

## Settings Operations

### Set Setting

```typescript
import { setSetting } from './services/database';

await setSetting('onboardingCompleted', true);
await setSetting('notificationsEnabled', false);
await setSetting('lastNotificationCheck', Date.now());
```

### Get Setting

```typescript
import { getSetting } from './services/database';

const onboarding = await getSetting('onboardingCompleted');
// Returns: true, false, or null if not set
```

### Get All Settings

```typescript
import { getAllSettings } from './services/database';

const settings = await getAllSettings();
// Returns: { onboardingCompleted: true, notificationsEnabled: false, ... }
```

## Error Handling

All database operations throw errors nếu fails. Luôn wrap trong try-catch:

```typescript
try {
  const capsule = await getCapsule(capsuleId);
} catch (error) {
  console.error('Database operation failed:', error);
  // Show error to user
}
```

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Database not initialized` | Chưa gọi `initializeDatabase()` | Gọi init trước khi dùng |
| `Unlock time must be in the future` | unlockAt <= createdAt | Chọn thời gian tương lai |
| `Content must be between 1 and 2000 characters` | Content quá dài/ngắn | Validate trước khi save |
| `Can only delete opened capsules` | Trying to delete locked/ready capsule | Chỉ xóa capsules đã opened |

## Database Schema

### Tables

1. **capsule** - Stores capsule data
2. **capsule_image** - Stores image references (max 3 per capsule)
3. **app_settings** - Key-value store for app settings

### Indexes

- `idx_capsule_status` - Optimize status queries
- `idx_capsule_unlock_at` - Optimize unlock time queries
- `idx_capsule_opened_at` - Optimize archive queries

Xem chi tiết schema tại: `design/database/schema.md`

## Data Persistence

- ✅ Data persist sau app restart
- ✅ Data persist sau device restart
- ✅ Data persist sau app update (migration support)
- ❌ Data **KHÔNG** persist sau app uninstall
- ❌ Data **KHÔNG** persist sau clear app data

## Testing

Manual tests available trong `__tests__/database.test.ts`:

```typescript
import { runAllTests } from './services/__tests__/database.test';

// Run all tests
await runAllTests();
```

## Performance Notes

- Database uses indexes cho fast queries
- Image URIs are stored, không phải binary data
- Settings sử dụng JSON serialization
- Concurrent access handled bởi SQLite locking

## Future Enhancements

- [ ] Migration system cho schema updates
- [ ] Backup/export functionality
- [ ] Encryption cho sensitive data
- [ ] Transaction support cho complex operations
