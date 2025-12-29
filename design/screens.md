# Screen Descriptions
# FutureBoxes - Time Capsule App

**Version:** 1.0
**Last Updated:** 2025-12-25
**Purpose:** Comprehensive UI/UX specifications for all app screens

---

## Table of Contents

1. [Onboarding Flow](#1-onboarding-flow)
2. [Home Screen](#2-home-screen)
3. [Create Capsule Flow](#3-create-capsule-flow)
4. [Open Capsule Flow](#4-open-capsule-flow)
5. [Archive Flow](#5-archive-flow)
6. [Empty States](#6-empty-states)

---

## 1. Onboarding Flow

### 1.1 Onboarding Screen (Slides 1-4)

#### Mục đích
Giới thiệu concept và features của app cho người dùng lần đầu. Giúp user hiểu cách sử dụng app ngay từ đầu.

#### Các thành phần chính

**1. Slide Container**
   - Mô tả: Full-screen carousel/swiper chứa 4 slides
   - Tương tác: Swipe left/right để chuyển slides, hoặc tap Next/Skip
   - Hiệu ứng: Slide transition 300ms ease-in-out khi chuyển

**2. Slide 1 - Welcome**
   - Mô tả:
     - Illustration: Time capsule box với sparkles (floating animation)
     - Title: "Welcome to FutureBoxes" (Heading 1, centered)
     - Description: "Send messages to your future self and rediscover them when the time is right." (Body 1, centered)
   - Tương tác: Swipe left, tap Next, hoặc Skip
   - Hiệu ứng: Capsule floating gently (subtle up-down motion)

**3. Slide 2 - Capsule Types**
   - Mô tả:
     - Illustration: 4 capsule type icons in grid layout
       - Heart icon (Pink) - Emotion
       - Target icon (Green) - Goal
       - Camera icon (Orange) - Memory
       - Scale icon (Blue) - Decision
     - Title: "Four Ways to Reflect"
     - Description: 4 bullet points explaining each type
   - Tương tác: Swipe navigation, tap Next/Skip
   - Hiệu ứng: Icons appear sequentially (stagger animation, 100ms delay each)

**4. Slide 3 - Lock & Unlock**
   - Mô tả:
     - Illustration: Lock icon with countdown timer
     - Title: "Lock It Away"
     - Description: "Your capsule stays sealed until the date you choose. No peeking! We'll notify you when it's ready."
   - Tương tác: Swipe navigation, tap Next/Skip
   - Hiệu ứng: Lock closing animation, then opening (loop)

**5. Slide 4 - Get Started**
   - Mô tả:
     - Illustration: Open capsule with light rays (celebration theme)
     - Title: "Ready to Begin?"
     - Description: "Create your first time capsule and start your journey of self-reflection."
     - CTA button: "Get Started" (Primary button, full width)
   - Tương tác: Tap "Get Started" để complete onboarding
   - Hiệu ứng: Confetti or sparkles (gentle, looping)

**6. Pagination Dots**
   - Mô tả: 4 dots indicating current slide position
   - Tương tác: Visual indicator only (not tappable)
   - Hiệu ứng: Active dot color transition, smooth scale

**7. Skip Button**
   - Mô tả: Text button "Skip" ở top-right (Slides 1-3)
   - Tương tác: Tap để skip onboarding và đến Home
   - Hiệu ứng: Press state scale down to 0.95

**8. Next Button**
   - Mô tả: Contained button "Next ->" ở bottom-right (Slides 1-3)
   - Tương tác: Tap để chuyển slide tiếp theo
   - Hiệu ứng: Press state, slide transition

#### Navigation
- Đến screen này từ: App Launch (first time only)
- Từ screen này đến: Home Screen

#### Ghi chú
- Onboarding chỉ hiển thị một lần (khi onboardingCompleted = false)
- User có thể skip bất kỳ lúc nào
- Animations nên reduce khi device có "Reduce Motion" enabled
- Haptic feedback: Light impact khi swipe slide

---

## 2. Home Screen

### 2.1 Home Screen (Main)

#### Mục đích
Màn hình chính hiển thị 6 capsules sắp mở gần nhất. User có thể xem countdown, tap để mở capsule ready, và tạo capsule mới.

#### Các thành phần chính

**1. Header Bar**
   - Mô tả:
     - Left: App logo/title "FutureBoxes" (Heading 2)
     - Right: Archive icon button (Ionicons: archive-outline)
   - Tương tác: Tap Archive icon -> navigate to Archive Screen
   - Hiệu ứng: Icon press state scale 0.9

**2. Capsule Grid (3x2 layout)**
   - Mô tả: ScrollView chứa tối đa 6 capsule cards, layout 3 rows x 2 columns
   - Tương tác: Tap individual capsule card
   - Hiệu ứng: Grid fade in on mount (stagger children 50ms)

**3. Capsule Card (Locked State)**
   - Mô tả:
     - Background: White card với subtle shadow
     - Border radius: 16px
     - Padding: 16px
     - Content:
       - Type icon ở top (size 40x40, type-specific color)
       - Countdown timer ở center (e.g., "3d 5h 30m")
         - Format: Xd Yh Zm (khi > 1 day)
         - Format: Xh Ym Zs (khi < 1 day, updates every second)
       - Lock icon ở bottom (Ionicons: lock-closed, size 24, muted color)
   - Tương tác: Tap -> Show toast "This capsule will unlock in X days"
   - Hiệu ứng:
     - Press state: Scale down to 0.98
     - Toast appear/disappear: Fade + slide from top
     - Countdown text update: Cross-fade old/new value

**4. Capsule Card (Ready State)**
   - Mô tả:
     - Background: White card với glow effect
     - Border: Gradient border (type-specific colors)
     - Content:
       - Type icon ở top (animated pulse)
       - "Ready to Open!" badge ở center (bold, type color)
       - Unlock icon ở bottom (Ionicons: lock-open, với glow)
   - Tương tác: Tap -> Navigate to Open Capsule Screen
   - Hiệu ứng:
     - Idle: Gentle pulse animation (scale 1.0 -> 1.02 -> 1.0, 2s loop)
     - Press: Scale down to 0.96, haptic medium impact
     - Transition to Open: Card expand and fade out

**5. Empty Slots**
   - Mô tả: Nếu < 6 capsules, fill grid với empty/placeholder cards
   - Tương tác: None (visual only)
   - Hiệu ứng: Subtle dashed border, muted background

**6. FAB (Floating Action Button)**
   - Mô tả:
     - Position: Bottom-right, 16px margin
     - Size: 56x56px circle
     - Color: Primary gradient
     - Icon: Plus (+) white, size 24
     - Elevation: High shadow
   - Tương tác: Tap -> Navigate to Type Selection Screen
   - Hiệu ứng:
     - Idle: Subtle shadow pulse
     - Press: Scale to 0.9, rotate 90deg, haptic medium impact
     - After create: Scale bounce from 0.8 to 1.0

**7. Timer Refresh Logic**
   - Mô tả: Background interval mỗi 60s (hoặc 1s nếu có capsule < 24h)
   - Tương tác: Auto-update countdown displays
   - Hiệu ứng: Countdown text cross-fade khi update

#### Navigation
- Đến screen này từ: Onboarding, App Launch, Create Complete, Open Complete
- Từ screen này đến: Archive Screen, Type Selection Screen, Open Capsule Screen

#### Ghi chú
- Capsules sort theo unlockAt ascending (soonest first)
- Grid không scroll nếu exactly 6 capsules
- Pull-to-refresh để manually check status updates
- Khi capsule status changes từ locked -> ready, animate card transformation
- Empty state hiển thị khi 0 capsules (see Empty States section)
- Haptic feedback: Light khi tap locked capsule, Medium khi tap ready capsule

---

## 3. Create Capsule Flow

### 3.1 Type Selection Screen

#### Mục đích
Cho phép user chọn 1 trong 4 loại capsule trước khi tạo nội dung.

#### Các thành phần chính

**1. Header Bar**
   - Mô tả:
     - Left: Back button (Ionicons: arrow-back)
     - Center: "Choose Type" (Heading 2)
   - Tương tác: Back -> Navigate to Home (with confirmation if selection made)
   - Hiệu ứng: Header slide down on mount

**2. Instruction Text**
   - Mô tả: "What would you like to create?" (Heading 3, centered)
   - Tương tác: None (informational)
   - Hiệu ứng: Fade in 100ms after header

**3. Type Cards (4 cards, vertical list)**

**Card 1: Emotion**
   - Mô tả:
     - Icon: Heart (MaterialIcons: favorite), Pink/Purple gradient
     - Title: "Emotion" (Heading 3, bold)
     - Description: "Record your feelings and thoughts for future reflection" (Body 2)
     - Border: 2px solid when unselected, 4px when selected
     - Background: White -> Light pink tint when selected
     - Checkmark: Appears in top-right when selected (Ionicons: checkmark-circle)
   - Tương tác: Tap to select/deselect
   - Hiệu ứng:
     - Select: Border color fade, background tint fade, checkmark scale from 0
     - Deselect: Reverse animation
     - Press: Scale to 0.98

**Card 2: Goal**
   - Mô tả:
     - Icon: Target (MaterialIcons: flag), Green/Blue gradient
     - Title: "Goal"
     - Description: "Set a goal and check back to see if you achieved it"
     - Same states as Emotion card
   - Tương tác: Tap to select/deselect
   - Hiệu ứng: Same as Emotion

**Card 3: Memory**
   - Mô tả:
     - Icon: Photo (MaterialIcons: photo-camera), Orange/Yellow gradient
     - Title: "Memory"
     - Description: "Preserve a special moment to revisit in the future"
     - Same states as Emotion card
   - Tương tác: Tap to select/deselect
   - Hiệu ứng: Same as Emotion

**Card 4: Decision**
   - Mô tả:
     - Icon: Scale (MaterialIcons: balance), Blue/Gray gradient
     - Title: "Decision"
     - Description: "Document an important decision and rate it later"
     - Same states as Emotion card
   - Tương tác: Tap to select/deselect
   - Hiệu ứng: Same as Emotion

**4. Continue Button**
   - Mô tả:
     - Full-width button at bottom
     - Text: "Continue" (white, bold)
     - Disabled state: Gray, opacity 0.5
     - Enabled state: Primary gradient, opacity 1.0
   - Tương tác: Tap (when enabled) -> Navigate to Create Capsule Screen
   - Hiệu ứng:
     - Enable transition: Opacity 0.5 -> 1.0, 150ms
     - Press: Scale to 0.98, haptic light impact

#### Navigation
- Đến screen này từ: Home Screen (FAB tap)
- Từ screen này đến: Create Capsule Screen (with selected type)

#### Ghi chú
- Only one type can be selected at a time
- Tapping selected card deselects it
- Continue button disabled until selection made
- Cards appear với stagger animation (100ms delay each)
- Haptic feedback: Light impact on select, medium on Continue

---

### 3.2 Create Capsule Screen

#### Mục đích
Nhập nội dung capsule: text, ảnh, reflection question (nếu có), và thời gian mở.

#### Các thành phần chính

**1. Header Bar**
   - Mô tả:
     - Left: Back button (with unsaved changes warning)
     - Center: "Create [Type]" (e.g., "Create Emotion")
   - Tương tác: Back -> Confirmation dialog if has input
   - Hiệu ứng: Header slide down

**2. ScrollView Container**
   - Mô tả: Scrollable container chứa all form fields
   - Tương tác: Scroll to reveal all fields
   - Hiệu ứng: Smooth scroll, keyboard avoidance

**3. Text Input Section**
   - Mô tả:
     - Label: "Write your message" (Heading 3)
     - Input: Multi-line TextInput, min-height 120px
     - Placeholder: "What do you want to tell your future self?"
     - Border: 1px solid gray, focus -> primary color
     - Character counter: "0/2000 characters" (Body 2, muted)
   - Tương tác:
     - Focus -> Keyboard appears, scroll to input
     - Type -> Character count updates
     - Paste > 2000 chars -> Truncate, show warning toast
   - Hiệu ứng:
     - Focus: Border color fade, slight scale 1.0 -> 1.01
     - Character count: Color changes to warning at 1900+ chars
     - Warning toast: Slide from top

**4. Image Picker Section**
   - Mô tả:
     - Label: "Add Photos (optional)" (Heading 3)
     - Horizontal ScrollView containing:
       - Selected images (thumbnails 80x80, border-radius 8px)
       - "X" remove button on each thumbnail (top-right overlay)
       - Add button (+) when < 3 images (dashed border)
     - Max 3 images indicator: "X/3 photos"
   - Tương tác:
     - Tap Add (+) -> Open image picker (expo-image-picker)
     - Tap thumbnail -> Zoom preview modal
     - Tap X -> Remove image with confirmation
     - Tap when 3 images -> Show toast "Maximum 3 images"
   - Hiệu ứng:
     - Image appear: Scale from 0.8 to 1.0, fade in
     - Image remove: Scale to 0, fade out
     - Add button press: Scale to 0.9

**5. Reflection Question Section** (Hidden for Memory type)
   - Mô tả:
     - Label: "Reflection Question" (Heading 3)
     - Input: Single-line TextInput
     - Placeholder:
       - Emotion: "How do you feel about this now?"
       - Goal: "Did you achieve this goal?"
       - Decision: "Was this the right choice?"
   - Tương tác: Focus -> Keyboard, type text
   - Hiệu ứng: Focus border color fade

**6. Date/Time Picker Section**
   - Mô tả:
     - Label: "Open this capsule on" (Heading 3)
     - Button: Calendar icon + selected date display
       - Default: "Select date..." (muted)
       - Selected: "December 25, 2025 at 9:00 AM"
   - Tương tác: Tap -> Open Date Picker Modal
   - Hiệu ứng: Press scale to 0.98

**7. Date Picker Modal** (Opens from step 6)
   - Mô tả:
     - Modal overlay (semi-transparent background)
     - Modal content:
       - Header: "When to open?"
       - Quick presets (chips):
         - "1 Week"
         - "1 Month"
         - "3 Months"
         - "6 Months"
         - "1 Year"
       - Divider
       - "Custom Date" button
       - Calendar picker (when custom selected)
       - Time picker (after date selected)
       - Confirm/Cancel buttons
   - Tương tác:
     - Tap preset -> Auto-calculate date, close modal
     - Tap Custom -> Show calendar picker
     - Select date -> Show time picker
     - Confirm -> Save date, close modal
     - Tap background -> Close modal (cancel)
   - Hiệu ứng:
     - Modal appear: Slide up from bottom, background fade to semi-transparent
     - Preset tap: Ripple effect, check icon appears
     - Calendar: Native picker animations
     - Confirm: Modal slide down, background fade out

**8. Preview Button**
   - Mô tả:
     - Full-width button at bottom
     - Text: "Preview"
     - Disabled when required fields empty
   - Tương tác: Tap -> Navigate to Preview Screen
   - Hiệu ứng: Press scale, haptic medium impact

#### Validation
- Text content: Required, 1-2000 chars
- Images: Optional, max 3
- Reflection: Required for Emotion/Goal/Decision, auto-skip for Memory
- Date: Required, must be future date/time

#### Navigation
- Đến screen này từ: Type Selection Screen
- Từ screen này đến: Preview & Lock Screen, Type Selection (back)

#### Ghi chú
- Form state persists khi back to edit
- Keyboard dismisses khi tap outside inputs
- Auto-scroll to focused input
- Image compression before saving (max 1024px width)
- Haptic feedback: Light on image add/remove, medium on Preview

---

### 3.3 Preview & Lock Screen

#### Mục đích
Hiển thị preview toàn bộ nội dung capsule trước khi lock. User có thể edit hoặc confirm lock.

#### Các thành phần chính

**1. Header Bar**
   - Mô tả:
     - Left: "Edit" text button
     - Center: "Preview" (Heading 2)
   - Tương tác: Edit -> Back to Create Screen (preserve data)
   - Hiệu ứng: Header slide down

**2. Capsule Type Badge**
   - Mô tả:
     - Type icon (large, 60x60) centered at top
     - Type name below icon (e.g., "Emotion Capsule")
     - Type-specific gradient background
   - Tương tác: None (visual only)
   - Hiệu ứng: Icon scale in from 0.8, fade in

**3. Content Preview Card**
   - Mô tả:
     - White card với padding 16px
     - Scrollable if content long
     - Contains:
       - Full text content (Body 1)
       - Line height 1.6 for readability
   - Tương tác: Scroll to read all content
   - Hiệu ứng: Card slide up from bottom

**4. Image Gallery** (if images exist)
   - Mô tả:
     - Horizontal scrolling gallery
     - Image thumbnails (120x120)
     - Border radius 8px
     - Spacing 8px between images
   - Tương tác: Tap image -> Fullscreen preview
   - Hiệu ứng: Images fade in với stagger (100ms delay each)

**5. Reflection Question Display** (if has reflection)
   - Mô tả:
     - Section header: "Reflection Question:" (Heading 3)
     - Question text in quotes (Body 1, italic)
     - Background: Light tint of type color
     - Padding: 12px
     - Border radius: 8px
   - Tương tác: None (display only)
   - Hiệu ứng: Fade in

**6. Unlock Date Display**
   - Mô tả:
     - Section header: "Opens on:" (Heading 3)
     - Date/time display (large, bold): "December 25, 2025 at 9:00 AM"
     - Icon: Calendar (MaterialIcons: event)
   - Tương tác: None (display only)
   - Hiệu ứng: Fade in

**7. Lock Button**
   - Mô tả:
     - Full-width button at bottom
     - Icon: Lock (Ionicons: lock-closed)
     - Text: "Lock Capsule"
     - Primary gradient background
   - Tương tác: Tap -> Show Lock Confirmation Dialog
   - Hiệu ứng: Press scale to 0.98, haptic medium impact

**8. Lock Confirmation Dialog**
   - Mô tả:
     - Modal overlay (dark, semi-transparent)
     - Dialog card (centered):
       - Icon: Lock closing animation
       - Title: "Lock this capsule?"
       - Message: "Once locked, you cannot view, edit, or delete this capsule until it opens on:"
       - Date display: [Selected date]
       - Buttons:
         - Cancel (Text button, left)
         - Lock (Contained button, right, primary)
   - Tương tác:
     - Cancel -> Close dialog
     - Lock -> Trigger Lock Flow (F5)
     - Tap background -> Close dialog
   - Hiệu ứng:
     - Dialog appear: Scale from 0.9 to 1.0, background fade in
     - Lock button: Gradient shimmer effect
     - Dismiss: Scale to 0.9, fade out

#### Navigation
- Đến screen này từ: Create Capsule Screen
- Từ screen này đến: Lock Animation Screen, Create Capsule (edit)

#### Ghi chú
- All content read-only on this screen
- Back navigation preserves all data for editing
- Lock confirmation prevents accidental locks
- Preview provides final chance to review before committing

---

### 3.4 Lock Animation Screen

#### Mục đích
Hiển thị animation khóa capsule và feedback thành công. Xác nhận capsule đã được lưu an toàn.

#### Các thành phần chính

**1. Full-Screen Animation Canvas**
   - Mô tả:
     - Background: Type-specific gradient (full screen)
     - Centered animation area
   - Tương tác: None during animation (can tap to skip)
   - Hiệu ứng: Background gradient animate in

**2. Capsule Box Animation**
   - Mô tả:
     - 3D capsule/box illustration
     - Animation sequence:
       - Phase 1 (0-0.5s): Box appears, scale from 0.8 to 1.0
       - Phase 2 (0.5-1.0s): Box closing animation (lid lowering)
       - Phase 3 (1.0-1.3s): Lock icon appears, clicks into place
       - Phase 4 (1.3-1.8s): Sparkle/particle effect bursts
   - Tương tác: Visual only
   - Hiệu ứng: Can use Lottie animation for smooth effect

**3. Success Message**
   - Mô tả:
     - Appears after lock animation (1.8s mark)
     - Text 1: "Capsule Locked!" (Heading 1, bold, white)
     - Text 2: "Your capsule will open in [X days]" (Body 1, white)
   - Tương tác: None
   - Hiệu ứng:
     - Fade in + slide up from bottom
     - Text 1: Scale bounce (0.8 -> 1.1 -> 1.0)

**4. Background Particles**
   - Mô tả: Floating particles/sparkles throughout animation
   - Tương tác: Visual decoration only
   - Hiệu ứng: Continuous floating, fading in/out

**5. Skip Indicator** (appears after 0.5s)
   - Mô tả: Small text at bottom "Tap to skip" (muted, small)
   - Tương tác: Tap anywhere -> Skip to end, navigate home
   - Hiệu ứng: Fade in slowly

#### Animation Timeline
```
0.0s: Background fade in, box appear
0.5s: Box closing starts, skip hint appears
1.0s: Lock click sound/haptic
1.3s: Sparkle burst, haptic heavy impact
1.8s: Success message appear
2.0s: Hold final frame
2.5s: Auto-navigate to Home Screen
```

#### Navigation
- Đến screen này từ: Preview & Lock Screen (after confirm)
- Từ screen này đến: Home Screen (auto after 2.5s, or tap to skip)

#### Ghi chú
- During animation: Save capsule to database, schedule notification
- Haptic feedback: Heavy impact at lock click moment
- Animation can be skipped by tapping screen
- If save fails: Show error, allow retry
- Success guarantees capsule is safely stored

---

## 4. Open Capsule Flow

### 4.1 Open Capsule Animation Screen

#### Mục đích
Animation mở capsule khi user tap capsule ready. Tạo trải nghiệm hồi hộp và thú vị.

#### Các thành phần chính

**1. Full-Screen Animation Canvas**
   - Mô tả:
     - Background: Dark gradient (mystery theme)
     - Centered animation area
   - Tương tác: Tap to skip animation
   - Hiệu ứng: Background subtle particle floating

**2. Capsule Opening Animation**
   - Mô tả:
     - Sequence:
       - Phase 1 (0-0.3s): Closed capsule appears, shaking/glowing
       - Phase 2 (0.3-1.1s): Lid opening animation (3D rotation)
       - Phase 3 (1.1-1.6s): Light rays emanate from inside
       - Phase 4 (1.6-2.1s): Content preview fade in (blurred initially)
       - Phase 5 (2.1-2.5s): Content clear, full reveal
   - Tương tác: Visual only
   - Hiệu ứng: Smooth Lottie or custom Reanimated animation

**3. Light Rays Effect**
   - Mô tả: Golden/colorful light beams radiating from opening capsule
   - Tương tác: Visual decoration
   - Hiệu ứng: Opacity pulse, rotating slightly

**4. Skip Indicator**
   - Mô tả: "Tap to skip" text at bottom
   - Tương tác: Tap anywhere -> Skip to content
   - Hiệu ứng: Fade in after 0.3s

#### Animation Timeline
```
0.0s: Capsule appear, shake begin
0.3s: Lid opening starts, skip hint appears
1.1s: Light rays burst, haptic medium impact
1.6s: Content preview starts fading in
2.5s: Auto-transition to Content Screen
```

#### Navigation
- Đến screen này từ: Home Screen (tap ready capsule)
- Từ screen này đến: Capsule Content Screen

#### Ghi chú
- Animation loads capsule data in background
- Skipping animation goes straight to content
- Haptic feedback at key moments (shake, light burst)
- Reduce motion accessibility: Skip animation automatically

---

### 4.2 Capsule Content Screen

#### Mục đích
Hiển thị nội dung capsule đã mở. User đọc message, xem ảnh, rồi chuyển sang reflection.

#### Các thành phần chính

**1. Header Bar**
   - Mô tả:
     - Left: Back button (returns to Home)
     - Center: Empty or minimal
   - Tương tác: Back -> Capsule stays ready (not opened yet)
   - Hiệu ứng: Header slide down

**2. Type Badge**
   - Mô tả:
     - Type icon (48x48) with type color
     - Type name (e.g., "Emotion")
     - Creation date: "Created on November 25, 2024"
   - Tương tác: None
   - Hiệu ứng: Fade in + slide from top

**3. Content Card**
   - Mô tả:
     - White card with padding
     - Contains full text content
     - Font: Body 1, line-height 1.6
     - Scrollable if content is long
   - Tương tác: Scroll to read all
   - Hiệu ứng: Card slide up from bottom

**4. Image Gallery** (if images exist)
   - Mô tả:
     - Horizontal scroll view
     - Image thumbnails (100x100)
     - Border radius: 12px
     - Tap hint: "Tap to view"
   - Tương tác: Tap image -> Fullscreen Viewer
   - Hiệu ứng: Images fade in with stagger

**5. Image Fullscreen Viewer Modal**
   - Mô tả:
     - Black background overlay
     - Current image centered, large
     - Close button (X) top-right
     - Image counter: "1 of 3"
   - Tương tác:
     - Pinch to zoom
     - Swipe left/right -> Next/previous image
     - Tap X or background -> Close viewer
     - Double tap -> Toggle zoom
   - Hiệu ứng:
     - Open: Zoom from thumbnail position, background fade in
     - Swipe: Page transition with momentum
     - Close: Zoom back to thumbnail, background fade out

**6. Continue Button**
   - Mô tả:
     - Full-width button at bottom
     - Text: "Continue" or "Next"
     - Primary color
   - Tương tác: Tap -> Navigate to Reflection (or Archive if Memory)
   - Hiệu ứng: Press scale, haptic medium impact

#### Navigation
- Đến screen này từ: Open Animation Screen
- Từ screen này đến: Reflection Screen (Emotion/Goal/Decision), Celebration Screen (Memory)

#### Ghi chú
- Content is read-only
- Back before Continue -> Capsule stays "ready" (can open again)
- Images lazy load for performance
- Long content auto-scrolls to show more indicator
- Haptic: Light on image tap, medium on Continue

---

### 4.3 Reflection Response Screen

#### Mục đích
User trả lời reflection question đã đặt ra khi tạo capsule. Khác nhau cho mỗi loại capsule.

#### Các thành phần chính (Yes/No - Emotion, Goal)

**1. Header**
   - Mô tả:
     - Type icon (centered, 48x48)
     - Title: "Reflect on your [Type]" (Heading 2, centered)
   - Tương tác: None
   - Hiệu ứng: Fade in

**2. Reflection Question Card**
   - Mô tả:
     - Card with type-colored background (light tint)
     - Question text in quotes (Heading 3, centered)
     - Padding: 24px
     - Border radius: 16px
   - Tương tác: None (display only)
   - Hiệu ứng: Scale in from 0.95

**3. Yes/No Buttons**
   - Mô tả:
     - Two large buttons, side-by-side
     - Button dimensions: 48% width each
     - Spacing: 4% gap between
     - Yes button:
       - Unselected: Outlined, gray
       - Selected: Filled, green gradient, checkmark icon
     - No button:
       - Unselected: Outlined, gray
       - Selected: Filled, red gradient, X icon
   - Tương tác:
     - Tap Yes -> Select Yes, deselect No, enable Continue
     - Tap No -> Select No, deselect Yes, enable Continue
     - Tap same again -> Deselect (toggle off)
   - Hiệu ứng:
     - Select: Background fade to gradient, icon scale from 0
     - Press: Scale to 0.96, haptic light impact

**4. Continue Button**
   - Mô tả:
     - Full-width at bottom
     - Disabled until selection made
   - Tương tác: Tap -> Save answer, Navigate to Celebration
   - Hiệu ứng: Enable transition opacity, press scale

#### Các thành phần chính (Rating 1-5 - Decision)

**1-2. Header and Question Card** (Same as Yes/No)

**3. Rating Options**
   - Mô tả:
     - 5 star icons in a row (centered)
     - Star size: 40x40
     - Spacing: 8px between stars
     - States:
       - Unselected: Outlined star, gray
       - Selected: Filled star, gold
       - All stars up to selected are filled (e.g., rating 3 = 3 filled stars)
     - Label below stars:
       - 1: "Poor decision" (red)
       - 2: "Below expectations" (orange)
       - 3: "Neutral / Okay" (yellow)
       - 4: "Good decision" (light green)
       - 5: "Excellent decision" (green)
   - Tương tác: Tap star X -> Select rating X, fill stars 1 to X
   - Hiệu ứng:
     - Select: Stars fill sequentially (stagger 50ms), scale bounce
     - Label: Cross-fade to new label, color transition

**4. Continue Button** (Same as Yes/No)

#### Navigation
- Đến screen này từ: Capsule Content Screen
- Từ screen này đến: Celebration Effects Screen

#### Ghi chú
- Reflection is required (cannot skip)
- Can change answer before tapping Continue
- Answer is saved to database when Continue tapped
- Back button shows warning: "You'll need to answer again"
- Haptic: Light on select, medium on Continue

---

### 4.4 Celebration Effects Screen

#### Mục đích
Hiển thị animation và message tương ứng với reflection answer. Tạo trải nghiệm cảm xúc.

#### Các thành phần chính

**1. Full-Screen Effect Canvas**
   - Mô tả: Full screen với type-specific background
   - Tương tác: Tap to skip
   - Hiệu ứng: Background gradient animation

**2. Celebration Effect (Yes, Rating 4-5)**
   - Mô tả:
     - Confetti burst from center (50+ particles)
     - Sparkles twinkling
     - Stars floating
     - Colors: Gold, green, blue
   - Tương tác: Visual only
   - Hiệu ứng:
     - Confetti: Physics-based fall, rotation
     - Sparkles: Random positions, fade in/out
     - Duration: 2.5s

**3. Encouraging Effect (No, Rating 1-2)**
   - Mô tả:
     - Soft gradient glow (warm pink/purple)
     - Floating hearts/hugs (5-10 items)
     - Gentle color transitions
   - Tương tác: Visual only
   - Hiệu ứng:
     - Hearts float upward slowly
     - Gradient pulse (opacity)
     - Duration: 2.5s

**4. Neutral Effect (Rating 3)**
   - Mô tả:
     - Subtle shimmer wave
     - Thoughtful bubbles floating
     - Blue/gray/white palette
   - Tương tác: Visual only
   - Hiệu ứng:
     - Shimmer horizontal sweep
     - Bubbles float and pop
     - Duration: 2s

**5. Nostalgic Effect (Memory - no reflection)**
   - Mô tả:
     - Warm sepia/golden overlay
     - Floating photo frames
     - Soft light flares (lens flare effect)
     - Sepia, gold, warm orange colors
   - Tương tác: Visual only
   - Hiệu ứng:
     - Sepia overlay fade in
     - Frames float and rotate
     - Duration: 3s

**6. Message Overlay**
   - Mô tả:
     - Centered text over animation
     - Message based on answer:
       - Celebration: "Congratulations! You did it!"
       - Encouraging: "It's okay, keep trying!"
       - Neutral: "Interesting outcome!"
       - Nostalgic: "A beautiful memory!"
     - Font: Heading 1, white with shadow
   - Tương tác: None
   - Hiệu ứng: Fade in after 0.5s, scale bounce

**7. Skip Indicator**
   - Mô tả: "Tap anywhere to continue" (small, bottom)
   - Tương tác: Tap anywhere -> Skip to Home
   - Hiệu ứng: Fade in

#### Effect Timeline
```
0.0s: Background fade in, effect starts
0.5s: Message fade in, skip hint appears
1.0s: Peak of effect (haptic impact)
2.5s: Hold final frame
3.0s: Auto-navigate to Home (capsule moved to Archive)
```

#### Navigation
- Đến screen này từ: Reflection Screen (or Content Screen if Memory)
- Từ screen này đến: Home Screen (capsule now in Archive)

#### Ghi chú
- During animation: Update capsule status to "opened", set openedAt timestamp
- Capsule removed from Home, moved to Archive
- Toast on Home: "Capsule archived" (subtle)
- Haptic: Heavy impact at effect peak
- Reduce motion: Show static message, skip animation
- Sound effects (optional): Respect device silent mode

---

## 5. Archive Flow

### 5.1 Archive List Screen

#### Mục đích
Hiển thị danh sách tất cả capsules đã mở. User có thể xem lại nội dung và reflection.

#### Các thành phần chính

**1. Header Bar**
   - Mô tả:
     - Left: Back button
     - Center: "Archive" (Heading 2)
   - Tương tác: Back -> Navigate to Home
   - Hiệu ứng: Header slide down

**2. Section Header**
   - Mô tả: "Your Opened Capsules" (Heading 3, muted)
   - Tương tác: None
   - Hiệu ứng: Fade in

**3. Capsule List (FlatList, virtualized)**
   - Mô tả: Vertical scrolling list of opened capsules
   - Tương tác: Scroll, tap items
   - Hiệu ứng: Smooth scroll, items fade in on mount

**4. Capsule List Item**
   - Mô tả:
     - Card layout (white, shadow)
     - Height: ~120px
     - Padding: 16px
     - Border-left: 4px type-colored accent
     - Content:
       - Top-left: Type icon (32x32) + Type name
       - Top-right: Chevron-right icon (hints tappable)
       - Middle: Created & Opened dates
         - "Created: Nov 25, 2024"
         - "Opened: Dec 25, 2024"
       - Bottom: Text preview (first 50 chars + "...")
         - Font: Body 2, muted
   - Tương tác: Tap -> Navigate to Archive Detail
   - Hiệu ứng:
     - Press: Scale to 0.98, opacity 0.7
     - Swipe-to-delete (optional): Reveal delete button

**5. Pull-to-Refresh (optional)**
   - Mô tả: Pull down on list to refresh
   - Tương tác: Pull -> Show spinner, re-query database
   - Hiệu ứng: Spinner rotation, list content shift down

**6. Loading State**
   - Mô tả: Skeleton screens or spinner while loading
   - Tương tác: None
   - Hiệu ứng: Pulse animation on skeletons

#### Navigation
- Đến screen này từ: Home Screen (Archive icon)
- Từ screen này đến: Archive Detail Screen, Home Screen

#### Ghi chú
- List sorted by openedAt DESC (newest first)
- Virtualized for performance (100+ items)
- Empty state if no opened capsules (see Empty States)
- Items animate in with slight stagger
- Haptic: Light on tap item

---

### 5.2 Archive Detail Screen

#### Mục đích
Hiển thị chi tiết đầy đủ của capsule đã mở, bao gồm cả reflection answer. Cho phép xóa capsule.

#### Các thành phần chính

**1. Header Bar**
   - Mô tả:
     - Left: Back button
     - Center: "[Type] Capsule" (e.g., "Emotion Capsule")
     - Right: Delete icon (Ionicons: trash-outline)
   - Tương tác:
     - Back -> Navigate to Archive List
     - Delete -> Show delete confirmation
   - Hiệu ứng: Header slide down, delete icon press scale

**2. Type Badge**
   - Mô tả:
     - Type icon (60x60, centered)
     - Type-colored gradient background
   - Tương tác: None
   - Hiệu ứng: Scale in from 0.8

**3. Date Info**
   - Mô tả:
     - Two lines of text (centered):
       - "Created: November 25, 2024"
       - "Opened: December 25, 2024"
     - Font: Body 2, muted
   - Tương tác: None
   - Hiệu ứng: Fade in

**4. Content Card** (Same as Capsule Content Screen)
   - Mô tả: White card with full text content
   - Tương tác: Scrollable
   - Hiệu ứng: Slide up

**5. Image Gallery** (if images exist)
   - Mô tả: Horizontal scrollable thumbnails
   - Tương tác: Tap -> Fullscreen viewer
   - Hiệu ứng: Same as Content Screen

**6. Reflection Section** (if has reflection)
   - Mô tả:
     - Section header: "--- Reflection ---" (divider)
     - Question display: "Q: [Question text]"
     - Answer display:
       - Yes/No: "A: Yes ✓" (green) or "A: No ✗" (red)
       - Rating: "A: ★★★★☆ - 4 out of 5 - Good decision"
     - Background: Light tint of type color
     - Padding: 16px
     - Border radius: 12px
   - Tương tác: None (display only)
   - Hiệu ứng: Fade in

**7. Memory (No Reflection)**
   - Mô tả: Reflection section không hiển thị
   - Tương tác: N/A
   - Hiệu ứng: N/A

**8. Delete Confirmation Dialog**
   - Mô tả:
     - Modal overlay
     - Dialog:
       - Icon: Warning (MaterialIcons: warning, red)
       - Title: "Delete this capsule?"
       - Message: "This action cannot be undone. All content and images will be permanently deleted."
       - Buttons:
         - Cancel (Text button)
         - Delete (Contained button, red)
   - Tương tác:
     - Cancel -> Close dialog
     - Delete -> Delete capsule from DB, navigate back to Archive List
   - Hiệu ứng:
     - Dialog scale in
     - Delete: Show loading, then navigate with toast "Capsule deleted"

#### Navigation
- Đến screen này từ: Archive List Screen
- Từ screen này đến: Archive List (back or after delete)

#### Ghi chú
- All content read-only (cannot edit opened capsules)
- Delete removes capsule record and all associated images
- Delete confirmation prevents accidents
- Deleted capsule removed from list immediately
- Haptic: Heavy impact on delete confirm

---

## 6. Empty States

### 6.1 Home Empty State

#### Mục đích
Hiển thị khi không có capsule locked/ready. Hướng dẫn user tạo capsule đầu tiên.

#### Các thành phần chính

**1. Illustration**
   - Mô tả:
     - Empty/open time capsule box
     - Size: 150x150
     - Style: Friendly, inviting (not sad)
     - Colors: Primary palette, light background
   - Tương tác: None (decorative)
   - Hiệu ứng: Subtle floating animation (up-down 10px, 3s loop)

**2. Title**
   - Mô tả: "No time capsules yet" (Heading 2, centered)
   - Tương tác: None
   - Hiệu ứng: Fade in after illustration

**3. Description**
   - Mô tả: "Create your first capsule to send a message to your future self!" (Body 1, centered, muted)
   - Tương tác: None
   - Hiệu ứng: Fade in after title

**4. CTA Button**
   - Mô tả:
     - Text: "Create First Capsule"
     - Style: Primary gradient, medium size
     - Position: Centered below description
   - Tương tác: Tap -> Navigate to Type Selection
   - Hiệu ứng: Press scale, slight pulse animation on idle

**5. FAB** (Still visible)
   - Mô tả: Same FAB as normal Home Screen
   - Tương tác: Tap -> Navigate to Type Selection
   - Hiệu ứng: Same as Home

#### Navigation
- Đến screen này từ: Home Screen (when 0 locked/ready capsules)
- Từ screen này đến: Type Selection Screen

#### Ghi chú
- Empty state replaced by grid when first capsule created
- Both CTA and FAB lead to same destination
- Animation reduces if "Reduce Motion" enabled
- Haptic: Medium impact on CTA tap

---

### 6.2 Archive Empty State

#### Mục đích
Hiển thị khi chưa có capsule opened. Informational only, không có CTA.

#### Các thành phần chính

**1. Illustration**
   - Mô tả:
     - Empty folder or box with stars
     - Size: 150x150
     - Style: Hopeful, anticipating
     - Colors: Muted but warm
   - Tương tác: None
   - Hiệu ứng: Gentle pulse (scale 1.0 -> 1.05 -> 1.0, 4s loop)

**2. Title**
   - Mô tả: "No opened capsules yet" (Heading 2, centered)
   - Tương tác: None
   - Hiệu ứng: Fade in

**3. Description**
   - Mô tả: "Your opened capsules will appear here. Create a capsule and wait for it to unlock!" (Body 1, centered, muted)
   - Tương tác: None
   - Hiệu ứng: Fade in

**4. No CTA Button**
   - Mô tả: Không có button vì user không thể trực tiếp tạo "opened" capsule
   - Tương tác: N/A
   - Hiệu ứng: N/A

#### Navigation
- Đến screen này từ: Archive Screen (when 0 opened capsules)
- Từ screen này đến: None (informational only)

#### Ghi chú
- Empty state replaced by list when first capsule opened
- No action required from user
- Explains the process: Create -> Lock -> Wait -> Open -> Archive
- Animation reduces if "Reduce Motion" enabled

---

## Design Tokens & Patterns

### Color Palette

**Capsule Types:**
- **Emotion**: Pink (#FF6B9D) to Purple (#C44EFF) gradient
- **Goal**: Green (#4CAF50) to Blue (#2196F3) gradient
- **Memory**: Orange (#FF9800) to Yellow (#FFC107) gradient
- **Decision**: Blue (#2196F3) to Gray (#607D8B) gradient

**UI Colors:**
- **Primary**: #6366F1 (Indigo)
- **Secondary**: #8B5CF6 (Purple)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Orange)
- **Error**: #EF4444 (Red)
- **Background**: #FFFFFF (White)
- **Surface**: #F9FAFB (Light Gray)
- **Text Primary**: #111827 (Dark Gray)
- **Text Secondary**: #6B7280 (Medium Gray)
- **Text Muted**: #9CA3AF (Light Gray)

### Typography

**Headings:**
- **H1**: 32px, Bold (700), Line-height 1.2
- **H2**: 24px, Bold (700), Line-height 1.3
- **H3**: 20px, SemiBold (600), Line-height 1.4

**Body:**
- **Body 1**: 16px, Regular (400), Line-height 1.5
- **Body 2**: 14px, Regular (400), Line-height 1.5
- **Caption**: 12px, Regular (400), Line-height 1.4

**Font Family:**
- System default: SF Pro (iOS), Roboto (Android)
- Optional custom: Inter, Poppins, or similar modern sans-serif

### Spacing Scale (8pt grid)

- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### Border Radius

- **Small**: 4px (chips, tags)
- **Medium**: 8px (buttons, inputs)
- **Large**: 12px (cards)
- **XLarge**: 16px (modals)
- **Round**: 999px (circular buttons)

### Shadows

**Elevation levels:**
- **Level 1**: `0 1px 3px rgba(0,0,0,0.1)`
- **Level 2**: `0 4px 6px rgba(0,0,0,0.1)`
- **Level 3**: `0 10px 15px rgba(0,0,0,0.1)`
- **Level 4**: `0 20px 25px rgba(0,0,0,0.15)`

### Animations

**Durations:**
- **Fast**: 150ms (micro-interactions)
- **Normal**: 300ms (standard transitions)
- **Slow**: 500ms (complex animations)

**Easings:**
- **Ease-out**: For entrances
- **Ease-in**: For exits
- **Ease-in-out**: For transitions
- **Spring**: For bouncy effects

### Touch Targets

- **Minimum**: 44x44px (iOS HIG standard)
- **Preferred**: 48x48px (Material Design)
- **Icon buttons**: 40x40px minimum
- **Text buttons**: 32px minimum height

### Haptic Feedback Mapping

| Action | Haptic Type |
|--------|-------------|
| Light tap/select | Light Impact |
| Button press | Medium Impact |
| Success action | Heavy Impact (Success) |
| Error/warning | Error Pattern |
| Long press | Medium Impact |

---

*End of Screen Descriptions*
