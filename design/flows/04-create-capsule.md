# F4: Create Capsule - Activity Diagram

**Feature ID:** F4
**Priority:** Must Have
**Dependencies:** F1 (Local Data Storage), F3 (Capsule Type Selection)

---

## 1. Overview

Man hinh cho phep user nhap noi dung capsule bao gom: text content (required), anh (optional, max 3), cau hoi reflection (required tru Memory), va thoi gian mo.

---

## 2. Main Activity Diagram

```mermaid
flowchart TD
    A[Navigate from Type Selection] --> B[Receive selected type]
    B --> C[Initialize Create Form]

    C --> D[Show Text Input Field]
    D --> E[Show Image Picker - Optional]
    E --> F{Type = Memory?}

    F -->|Yes| G[Skip Reflection Question]
    F -->|No| H[Show Reflection Question Field]

    G --> I[Show Date/Time Picker]
    H --> I

    I --> J[Show Preview Button]
    J --> K[Wait for user input]

    K --> L{User action?}

    L -->|Enter text| M[Update text state]
    M --> N[Validate: 1-2000 chars]
    N --> K

    L -->|Add image| O[Open Image Picker]
    O --> P[F4.1: Image Selection Flow]
    P --> K

    L -->|Enter reflection| Q[Update reflection state]
    Q --> K

    L -->|Select date| R[F4.2: Date Selection Flow]
    R --> K

    L -->|Tap Preview| S{All required fields valid?}
    S -->|No| T[Show validation errors]
    T --> K
    S -->|Yes| U[Navigate to Preview Screen]
    U --> V[F4.3: Preview and Lock Flow]

    L -->|Back/Cancel| W[Show confirmation dialog]
    W --> X{Discard?}
    X -->|Yes| Y[Navigate back to Type Selection]
    X -->|No| K
```

---

## 3. F4.1: Image Selection Flow

```mermaid
flowchart TD
    A[User tap Add Image] --> B{Current image count?}

    B -->|3 images| C[Show message: Maximum 3 images]
    C --> D[Return - no action]

    B -->|< 3 images| E[Request permission if needed]
    E --> F{Permission granted?}

    F -->|No| G[Show permission denied message]
    G --> H[Offer to open settings]
    H --> D

    F -->|Yes| I[Open expo-image-picker]
    I --> J[User selects image from gallery]

    J --> K{Image selected?}
    K -->|No/Cancel| D
    K -->|Yes| L[Add image to selection array]

    L --> M[Show image thumbnail in form]
    M --> N[Show X button to remove]
    N --> O[Update image count display]
    O --> D
```

---

## 4. Remove Image Flow

```mermaid
flowchart TD
    A[User tap X on image] --> B[Show confirmation - optional]
    B --> C[Remove image from array]
    C --> D[Update UI - remove thumbnail]
    D --> E[Update image count]
```

---

## 5. F4.2: Date Selection Flow

```mermaid
flowchart TD
    A[User tap Date/Time field] --> B[Show Date Picker Modal]

    B --> C[Display Quick Presets]
    C --> D[1 Week from now]
    C --> E[1 Month from now]
    C --> F[3 Months from now]
    C --> G[6 Months from now]
    C --> H[1 Year from now]
    C --> I[Custom Date option]

    D --> J[Set date and close]
    E --> J
    F --> J
    G --> J
    H --> J

    I --> K[Show Calendar Picker]
    K --> L[User selects date]
    L --> M{Date in future?}

    M -->|No| N[Show error: Must be future date]
    N --> K

    M -->|Yes| O[Show Time Picker]
    O --> P[User selects time]
    P --> Q{Time valid?}

    Q -->|Same day, past time| R[Show error: Must be future time]
    R --> O

    Q -->|Valid| J

    J --> S[Display selected date in field]
    S --> T[Format: MMM DD, YYYY at HH:MM]
```

---

## 6. F4.3: Preview and Lock Flow

```mermaid
flowchart TD
    A[Navigate to Preview Screen] --> B[Display all capsule info]

    B --> C[Show Capsule Type with icon]
    C --> D[Show Text Content - full]
    D --> E{Has images?}

    E -->|Yes| F[Show image gallery/carousel]
    E -->|No| G[No image section]

    F --> H{Has reflection question?}
    G --> H

    H -->|Yes| I[Show Reflection Question]
    H -->|No| J[Skip reflection display]

    I --> K[Show Unlock Date/Time]
    J --> K

    K --> L[Show Lock Button]
    L --> M[Wait for user action]

    M --> N{User action?}

    N -->|Edit| O[Navigate back to form]
    O --> P[Preserve all input]

    N -->|Lock| Q[Show Lock Confirmation Dialog]
    Q --> R{Confirm lock?}

    R -->|No| M
    R -->|Yes| S[F5: Lock Capsule Flow]
```

---

## 7. Screen Layout - Create Form

```
+----------------------------------------+
|  <- Back      Create [Type]            |
+----------------------------------------+
|                                        |
|  Write your message                    |
|  +----------------------------------+  |
|  |                                  |  |
|  |  [Multi-line text input]         |  |
|  |                                  |  |
|  |                                  |  |
|  +----------------------------------+  |
|  1234/2000 characters                  |
|                                        |
|  Add Photos (optional)                 |
|  +------+ +------+ +------+ +------+   |
|  |[Img1]| |[Img2]| |[Img3]| | [+]  |   |
|  |  X   | |  X   | |  X   | |      |   |
|  +------+ +------+ +------+ +------+   |
|                                        |
|  Reflection Question                   |  <- Hidden for Memory
|  +----------------------------------+  |
|  |  What will you ask yourself?     |  |
|  +----------------------------------+  |
|                                        |
|  Open this capsule on                  |
|  +----------------------------------+  |
|  |  [Calendar icon] Select date...  |  |
|  +----------------------------------+  |
|                                        |
|  +----------------------------------+  |
|  |          Preview                 |  |
|  +----------------------------------+  |
|                                        |
+----------------------------------------+
```

---

## 8. Screen Layout - Preview

```
+----------------------------------------+
|  <- Edit       Preview                 |
+----------------------------------------+
|                                        |
|  [Capsule Type Icon]                   |
|  [Type Name] Capsule                   |
|                                        |
|  +----------------------------------+  |
|  |                                  |  |
|  |  Your message content here...    |  |
|  |  Full text displayed.            |  |
|  |                                  |  |
|  +----------------------------------+  |
|                                        |
|  [Image 1] [Image 2] [Image 3]         |
|                                        |
|  Reflection Question:                  |
|  "Did you achieve this goal?"          |
|                                        |
|  Opens on:                             |
|  December 25, 2025 at 9:00 AM          |
|                                        |
|  +----------------------------------+  |
|  |     [Lock icon] Lock Capsule     |  |
|  +----------------------------------+  |
|                                        |
+----------------------------------------+
```

---

## 9. Validation Rules

| Field | Type | Validation | Error Message |
|-------|------|------------|---------------|
| Content | Text | Required, 1-2000 chars | "Please enter your message (1-2000 characters)" |
| Images | Array | Optional, max 3 | "Maximum 3 images allowed" |
| Reflection Question | Text | Required for Emotion/Goal/Decision | "Please enter a reflection question" |
| Unlock Date | DateTime | Required, must be future | "Please select a future date and time" |

---

## 10. Date/Time Presets

| Preset | Calculation |
|--------|-------------|
| 1 Week | now + 7 days, same time |
| 1 Month | now + 30 days, same time |
| 3 Months | now + 90 days, same time |
| 6 Months | now + 180 days, same time |
| 1 Year | now + 365 days, same time |

---

## 11. Edge Cases

| Case | Handling |
|------|----------|
| Text exactly 2000 chars | Accept, disable further input |
| Text > 2000 chars (paste) | Truncate to 2000, show warning |
| Image picker cancel | No change to selection |
| Image load error | Show placeholder, allow remove |
| Large image file | Resize before save (max 1024px width) |
| Date picker cancel | Keep previous selection |
| Back with unsaved changes | Show "Discard?" confirmation |
| App killed during create | Lost - not saved until lock |

---

## 12. State Management

```typescript
interface CreateCapsuleState {
  type: 'emotion' | 'goal' | 'memory' | 'decision';
  content: string;
  images: ImageUri[];
  reflectionQuestion: string | null;
  unlockDate: Date | null;
  isValid: boolean;
  errors: ValidationErrors;
}
```

---

## 13. Accessibility

| Element | Accessibility |
|---------|---------------|
| Text input | Label: "Write your message", hint: character count |
| Add image button | Label: "Add photo, X of 3 selected" |
| Remove image | Label: "Remove image X" |
| Reflection input | Label: "Reflection question" |
| Date picker | Label: "Select open date", announce selected date |
| Preview button | Label: "Preview capsule" |
| Lock button | Label: "Lock capsule" |

---

*Flow End*
