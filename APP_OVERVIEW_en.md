# **FutureBoxes – Time Capsule Mobile Application**

## **1. General Introduction**

**FutureBoxes** is a unique mobile application that allows users to create digital “time capsules.” Users can store their thoughts, emotions, goals, memories, and important decisions inside these capsules, then lock them and only open them at a specified point in the future.

The app helps users connect with their present and future selves, reflect on personal growth, and cherish meaningful moments.

![Image 1](app-images/app_icon.jpg)

## **2. Key Features**

### 📦 Multiple Capsule Types
Users can choose one of four capsule types depending on their needs:

- **Emotion:** Record current moods and thoughts.
- **Goal:** Set goals to work toward and review later.
- **Memory:** Preserve beautiful moments through images and messages.
- **Decision:** Record important decisions to evaluate their correctness in the future.

![Image 2](app-images/choose_capsule.jpg)

### 🔒 Locking Mechanism & Countdown

- Once created, a capsule is **completely locked**. Users cannot view, edit, or delete its contents.
- A countdown timer displays the remaining time until the capsule can be opened, creating a sense of anticipation and excitement.

![Image 3](app-images/confirm_box.jpg)

### 🔔 Notifications & Capsule Opening

- When the scheduled time arrives, the app sends a notification reminder.
- Upon opening a capsule, users can review all stored text and images.
- For **Emotion, Goal, and Decision** capsules, users are provided with a **Reflection** section to evaluate what they wrote (Yes/No or rating-based reflection).

### 📂 Local Storage & Privacy

- Data is stored directly on the device (**offline-first**), ensuring privacy.
- An **Archive** allows users to review all opened capsules.

![Image 4](app-images/capsule_created.jpg)

## **3. Development Process**

The project was developed using a **simplified Waterfall-like model**, combined with the power of AI Agents, as described in the project’s technical documentation.

### Main phases include:

1. **Requirement Analysis (BA Agent):**
   Building a detailed Product Requirements Document (PRD), defining user stories and acceptance criteria.

2. **Design (UI/UX Agent):**
   - Designing the database schema and business flows (Activity Diagrams).
   - Providing detailed screen descriptions.

3. **Implementation (React Agent):**
   Developing the application using React Native and Expo, strictly following the designs.

4. **Testing:**
   Ensuring product quality before delivery.

## **4. Technology Stack**

- **Framework:** React Native (New Architecture), Expo SDK 52
- **Language:** TypeScript
- **Storage:** SQLite (Local Database), File System (Image storage)
- **Styling:** Custom Design System
- **Animation:** Reanimated, Lottie

## **5. Application Image Gallery**

Below are several illustrative images showcasing the user interface and experience of FutureBoxes:

| | |
|:---:|:---:|
| ![Image 5](app-images/create_capsule.jpg) | ![Image 6](app-images/first_screen.jpg) |
| ![Image 7](app-images/welcome_message.jpg) | ![Image 8](app-images/preview.jpg) |

