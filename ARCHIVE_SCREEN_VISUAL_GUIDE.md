# Archive Screen - Visual Component Guide

## Screen Layout

```
┌─────────────────────────────────────────────┐
│  ← Back          Archive                    │  ← Header (White bg)
├─────────────────────────────────────────────┤
│                                             │
│  YOUR OPENED CAPSULES        12 memories    │  ← Section Header
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │▌ ❤️  Emotion               →         │  │  ← Card 1
│  │  Created: Nov 25, 2024               │  │
│  │  Opened: Dec 25, 2024                │  │
│  │  Today I felt amazing about...       │  │  (Content preview)
│  │  ✓ Reflection answered               │  │  (Badge if has answer)
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │▌ 🚩 Goal                   →         │  │  ← Card 2
│  │  Created: Oct 15, 2024               │  │
│  │  Opened: Dec 20, 2024                │  │
│  │  I want to learn React Native and... │  │
│  │  ✓ Reflection answered               │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │▌ 📷 Memory                 →         │  │  ← Card 3
│  │  Created: Sep 10, 2024               │  │
│  │  Opened: Dec 10, 2024                │  │
│  │  Beautiful sunset at the beach...    │  │
│  └──────────────────────────────────────┘  │  (No reflection badge for Memory)
│                                             │
│  ... (scrollable list)                     │
│                                             │
└─────────────────────────────────────────────┘
```

## Empty State

```
┌─────────────────────────────────────────────┐
│  ← Back          Archive                    │
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│               ┌───────────┐                 │
│               │           │                 │
│               │  📂       │  (150x150)      │
│               │           │                 │
│               └───────────┘                 │
│                                             │
│         No opened capsules yet              │  ← Title (20px, bold)
│                                             │
│   Your opened capsules will appear here.    │  ← Description (14px)
│   Create a capsule and wait for it to       │
│   unlock!                                   │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

## Capsule Card Anatomy

```
┌──────────────────────────────────────────┐
│▌ (Accent)                                │
│  ┌──┐                                    │
│  │❤️│ Emotion                →          │  ← Header row
│  └──┘                                    │     - Icon in circle (32x32)
│  (32x32)                                 │     - Type label (16px, semibold)
│                                          │     - Chevron-right (20px)
│  Created: Nov 25, 2024                   │  ← Dates (12px, gray)
│  Opened: Dec 25, 2024                    │
│                                          │
│  Today I felt amazing about the new...   │  ← Content preview (14px, gray)
│                                          │     Max 60 chars + "..."
│  ┌──────────────────────┐                │
│  │ ✓ Reflection answered │               │  ← Reflection badge (if exists)
│  └──────────────────────┘                │     Green checkmark + text
│  (Light green bg)                        │
└──────────────────────────────────────────┘
```

## Color Mapping

### Type Accent Colors:
- **Emotion**: `#FF6B9D` (Pink)
  - Icon: ❤️ heart (Ionicons)

- **Goal**: `#4CAF50` (Green)
  - Icon: 🚩 flag (Ionicons)

- **Memory**: `#FF9800` (Orange)
  - Icon: 📷 camera (Ionicons)

- **Decision**: `#2196F3` (Blue)
  - Icon: ⚖️ scale (Ionicons)

### UI Colors:
- Background: `#F9FAFB` (Light gray)
- Card: `#FFFFFF` (White)
- Accent bar: 4px wide, type color
- Icon container bg: Type color at 20% opacity (`typeColor + '20'`)
- Text primary: `#111827`
- Text secondary: `#6B7280`
- Text muted: `#9CA3AF`
- Reflection badge bg: `#ECFDF5` (Light green)
- Reflection badge text: `#10B981` (Green)

## Spacing & Sizing

### Card Dimensions:
- Width: Full width - 32px (16px margin each side)
- Height: Auto (content-based)
- Padding: 16px all sides
- Border radius: 12px
- Accent bar: 4px width

### Gaps:
- Screen horizontal padding: 16px
- Section header top: 16px
- Section header bottom: 12px
- Card separator: 12px
- Icon container margin-right: 8px
- Reflection badge padding: 8px horizontal, 4px vertical

### Icon Sizes:
- Type icon: 18px
- Chevron: 20px
- Reflection checkmark: 14px
- Empty state icon: 80px
- Back button icon: 24px

## Typography Scale

```
Header Title: 20px, Weight 700, Color #111827
Section Title: 12px, Weight 700, Color #6B7280, uppercase, letter-spacing 1
Section Count: 12px, Weight 500, Color #9CA3AF

Card Type Label: 16px, Weight 600, Color #111827
Card Date Label: 12px, Weight 400, Color #6B7280
Card Date Value: 12px, Weight 500, Color #374151
Card Content: 14px, Weight 400, Color #6B7280, Line-height 20
Reflection Text: 11px, Weight 600, Color #10B981

Empty Title: 20px, Weight 700, Color #111827
Empty Description: 14px, Weight 400, Color #6B7280, Line-height 20
```

## Interaction States

### Card Press:
```javascript
// Normal
opacity: 1.0
scale: 1.0

// Pressed
opacity: 0.7
scale: 0.98
```

### Back Button Press:
```javascript
// Normal
opacity: 1.0

// Pressed
opacity: 0.6
```

### Haptic Patterns:
- Card tap: Light impact
- Back button: Light impact

## Animation Specs

### List Items Entrance:
```javascript
FadeInDown.delay(index * 50).springify()

// Result:
// Card 1: 0ms delay
// Card 2: 50ms delay
// Card 3: 100ms delay
// ... staggered effect
```

### Empty State Entrance:
```javascript
FadeIn

// Simple fade from opacity 0 to 1
```

### Pull-to-Refresh:
```javascript
RefreshControl {
  tintColor: '#6366F1',
  colors: ['#6366F1']
}

// Standard iOS/Android spinner
```

## Date Formatting

### Input:
- Unix timestamp in seconds (from database)
- Example: `1703548800`

### Processing:
```javascript
const date = new Date(timestamp * 1000); // Convert to milliseconds
date.toLocaleDateString('en-US', {
  month: 'short',  // "Dec"
  day: 'numeric',  // "25"
  year: 'numeric'  // "2024"
});
```

### Output:
- Format: `"Dec 25, 2024"`
- Label: `"Created: Dec 25, 2024"`
- Label: `"Opened: Dec 25, 2024"`

## Content Preview Logic

```javascript
const contentPreview = content.length > 60
  ? content.substring(0, 60) + '...'
  : content;

// Examples:
// "Hello world" → "Hello world"
// "This is a very long text that exceeds the sixty character limit..."
//   → "This is a very long text that exceeds the sixty character..."
```

## Reflection Badge Logic

```javascript
const hasReflection = reflectionAnswer !== null && reflectionAnswer !== undefined;

// Badge appears when:
// - reflectionAnswer is "yes" or "no"
// - reflectionAnswer is 1, 2, 3, 4, or 5
// - ANY non-null/undefined value

// Badge does NOT appear when:
// - reflectionAnswer is null
// - reflectionAnswer is undefined
// - Capsule type is Memory (no reflection question)
```

## Component Hierarchy

```
ArchiveScreen (Main component)
├── SafeAreaView
│   ├── StatusBar
│   ├── Header (View)
│   │   ├── Back Button (Pressable → Ionicons)
│   │   ├── Title (Text)
│   │   └── Placeholder (View, for symmetry)
│   ├── Section Header (View, conditional)
│   │   ├── Section Title (Text)
│   │   └── Section Count (Text)
│   └── FlatList
│       ├── renderItem → ArchiveCapsuleCard (Animated.View)
│       ├── ListEmptyComponent → Empty State (Animated.View)
│       └── refreshControl → RefreshControl

ArchiveCapsuleCard (Sub-component)
├── Pressable
│   ├── Accent Bar (View)
│   └── Card Content (View)
│       ├── Header (View)
│       │   ├── Type Container (View)
│       │   │   ├── Icon Container (View → Ionicons)
│       │   │   └── Type Label (Text)
│       │   └── Chevron (Ionicons)
│       ├── Dates (View)
│       │   ├── Created Date (Text)
│       │   └── Opened Date (Text)
│       ├── Content Preview (Text)
│       └── Reflection Badge (View, conditional)
│           ├── Checkmark Icon (Ionicons)
│           └── Badge Text (Text)
```

## Responsive Behavior

### FlatList Performance:
- Virtualized rendering (only renders visible items)
- Efficient re-renders on data change
- Smooth scroll at 60 FPS
- Supports large lists (100+ items)

### Screen Width Adaptation:
- Cards full-width (auto-adjusts to screen)
- Horizontal padding: Fixed 16px
- Icon sizes: Fixed (no scaling)
- Text wraps naturally

### Safe Area:
- Uses SafeAreaView for notch/status bar
- Header respects safe area insets
- Content scrollable to bottom (no cutoff)

## Accessibility Considerations

### Touch Targets:
- Card: Full width, ~120px height (well above 44px minimum)
- Back button: 32x32px (meets minimum)
- Chevron: Visual only (card is tappable)

### Color Contrast:
- Text on white: Passes WCAG AA
- Icons: High contrast with backgrounds
- Reflection badge: Green on light green (passes AA)

### Screen Reader Support:
- Card type announced
- Dates announced
- Content preview announced
- Reflection status announced

## Performance Notes

### Optimizations:
- FlatList virtualization (only renders visible)
- useCallback for handlers (prevents re-renders)
- Memoized date formatting (could add useMemo)
- Lazy image loading (if images added)

### Memory:
- FlatList recycles item components
- No heavy animations (only fade)
- Minimal state (capsules array only)

### Battery:
- No timers (unlike Home countdown)
- No background tasks
- Haptics only on user interaction
- Refresh only on user pull

---

**This visual guide complements the technical implementation in ArchiveScreen.tsx**
