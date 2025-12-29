# Quy trình phát triển ứng dụng với Claude Code

Tài liệu này mô tả quy trình phát triển ứng dụng FutureBoxes v2 sử dụng mô hình **thác nước rút gọn** với 4 giai đoạn chính: **Requirement → Design → Implementation → Test**.

## Tổng quan

Dự án sử dụng 3 custom agents chuyên biệt:
- **agent-ba** (Business Analyst) - Phân tích yêu cầu và thiết kế hệ thống
- **agent-uiux** (UI/UX Designer) - Thiết kế giao diện và trải nghiệm người dùng
- **agent-react** (React Native Developer) - Triển khai code nghiệp vụ

Agent chính (main) đóng vai trò điều phối và quản lý trạng thái dự án qua các giai đoạn.

---

## Giai đoạn 1: Requirement (Phân tích yêu cầu)

### Mục tiêu
Thu thập và tài liệu hóa yêu cầu dự án thành **Product Requirements Document (PRD)**.

### Quy trình

1. **Agent chính** nhận ý tưởng/yêu cầu dự án từ người dùng
2. **Agent chính** gọi **agent-ba** để:
   - Phân tích yêu cầu chi tiết
   - Khám phá các yêu cầu ngầm định và edge cases
   - Định nghĩa user stories và acceptance criteria
   - Xác định yêu cầu phi chức năng (performance, security, scalability)
3. **agent-ba** cộng tác với người dùng để:
   - Làm rõ các mơ hồ, giả định
   - Đặt câu hỏi sâu về tầm nhìn sản phẩm
   - Ưu tiên tính năng theo MoSCoW
4. **agent-ba** tạo file **PRD.md** với cấu trúc:
   - Executive Summary
   - Feature Table (features có đánh số và có xác định mối quan hệ phụ thuộc)
   - Acceptance Criteria
   - Non-functional Requirements
   - Assumptions & Constraints

### Checkpoint
- ✅ Người dùng xác nhận file **PRD.md**
- ✅ Agent chính cập nhật trạng thái dự án: `Requirement ✓ → Design`

---

## Giai đoạn 2: Design (Thiết kế hệ thống)

### Mục tiêu
Thiết kế kiến trúc hệ thống, database, luồng nghiệp vụ và mô tả screens.

### Quy trình

#### 2.1. System & Flow Design (Agent-ba)

1. **Agent chính** gọi **agent-ba** để thiết kế:

   **A. Database Design**
   - Entity-Relationship Diagrams (ERD) bằng Mermaid
   - Table schemas (fields, data types, constraints, relationships)
   - Indexing strategy
   - Lưu vào: `design/database/schema.md`

   **B. Activity Diagrams**
   Mỗi diagram sẽ:
   - Mô tả chi tiết về tính năng, mô tả cách người dùng sẽ tương tác trên ứng dụng để hoàn thành tính năng.
   - Luồng nghiệp vụ chính của các tính năng
   - Decision points, parallel processes
   - Error handling flows
   - Lưu vào: `design/flows/[feature-number]-[short-name].md`

   **C. System Architecture** (nếu cần)
   - Component diagram
   - API endpoints design
   - State management strategy

2. **Agent-ba** làm việc với người dùng để:
   - Xác nhận các quyết định thiết kế
   - Giải thích trade-offs giữa các phương án
   - Điều chỉnh thiết kế dựa trên feedback

#### 2.2. Screen Descriptions (Agent-uiux)

**Sau khi agent-ba hoàn thành TẤT CẢ activity diagrams:**

1. **Agent chính** gọi **agent-uiux** để tạo mô tả screens với:
   - PRD.md (feature list và requirements)
   - Activity diagrams từ `design/flows/`
   - Design reference (nếu có)

2. **Agent-uiux** tạo file **design/screens.md** với cấu trúc:

   ```markdown
   # Screen Descriptions

   ## [Screen Name]

   ### Mục đích
   [Mô tả ngắn gọn mục đích của screen]

   ### Các thành phần chính
   1. **[Component Name]**
      - Mô tả: [Mô tả component]
      - Tương tác: [Người dùng có thể làm gì với component này]
      - Hiệu ứng: [Animation/transition nếu có]

   2. **[Component Name]**
      - Mô tả: [Mô tả component]
      - Tương tác: [Người dùng có thể làm gì với component này]
      - Hiệu ứng: [Animation/transition nếu có]

   ### Navigation
   - Đến screen này từ: [Danh sách screens]
   - Từ screen này đến: [Danh sách screens]

   ### Ghi chú
   [Các lưu ý đặc biệt về UX, edge cases hiển thị, v.v.]
   ```

3. Mỗi screen phải bao gồm:
   - **Các thành phần UI**: Header, buttons, inputs, lists, cards, modals, v.v.
   - **Tương tác người dùng**: Tap, swipe, scroll, long press, v.v.
   - **Hiệu ứng**: Fade in/out, slide, scale, loading states, v.v.
   - **Navigation flow**: Screens liên quan

4. **Agent-uiux** làm việc với người dùng để:
   - Xác nhận mô tả screens
   - Điều chỉnh components và interactions
   - Làm rõ các hiệu ứng và animations

### Checkpoint
- ✅ Người dùng xác nhận database schema và activity diagrams
- ✅ Người dùng xác nhận file **design/screens.md**
- ✅ Agent chính cập nhật trạng thái dự án: `Design ✓ → Implementation`

---

## Giai đoạn 3: Implementation & Test (Triển khai và kiểm thử)

### Mục tiêu
Triển khai từng tính năng theo thiết kế, kết hợp UI/UX và nghiệp vụ.

### Quy trình cho MỖI tính năng

#### 3.1. Chọn tính năng
- Agent chính hoặc người dùng chọn tính năng từ PRD để triển khai
- Ưu tiên theo thứ tự trong PRD (Must have → Should have → Could have) và mối quan hệ phụ thuộc giữa các tính năng.

#### 3.2. UI/UX Design Phase

1. **Agent chính** gọi **agent-uiux** với:
   - Requirements từ PRD
   - Design flows liên quan
   - Reference designs (nếu có)

2. **Agent-uiux** thực hiện:
   - Phân tích design patterns từ project
   - Thiết kế UI/UX bằng React Native components
   - Implement animations, interactions (happy cases, mock data)
   - Focus vào presentation layer

3. **Agent-uiux** tạo:
   - React Native component structure
   - Styling với design tokens
   - Navigation flows
   - Animation/transition specs

#### 3.3. Business Logic Implementation

1. **Agent-uiux** chuyển giao cho **agent-react**:
   - Tóm tắt UI/UX đã implement
   - Component structure đã tạo
   - Props và state cần thiết

2. **Agent-react** nhận handoff và:
   - Review UI/UX code từ agent-uiux
   - Tham khảo **agent-ba** về:
     - Business requirements chi tiết
     - Validation rules
     - Edge cases và error scenarios
     - Activity diagrams

3. **Agent-react** implement:
   - Business logic layer
   - API integration
   - State management
   - Error handling
   - Data validation
   - Edge cases coverage

#### 3.4. Collaboration & Refinement

- **Agent-react** và **agent-uiux** trao đổi:
  - Agent-react báo lỗi UI/UX (nếu có) → agent-uiux chỉnh sửa
  - Agent-uiux điều chỉnh design để phù hợp với business constraints
  - Đảm bảo integration mượt mà giữa UI và logic

#### 3.5. Feature Completion

1. **Agent-react** hoàn tất:
   - Clean code review
   - Performance optimization
   - Code documentation (nếu cần)

2. **Agent chính** tóm tắt:
   - Tính năng đã implement
   - Files đã thay đổi/tạo mới
   - Hướng dẫn test (nếu cần)

### Checkpoint cho mỗi tính năng
- ✅ Người dùng tự test tính năng trên thiết bị/simulator
- ✅ Người dùng báo cáo lỗi (nếu có) → Quay lại fix
- ✅ Agent chính cập nhật trạng thái: `[Feature Name] ✓`

### Khi hoàn thành TẤT CẢ tính năng
- ✅ Agent chính cập nhật trạng thái dự án: `Implementation ✓ → Complete`

---

## Quản lý trạng thái dự án

### File tracking: `PROJECT_STATUS.md`

Agent chính duy trì file này với format:

```markdown
# Project Status

## Current Phase: [Requirement|Design|Implementation|Complete]

## Progress

### ✓ Completed Phases
- [x] Requirement - PRD confirmed on [date]
- [x] Design - System design confirmed on [date]

### → Current Phase
- [ ] Implementation - In progress

## Features Status

### Must Have
- [x] Feature A - Completed
- [ ] Feature B - In progress (UI/UX done, waiting for business logic)
- [ ] Feature C - Pending

### Should Have
- [ ] Feature D - Pending

### Could Have
- [ ] Feature E - Pending

## Last Updated
[Date and time]
```

---

## Agent Communication Logging

### Mục đích
Tracking và audit trail cho mọi giao tiếp giữa các agents để:
- Theo dõi luồng công việc giữa các agents
- Debug khi có vấn đề
- Review lịch sử collaboration
- Đảm bảo transparency trong quy trình

### File log: `AGENT_COMMUNICATION.log`

Tất cả agents (kể cả agent chính) phải log mọi communication vào file này.

### Format log entry

```
[YYYY-MM-DD HH:MM:SS] SENDER → RECEIVER | REQUEST_BRIEF
```

**Chi tiết:**
- **Time**: ISO format `YYYY-MM-DD HH:MM:SS` (local time)
- **SENDER**: Tên agent gửi (main, agent-ba, agent-uiux, agent-react)
- **RECEIVER**: Tên agent nhận
- **REQUEST_BRIEF**: Mô tả ngắn gọn (1 dòng, tối đa 100 ký tự) về yêu cầu/thông tin trao đổi

### Ví dụ log entries

```log
[2025-12-20 14:30:15] main → agent-ba | Phân tích yêu cầu: App quản lý công việc cho team nhỏ
[2025-12-20 14:45:22] agent-ba → main | Hoàn thành PRD.md với 8 tính năng chính
[2025-12-20 15:10:03] main → agent-ba | Thiết kế database schema cho task management
[2025-12-20 15:35:41] agent-ba → main | Hoàn thành schema.md và activity diagrams
[2025-12-20 16:00:12] main → agent-uiux | Thiết kế UI cho màn hình Create Task
[2025-12-20 16:25:33] agent-uiux → agent-react | Chuyển giao UI code cho Create Task screen
[2025-12-20 16:30:05] agent-react → agent-ba | Yêu cầu validation rules cho task creation
[2025-12-20 16:32:18] agent-ba → agent-react | Cung cấp validation rules và edge cases
[2025-12-20 16:55:47] agent-react → agent-uiux | Báo lỗi: Button disabled state chưa có style
[2025-12-20 17:02:09] agent-uiux → agent-react | Đã fix disabled state styling
[2025-12-20 17:15:30] agent-react → main | Hoàn thành feature Create Task
```

### Quy tắc logging

#### 1. Khi nào phải log

**BẮT BUỘC log trong các trường hợp sau:**

- Agent chính gọi custom agent (main → agent-*)
- Custom agent báo cáo kết quả cho agent chính (agent-* → main)
- Custom agent gọi custom agent khác (agent-* → agent-*)
- Agent yêu cầu thông tin từ agent khác
- Agent chuyển giao công việc (handoff)
- Agent báo lỗi/vấn đề cho agent khác

#### 2. Không cần log

- Agent tương tác với user (đã có trong chat transcript)
- Agent đọc/ghi file (đã có tool logs)
- Agent tự thực hiện công việc internal

#### 3. Cách implement logging

**Sử dụng Bash tool để append vào log file:**

```bash
echo "[$(date '+%Y-%m-%d %H:%M:%S')] SENDER → RECEIVER | REQUEST_BRIEF" >> AGENT_COMMUNICATION.log
```

**Ví dụ cụ thể:**

```bash
# Agent chính gọi agent-ba
echo "[$(date '+%Y-%m-%d %H:%M:%S')] main → agent-ba | Phân tích yêu cầu: App quản lý công việc" >> AGENT_COMMUNICATION.log

# Agent-ba báo cáo cho main
echo "[$(date '+%Y-%m-%d %H:%M:%S')] agent-ba → main | Hoàn thành PRD.md với 8 features" >> AGENT_COMMUNICATION.log

# Agent-uiux chuyển giao cho agent-react
echo "[$(date '+%Y-%m-%d %H:%M:%S')] agent-uiux → agent-react | Handoff UI code cho Login screen" >> AGENT_COMMUNICATION.log
```

#### 4. Best practices cho REQUEST_BRIEF

- **Ngắn gọn**: Tối đa 100 ký tự
- **Mô tả rõ ràng**: Ai đọc cũng hiểu ngay
- **Tập trung vào action**: Dùng động từ (Phân tích, Thiết kế, Implement, Fix, Yêu cầu, Cung cấp)
- **Bao gồm context key**: Feature name, screen name, hoặc task name

**Tốt:**
- `Phân tích yêu cầu: App quản lý công việc cho team nhỏ`
- `Thiết kế UI cho màn hình Login`
- `Yêu cầu validation rules cho user registration`
- `Fix: Button disabled state styling`

**Không tốt:**
- `Làm việc` (quá chung chung)
- `Agent-ba please analyze the requirements for the task management app with real-time sync and...` (quá dài)
- `???` (không có thông tin)

### Trách nhiệm logging

#### Agent chính (Main Agent)
- Log **TRƯỚC** khi gọi custom agent (main → agent-*)
- Log **SAU** khi nhận kết quả từ custom agent (agent-* → main)

#### Custom Agents (agent-ba, agent-uiux, agent-react)
- Log **NGAY** khi bắt đầu nhận task từ agent khác
- Log **TRƯỚC** khi gọi/yêu cầu agent khác (agent-* → agent-*)
- Log **SAU** khi hoàn thành và trả kết quả

### Xem log

```bash
# Xem toàn bộ log
cat AGENT_COMMUNICATION.log

# Xem 20 log entries gần nhất
tail -20 AGENT_COMMUNICATION.log

# Tìm tất cả communication từ main agent
grep "main →" AGENT_COMMUNICATION.log

# Tìm tất cả communication liên quan đến agent-ba
grep "agent-ba" AGENT_COMMUNICATION.log

# Xem log trong khoảng thời gian cụ thể
grep "2025-12-20" AGENT_COMMUNICATION.log
```

---

## Vai trò và trách nhiệm

### Agent chính (Main Agent)
- Điều phối workflow giữa các agents
- Quản lý trạng thái dự án qua các giai đoạn
- Tổng hợp kết quả và báo cáo cho người dùng
- Đảm bảo các checkpoint được hoàn thành trước khi chuyển giai đoạn

### Agent-ba (Business Analyst)
- **Giai đoạn Requirement**: Tạo PRD, phân tích yêu cầu
- **Giai đoạn Design**: Thiết kế DB, activity diagrams, system architecture
- **Giai đoạn Implementation**: Cung cấp business requirements cho agent-react

### Agent-uiux (UI/UX Designer)
- **Giai đoạn Design**: Tạo mô tả screens (design/screens.md) dựa trên activity diagrams
- **Giai đoạn Implementation**: Thiết kế và code UI/UX layer cho từng tính năng
- Tạo component structure, styling, animations
- Collaborate với agent-react để refine design

### Agent-react (React Native Developer)
- **Giai đoạn Implementation**: Code business logic, integrate với UI
- Implement state management, API calls, error handling
- Collaborate với agent-uiux để ensure design-logic compatibility

---

## Nguyên tắc làm việc

1. **Không skip giai đoạn**: Phải hoàn thành Requirement trước khi Design, Design trước khi Implementation
2. **User approval required**: Mỗi checkpoint cần xác nhận từ người dùng
3. **Collaboration over handoff**: Các agents trao đổi với nhau, không chỉ chuyển giao một chiều
4. **Document everything**: PRD, designs, diagrams phải được lưu file
5. **Iterative refinement**: Chấp nhận feedback và iterate cho đến khi đạt yêu cầu
6. **Quality over speed**: Focus vào code quality, maintainability, best practices

---

## Ví dụ workflow đầy đủ

```
User: "Tôi muốn xây dựng app quản lý công việc"

[Giai đoạn 1: Requirement]
Main → agent-ba: Phân tích requirements
agent-ba ↔ User: Clarify vision, features, priorities
agent-ba: Tạo PRD.md
User: ✓ Approve PRD
Main: Update status → Design phase

[Giai đoạn 2: Design]
Main → agent-ba: Design system
agent-ba: Tạo design/database/schema.md
agent-ba: Tạo design/flows/task-management.md (và các flows khác)
User: ✓ Approve DB schema và activity diagrams
Main → agent-uiux: Tạo screen descriptions
agent-uiux: Tạo design/screens.md (mô tả tất cả screens)
User: ✓ Approve screen descriptions
Main: Update status → Implementation phase

[Giai đoạn 3: Implementation - Feature "Create Task"]
Main → agent-uiux: Design UI for create task
agent-uiux: Code create-task screen (UI only)
agent-uiux → agent-react: Handoff UI code
agent-react ← agent-ba: Get validation rules
agent-react: Implement business logic
agent-react ↔ agent-uiux: Fix UI issues
Main: Feature complete, summarize
User: ✓ Test passed

[Repeat for next features...]

Main: Update status → All features complete ✓
```

---

## Lưu ý

- File này là hướng dẫn cho **agent chính** và **các custom agents**
- Người dùng có thể linh hoạt điều chỉnh quy trình nếu cần
- Trong trường hợp emergency fix, có thể skip một số bước nhưng phải document lại
- Luôn maintain PROJECT_STATUS.md để track progress
