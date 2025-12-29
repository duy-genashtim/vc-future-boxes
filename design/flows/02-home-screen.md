# F2: Home Screen - Activity Diagram

**Feature ID:** F2
**Priority:** Must Have
**Dependencies:** F1 (Local Data Storage)

---

## 1. Overview

Home Screen la man hinh chinh hien thi 6 capsules sap mo nhat trong layout 3x2 grid. User co the tap vao capsule de mo (neu ready) hoac xem thong bao chua den gio (neu locked).

---

## 2. Main Activity Diagram

```mermaid
flowchart TD
    A[Navigate to Home Screen] --> B[Load Capsules from DB]
    B --> C{Query: status IN locked,ready ORDER BY unlockAt LIMIT 6}
    C --> D{Has Capsules?}

    D -->|No| E[Show Empty State F14]
    D -->|Yes| F[Render 3x2 Grid]

    F --> G[For each capsule]
    G --> H{Status?}

    H -->|locked| I[Render Locked Card]
    I --> J[Show countdown timer]

    H -->|ready| K[Render Ready Card]
    K --> L[Show Ready to Open badge]

    J --> M{More capsules?}
    L --> M

    M -->|Yes| G
    M -->|No| N[Grid Complete]

    N --> O[Render FAB Button +]
    O --> P[Render Archive Navigation]
    P --> Q[Screen Ready]

    Q --> R[Start Timer Refresh - Every 60s]
    R --> S[Update countdown displays]
    S --> T{Any status changed to ready?}
    T -->|Yes| U[Refresh Grid]
    T -->|No| R
```

---

## 3. User Interaction - Tap Capsule

```mermaid
flowchart TD
    A[User tap capsule card] --> B{Capsule Status?}

    B -->|locked| C[Show Toast/Modal]
    C --> D[Message: This capsule will unlock in X days]
    D --> E[Dismiss after 2s]
    E --> F[Return to Home]

    B -->|ready| G[Navigate to Open Capsule Screen]
    G --> H[Pass capsule ID as param]
    H --> I[F8: Open Capsule Flow]
```

---

## 4. User Interaction - Create New Capsule

```mermaid
flowchart TD
    A[User tap FAB +] --> B[Navigate to Type Selection]
    B --> C[F3: Capsule Type Selection Flow]
    C --> D{Capsule Created?}

    D -->|Yes| E[Navigate back to Home]
    E --> F[Refresh capsule list]
    F --> G[New capsule appears in grid]

    D -->|No/Cancel| H[Navigate back to Home]
    H --> I[No changes to grid]
```

---

## 5. User Interaction - Navigate to Archive

```mermaid
flowchart TD
    A[User tap Archive button/icon] --> B[Navigate to Archive Screen]
    B --> C[F11: Archive Flow]
```

---

## 6. Capsule Card Display

### 6.1 Locked Capsule Card

```
+---------------------------+
|  [Capsule Type Icon]      |
|                           |
|     3d 5h 30m             |  <- Countdown
|                           |
|  [Lock Icon]              |  <- Visual lock indicator
+---------------------------+
```

### 6.2 Ready Capsule Card

```
+---------------------------+
|  [Capsule Type Icon]      |
|                           |
|   Ready to Open!          |  <- Ready badge
|                           |
|  [Unlock Icon/Glow]       |  <- Visual ready indicator
+---------------------------+
```

---

## 7. Countdown Timer Logic

```mermaid
flowchart TD
    A[Calculate time remaining] --> B{Days > 0?}

    B -->|Yes| C[Format: Xd Yh Zm]
    B -->|No| D{Hours > 0?}

    D -->|Yes| E[Format: Xh Ym Zs]
    D -->|No| F{Minutes > 0?}

    F -->|Yes| G[Format: Xm Ys]
    F -->|No| H{Seconds > 0?}

    H -->|Yes| I[Format: Xs]
    H -->|No| J[Status = Ready]

    subgraph Update Frequency
        C --> K[Update every 60s]
        E --> L[Update every 1s - trong 24h cuoi]
        G --> L
        I --> L
    end
```

---

## 8. Screen Layout

```
+----------------------------------------+
|  FutureBoxes                [Archive]  |  <- Header
+----------------------------------------+
|                                        |
|  +----------+  +----------+            |
|  | Capsule1 |  | Capsule2 |            |  <- Row 1
|  +----------+  +----------+            |
|                                        |
|  +----------+  +----------+            |
|  | Capsule3 |  | Capsule4 |            |  <- Row 2
|  +----------+  +----------+            |
|                                        |
|  +----------+  +----------+            |
|  | Capsule5 |  | Capsule6 |            |  <- Row 3
|  +----------+  +----------+            |
|                                        |
|                              [+]       |  <- FAB
+----------------------------------------+
```

---

## 9. Data Refresh Triggers

| Trigger | Action |
|---------|--------|
| Screen mount | Load capsules from DB |
| App foreground | Refresh list + check status updates |
| After create capsule | Refresh list |
| After open capsule | Refresh list (capsule removed) |
| Timer tick | Update countdown displays |
| Pull to refresh (optional) | Refresh list |

---

## 10. Edge Cases

| Case | Handling |
|------|----------|
| Exactly 6 capsules | Show all 6, no scroll |
| More than 6 capsules | Show top 6 (soonest unlock), rest hidden |
| Less than 6 capsules | Show available, fill grid with empty slots |
| 0 capsules | Show Empty State (F14) |
| Mix of locked and ready | Ready appear in chronological order with locked |
| All capsules are ready | All show Ready to Open badge |
| Capsule becomes ready while viewing | Update card from countdown to Ready badge |

---

## 11. Performance Considerations

| Aspect | Implementation |
|--------|----------------|
| Initial load | Single DB query, fast |
| Timer updates | Only update text, no re-render full card |
| Images | Lazy load card icons only |
| Memory | Max 6 items, minimal footprint |
| Animations | Subtle hover/press states only |

---

## 12. Accessibility

| Element | Accessibility |
|---------|---------------|
| Capsule card | Tappable, describe type and status |
| FAB | Label: "Create new capsule" |
| Archive | Label: "View opened capsules" |
| Countdown | Announce time remaining |

---

*Flow End*
