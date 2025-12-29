# Product Requirements Document (PRD)
# FutureBoxes - Time Capsule App

**Version:** 1.0
**Last Updated:** 2025-12-20
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Feature Table](#2-feature-table)
3. [User Stories & Acceptance Criteria](#3-user-stories--acceptance-criteria)
4. [Non-functional Requirements](#4-non-functional-requirements)
5. [Assumptions & Constraints](#5-assumptions--constraints)

---

## 1. Executive Summary

### 1.1 Vision

FutureBoxes là ứng dụng mobile cho phép người dùng tạo "hộp thời gian" (time capsules) chứa suy nghĩ, cảm xúc, mục tiêu, kỷ niệm và quyết định quan trọng. Mỗi capsule được khóa lại và chỉ mở được khi đến đúng thời điểm đã chọn trong tương lai.

### 1.2 Problem Statement

Con người thường quên đi cảm xúc, suy nghĩ và bối cảnh của những khoảnh khắc quan trọng theo thời gian. Việc nhìn lại quá khứ giúp:
- Đánh giá sự phát triển bản thân
- Học hỏi từ các quyết định đã đưa ra
- Trân trọng những kỷ niệm đẹp
- Động viên bản thân khi đối mặt thử thách

### 1.3 Solution

FutureBoxes cung cấp 4 loại capsule phù hợp với các nhu cầu khác nhau:

| Loại Capsule | Mục đích | Reflection |
|--------------|----------|------------|
| **Emotion** (Cảm xúc) | Ghi lại cảm xúc, suy nghĩ hiện tại | Yes/No |
| **Goal** (Mục tiêu) | Đặt mục tiêu và theo dõi kết quả | Yes/No |
| **Memory** (Kỷ niệm) | Lưu giữ khoảnh khắc đáng nhớ | Không có |
| **Decision** (Quyết định) | Ghi nhận quyết định quan trọng để đánh giá sau | Rating 1-5 |

### 1.4 Target Users

- Người trẻ (18-35 tuổi) muốn ghi lại hành trình cuộc sống
- Người đang theo đuổi mục tiêu cá nhân (học tập, sức khỏe, sự nghiệp)
- Người thích journaling nhưng muốn trải nghiệm mới lạ hơn

### 1.5 Success Metrics

| Metric | Target |
|--------|--------|
| App crash rate | < 0.1% |
| Capsule creation success rate | > 99% |
| Notification delivery rate | > 95% |
| App launch time | < 2 seconds |

---

## 2. Feature Table

| ID | Feature | Description | Priority | Dependencies |
|----|---------|-------------|----------|--------------|
| **F1** | Local Data Storage | Lưu trữ dữ liệu capsules trên device bằng SQLite/AsyncStorage | Must Have | - |
| **F2** | Home Screen | Hiển thị 6 capsules có hạn mở gần nhất (3x2 grid) | Must Have | F1 |
| **F3** | Capsule Type Selection | Chọn 1 trong 4 loại capsule khi tạo mới | Must Have | F1 |
| **F4** | Create Capsule | Tạo capsule với text, ảnh (tối đa 3), câu hỏi reflection, thời gian mở | Must Have | F1, F3 |
| **F5** | Lock Capsule | Khóa capsule sau khi tạo, không cho phép xem/sửa/xóa | Must Have | F4 |
| **F6** | Capsule Timer | Đếm ngược thời gian đến lúc mở capsule | Must Have | F5 |
| **F7** | Push Notification | Thông báo khi capsule đến thời gian mở (Expo Notifications) | Must Have | F5 |
| **F8** | Open Capsule | Mở và xem nội dung capsule khi đến thời gian | Must Have | F5, F6 |
| **F9** | Reflection Response | Trả lời câu hỏi reflection (Yes/No hoặc Rating 1-5) | Must Have | F8 |
| **F10** | Celebration Effects | Hiệu ứng animation sau khi trả lời reflection | Should Have | F9 |
| **F11** | Archive/History | Lưu trữ và hiển thị capsules đã mở | Must Have | F8 |
| **F12** | Delete Opened Capsule | Xóa capsule đã mở khỏi Archive | Should Have | F11 |
| **F13** | Onboarding | Giới thiệu app cho người dùng lần đầu | Should Have | - |
| **F14** | Empty States | UI cho trạng thái không có capsule | Should Have | F2, F11 |

### Feature Dependency Graph

```
F1 (Storage)
 ├── F2 (Home Screen)
 ├── F3 (Type Selection)
 │    └── F4 (Create Capsule)
 │         └── F5 (Lock Capsule)
 │              ├── F6 (Timer)
 │              ├── F7 (Notification)
 │              └── F8 (Open Capsule)
 │                   ├── F9 (Reflection)
 │                   │    └── F10 (Effects)
 │                   └── F11 (Archive)
 │                        └── F12 (Delete)
 └── F14 (Empty States)

F13 (Onboarding) - Independent
```

---

## 3. User Stories & Acceptance Criteria

### F1: Local Data Storage

**User Story:**
> Là người dùng, tôi muốn dữ liệu capsules được lưu trên device để có thể sử dụng app offline mà không cần internet.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 1.1 | Dữ liệu capsule được lưu vào SQLite database trên device | Tạo capsule, tắt app, mở lại - dữ liệu vẫn còn |
| 1.2 | Ảnh được lưu vào local file system với reference trong database | Capsule có ảnh hiển thị đúng sau khi restart app |
| 1.3 | App hoạt động hoàn toàn offline | Bật airplane mode, tạo/xem capsule vẫn hoạt động |
| 1.4 | Dữ liệu persist sau khi update app | Update app version, dữ liệu cũ vẫn còn |

---

### F2: Home Screen

**User Story:**
> Là người dùng, tôi muốn thấy các capsules sắp mở trên màn hình chính để biết những gì đang chờ đợi mình.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 2.1 | Hiển thị tối đa 6 capsules trong layout 3x2 | Tạo 10 capsules, Home chỉ hiển thị 6 |
| 2.2 | Sắp xếp theo thời gian unlock gần nhất (ascending) | Capsule unlock sớm nhất hiển thị đầu tiên |
| 2.3 | Hiển thị cả capsules "locked" và "ready" | Capsule chưa đến giờ và đã đến giờ đều hiển thị |
| 2.4 | Mỗi capsule card hiển thị: icon loại, countdown/ready badge | Nhìn card biết được loại và trạng thái |
| 2.5 | Tap vào capsule "ready" để mở | Tap capsule đã đến giờ -> chuyển sang Open screen |
| 2.6 | Tap vào capsule "locked" hiển thị thông báo chưa đến giờ | Tap capsule chưa đến giờ -> show message |
| 2.7 | Có nút FAB (+) để tạo capsule mới | Tap FAB -> chuyển sang Create flow |
| 2.8 | Có navigation để vào Archive | Có thể navigate đến màn Archive |

---

### F3: Capsule Type Selection

**User Story:**
> Là người dùng, tôi muốn chọn loại capsule phù hợp với mục đích của mình để có trải nghiệm tối ưu.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 3.1 | Hiển thị 4 loại capsule với icon và mô tả | Thấy rõ 4 options: Emotion, Goal, Memory, Decision |
| 3.2 | Mỗi loại có visual distinction (màu/icon khác nhau) | Phân biệt được các loại bằng mắt |
| 3.3 | Tap để chọn loại, có highlight trạng thái selected | Tap 1 loại -> highlight, tap loại khác -> switch |
| 3.4 | Có nút Continue sau khi chọn | Chọn loại xong -> tap Continue -> sang bước tiếp |
| 3.5 | Không thể continue nếu chưa chọn loại | Chưa chọn loại -> nút Continue disabled |

---

### F4: Create Capsule

**User Story:**
> Là người dùng, tôi muốn tạo capsule với nội dung text, ảnh, câu hỏi reflection và thời gian mở để gửi tin nhắn cho tương lai.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 4.1 | Nhập nội dung text (required, max 2000 ký tự) | Không nhập text -> không thể tạo; vượt 2000 -> truncate/warning |
| 4.2 | Chọn ảnh từ gallery (optional, max 3 ảnh) | Chọn được 1-3 ảnh, chọn ảnh thứ 4 -> blocked |
| 4.3 | Xóa ảnh đã chọn | Tap X trên ảnh -> ảnh bị xóa khỏi selection |
| 4.4 | Nhập câu hỏi reflection (required cho Emotion/Goal/Decision) | Loại Memory -> không có field này; các loại khác -> required |
| 4.5 | Chọn ngày giờ mở trong tương lai | Chọn thời gian quá khứ -> show error |
| 4.6 | Date picker thân thiện với các preset (1 tuần, 1 tháng, 1 năm) | Có quick options + custom date picker |
| 4.7 | Preview capsule trước khi lock | Xem lại toàn bộ nội dung trước khi confirm |
| 4.8 | Confirm để lock capsule | Tap Lock -> confirmation dialog -> lock |

---

### F5: Lock Capsule

**User Story:**
> Là người dùng, tôi muốn capsule bị khóa hoàn toàn sau khi tạo để đảm bảo tính nguyên bản của tin nhắn.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 5.1 | Sau khi lock, không thể xem nội dung capsule | Tap capsule locked -> chỉ thấy countdown, không thấy content |
| 5.2 | Không thể chỉnh sửa capsule đã lock | Không có option edit cho capsule locked |
| 5.3 | Không thể xóa capsule đã lock | Không có option delete cho capsule locked |
| 5.4 | Hiển thị animation/effect khi lock thành công | Lock xong -> có visual feedback (animation hộp đóng lại) |
| 5.5 | Capsule status chuyển sang "locked" | Database record có status = "locked" |
| 5.6 | Schedule notification cho thời gian unlock | Notification được schedule với Expo |

---

### F6: Capsule Timer

**User Story:**
> Là người dùng, tôi muốn thấy thời gian còn lại đến khi capsule mở để có sự mong đợi và hồi hộp.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 6.1 | Hiển thị countdown dạng: X ngày Y giờ Z phút | Capsule 3 ngày nữa -> "3d 5h 30m" |
| 6.2 | Countdown update real-time (mỗi phút) | Đợi 1 phút -> số phút giảm đi 1 |
| 6.3 | Khi còn < 1 ngày, hiển thị giờ:phút:giây | Còn 5 giờ -> "5:30:45" với seconds ticking |
| 6.4 | Khi hết countdown, status chuyển "ready" | Đến giờ -> capsule hiện badge "Ready to open" |
| 6.5 | Background task check và update status | App ở background, đến giờ vẫn trigger notification |

---

### F7: Push Notification

**User Story:**
> Là người dùng, tôi muốn nhận thông báo khi capsule đến thời gian mở để không bỏ lỡ.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 7.1 | Request notification permission khi cần | Lần đầu tạo capsule -> request permission |
| 7.2 | Schedule local notification bằng Expo Notifications | Notification được schedule thành công |
| 7.3 | Notification hiển thị đúng thời gian unlock | Đến giờ -> notification xuất hiện |
| 7.4 | Notification content: "Your [Type] capsule is ready to open!" | Nội dung notification đúng format |
| 7.5 | Tap notification mở app đến capsule đó | Tap notification -> app mở, navigate đến capsule |
| 7.6 | Notification hoạt động khi app ở background/killed | Tắt app, đến giờ vẫn nhận notification |
| 7.7 | Cancel notification nếu capsule bị xóa (cho opened capsules, nếu có pending) | Không applicable cho v1 (locked không xóa được) |

---

### F8: Open Capsule

**User Story:**
> Là người dùng, tôi muốn mở capsule khi đến thời gian để đọc lại tin nhắn từ quá khứ.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 8.1 | Chỉ có thể mở capsule có status "ready" | Tap capsule locked -> blocked; tap ready -> allowed |
| 8.2 | Animation mở hộp khi bắt đầu | Có visual effect hộp mở ra |
| 8.3 | Hiển thị nội dung text đầy đủ | Text content hiện đúng như lúc tạo |
| 8.4 | Hiển thị ảnh (nếu có) | Ảnh hiển thị đúng, có thể tap để zoom |
| 8.5 | Hiển thị thông tin: ngày tạo, loại capsule | Thấy "Created on [date]", icon loại |
| 8.6 | Sau khi xem xong, chuyển sang Reflection (nếu có) | Loại có reflection -> hiện câu hỏi; Memory -> straight to archive |

---

### F9: Reflection Response

**User Story:**
> Là người dùng, tôi muốn trả lời câu hỏi reflection để đánh giá lại sự kiện/quyết định trong quá khứ.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 9.1 | Hiển thị câu hỏi reflection đã tạo | Câu hỏi hiện đúng như lúc nhập |
| 9.2 | Emotion/Goal: Hiển thị 2 nút Yes/No | 2 nút rõ ràng, dễ tap |
| 9.3 | Decision: Hiển thị rating 1-5 (stars hoặc numbers) | 5 options rating, tap để chọn |
| 9.4 | Phải trả lời mới được tiếp tục (required) | Chưa chọn -> nút Continue disabled |
| 9.5 | Lưu câu trả lời vào database | reflectionAnswer được save |
| 9.6 | Sau khi trả lời -> trigger Celebration Effect | Chọn xong -> animation effect |

---

### F10: Celebration Effects

**User Story:**
> Là người dùng, tôi muốn có hiệu ứng thú vị sau khi trả lời reflection để tạo trải nghiệm cảm xúc.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 10.1 | Yes/Rating 4-5: Hiệu ứng chúc mừng (confetti, sparkles) | Chọn Yes -> confetti animation |
| 10.2 | No/Rating 1-2: Hiệu ứng động viên (gentle, encouraging) | Chọn No -> soft animation + encouraging message |
| 10.3 | Rating 3: Hiệu ứng neutral | Rating 3 -> neutral animation |
| 10.4 | Memory (không có reflection): Hiệu ứng nostalgic | Mở Memory -> warm, nostalgic effect |
| 10.5 | Animation duration: 2-3 giây | Effect không quá dài, không quá ngắn |
| 10.6 | Có thể skip animation | Tap anywhere -> skip to next |
| 10.7 | Sau animation -> capsule chuyển vào Archive | Animation xong -> capsule status = opened, vào Archive |

---

### F11: Archive/History

**User Story:**
> Là người dùng, tôi muốn xem lại các capsules đã mở để hồi tưởng và reflect.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 11.1 | Hiển thị danh sách tất cả capsules đã mở | Tất cả capsule status=opened hiển thị ở đây |
| 11.2 | Sắp xếp theo ngày mở (mới nhất trước) | Capsule mở gần đây nhất ở đầu list |
| 11.3 | Mỗi item hiển thị: loại, ngày tạo, ngày mở, preview text | Đủ thông tin để identify capsule |
| 11.4 | Tap để xem lại chi tiết capsule | Tap -> xem full content + reflection answer |
| 11.5 | Hiển thị câu trả lời reflection (nếu có) | Thấy được "Did you achieve it? Yes" |
| 11.6 | Có thể scroll nếu nhiều capsules | List scrollable |

---

### F12: Delete Opened Capsule

**User Story:**
> Là người dùng, tôi muốn xóa capsules đã mở mà tôi không muốn giữ để dọn dẹp Archive.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 12.1 | Chỉ có thể xóa capsule đã mở (status=opened) | Option delete chỉ available cho opened capsules |
| 12.2 | Confirmation dialog trước khi xóa | "Delete this capsule? This cannot be undone" |
| 12.3 | Xóa capsule và ảnh liên quan khỏi storage | Record và files bị xóa hoàn toàn |
| 12.4 | Update UI sau khi xóa (remove from list) | Capsule biến mất khỏi Archive list |
| 12.5 | Swipe-to-delete gesture (optional) | Swipe left -> reveal delete button |

---

### F13: Onboarding

**User Story:**
> Là người dùng mới, tôi muốn hiểu cách sử dụng app nhanh chóng để bắt đầu tạo capsule đầu tiên.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 13.1 | Hiển thị onboarding khi lần đầu mở app | First launch -> show onboarding |
| 13.2 | 3-4 slides giới thiệu concept và features | Slides ngắn gọn, visual-focused |
| 13.3 | Skip button để bỏ qua | Tap Skip -> straight to Home |
| 13.4 | Sau onboarding, không hiển thị lại | Subsequent launches -> straight to Home |
| 13.5 | Có thể xem lại từ Settings (nếu có) | Nice-to-have, không required |

---

### F14: Empty States

**User Story:**
> Là người dùng, tôi muốn thấy UI thân thiện khi chưa có capsules để biết phải làm gì tiếp theo.

**Acceptance Criteria:**

| # | Criteria | Verification |
|---|----------|--------------|
| 14.1 | Home empty: Illustration + "Create your first capsule" | Không có capsule -> show empty state với CTA |
| 14.2 | Archive empty: Illustration + "No opened capsules yet" | Archive trống -> show empty state |
| 14.3 | Empty states có visual appeal (illustration/icon) | Không chỉ text, có hình ảnh |
| 14.4 | CTA button dẫn đến action phù hợp | Home empty -> button tạo capsule |

---

## 4. Tech Stacks

### 4.1 Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.77.x | Cross-platform mobile framework |
| **Expo** | SDK 52.x | Development platform & tooling |
| **TypeScript** | 5.9.x | Type-safe JavaScript |
| **Node.js** | 20.x LTS | Development runtime |

> **Note**: Expo SDK 52 (released Nov 2024) enables New Architecture by default with React Native 0.77.

### 4.2 Data & Storage

| Technology | Version | Purpose |
|------------|---------|---------|
| **expo-sqlite** | ^16.0.0 | Local SQLite database |
| **expo-file-system** | Latest (SDK 52) | File storage for images |
| **@react-native-async-storage/async-storage** | ^2.0.0 | Key-value storage for settings |

### 4.3 Navigation

| Technology | Version | Purpose |
|------------|---------|---------|
| **@react-navigation/native** | ^7.1.0 | Navigation framework |
| **@react-navigation/stack** | ^7.1.0 | Stack navigator for screens |
| **@react-navigation/bottom-tabs** | ^7.1.0 | Tab navigation (if needed) |
| **react-native-screens** | Latest | Native screen optimization |
| **react-native-safe-area-context** | Latest | Safe area handling |

> **Note**: React Navigation 7.0 released Nov 6, 2024 with static API and improved TypeScript support.

### 4.4 UI & Animations

| Technology | Version | Purpose |
|------------|---------|---------|
| **react-native-reanimated** | ^4.2.0 | High-performance animations (New Architecture only) |
| **react-native-gesture-handler** | Latest | Touch gestures |
| **expo-linear-gradient** | Latest (SDK 52) | Gradient backgrounds |
| **expo-blur** | Latest (SDK 52) | Blur effects (if needed) |
| **expo-haptics** | Latest (SDK 52) | Haptic feedback |
| **lottie-react-native** | ^7.0.0 | Complex animations (celebration effects) |

> **Note**: Reanimated 4.x requires New Architecture. Use 3.x if staying on old architecture.

### 4.5 Media & Permissions

| Technology | Version | Purpose |
|------------|---------|---------|
| **expo-image-picker** | ^17.0.0 | Select images from gallery |
| **expo-image** | ^3.0.0 | Optimized image component |
| **expo-media-library** | Latest (SDK 52) | Access device media |

### 4.6 Notifications & Background Tasks

| Technology | Version | Purpose |
|------------|---------|---------|
| **expo-notifications** | ^0.32.0 | Local push notifications |
| **expo-task-manager** | Latest (SDK 52) | Background tasks |
| **expo-background-fetch** | Latest (SDK 52) | Background updates (timer checks) |

### 4.7 Date & Time

| Technology | Version | Purpose |
|------------|---------|---------|
| **@react-native-community/datetimepicker** | ^8.0.0 | Native date/time picker |
| **date-fns** | ^4.1.0 | Date manipulation library |

> **Note**: date-fns 4.0 (released Sep 2024) includes first-class time zone support.

### 4.8 Icons & Fonts

| Technology | Version | Purpose |
|------------|---------|---------|
| **@expo/vector-icons** | Latest (SDK 52) | Icon library (MaterialIcons, Ionicons) |
| **expo-font** | Latest (SDK 52) | Custom fonts loading |

### 4.9 State Management

| Technology | Version | Purpose |
|------------|---------|---------|
| **zustand** | ^5.0.0 | Lightweight state management |
| **React Context API** | Built-in | Local component state |

### 4.10 Developer Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | ^9.0.0 | Code linting |
| **Prettier** | ^3.0.0 | Code formatting |
| **expo-dev-client** | Latest (SDK 52) | Custom development builds |

### 4.11 Platform Requirements

| Platform | Minimum Version | Target Version |
|----------|-----------------|----------------|
| **iOS** | 13.4+ | iOS 17+ |
| **Android** | API 21 (5.0)+ | API 34 (Android 14)+ |

### 4.12 Development Environment

| Tool | Version | Purpose |
|------|---------|---------|
| **Expo Go** | Latest | Testing on physical devices |
| **Android Studio** | Latest | Android development |
| **Xcode** | 15+ | iOS development (macOS only) |

---

## 5. Assumptions & Constraints

### 5.1 Assumptions

| # | Assumption |
|---|------------|
| A1 | User có smartphone với iOS 13+ hoặc Android 5.0+ |
| A2 | User hiểu concept "time capsule" hoặc sẽ hiểu qua onboarding |
| A3 | User sẽ grant notification permission để nhận thông báo |
| A4 | User sẽ không uninstall app trước khi capsules mở (data sẽ mất) |
| A5 | Device có đủ storage cho ảnh (user responsibility) |
| A6 | System clock của device chính xác (không bị manipulate) |

### 5.2 Constraints

| # | Constraint | Impact |
|---|------------|--------|
| C1 | Không có backend/cloud | Data không sync across devices; mất data nếu uninstall |
| C2 | Local storage only | Giới hạn số lượng capsules bởi device storage |
| C3 | Expo managed workflow | Một số native features có thể bị giới hạn |
| C4 | Offline-only | Không thể backup/restore trong v1 |
| C5 | Không có user account | Không thể recover data nếu đổi device |

### 5.3 Out of Scope (v1)

| Feature | Reason |
|---------|--------|
| Cloud backup/sync | Cần backend infrastructure |
| Share capsule với người khác | Social feature cho v2 |
| Recurring capsules | Complexity, evaluate sau v1 launch |
| Categories/Tags | Evaluate nhu cầu sau v1 |
| Search/Filter | Có thể thêm nếu user có nhiều capsules |
| Camera capture | Chỉ gallery trong v1, camera cho v2 |
| Video/Voice recording | Complexity và storage concerns |
| Multiple languages | English + Vietnamese cho v1 |
| Themes/Customization | Focus vào core experience trước |

### 5.4 Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| User manipulates system clock để mở capsule sớm | Low | Medium | Accept risk - trust-based system |
| Data loss khi uninstall | Medium | High | Warning trong onboarding; backup feature cho v2 |
| Notification không deliver | Low | Medium | In-app indicator cho ready capsules |
| Storage full | Low | Medium | Warning khi add nhiều ảnh |

---

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| Capsule | Một "hộp thời gian" chứa nội dung do user tạo |
| Lock | Hành động đóng capsule, sau đó không thể xem/sửa/xóa |
| Unlock | Thời điểm capsule có thể được mở |
| Ready | Trạng thái capsule đã đến thời gian mở nhưng chưa được mở |
| Reflection | Câu hỏi user tự đặt ra để trả lời khi mở capsule |
| Archive | Nơi lưu trữ các capsules đã mở |

### B. Capsule Type Summary

| Type | Icon Suggestion | Color Suggestion | Reflection Type | Effect Theme |
|------|-----------------|------------------|-----------------|--------------|
| Emotion | Heart/Face | Pink/Purple | Yes/No | Warm/Emotional |
| Goal | Target/Flag | Green/Blue | Yes/No | Achievement/Celebration |
| Memory | Camera/Photo | Orange/Yellow | None | Nostalgic/Warm |
| Decision | Scale/Crossroads | Blue/Gray | Rating 1-5 | Reflective/Thoughtful |

---

*Document End*
