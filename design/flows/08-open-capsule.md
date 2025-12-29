# F8: Open Capsule - Activity Diagram

**Feature ID:** F8
**Priority:** Must Have
**Dependencies:** F5 (Lock Capsule), F6 (Capsule Timer)

---

## 1. Overview

Cho phep user mo capsule khi da den thoi gian (status = ready). Hien thi noi dung capsule voi animation mo hop va sau do chuyen sang reflection (neu co).

---

## 2. Main Activity Diagram

```mermaid
flowchart TD
    A[User tap capsule from Home] --> B{Capsule status?}

    B -->|locked| C[Show message: Not yet time]
    C --> D[Return to Home]

    B -->|ready| E[Navigate to Open Screen]
    E --> F[Fetch capsule full data]
    F --> G[Fetch associated images]

    G --> H[Play Opening Animation]
    H --> I[Show capsule content]

    I --> J[Display creation date]
    J --> K[Display capsule type icon]
    K --> L[Display text content]

    L --> M{Has images?}
    M -->|Yes| N[Display image gallery]
    M -->|No| O[Skip images]

    N --> P[User views content]
    O --> P

    P --> Q[Show Continue button]
    Q --> R{User taps Continue}

    R --> S{Capsule type?}

    S -->|Memory| T[F10: Show nostalgic effect]
    T --> U[Update status to opened]
    U --> V[Move to Archive]
    V --> W[Navigate to Home or Archive]

    S -->|Emotion/Goal/Decision| X[F9: Reflection Flow]
```

---

## 3. Opening Animation Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant S as Screen
    participant A as Animation

    U->>S: Tap ready capsule
    S->>S: Load capsule data

    S->>A: Start opening sequence

    A->>A: Show closed capsule box (0.3s)
    A->>A: Box shaking/glowing (0.5s)
    A->>A: Lid opening animation (0.8s)
    A->>A: Light rays emanating (0.5s)
    A->>A: Content fading in (0.5s)

    Note over A: Total: ~2.5s

    A->>S: Animation complete
    S->>U: Content visible
```

---

## 4. Content Display Screen

```
+----------------------------------------+
|  <- Back                               |
+----------------------------------------+
|                                        |
|  [Opening Animation plays here]        |
|                                        |
|  ---- After animation ----             |
|                                        |
|  [Capsule Type Icon]                   |
|  Created on November 25, 2024          |
|                                        |
|  +----------------------------------+  |
|  |                                  |  |
|  |  Your message content here.     |  |
|  |  This is what you wrote to      |  |
|  |  your future self. All the      |  |
|  |  text is displayed in full.     |  |
|  |                                  |  |
|  +----------------------------------+  |
|                                        |
|  [Image 1] [Image 2] [Image 3]         |
|  (tap to zoom)                         |
|                                        |
|  +----------------------------------+  |
|  |          Continue                |  |
|  +----------------------------------+  |
|                                        |
+----------------------------------------+
```

---

## 5. Image Viewing Flow

```mermaid
flowchart TD
    A[Images displayed as thumbnails] --> B{User taps image?}

    B -->|No| C[Continue reading]
    B -->|Yes| D[Open fullscreen viewer]

    D --> E[Show selected image large]
    E --> F[Enable pinch to zoom]
    F --> G[Enable swipe to next/prev]

    G --> H{User action?}

    H -->|Swipe left/right| I[Show next/prev image]
    I --> G

    H -->|Tap X or background| J[Close viewer]
    J --> C

    H -->|Double tap| K[Toggle zoom]
    K --> G
```

---

## 6. Back Navigation Handling

```mermaid
flowchart TD
    A[User taps Back] --> B{Content viewed?}

    B -->|Yes, Continue not tapped| C[Show confirmation]
    C --> D{Leave without completing?}

    D -->|Yes| E[Navigate to Home]
    E --> F[Capsule stays ready - not opened]

    D -->|No| G[Stay on content screen]

    B -->|After Continue tapped| H[In reflection or effect]
    H --> I[Cannot go back mid-flow]
```

Note: Neu user back truoc khi tap Continue, capsule van o trang thai ready va co the mo lai sau.

---

## 7. Content Display Rules

| Element | Display Rule |
|---------|--------------|
| Type icon | Always shown with type-specific color |
| Creation date | Format: "Created on [Month DD, YYYY]" |
| Text content | Full text, scrollable if long |
| Images | Thumbnails with tap-to-expand |
| Reflection question | NOT shown yet (shown in F9) |

---

## 8. Animation Specifications

### 8.1 Opening Animation

| Phase | Duration | Effect |
|-------|----------|--------|
| Box appear | 300ms | Fade in, centered |
| Box shake | 500ms | Subtle shake, glow increases |
| Lid open | 800ms | 3D rotation upward |
| Light burst | 500ms | Rays emanate from box |
| Content reveal | 500ms | Fade in, slide up |

### 8.2 Skip Animation

| Trigger | Action |
|---------|--------|
| Tap anywhere during animation | Skip to content display |
| Animation complete | Auto-show content |

---

## 9. Data Flow

```mermaid
flowchart TD
    A[Capsule ID from navigation] --> B[Query capsule by ID]
    B --> C[Query capsule_image by capsuleId]

    C --> D[Combine data]

    D --> E{All data loaded?}
    E -->|Yes| F[Display content]
    E -->|No| G[Show error]
    G --> H[Navigate back]

    F --> I[User interacts with content]
```

---

## 10. Edge Cases

| Case | Handling |
|------|----------|
| Capsule not found (deleted externally) | Show error, navigate home |
| Images not found (corrupted) | Show placeholder, allow continue |
| Very long text | Scrollable container |
| No images | Hide image section |
| User force closes during open | Capsule stays ready |
| Network error | N/A - all local |
| Animation lag on slow device | Reduce animation complexity |

---

## 11. Capsule Status Transition

```mermaid
stateDiagram-v2
    [*] --> ready: Timer completed

    ready --> viewing: User taps capsule
    viewing --> ready: User backs out before Continue

    viewing --> reflection: Continue tapped (non-Memory)
    viewing --> opened: Continue tapped (Memory)

    reflection --> opened: Reflection answered

    opened --> [*]: Capsule in Archive
```

---

## 12. Screen States

| State | Content |
|-------|---------|
| Loading | Spinner while fetching data |
| Animating | Opening animation playing |
| Displaying | Content visible, can interact |
| Image View | Fullscreen image viewer open |

---

## 13. Accessibility

| Element | Accessibility |
|---------|---------------|
| Opening animation | Reducible for motion sensitivity |
| Content text | Full text read by screen reader |
| Images | Alt text: "Image X of Y" |
| Continue button | Label: "Continue to reflection" or "Complete viewing" |
| Back button | Label: "Go back" |

---

## 14. Haptic Feedback

| Event | Haptic |
|-------|--------|
| Animation start | Light |
| Content revealed | Medium |
| Image tap | Light |
| Continue tap | Medium |

---

*Flow End*
