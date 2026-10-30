# TaskFlow – React Native Task Management App

TaskFlow is a simple and user-friendly mobile task management application built with React Native and Expo. It helps users organize daily tasks, manage priorities, track progress, and stay productive.

## ✨ Features

- **Add Tasks:** Create new tasks with custom titles.
- **Edit Tasks:** Update existing task names.
- **Delete Tasks:** Remove tasks with a confirmation prompt.
- **Task Priorities:** Assign High, Medium, or Low priority to tasks.
- **Task Status:** Mark tasks as completed or pending.
- **Search Tasks:** Quickly find tasks using the search feature.
- **Filter Tasks:** View All, Pending, or Completed tasks.
- **Task Statistics:** Track total, pending, and completed tasks.
- **Local Storage:** Save tasks using AsyncStorage.
- **Offline Support:** Access locally saved tasks without an internet connection.
- **Mobile-Friendly UI:** Clean, responsive design with a light pink and peach color theme.

## 🛠️ Technologies Used

- React Native
- Expo SDK 58
- TypeScript
- Expo Router
- AsyncStorage
- JavaScript / TypeScript
- EAS Build


## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project

```bash
cd my-app
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npx expo start
```

You can scan the QR code using Expo Go or run the application on a supported emulator.

## 📦 Android APK

TaskFlow has been built as an Android APK using Expo Application Services (EAS Build).

To create another preview APK, use:

```bash
eas build --platform android --profile preview
```

The APK can be installed directly on a compatible Android device.

## 💾 Data Storage

TaskFlow uses AsyncStorage to store tasks locally on the device.

- Tasks remain saved after closing and reopening the app.
- Data is stored locally on the device.
- Tasks do not automatically synchronize between different devices.
- Uninstalling the app may remove locally stored data.

## 🎯 Project Purpose

The purpose of TaskFlow is to practice mobile application development and understand important React Native concepts, including:

- Components and props
- React Hooks (`useState` and `useEffect`)
- State management
- CRUD operations
- Local data persistence
- Navigation with Expo Router
- Building and installing Android applications

## 👩‍💻 Developer

**Maryam Ayub**

Software Engineering Student | Frontend & Mobile App Development

GitHub: [maryamfew77-art](https://github.com/maryamfew77-art)

---

⭐ If you find this project useful, consider giving it a star!