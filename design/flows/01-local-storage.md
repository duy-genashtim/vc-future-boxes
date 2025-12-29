# F1: Local Data Storage - Activity Diagram

**Feature ID:** F1
**Priority:** Must Have
**Dependencies:** None

---

## 1. Overview

Feature nay la foundation cho toan bo app. Cung cap kha nang luu tru va truy xuat du lieu capsule tren local device su dung SQLite.

---

## 2. Activity Diagram - Database Initialization

```mermaid
flowchart TD
    A[App Launch] --> B{First Launch?}
    B -->|Yes| C[Create Database File]
    B -->|No| D[Open Existing Database]

    C --> E[Enable Foreign Keys]
    E --> F[Create Tables]
    F --> G[Create Indexes]
    G --> H[Set Schema Version]
    H --> I[Database Ready]

    D --> J{Schema Version Check}
    J -->|Current| I
    J -->|Outdated| K[Run Migrations]
    K --> L[Update Schema Version]
    L --> I

    I --> M[App Continue]

    subgraph Error Handling
        C -->|Error| ERR1[Log Error]
        F -->|Error| ERR1
        K -->|Error| ERR1
        ERR1 --> ERR2[Show Error Screen]
        ERR2 --> ERR3[Offer Retry/Reset]
    end
```

---

## 3. Activity Diagram - Save Capsule Data

```mermaid
flowchart TD
    A[User tao capsule] --> B[Validate Input Data]
    B -->|Invalid| C[Return Validation Errors]
    C --> A

    B -->|Valid| D[Generate UUID cho capsule]
    D --> E{Co anh khong?}

    E -->|Yes| F[Copy anh vao local storage]
    F --> G[Generate UUID cho moi anh]
    G --> H[Tao folder capsule_images/capsuleId]
    H --> I[Save anh voi ten 0.jpg, 1.jpg, 2.jpg]

    E -->|No| J[Skip image processing]
    I --> J

    J --> K[Begin Transaction]
    K --> L[INSERT capsule record]
    L --> M{Co anh?}

    M -->|Yes| N[INSERT capsule_image records]
    M -->|No| O[Skip image insert]
    N --> O

    O --> P[Commit Transaction]
    P --> Q[Schedule Notification]
    Q --> R[Update notificationId in DB]
    R --> S[Return Success + Capsule Data]

    subgraph Error Handling
        F -->|Copy Failed| ERR1[Rollback]
        L -->|Insert Failed| ERR1
        N -->|Insert Failed| ERR1
        ERR1 --> ERR2[Delete copied images]
        ERR2 --> ERR3[Return Error]
    end
```

---

## 4. Activity Diagram - Load Capsule Data

```mermaid
flowchart TD
    A[Request Load Capsules] --> B{Query Type?}

    B -->|Home Screen| C[Query: status IN locked,ready ORDER BY unlockAt LIMIT 6]
    B -->|Archive| D[Query: status = opened ORDER BY openedAt DESC]
    B -->|Single Capsule| E[Query: WHERE id = ?]

    C --> F[Execute Query]
    D --> F
    E --> F

    F --> G[Fetch capsule records]
    G --> H{Has Results?}

    H -->|No| I[Return Empty Array]
    H -->|Yes| J[For each capsule]

    J --> K[Query capsule_image WHERE capsuleId = ?]
    K --> L[Attach images to capsule object]
    L --> M{More capsules?}

    M -->|Yes| J
    M -->|No| N[Return Capsule Array]

    subgraph Error Handling
        F -->|Query Error| ERR1[Log Error]
        K -->|Query Error| ERR1
        ERR1 --> ERR2[Return Error/Empty]
    end
```

---

## 5. Activity Diagram - Delete Capsule Data

```mermaid
flowchart TD
    A[Request Delete Capsule] --> B{Capsule Status?}

    B -->|locked or ready| C[Return Error: Cannot delete locked capsule]
    B -->|opened| D[Begin Transaction]

    D --> E[Get capsule images URIs]
    E --> F[DELETE FROM capsule WHERE id = ?]
    F --> G[CASCADE deletes capsule_image records]
    G --> H[Commit Transaction]

    H --> I[Delete image files from storage]
    I --> J[Delete folder capsule_images/capsuleId]
    J --> K[Return Success]

    subgraph Error Handling
        F -->|Delete Failed| ERR1[Rollback Transaction]
        I -->|File Delete Failed| ERR2[Log Warning - orphan files]
        ERR1 --> ERR3[Return Error]
    end
```

---

## 6. Activity Diagram - Update Capsule Status

```mermaid
flowchart TD
    A[Timer Trigger / App Foreground] --> B[Query: status = locked AND unlockAt <= now]
    B --> C{Found capsules?}

    C -->|No| D[No action needed]
    C -->|Yes| E[For each capsule]

    E --> F[UPDATE status = ready]
    F --> G{More capsules?}

    G -->|Yes| E
    G -->|No| H[Trigger UI Refresh]
    H --> I[Done]

    subgraph Error Handling
        F -->|Update Failed| ERR1[Log Error]
        ERR1 --> G
    end
```

---

## 7. User Interaction Flow

### 7.1 Khi nao data duoc save?
- Sau khi user tap "Lock" va confirm tao capsule
- Reflection answer duoc save khi user tra loi

### 7.2 Khi nao data duoc load?
- App launch: Load home screen capsules
- Navigate to Archive: Load opened capsules
- Tap vao capsule: Load single capsule detail

### 7.3 Khi nao data duoc delete?
- Chi khi user xoa capsule da mo (status = opened)
- User confirm trong dialog truoc khi xoa

---

## 8. Offline Behavior

| Scenario | Behavior |
|----------|----------|
| No internet | App hoat dong binh thuong (100% offline) |
| Airplane mode | Tat ca features hoat dong |
| Low storage | Warning khi save anh, block neu khong du |

---

## 9. Data Persistence Guarantees

| Event | Data Status |
|-------|-------------|
| App restart | Data van con |
| Device restart | Data van con |
| App update | Data van con (migration if needed) |
| App uninstall | Data bi XOA |
| Clear app data | Data bi XOA |

---

## 10. Edge Cases

| Case | Handling |
|------|----------|
| Database corruption | Show error, offer reset option |
| Storage full | Block save, show warning |
| Invalid data in DB | Skip invalid records, log error |
| Concurrent access | SQLite handles via locking |
| Large content (2000 chars) | Accepted, no truncation |

---

*Flow End*
