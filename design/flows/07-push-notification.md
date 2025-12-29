# F7: Push Notification - Activity Diagram

**Feature ID:** F7
**Priority:** Must Have
**Dependencies:** F5 (Lock Capsule)

---

## 1. Overview

Gu thong bao day (local push notification) khi capsule den thoi gian mo. Su dung Expo Notifications de schedule notification tai thoi diem lock capsule.

---

## 2. Permission Request Flow

```mermaid
flowchart TD
    A[First capsule creation] --> B[Check permission status]

    B --> C{Permission status?}

    C -->|undetermined| D[Show permission explanation]
    D --> E[Request permission]
    E --> F{User response?}

    F -->|Allow| G[Save status: granted]
    F -->|Deny| H[Save status: denied]

    C -->|granted| I[Permission OK]
    C -->|denied| J[Show info: notifications disabled]

    G --> I
    H --> J

    I --> K[Continue with capsule creation]
    J --> K

    K --> L[Schedule notification if permitted]
```

---

## 3. Notification Scheduling Flow

```mermaid
flowchart TD
    A[Capsule locked successfully] --> B{Notification permission?}

    B -->|denied| C[Skip notification]
    C --> D[Log: notification not scheduled]
    D --> E[Capsule works without notification]

    B -->|granted| F[Create notification content]

    F --> G[Set trigger: unlockAt timestamp]
    G --> H[Schedule with Expo Notifications]

    H --> I{Schedule successful?}

    I -->|Yes| J[Get notification identifier]
    J --> K[Save identifier to capsule.notificationId]
    K --> L[Notification scheduled]

    I -->|No| M[Log error]
    M --> N[Continue without notification]

    L --> O[Done]
    N --> O
    E --> O
```

---

## 4. Notification Content by Type

| Capsule Type | Title | Body |
|--------------|-------|------|
| Emotion | Time Capsule Ready! | Your Emotion capsule is ready to open |
| Goal | Time Capsule Ready! | Your Goal capsule is ready to open |
| Memory | Time Capsule Ready! | Your Memory capsule is ready to open |
| Decision | Time Capsule Ready! | Your Decision capsule is ready to open |

---

## 5. Notification Delivery Flow

```mermaid
flowchart TD
    A[Unlock time reached] --> B[System triggers notification]

    B --> C{App state?}

    C -->|Foreground| D[Show in-app alert/banner]
    D --> E[User can tap to navigate]

    C -->|Background| F[Show system notification]
    F --> G[User sees in notification tray]
    G --> H{User taps notification?}

    H -->|Yes| I[Open app]
    I --> J[Navigate to capsule]
    J --> K[F8: Open Capsule Flow]

    H -->|No| L[Notification stays in tray]
    L --> M[User opens app later]
    M --> N[See Ready badge on Home]

    C -->|Killed| F
```

---

## 6. Notification Tap Handler

```mermaid
flowchart TD
    A[User taps notification] --> B[App opens/resumes]
    B --> C[Get notification data]

    C --> D{Has capsuleId?}

    D -->|No| E[Navigate to Home]
    D -->|Yes| F[Query capsule by ID]

    F --> G{Capsule exists?}

    G -->|No| H[Show error: Capsule not found]
    H --> I[Navigate to Home]

    G -->|Yes| J{Capsule status?}

    J -->|ready| K[Navigate to Open Capsule screen]
    K --> L[Pass capsule data]

    J -->|opened| M[Navigate to Archive detail]

    J -->|locked| N[Should not happen]
    N --> O[Navigate to Home]
    O --> P[Show capsule in grid]
```

---

## 7. Notification Data Structure

```typescript
interface NotificationContent {
  title: string;
  body: string;
  data: {
    capsuleId: string;
    capsuleType: CapsuleType;
  };
  sound: 'default';
}

interface NotificationTrigger {
  type: 'date';
  date: Date; // unlockAt timestamp
}
```

---

## 8. Permission Explanation Screen

```
+----------------------------------------+
|                                        |
|         [Bell Icon Animation]          |
|                                        |
|     Stay Connected to Your            |
|        Time Capsules                   |
|                                        |
|  We'll notify you when your capsules  |
|  are ready to open, so you never      |
|  miss a moment from your past self.   |
|                                        |
|  +----------------------------------+  |
|  |        Enable Notifications      |  |
|  +----------------------------------+  |
|                                        |
|          Maybe Later                   |
|                                        |
+----------------------------------------+
```

---

## 9. In-App Notification (Foreground)

```
+----------------------------------------+
|  [Bell] Time Capsule Ready!     [X]   |
|  Your Goal capsule is ready to open   |
|                              [View]    |
+----------------------------------------+
```

---

## 10. Edge Cases

| Case | Handling |
|------|----------|
| Permission denied | Capsule works, no notification |
| User revokes permission later | Scheduled notifications still fire (already scheduled) |
| Device restarted | Expo handles re-scheduling |
| App uninstalled before unlock | Notifications cancelled by OS |
| Notification tap after app killed | Deep link to capsule |
| Multiple capsules same time | Multiple notifications |
| Very far future (years) | Notification may not be reliable |
| Past unlock time | No notification, capsule ready immediately |

---

## 11. Notification Cancellation

```mermaid
flowchart TD
    A[Scenario: Cancel notification] --> B{When to cancel?}

    B -->|Capsule deleted| C[Note: Locked capsules cannot be deleted]
    C --> D[Not applicable for v1]

    B -->|User opens capsule| E[Notification should have fired]
    E --> F[Cancel if still pending]
    F --> G[Notifications.cancelScheduledNotificationAsync id]

    B -->|App uninstalled| H[OS handles cancellation]
```

Note: Trong v1, capsule locked khong the xoa nen khong can cancel notification. Sau khi capsule opened, notification da fire roi.

---

## 12. Permission Status Persistence

```mermaid
flowchart TD
    A[Check permission] --> B[Expo Notifications.getPermissionsAsync]
    B --> C[Get status object]

    C --> D{status.granted?}

    D -->|true| E[Can schedule notifications]
    D -->|false| F{status.canAskAgain?}

    F -->|true| G[Can request again]
    F -->|false| H[Must go to Settings]

    G --> I[Store: undetermined or denied-can-ask]
    H --> J[Store: denied-permanent]
    E --> K[Store: granted]
```

---

## 13. Settings Deep Link

Khi user da deny permission va can enable lai:

```mermaid
flowchart TD
    A[User wants notifications] --> B{Permission denied permanent?}

    B -->|Yes| C[Show dialog]
    C --> D[Explain need to enable in Settings]
    D --> E{User taps Open Settings?}

    E -->|Yes| F[Linking.openSettings]
    F --> G[User enables manually]
    G --> H[Check on app resume]

    E -->|No| I[Continue without notifications]
```

---

## 14. Notification Sound & Vibration

| Setting | Value |
|---------|-------|
| Sound | Default system sound |
| Vibration | Default pattern |
| Badge | Not used (no badge count) |
| Priority | High (important) |

---

## 15. Testing Notification

```mermaid
flowchart TD
    A[Dev/Testing] --> B[Create capsule with 1 minute unlock]
    B --> C[Wait 1 minute]
    C --> D{Notification appears?}

    D -->|Yes| E[Tap notification]
    E --> F[Navigate to capsule]
    F --> G[Test passed]

    D -->|No| H[Check permission]
    H --> I[Check device settings]
    I --> J[Debug]
```

---

*Flow End*
