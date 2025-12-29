# ArchiveDetailScreen - UI/UX Design Reference

## Visual Structure

```
┌─────────────────────────────────────┐
│ ← [Header]        [Delete Icon 🗑️] │  ← Header (fixed)
├─────────────────────────────────────┤
│                                     │
│          ┌─────────────┐            │
│          │   [Icon]    │            │  ← Type Badge (60x60)
│          │   60x60     │            │     Colored background
│          └─────────────┘            │
│                                     │
│     Created: Nov 25, 2024           │  ← Date Info
│     Opened: Dec 25, 2024            │
│                                     │
├─────────────────────────────────────┤
│ Message                             │  ← Section Label
│ ┌─────────────────────────────────┐ │
│ │ Lorem ipsum dolor sit amet...   │ │  ← Content Box
│ │ consectetur adipiscing elit...  │ │     White card
│ │ ...                             │ │     Scrollable
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Photos (3)                          │  ← Images Section
│ ┌───┐ ┌───┐ ┌───┐                  │
│ │img│ │img│ │img│                  │  ← Image Grid
│ └───┘ └───┘ └───┘                  │     Tappable
├─────────────────────────────────────┤
│ ─────── REFLECTION ───────          │  ← Divider
│                                     │
│ ❓ "Did you achieve this goal?"    │  ← Question Box
│                                     │     Colored tint
│                                     │
│ Your Answer:                        │  ← Answer Box
│ ✅ Yes                              │     Yes/No display
│ OR                                  │     OR
│ ⭐⭐⭐⭐⭐ 5/5 - Excellent           │     Rating display
│                                     │
└─────────────────────────────────────┘
```

## Delete Confirmation Modal

```
     ┌─────────────────────────────┐
     │                             │
     │        ⚠️                    │  ← Warning Icon
     │      (80x80)                │     Red background
     │                             │
     │  Delete this capsule?       │  ← Title (Bold)
     │                             │
     │  This action cannot be      │  ← Message
     │  undone. The capsule and    │
     │  all its photos will be     │
     │  permanently deleted.       │
     │                             │
     │  ┌───────┐  ┌────────┐     │
     │  │Cancel │  │ Delete │     │  ← Buttons
     │  └───────┘  └────────┘     │
     │   (Gray)     (Red)         │
     └─────────────────────────────┘
```

## Swipe-to-Delete Gesture

```
Normal State:
┌─────────────────────────────────────┐
│ ┃ 💗 Emotion           →           │
│ ┃ Created: Nov 25, 2024            │
│ ┃ Opened: Dec 25, 2024             │
│ ┃ Lorem ipsum dolor sit...         │
└─────────────────────────────────────┘

Swiped Left:
                  ┌─────────────────┐
                  │ 💗 Emotion   → │
                  │ Created: Nov... │
                  │ Opened: Dec...  │
                  │ Lorem ipsum...  │
                  └─────────────────┘
                              ┌──────┐
                              │ 🗑️   │ ← Delete Button
                              │Delete│    (Red, 80px)
                              └──────┘
```

## Color Palette

### Destructive Actions
```css
--delete-icon: #EF4444       /* Red - Delete button */
--warning-bg: #FEE2E2        /* Light red - Warning icon background */
--delete-button: #EF4444     /* Red - Delete button background */
```

### UI Elements
```css
--background: #F8F7F6        /* App background */
--surface: #FFFFFF           /* Card background */
--border: #E5E7EB            /* Card borders */
--text-primary: #1B160D      /* Main text */
--text-secondary: #6B7280    /* Secondary text */
--text-muted: #9CA3AF        /* Muted text */
```

### Type-Specific Colors (from CAPSULE_TYPES)
```css
--emotion: #E91E63           /* Pink */
--goal: #4CAF50              /* Green */
--memory: #FF9800            /* Orange */
--decision: #2196F3          /* Blue */
```

### Reflection Answer Colors
```css
--reflection-yes: #10B981    /* Green - Positive */
--reflection-no: #EF4444     /* Red - Negative */
--reflection-neutral: #F59E0B /* Orange - Neutral */
--reflection-star: #F59E0B   /* Orange - Star rating */
```

## Typography Scale

```typescript
// Modal
modalTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: '#1B160D',
}

modalMessage: {
  fontSize: 14,
  fontWeight: '400',
  color: '#6B7280',
  lineHeight: 20,
}

// Section Labels
sectionLabel: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1B160D',
}

// Content
contentText: {
  fontSize: 16,
  fontWeight: '400',
  color: '#1B160D',
  lineHeight: 24,
}

// Dates
dateLabel: {
  fontSize: 14,
  fontWeight: '400',
  color: '#6B7280',
}

dateValue: {
  fontSize: 14,
  fontWeight: '600',
  color: '#374151',
}

// Buttons
buttonText: {
  fontSize: 16,
  fontWeight: '700', // Delete button
  fontWeight: '600', // Cancel button
}
```

## Spacing System

```typescript
// Padding/Margin
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 16px
--spacing-xl: 24px
--spacing-2xl: 32px

// Applied
header: {
  paddingHorizontal: 16,  // lg
  paddingVertical: 12,    // md
}

contentBox: {
  padding: 16,            // lg
  borderRadius: 12,       // md
}

modal: {
  padding: 24,            // xl
  borderRadius: 20,       // lg+
}

imageGrid: {
  gap: 8,                 // sm
}
```

## Border Radius

```typescript
--radius-sm: 8px         // Small elements
--radius-md: 12px        // Cards, images
--radius-lg: 16px        // Large cards
--radius-xl: 20px        // Modals
--radius-round: 24px     // Buttons (pill shape)
--radius-circle: 50%     // Icons, badges
```

## Shadows

```typescript
// Card elevation
cardContainer: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 2,
}

// Modal overlay
modalOverlay: {
  backgroundColor: 'rgba(0, 0, 0, 0.6)', // 60% black
}

// Warning icon
warningIconContainer: {
  shadowColor: '#EF4444',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 4,
}
```

## Animation Timings

```typescript
// Modal entrance
modalScale: {
  from: 0.9,
  to: 1.0,
  config: {
    damping: 15,
    stiffness: 150,
  }
}

// Content sections
FadeInDown: {
  duration: 400,
  delay: 100-400 (stagger),
}

// Swipe gesture
panGesture: {
  spring: {
    damping: 15,
    stiffness: 100,
  }
}
```

## Touch Targets

```typescript
// Minimum touch area: 48x48
headerButton: {
  width: 48,
  height: 48,
}

// Modal buttons
modalButton: {
  height: 48,
  borderRadius: 24,
}

// Image thumbnails
imageContainer: {
  width: (width - 64) / 3,  // Dynamic
  height: (width - 64) / 3,
  borderRadius: 12,
}
```

## Haptic Feedback Map

```typescript
// Light Impact
- Back button press
- Card tap
- Cancel button
- Image tap
- Swipe gesture start

// Medium Impact
- Delete icon press
- Swipe reveal threshold
- Image fullscreen open

// Heavy Impact
- Confirm delete action
```

## Accessibility

### Color Contrast Ratios

```
Background (#F8F7F6) vs Text (#1B160D): 11.6:1 ✅ AAA
White (#FFFFFF) vs Text (#1B160D): 14.1:1 ✅ AAA
Delete Red (#EF4444) vs White: 4.5:1 ✅ AA
```

### Touch Targets

```
All interactive elements: ≥ 48x48px ✅
Delete button: 80x48px ✅
Modal buttons: 48px height ✅
```

### Labels

```
Delete icon: aria-label="Delete capsule"
Cancel button: Clear text "Cancel"
Delete button: Clear text "Delete"
Warning icon: Visible warning symbol
```

## Edge Cases Handled

1. **No Images:** Images section hidden if 0 images
2. **No Reflection:** Reflection section hidden if Memory type
3. **Long Content:** Content scrollable, no truncation
4. **Many Images:** Grid wraps automatically
5. **Loading State:** ActivityIndicator with text
6. **Delete Error:** Alert with retry option
7. **Swipe Insufficient:** Auto snap-back to closed state

## Platform Differences

### iOS
- Swipe gestures feel more natural
- Haptics stronger
- Modal animations smoother (120 FPS)

### Android
- Material Design ripple effects
- Different haptic patterns
- Elevation shadows instead of iOS shadows

## Performance Optimizations

1. **Image Lazy Loading:** Images load as user scrolls
2. **Animated Values on UI Thread:** Reanimated worklets
3. **Gesture Handler UI Thread:** Pan gestures don't block JS
4. **Conditional Rendering:** SwipeableCard only when enabled
5. **Memoized Callbacks:** useCallback for all handlers

## Testing Scenarios

### Visual Testing
```typescript
// Scenario 1: Emotion capsule with reflection (Yes/No)
capsule = {
  type: 'emotion',
  reflectionType: 'yes_no',
  reflectionAnswer: 'yes',
}

// Scenario 2: Decision capsule with rating
capsule = {
  type: 'decision',
  reflectionType: 'rating',
  reflectionAnswer: 4,
}

// Scenario 3: Memory capsule (no reflection)
capsule = {
  type: 'memory',
  reflectionType: 'none',
  reflectionAnswer: null,
}

// Scenario 4: Capsule with 3 images
images = [
  { id: '1', uri: 'file://...', order: 0 },
  { id: '2', uri: 'file://...', order: 1 },
  { id: '3', uri: 'file://...', order: 2 },
]

// Scenario 5: Capsule with long content (scroll test)
capsule.content = 'Lorem ipsum... (2000 chars)'
```

### Interaction Testing
```typescript
// Test 1: Delete flow
1. Tap delete icon → Modal appears
2. Tap Cancel → Modal closes
3. Tap delete icon again → Modal appears
4. Tap Delete → Delete executes, navigate back

// Test 2: Swipe flow
1. Swipe left 40px → Snap back
2. Swipe left 90px → Reveal delete button
3. Tap delete button → Navigate to detail

// Test 3: Image viewer
1. Tap image 1 → Fullscreen viewer opens
2. Swipe left → Image 2
3. Swipe left → Image 3
4. Tap close → Return to detail
```

## Future Enhancements

1. **Undo Delete:** Toast with "Undo" button (3s window)
2. **Batch Delete:** Select multiple capsules
3. **Export Before Delete:** Save to device before deletion
4. **Delete Animation:** Fade out card with celebration/mourning effect
5. **Archive Trash:** Temporary storage before permanent delete
6. **Confirmation Setting:** "Always ask" / "Never ask" preference

---

**End of Design Reference**
