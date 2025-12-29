# F10: Celebration Effects - Activity Diagram

**Feature ID:** F10
**Priority:** Should Have
**Dependencies:** F9 (Reflection Response)

---

## 1. Overview

Hieu ung animation sau khi user tra loi reflection hoac xem xong Memory capsule. Moi loai tra loi se co hieu ung phu hop voi cam xuc.

---

## 2. Main Activity Diagram

```mermaid
flowchart TD
    A[From Reflection - Answer saved] --> B{Determine effect type}

    B --> C{Capsule type?}

    C -->|Memory| D[Nostalgic Effect]

    C -->|Emotion/Goal| E{Answer?}
    E -->|Yes| F[Celebration Effect]
    E -->|No| G[Encouraging Effect]

    C -->|Decision| H{Rating?}
    H -->|4-5| F
    H -->|3| I[Neutral Effect]
    H -->|1-2| G

    D --> J[Play Effect Animation]
    F --> J
    G --> J
    I --> J

    J --> K[Show message overlay]
    K --> L[Wait for animation complete or skip]

    L --> M{User action?}
    M -->|Tap to skip| N[Skip animation]
    M -->|Wait| O[Animation complete]

    N --> P[Update capsule status to opened]
    O --> P

    P --> Q[Navigate to Home]
    Q --> R[Capsule moved to Archive]
```

---

## 3. Effect Types

### 3.1 Celebration Effect (Positive)

```mermaid
flowchart TD
    A[Trigger: Yes / Rating 4-5] --> B[Start celebration]

    B --> C[Confetti burst from center]
    C --> D[Sparkles floating]
    D --> E[Stars twinkling]

    E --> F[Show success message]
    F --> G[Colors: Gold, Green, Blue]

    G --> H[Duration: 2.5 seconds]
```

**Visual:**
```
+----------------------------------------+
|    *  *     *                    *     |
|  *    [Confetti]  *      *             |
|     *       *        *                 |
|                                        |
|           Congratulations!             |
|                                        |
|      You achieved your goal!           |
|                                        |
|    *         *     *          *        |
|                                        |
|         (tap anywhere to continue)     |
+----------------------------------------+
```

---

### 3.2 Encouraging Effect (Negative/Low)

```mermaid
flowchart TD
    A[Trigger: No / Rating 1-2] --> B[Start encouraging]

    B --> C[Soft gradient glow]
    C --> D[Gentle floating hearts/hugs]
    D --> E[Warm color transition]

    E --> F[Show supportive message]
    F --> G[Colors: Warm pink, Soft purple]

    G --> H[Duration: 2.5 seconds]
```

**Visual:**
```
+----------------------------------------+
|                                        |
|             ~  ~  ~  ~                 |
|                                        |
|          It's okay!                    |
|                                        |
|   Every experience is a lesson.        |
|   You're growing every day.            |
|                                        |
|              <3   <3                   |
|                                        |
|         (tap anywhere to continue)     |
+----------------------------------------+
```

---

### 3.3 Neutral Effect (Middle Rating)

```mermaid
flowchart TD
    A[Trigger: Rating 3] --> B[Start neutral]

    B --> C[Subtle shimmer]
    C --> D[Thoughtful clouds/bubbles]
    D --> E[Balanced color palette]

    E --> F[Show reflective message]
    F --> G[Colors: Blue, Gray, White]

    G --> H[Duration: 2 seconds]
```

**Visual:**
```
+----------------------------------------+
|                                        |
|           o   o   o   o                |
|                                        |
|          Interesting!                  |
|                                        |
|   Life is full of nuances.             |
|   Reflect and move forward.            |
|                                        |
|              o   o                     |
|                                        |
|         (tap anywhere to continue)     |
+----------------------------------------+
```

---

### 3.4 Nostalgic Effect (Memory)

```mermaid
flowchart TD
    A[Trigger: Memory capsule opened] --> B[Start nostalgic]

    B --> C[Warm sepia/golden overlay]
    C --> D[Floating photo frames]
    D --> E[Soft light flares]

    E --> F[Show memory message]
    F --> G[Colors: Sepia, Gold, Warm orange]

    G --> H[Duration: 3 seconds]
```

**Visual:**
```
+----------------------------------------+
|                                        |
|    [~]       [~]         [~]           |
|                                        |
|          A Beautiful Memory            |
|                                        |
|    Cherish these moments forever.      |
|                                        |
|           * glow *                     |
|                                        |
|         (tap anywhere to continue)     |
+----------------------------------------+
```

---

## 4. Effect Messages

### 4.1 Celebration Messages

| Context | Message Options |
|---------|-----------------|
| Goal - Yes | "Congratulations! You did it!", "Goal achieved!", "You're amazing!" |
| Emotion - Yes | "Wonderful!", "Glad things worked out!", "Great news!" |
| Decision - 4-5 | "Great decision!", "You chose wisely!", "Well done!" |

### 4.2 Encouraging Messages

| Context | Message Options |
|---------|-----------------|
| Goal - No | "That's okay, keep trying!", "Every step counts!", "Progress, not perfection!" |
| Emotion - No | "It's okay to feel this way.", "Tomorrow is a new day!", "You're stronger than you know." |
| Decision - 1-2 | "Learning experience!", "Now you know better!", "Growth comes from challenges." |

### 4.3 Neutral Messages

| Context | Message Options |
|---------|-----------------|
| Decision - 3 | "Interesting outcome!", "Life is full of nuances.", "Every choice teaches us something." |

### 4.4 Nostalgic Messages

| Context | Message Options |
|---------|-----------------|
| Memory | "A beautiful memory!", "Cherish this moment.", "Memories last forever." |

---

## 5. Animation Specifications

### 5.1 Celebration (Confetti + Sparkles)

| Element | Duration | Easing | Details |
|---------|----------|--------|---------|
| Confetti burst | 2000ms | ease-out | 50+ particles, physics-based fall |
| Sparkles | 1500ms | linear | Random positions, twinkle |
| Message fade in | 300ms | ease-out | Center of screen |
| Background glow | 500ms | ease-in-out | Radial gradient pulse |

### 5.2 Encouraging (Soft Glow)

| Element | Duration | Easing | Details |
|---------|----------|--------|---------|
| Gradient shift | 2000ms | linear | Warm colors transition |
| Floating hearts | 2500ms | ease-in-out | 5-10 hearts, float upward |
| Message fade in | 400ms | ease-out | Gentle appearance |

### 5.3 Neutral (Shimmer)

| Element | Duration | Easing | Details |
|---------|----------|--------|---------|
| Shimmer wave | 1500ms | linear | Horizontal sweep |
| Bubbles | 2000ms | ease-out | Float upward, pop |
| Message fade in | 300ms | ease-out | Center |

### 5.4 Nostalgic (Warm Glow)

| Element | Duration | Easing | Details |
|---------|----------|--------|---------|
| Sepia overlay | 500ms | ease-in | Full screen tint |
| Light flares | 2500ms | ease-in-out | Lens flare effect |
| Photo frames | 2000ms | ease-out | Float and rotate slightly |
| Message fade in | 400ms | ease-out | Center |

---

## 6. Skip Behavior

```mermaid
flowchart TD
    A[Animation playing] --> B{User taps screen?}

    B -->|Yes| C[Stop current animations]
    C --> D[Fade out quickly - 200ms]
    D --> E[Proceed to next step]

    B -->|No - wait| F[Animation completes naturally]
    F --> G[Hold final frame 500ms]
    G --> E
```

---

## 7. Implementation Notes

### 7.1 Lottie vs Custom Animation

| Approach | Pros | Cons |
|----------|------|------|
| Lottie | Pre-made, smooth, easy | File size, limited customization |
| Reanimated | Full control, smaller | More dev time |
| Hybrid | Best of both | Complexity |

**Recommendation:** Use Lottie for complex effects (confetti, sparkles), Reanimated for simple transitions.

### 7.2 Performance Considerations

| Consideration | Solution |
|---------------|----------|
| Many particles | Limit to 50-100 |
| Frame rate | Target 60fps, degrade gracefully |
| Memory | Cleanup animations after complete |
| Low-end devices | Reduce particle count |

---

## 8. Sound Effects (Optional)

| Effect | Sound |
|--------|-------|
| Celebration | Pop/chime sound |
| Encouraging | Soft harp/chime |
| Neutral | Subtle ding |
| Nostalgic | Soft music box note |

Note: Sounds optional, respect device silent mode.

---

## 9. Haptic Feedback

| Effect | Haptic |
|--------|--------|
| Celebration start | Medium impact |
| Celebration peak | Heavy impact |
| Encouraging | Light impact |
| Neutral | Light impact |
| Nostalgic | Medium impact |

---

## 10. Edge Cases

| Case | Handling |
|------|----------|
| Skip immediately | Quick fade, proceed |
| Animation error | Skip to next, no crash |
| Low memory | Reduce particle count |
| Background mid-animation | Complete in background, proceed on resume |
| Screen rotate | Maintain animation, adjust layout |

---

## 11. Post-Effect Navigation

```mermaid
flowchart TD
    A[Effect complete] --> B[Update DB: status = opened]
    B --> C[Set openedAt timestamp]
    C --> D[Clear capsule from Home list]
    D --> E[Add capsule to Archive]
    E --> F[Navigate to Home]
    F --> G[Show toast: Capsule archived]
```

---

## 12. Accessibility

| Feature | Implementation |
|---------|----------------|
| Motion sensitivity | Reduce motion option - skip effects |
| Screen reader | Announce message text |
| Skip hint | Show "tap to skip" text |
| Color contrast | Ensure message readable |

---

*Flow End*
