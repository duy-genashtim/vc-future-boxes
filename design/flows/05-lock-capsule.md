# F5: Lock Capsule - Activity Diagram

**Feature ID:** F5
**Priority:** Must Have
**Dependencies:** F4 (Create Capsule)

---

## 1. Overview

Sau khi user xac nhan tao capsule, he thong se khoa capsule lai. Capsule bi khoa se khong the xem noi dung, sua doi hoac xoa cho den khi den thoi gian mo.

---

## 2. Main Activity Diagram

```mermaid
flowchart TD
    A[User tap Lock Capsule] --> B[Show Confirmation Dialog]

    B --> C{User confirm?}
    C -->|No| D[Close dialog]
    D --> E[Return to Preview]

    C -->|Yes| F[Show Locking Animation]
    F --> G[Generate Capsule UUID]
    G --> H[Prepare capsule data]

    H --> I{Has images?}
    I -->|Yes| J[Copy images to local storage]
    J --> K[Generate image records]
    I -->|No| L[Skip image processing]

    K --> M[Begin DB Transaction]
    L --> M

    M --> N[INSERT capsule record]
    N --> O{Images to save?}

    O -->|Yes| P[INSERT capsule_image records]
    O -->|No| Q[Skip image insert]

    P --> R[Commit Transaction]
    Q --> R

    R --> S[Schedule Push Notification]
    S --> T{Notification scheduled?}

    T -->|Yes| U[UPDATE capsule.notificationId]
    T -->|No| V[Log warning - continue anyway]

    U --> W[Show Lock Success Animation]
    V --> W

    W --> X[Navigate to Home Screen]
    X --> Y[Home shows new capsule]

    subgraph Error Handling
        J -->|Copy failed| ERR1[Show error]
        N -->|Insert failed| ERR2[Rollback transaction]
        ERR1 --> ERR3[Offer retry]
        ERR2 --> ERR3
        ERR3 --> E
    end
```

---

## 3. Lock Animation Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant S as Screen
    participant A as Animation
    participant DB as Database

    U->>S: Tap Lock button
    S->>A: Start lock animation

    A->>A: Show capsule box
    A->>A: Box closing animation (0.5s)
    A->>A: Lock icon appears (0.3s)
    A->>A: Sparkle effect (0.5s)

    Note over A: Total animation: ~1.3s

    par Animation running
        A->>A: Continue animation
    and Database operations
        S->>DB: Save capsule
        DB-->>S: Success
        S->>DB: Schedule notification
    end

    A->>S: Animation complete
    S->>U: Show success message
    S->>U: Navigate to Home
```

---

## 4. Confirmation Dialog

```
+----------------------------------+
|                                  |
|     Lock this capsule?           |
|                                  |
|  Once locked, you cannot view,   |
|  edit, or delete this capsule    |
|  until it opens on:              |
|                                  |
|  December 25, 2025 at 9:00 AM    |
|                                  |
|  +------------+  +------------+  |
|  |   Cancel   |  |    Lock    |  |
|  +------------+  +------------+  |
|                                  |
+----------------------------------+
```

---

## 5. Lock Success Screen/Animation

```
+----------------------------------------+
|                                        |
|                                        |
|              [Box Icon]                |
|            closing animation           |
|                                        |
|              [Lock Icon]               |
|                 click!                 |
|                                        |
|           Capsule Locked!              |
|                                        |
|    Your capsule will open in          |
|           30 days                      |
|                                        |
|                                        |
+----------------------------------------+
```

---

## 6. Data Flow

```mermaid
flowchart LR
    A[Create Form Data] --> B[Validate]
    B --> C[Transform to DB format]

    C --> D[capsule record]
    D --> E{id: UUID}
    D --> F{type: from selection}
    D --> G{status: locked}
    D --> H{content: user text}
    D --> I{reflectionQuestion: user input}
    D --> J{unlockAt: timestamp}
    D --> K{createdAt: now}

    C --> L[capsule_image records]
    L --> M{id: UUID each}
    L --> N{capsuleId: capsule.id}
    L --> O{uri: local file path}
    L --> P{sortOrder: 0, 1, 2}
```

---

## 7. Notification Scheduling

```mermaid
flowchart TD
    A[Capsule saved to DB] --> B[Check notification permission]

    B --> C{Permission status?}

    C -->|granted| D[Schedule notification]
    C -->|undetermined| E[Request permission]
    C -->|denied| F[Skip notification]

    E --> G{User grants?}
    G -->|Yes| D
    G -->|No| F

    D --> H[Create notification content]
    H --> I[Title: Time Capsule Ready!]
    H --> J[Body: Your TYPE capsule is ready to open]
    H --> K[Trigger: unlockAt timestamp]

    I --> L[expo-notifications schedule]
    J --> L
    K --> L

    L --> M[Get notification ID]
    M --> N[Save ID to capsule record]

    F --> O[Log: notification skipped]
    O --> P[Capsule still works, just no push]
```

---

## 8. Capsule Status After Lock

| Field | Value |
|-------|-------|
| status | 'locked' |
| content | Stored but not accessible via UI |
| images | Stored in local filesystem |
| reflectionQuestion | Stored but not shown |
| reflectionAnswer | NULL |
| unlockAt | Future timestamp |
| createdAt | Now |
| openedAt | NULL |
| notificationId | Expo notification ID or NULL |

---

## 9. Locked Capsule Restrictions

| Action | Allowed? | Reason |
|--------|----------|--------|
| View content | No | Preserve surprise element |
| View images | No | Preserve surprise element |
| Edit content | No | Maintain authenticity |
| Edit unlock date | No | Prevent cheating |
| Delete capsule | No | Preserve commitment |
| See countdown | Yes | Build anticipation |
| See capsule type | Yes | Identification only |

---

## 10. Edge Cases

| Case | Handling |
|------|----------|
| App killed during save | Transaction rollback, no partial data |
| Storage full | Show error before saving |
| Image copy fails | Rollback, show error, allow retry |
| Notification permission denied | Save capsule anyway, warn user |
| Device offline | Works fine (local only) |
| Very long unlock time (years) | Accept, notification may not work |
| Unlock time just passed (race) | Set status to 'ready' immediately |

---

## 11. Animation Specifications

| Animation | Duration | Easing | Description |
|-----------|----------|--------|-------------|
| Box appear | 300ms | ease-out | Scale from 0.8 to 1.0 |
| Box close | 500ms | ease-in-out | Lid closing animation |
| Lock click | 200ms | spring | Lock icon bounces |
| Sparkles | 500ms | linear | Particles radiate outward |
| Success text | 300ms | ease-out | Fade in and slide up |
| Screen transition | 300ms | ease-out | Fade to Home |

---

## 12. Haptic Feedback

| Event | Haptic Type |
|-------|-------------|
| Tap Lock button | Light |
| Lock animation complete | Heavy (success) |
| Error occurs | Error pattern |

---

## 13. Post-Lock Navigation

```mermaid
flowchart TD
    A[Lock complete] --> B[Auto-navigate after 2s]
    B --> C[Navigate to Home Screen]
    C --> D[Home refreshes capsule list]
    D --> E[New capsule visible in grid]
    E --> F[Shows locked status with countdown]
```

---

*Flow End*
