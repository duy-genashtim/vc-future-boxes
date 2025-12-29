# F12: Delete Opened Capsule - Activity Diagram

**Feature ID:** F12
**Priority:** Should Have
**Dependencies:** F11 (Archive/History)

---

## 1. Overview

Cho phep user xoa capsule da mo (status = opened) khoi Archive. Chi capsule da opened moi co the xoa - capsule locked/ready khong the xoa.

---

## 2. Main Activity Diagram

```mermaid
flowchart TD
    A[User wants to delete capsule] --> B{Capsule status?}

    B -->|locked or ready| C[Delete not allowed]
    C --> D[No delete option shown]

    B -->|opened| E[Delete option available]
    E --> F{User initiates delete?}

    F -->|Tap delete icon| G[Show confirmation dialog]
    F -->|Swipe to delete| G

    G --> H{User confirms?}

    H -->|Cancel| I[Close dialog]
    I --> J[Return to previous state]

    H -->|Confirm Delete| K[Begin deletion process]

    K --> L[Get capsule images from DB]
    L --> M[Begin DB transaction]
    M --> N[DELETE capsule record]
    N --> O[CASCADE deletes capsule_image records]
    O --> P[Commit transaction]

    P --> Q{Delete images from filesystem?}
    Q -->|Images exist| R[Delete image files]
    Q -->|No images| S[Skip file deletion]

    R --> T[Delete folder capsule_images/capsuleId]
    S --> U[Update UI]
    T --> U

    U --> V[Remove capsule from Archive list]
    V --> W[Show success toast]
    W --> X[Done]

    subgraph Error Handling
        N -->|DB Error| ERR1[Rollback transaction]
        R -->|File Error| ERR2[Log warning - orphan files]
        ERR1 --> ERR3[Show error message]
        ERR3 --> J
    end
```

---

## 3. Delete Initiation Methods

### 3.1 Delete from Detail Screen

```mermaid
flowchart TD
    A[Archive Detail Screen] --> B[User taps delete icon in header]
    B --> C[Show confirmation dialog]
```

### 3.2 Swipe to Delete (Optional)

```mermaid
flowchart TD
    A[Archive List Screen] --> B[User swipes left on item]
    B --> C[Reveal delete button]
    C --> D{User taps delete button?}

    D -->|Yes| E[Show confirmation dialog]
    D -->|No - release swipe| F[Hide delete button]
```

---

## 4. Confirmation Dialog

```
+----------------------------------+
|                                  |
|     Delete this capsule?         |
|                                  |
|  This action cannot be undone.   |
|  All content and images will     |
|  be permanently deleted.         |
|                                  |
|  +------------+  +------------+  |
|  |   Cancel   |  |   Delete   |  |
|  +------------+  +------------+  |
|                                  |
+----------------------------------+
```

---

## 5. Swipe-to-Delete UI

```
Normal state:
+----------------------------------+
| [Icon] Emotion Capsule           |
| Created: Nov 25, 2024            |
| "Today I felt..."                |
+----------------------------------+

Swiped state:
+----------------------------------+
| [Icon] Emotion Caps... | [DELETE]|
| Created: Nov 25, 2024  |  [Red]  |
| "Today I felt..."      |         |
+----------------------------------+
```

---

## 6. Deletion Process

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UI
    participant DB as Database
    participant FS as FileSystem

    U->>UI: Confirm delete
    UI->>DB: BEGIN TRANSACTION

    DB->>DB: Get image URIs for capsuleId
    DB->>DB: DELETE FROM capsule WHERE id = ?
    Note over DB: ON DELETE CASCADE removes capsule_image

    DB->>UI: Commit success

    UI->>FS: Delete image files
    FS->>FS: Remove folder capsule_images/{id}
    FS-->>UI: Files deleted (or warning)

    UI->>UI: Remove item from list
    UI->>U: Show success toast
```

---

## 7. Delete SQL

```sql
-- Transaction block
BEGIN TRANSACTION;

-- Capsule_image records will be deleted automatically due to ON DELETE CASCADE
DELETE FROM capsule
WHERE id = ? AND status = 'opened';

COMMIT;
```

---

## 8. File Deletion

```mermaid
flowchart TD
    A[Get capsuleId] --> B[Construct folder path]
    B --> C[Path: documentDirectory/capsule_images/capsuleId/]

    C --> D{Folder exists?}

    D -->|Yes| E[Delete folder recursively]
    E --> F{Delete successful?}

    F -->|Yes| G[Log: Files deleted]
    F -->|No| H[Log warning: orphan files]

    D -->|No| I[No files to delete]

    G --> J[Continue]
    H --> J
    I --> J
```

---

## 9. UI Update After Delete

### 9.1 From Detail Screen

```mermaid
flowchart TD
    A[Delete confirmed] --> B[Deletion complete]
    B --> C[Navigate back to Archive list]
    C --> D[List refreshes without deleted item]
    D --> E[Show toast: Capsule deleted]
```

### 9.2 From List (Swipe)

```mermaid
flowchart TD
    A[Delete confirmed] --> B[Deletion complete]
    B --> C[Animate item removal]
    C --> D[List updates in place]
    D --> E[Show toast: Capsule deleted]
```

---

## 10. Item Removal Animation

| Animation | Duration | Effect |
|-----------|----------|--------|
| Slide out | 300ms | Item slides to left |
| Collapse | 200ms | Gap collapses |
| Toast appear | 200ms | From bottom |
| Toast disappear | 200ms | Fade out after 2s |

---

## 11. Edge Cases

| Case | Handling |
|------|----------|
| Delete last capsule | Show Empty State after deletion |
| Delete while offline | Works (local database) |
| Delete fails mid-process | Rollback, show error |
| Image file not found | Log warning, continue |
| User spams delete button | Disable after first tap |
| Capsule not found (race) | Show error, refresh list |

---

## 12. Restrictions

| Status | Can Delete? | Reason |
|--------|-------------|--------|
| locked | No | Preserve commitment |
| ready | No | Preserve commitment |
| opened | Yes | User choice to clean up |

---

## 13. Undo (Not Implemented)

v1 does not support undo. Once deleted, data is permanently gone.

Future enhancement could include:
- Soft delete with trash/recovery period
- Export before delete option

---

## 14. Success Toast

```
+----------------------------------------+
|                                        |
|  [Check icon] Capsule deleted          |
|                                        |
+----------------------------------------+
```

Duration: 2 seconds, auto-dismiss.

---

## 15. Error Handling

### 15.1 Database Error

```
+----------------------------------+
|                                  |
|     Failed to delete            |
|                                  |
|  Something went wrong. Please    |
|  try again.                      |
|                                  |
|         +------------+           |
|         |     OK     |           |
|         +------------+           |
|                                  |
+----------------------------------+
```

### 15.2 File Error (Non-blocking)

- Log warning to console
- Continue with success (data is deleted)
- Orphan files may remain (acceptable)

---

## 16. Accessibility

| Element | Accessibility |
|---------|---------------|
| Delete icon | Label: "Delete capsule" |
| Swipe action | Accessible alternative: long press → menu |
| Confirmation dialog | Focus trapped in dialog |
| Cancel button | Label: "Cancel" |
| Delete button | Label: "Delete permanently" |

---

## 17. Haptic Feedback

| Action | Haptic |
|--------|--------|
| Swipe reveal | Light |
| Tap delete button | Light |
| Delete confirmed | Medium (warning) |
| Delete complete | Light |

---

*Flow End*
