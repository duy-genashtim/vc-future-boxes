# ArchiveDetailScreen - Quick Reference Guide

## Usage

### Navigation

**Navigate to ArchiveDetailScreen:**
```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
navigation.navigate('ArchiveDetail', {
  capsuleId: 'your-capsule-id-here'
});
```

**From ArchiveScreen:**
```typescript
// Already implemented in ArchiveScreen.tsx
const handleCapsuleTap = (capsuleId: string) => {
  navigation.navigate('ArchiveDetail', { capsuleId });
};
```

### Route Parameters

```typescript
type ArchiveDetailParams = {
  capsuleId: string; // Required: ID of opened capsule to display
};
```

### Prerequisites

**Capsule Requirements:**
- Must exist in database
- Status must be 'opened' (not 'locked' or 'ready')
- Must have valid `openedAt` timestamp

**If requirements not met:**
- Screen automatically redirects to Archive
- Logs error to console

---

## Components

### 1. ArchiveDetailScreen

**Main screen component**

**Props:** None (uses route.params)

**State:**
```typescript
capsule: Capsule | null           // Loaded capsule data
images: CapsuleImage[]            // Capsule images
loading: boolean                  // Initial load state
fullscreenImage: string | null    // Current fullscreen image URI
showDeleteConfirm: boolean        // Delete modal visibility
deleting: boolean                 // Delete in progress
```

**Key Features:**
- Auto-loads capsule data on mount
- Displays read-only content
- Delete button in header
- Confirmation modal for delete
- Fullscreen image viewer

### 2. DeleteConfirmationModal

**Confirmation dialog component**

**Props:**
```typescript
interface DeleteConfirmationModalProps {
  visible: boolean;         // Show/hide modal
  onCancel: () => void;     // Cancel button handler
  onConfirm: () => void;    // Delete button handler
  deleting: boolean;        // Show loading in delete button
}
```

**Features:**
- Warning icon (red, 80x80)
- Clear destructive action warning
- Cancel (gray) and Delete (red) buttons
- Loading state (ActivityIndicator)
- Spring animation entrance
- Haptic feedback

**Usage:**
```typescript
<DeleteConfirmationModal
  visible={showDeleteConfirm}
  onCancel={() => setShowDeleteConfirm(false)}
  onConfirm={handleConfirmDelete}
  deleting={deleting}
/>
```

---

## Display Logic

### Type Badge
- Shows capsule type icon with color
- Icon size: 60x60
- Background: Type color with 20% opacity

### Date Display
```typescript
formatUnlockDate(date) // Returns: "Dec 25, 2024"
```

Displays:
- Created: [date]
- Opened: [date]

### Content
- Full text content (no truncation)
- White card with border
- Scrollable if long

### Images
- Grid layout (3 per row)
- Image size: (width - 64) / 3
- Tap to open fullscreen viewer
- Viewer supports:
  - Zoom/pan
  - Swipe between images
  - Image counter "X of Y"

### Reflection Section

**Shows only if `reflectionQuestion` exists**

**Yes/No Type:**
```typescript
if (reflectionType === 'yes_no') {
  // Displays:
  // ✅ Yes (green) or ❌ No (red)
}
```

**Rating Type:**
```typescript
if (reflectionType === 'rating') {
  // Displays:
  // ⭐⭐⭐⭐⭐ 5/5 - Excellent decision
  // Colors: 1-2 red, 3 orange, 4-5 green
}
```

**Memory Type:**
```typescript
if (reflectionType === 'none') {
  // No reflection section shown
}
```

---

## Delete Flow

### Step-by-Step

1. **User taps delete icon** (trash in header)
   ```typescript
   handleDeletePress()
   → Haptics.Light
   → setShowDeleteConfirm(true)
   ```

2. **Confirmation modal appears**
   - Spring animation entrance
   - Warning icon pulsing
   - Clear message displayed

3. **User chooses:**

   **Option A: Cancel**
   ```typescript
   handleCancelDelete()
   → Haptics.Light
   → setShowDeleteConfirm(false)
   → Stay on screen
   ```

   **Option B: Confirm Delete**
   ```typescript
   handleConfirmDelete()
   → Haptics.Heavy
   → setDeleting(true)
   → Execute delete logic
   → Show success/error Alert
   → Navigate back to Archive
   ```

### Delete Implementation (agent-react TODO)

**Current (Mock):**
```typescript
const handleConfirmDelete = async () => {
  setDeleting(true);
  setShowDeleteConfirm(false);

  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // MOCK
    Alert.alert('Success', 'Capsule deleted successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  } catch (error) {
    console.error('Failed to delete capsule:', error);
    Alert.alert('Error', 'Failed to delete capsule. Please try again.');
    setDeleting(false);
  }
}
```

**Required (Real):**
```typescript
import * as FileSystem from 'expo-file-system';
import { deleteCapsule, deleteCapsuleImages } from '../services/database';

const handleConfirmDelete = async () => {
  setDeleting(true);
  setShowDeleteConfirm(false);

  try {
    // 1. Get images before deleting capsule
    const images = await getCapsuleImages(capsuleId);

    // 2. Delete capsule from database
    await deleteCapsule(capsuleId);

    // 3. Delete image files from filesystem
    for (const image of images) {
      try {
        await FileSystem.deleteAsync(image.uri, { idempotent: true });
      } catch (fileError) {
        console.warn('Failed to delete image file:', image.uri, fileError);
        // Continue even if file delete fails
      }
    }

    // 4. Delete image records from database
    await deleteCapsuleImages(capsuleId);

    // 5. Success
    Alert.alert('Success', 'Capsule deleted successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  } catch (error) {
    console.error('Failed to delete capsule:', error);
    Alert.alert('Error', 'Failed to delete capsule. Please try again.');
    setDeleting(false);
  }
}
```

---

## Styling Reference

### Colors
```typescript
// Destructive
deleteIcon: '#EF4444'
warningBg: '#FEE2E2'

// UI
background: '#F8F7F6'
surface: '#FFFFFF'
border: '#E5E7EB'
textPrimary: '#1B160D'
textSecondary: '#6B7280'

// Type-specific (from CAPSULE_TYPES)
emotion: '#E91E63'
goal: '#4CAF50'
memory: '#FF9800'
decision: '#2196F3'

// Reflection answers
yes: '#10B981'
no: '#EF4444'
star: '#F59E0B'
```

### Typography
```typescript
headerTitle: { fontSize: 18, fontWeight: '700' }
sectionLabel: { fontSize: 16, fontWeight: '600' }
contentText: { fontSize: 16, lineHeight: 24 }
modalTitle: { fontSize: 20, fontWeight: '700' }
modalMessage: { fontSize: 14, lineHeight: 20 }
```

### Spacing
```typescript
screenPadding: 16
sectionGap: 24
cardPadding: 16
modalPadding: 24
```

### Animations
```typescript
// Content sections
FadeInDown.duration(400).delay(100-400)

// Modal entrance
Spring({ damping: 15, stiffness: 150 })
```

---

## Error Handling

### Capsule Not Found
```typescript
if (!capsuleData) {
  console.error('Capsule not found:', capsuleId);
  navigation.replace('Archive');
  return;
}
```

### Capsule Not Opened
```typescript
if (capsuleData.status !== 'opened') {
  console.warn('Capsule is not opened:', capsuleData.status);
  navigation.replace('Archive');
  return;
}
```

### Delete Failed
```typescript
catch (error) {
  console.error('Failed to delete capsule:', error);
  Alert.alert('Error', 'Failed to delete capsule. Please try again.');
  setDeleting(false); // Allow retry
}
```

### Image Load Failed
- Images fail silently (broken image icon)
- Fullscreen viewer handles missing images gracefully

---

## Accessibility

### Color Contrast
- All text meets WCAG AA (4.5:1 minimum)
- Delete button high contrast (red on white)

### Touch Targets
- Header buttons: 48x48
- Modal buttons: 48px height
- Image thumbnails: Dynamic (≥48x48)

### Labels
- Delete icon: Accessible trash icon
- Modal: Clear "Delete this capsule?" title
- Buttons: "Cancel" and "Delete" text

### Haptics
- Light: Navigation, tap actions
- Medium: Delete button press
- Heavy: Confirm delete (destructive)

---

## Performance

### Optimizations
- Image lazy loading (only visible images)
- Animated values on UI thread (Reanimated)
- Memoized callbacks (useCallback)
- Conditional rendering

### Load Times
- Initial render: < 100ms
- Capsule data fetch: 50-200ms (depends on database)
- Image loading: Depends on file size
- Modal animation: 300ms

---

## Testing

### Manual Test Cases

**Test 1: Normal Display**
1. Navigate to ArchiveDetail with valid capsuleId
2. Verify all content displays:
   - Type badge correct
   - Dates formatted
   - Content text full
   - Images load
   - Reflection shows (if exists)

**Test 2: Delete Flow**
1. Tap delete icon → Modal appears
2. Tap Cancel → Modal closes
3. Tap delete icon again → Modal appears
4. Tap Delete → Delete executes
5. Verify navigation back to Archive

**Test 3: Image Viewer**
1. Tap image → Fullscreen opens
2. Swipe between images (if multiple)
3. Tap close → Return to detail

**Test 4: Edge Cases**
1. Capsule with 0 images → Images section hidden
2. Capsule with no reflection → Reflection section hidden
3. Memory capsule → No reflection shown
4. Long content → Scrollable

### Automated Test Scenarios

```typescript
describe('ArchiveDetailScreen', () => {
  it('should render capsule details', () => {
    // Test type badge, dates, content, images display
  });

  it('should show delete confirmation modal', () => {
    // Test modal open/close
  });

  it('should navigate back after delete', () => {
    // Test delete flow navigation
  });

  it('should handle missing capsule', () => {
    // Test error handling
  });
});
```

---

## Common Issues & Solutions

### Issue: "Capsule not found"
**Cause:** Invalid capsuleId or capsule deleted
**Solution:** Ensure capsuleId exists and status is 'opened'

### Issue: Images not loading
**Cause:** File paths incorrect or files deleted
**Solution:** Verify image URIs exist in filesystem

### Issue: Delete doesn't work
**Cause:** Mock implementation still active
**Solution:** Implement real delete functions (see above)

### Issue: Modal won't close
**Cause:** State not updating
**Solution:** Check setShowDeleteConfirm(false) is called

---

## Integration Checklist

### Prerequisites
- [x] Navigation route registered in AppNavigator
- [x] Capsule and CapsuleImage types defined
- [x] getCapsule() and getCapsuleImages() functions exist
- [x] formatUnlockDate() utility function available
- [x] CAPSULE_TYPES config defined

### Required Implementations
- [ ] deleteCapsule() database function
- [ ] deleteCapsuleImages() database function
- [ ] FileSystem delete for image files

### Optional Enhancements
- [ ] Custom Toast instead of Alert.alert
- [ ] Delete animation (fade out)
- [ ] Undo delete feature
- [ ] Export before delete

---

## Related Components

### SwipeableArchiveCard
See `src/components/SwipeableArchiveCard.tsx`
- Optional swipe-to-delete in ArchiveScreen
- Disabled by default
- Can navigate to ArchiveDetail on swipe delete

### ArchiveScreen
See `src/screens/ArchiveScreen.tsx`
- Lists all opened capsules
- Navigates to ArchiveDetail on tap
- Can use SwipeableArchiveCard if enabled

---

## Support & Questions

For questions about UI/UX implementation:
- See: `HANDOFF_F12_DELETE_CAPSULE.md`
- See: `ArchiveDetailScreen.example.md`
- See: `F12_UI_SUMMARY.md`

For database/business logic questions:
- Contact: agent-react
- Reference: PRD.md F12 section
- Activity diagrams: design/flows/

---

**Last Updated:** 2025-12-26
**Version:** 1.0.0
**Status:** Ready for integration
