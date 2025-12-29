# F6: Capsule Timer - Activity Diagram

**Feature ID:** F6
**Priority:** Must Have
**Dependencies:** F5 (Lock Capsule)

---

## 1. Overview

Hien thi countdown timer cho moi capsule dang bi khoa. Timer update real-time va tu dong chuyen status tu 'locked' sang 'ready' khi het thoi gian.

---

## 2. Main Activity Diagram

```mermaid
flowchart TD
    A[Capsule Locked] --> B[Calculate time remaining]
    B --> C{Time remaining > 0?}

    C -->|Yes| D[Display countdown]
    C -->|No| E[Update status to ready]

    D --> F{Time remaining format?}

    F -->|> 1 day| G[Format: Xd Yh Zm]
    F -->|< 1 day, > 1 hour| H[Format: Xh Ym Zs]
    F -->|< 1 hour| I[Format: Xm Ys]
    F -->|< 1 minute| J[Format: Xs]

    G --> K[Update every 60 seconds]
    H --> L[Update every 1 second]
    I --> L
    J --> L

    K --> M{Time remaining > 1 day?}
    M -->|Yes| K
    M -->|No| L

    L --> N{Time remaining > 0?}
    N -->|Yes| L
    N -->|No| E

    E --> O[Show Ready to Open badge]
```

---

## 3. Timer Calculation Flow

```mermaid
flowchart TD
    A[Get unlockAt timestamp] --> B[Get current timestamp]
    B --> C[remaining = unlockAt - current]

    C --> D{remaining <= 0?}
    D -->|Yes| E[Return: Ready]
    D -->|No| F[Calculate components]

    F --> G[days = floor remaining / 86400]
    G --> H[hours = floor remaining % 86400 / 3600]
    H --> I[minutes = floor remaining % 3600 / 60]
    I --> J[seconds = remaining % 60]

    J --> K[Format based on largest unit]
    K --> L[Return formatted string]
```

---

## 4. Timer Update Strategy

```mermaid
sequenceDiagram
    participant S as Screen
    participant T as Timer Hook
    participant DB as Database

    S->>T: Mount component
    T->>T: Calculate initial countdown

    alt More than 1 day remaining
        loop Every 60 seconds
            T->>T: Recalculate countdown
            T->>S: Update display
        end
    else Less than 1 day remaining
        loop Every 1 second
            T->>T: Recalculate countdown
            T->>S: Update display
        end
    end

    T->>T: Countdown reaches 0
    T->>DB: Update status = ready
    T->>S: Show Ready badge
    S->>S: Enable capsule tap
```

---

## 5. Background Status Check

```mermaid
flowchart TD
    A[App comes to foreground] --> B[Query locked capsules]
    B --> C[For each capsule]

    C --> D{unlockAt <= now?}
    D -->|Yes| E[UPDATE status = ready]
    D -->|No| F[Keep status = locked]

    E --> G{More capsules?}
    F --> G

    G -->|Yes| C
    G -->|No| H[Refresh UI]
    H --> I[Updated capsules show Ready badge]
```

---

## 6. Timer Display Formats

### 6.1 Long Duration (> 1 day)

```
+------------------+
|  [Capsule Icon]  |
|                  |
|   30d 5h 45m     |  <- Days, hours, minutes
|                  |
|  [Lock Icon]     |
+------------------+
```

### 6.2 Medium Duration (< 1 day, > 1 hour)

```
+------------------+
|  [Capsule Icon]  |
|                  |
|   5:30:45        |  <- Hours:Minutes:Seconds
|                  |
|  [Lock Icon]     |
+------------------+
```

### 6.3 Short Duration (< 1 hour)

```
+------------------+
|  [Capsule Icon]  |
|                  |
|   45:30          |  <- Minutes:Seconds
|                  |
|  [Lock Icon]     |
+------------------+
```

### 6.4 Very Short (< 1 minute)

```
+------------------+
|  [Capsule Icon]  |
|                  |
|   30s            |  <- Seconds only
|                  |
|  [Lock Icon]     |
+------------------+
```

### 6.5 Ready State

```
+------------------+
|  [Capsule Icon]  |
|                  |
|  Ready to Open!  |  <- No countdown
|                  |
|  [Unlock Icon]   |
+------------------+
```

---

## 7. Timer State Machine

```mermaid
stateDiagram-v2
    [*] --> Locked: Capsule created

    Locked --> DaysRemaining: > 1 day left
    Locked --> HoursRemaining: < 1 day left

    DaysRemaining --> DaysRemaining: Update every 60s
    DaysRemaining --> HoursRemaining: < 1 day left

    HoursRemaining --> HoursRemaining: Update every 1s
    HoursRemaining --> Ready: Time reached 0

    Ready --> [*]: Capsule opened
```

---

## 8. Timer Hook Implementation Concept

```typescript
interface TimerState {
  remaining: number;      // seconds
  formatted: string;      // display string
  isReady: boolean;
  updateInterval: number; // 1000 or 60000 ms
}

function useCountdown(unlockAt: number): TimerState {
  // Calculate remaining time
  // Set appropriate update interval
  // Return formatted string
  // Auto-update status when ready
}
```

---

## 9. Performance Optimizations

| Optimization | Description |
|--------------|-------------|
| Conditional interval | 60s updates for long duration, 1s for short |
| Batch updates | Update all capsule timers in single render |
| Cleanup on unmount | Clear interval when component unmounts |
| Memoization | Memoize format function |
| Lazy calculation | Only calculate visible capsules |

---

## 10. Edge Cases

| Case | Handling |
|------|----------|
| App in background | No updates, check on foreground |
| Device clock changed | Recalculate on foreground |
| Multiple capsules same time | All become ready simultaneously |
| Unlock time in past (after install) | Immediately show Ready |
| Very long duration (years) | Show in days, warn about notification reliability |
| Negative remaining time | Show Ready, update status |

---

## 11. Timer Accuracy

| Scenario | Accuracy |
|----------|----------|
| > 1 day remaining | +/- 60 seconds |
| < 1 day remaining | +/- 1 second |
| Status transition | Within 1 second of actual time |

---

## 12. Visual Transitions

| Transition | Animation |
|------------|-----------|
| Number change | No animation (direct update) |
| Format change (days -> hours) | Subtle pulse |
| Locked -> Ready | Badge appears with scale animation |
| Color change near ready | Gradual color shift in last hour |

---

## 13. Accessibility

| Element | Accessibility |
|---------|---------------|
| Countdown text | Announce "X days Y hours remaining" |
| Ready badge | Announce "Capsule is ready to open" |
| Timer updates | Don't announce every second (too noisy) |

---

## 14. Sync with Database

```mermaid
flowchart TD
    A[Timer shows 0] --> B[Update capsule in DB]
    B --> C[SET status = ready]
    C --> D[Refresh capsule in UI state]
    D --> E[Re-render with Ready badge]
```

---

*Flow End*
