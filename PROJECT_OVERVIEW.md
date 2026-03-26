# KMRL App — Project Overview

## 📌 What Is This?

**KmrlApp** is a mobile application built for **Kochi Metro Rail Limited (KMRL)** staff and station managers.
It provides an internal document management and communication tool — allowing employees to view operational documents, upload and summarize files, manage meetings, and configure personal preferences.

---

## 🏗️ Project Structure

```
KMRL-app/
├── App.js                    # Root component — Navigation container + Theme setup
├── index.js                  # Expo entry point
├── app.json                  # Expo app configuration (name, icons, splash, platforms)
├── package.json              # Dependencies and npm scripts
├── assets/                   # App icons and splash screen images
│   ├── icon.png
│   ├── splash-icon.png
│   ├── android-icon-foreground.png
│   ├── android-icon-background.png
│   ├── android-icon-monochrome.png
│   └── favicon.png
└── components/               # All UI screens and navigation logic
    ├── App Entry & Navigation
    │   ├── DrawerNavigator.js    # Side drawer navigation shell
    │   ├── TabNavigator.js       # Bottom tab bar (Home, Upload, Meetings, Profile)
    │   ├── HomeStack.js          # Home tab — dashboard with recent documents
    │   └── ProfileStack.js       # Profile tab — nested stack
    │
    ├── Screens
    │   ├── LoginScreen.js        # Login / authentication screen
    │   ├── SignupScreen.js       # User registration screen
    │   ├── HomeStack.js          # Home dashboard (stats + recent documents)
    │   ├── AllDocsScreen.js      # Full list of all documents
    │   ├── UploadScreen.js       # Upload documents + generate AI summary + export PDF
    │   ├── MeetingScreen.js      # Meetings / schedule screen
    │   ├── ProfileScreen.js      # User profile screen
    │   ├── AboutScreen.js        # About the app screen
    │   └── SettingsScreen.js     # App settings (theme, language, notifications)
    │
    └── Context / Utility
        ├── ThemeContext.js       # Global dark/light theme context (React Context API)
        └── DrawerContent.js      # Custom sidebar drawer UI
```

---

## ⚙️ Tech Stack

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| **React Native** | 0.83.2 | Cross-platform mobile UI framework |
| **React** | 19.2.0 | UI component library |
| **Expo** | ~55.0.5 | Build toolchain, dev server, native APIs |

### Navigation
| Library | Purpose |
|---|---|
| `@react-navigation/native` | Core navigation container |
| `@react-navigation/native-stack` | Stack navigator (Login → Main flow) |
| `@react-navigation/bottom-tabs` | Bottom tab bar (Home, Upload, Meetings, Profile) |
| `@react-navigation/drawer` | Side drawer navigation |

### Expo Native Modules
| Library | Purpose |
|---|---|
| `expo-document-picker` | Pick PDF, Word, image files from device |
| `expo-image-picker` | Pick images from camera/gallery |
| `expo-print` | Generate PDF files from HTML |
| `expo-sharing` | Share/export generated PDF files |
| `expo-status-bar` | Manage status bar appearance |

### UI & Animation
| Library | Purpose |
|---|---|
| `@expo/vector-icons` (Ionicons) | Icon set used throughout the app |
| `react-native-gesture-handler` | Touch/gesture support for navigation |
| `react-native-reanimated` | Smooth UI animations |
| `react-native-safe-area-context` | Screen safe area management |
| `react-native-screens` | Native screen optimization |

### Storage
| Library | Purpose |
|---|---|
| `@react-native-async-storage/async-storage` | Persist settings (name, language, notifications) |

### Web Support
| Library | Purpose |
|---|---|
| `react-native-web` | Run app in web browser via Expo |
| `react-dom` | Required for web rendering |

---

## 🧭 Navigation Architecture

```
App.js (Stack Navigator)
├── LoginScreen         ← Entry point
├── SignupScreen
└── MainApp (DrawerNavigator)
    └── TabNavigator (Bottom Tabs)
        ├── HomeStack (Tab: Home)
        │   ├── HomeTab           ← Dashboard: stats + recent docs
        │   └── AllDocs           ← Full document list
        ├── UploadScreen (Tab: Upload)
        ├── MeetingScreen (Tab: Meetings)
        └── ProfileStack (Tab: Profile)
            ├── ProfileScreen
            ├── SettingsScreen
            └── AboutScreen
```

---

## 📱 Features

| Feature | Screen | Description |
|---|---|---|
| Authentication | `LoginScreen`, `SignupScreen` | User login and registration |
| Dashboard | `HomeStack` | Stats cards (Total Docs, Unread, History) + recent document feed |
| Document Feed | `AllDocsScreen` | Full list of operational documents with URGENT/GENERAL tags |
| File Upload | `UploadScreen` | Pick files (PDF/Word/Image), generate AI summary (mock), export as PDF |
| Meetings | `MeetingScreen` | View meeting schedule and events |
| Profile | `ProfileScreen` | View and manage user profile |
| Settings | `SettingsScreen` | Dark mode toggle, language selector (English/Malayalam), notifications, clear cache |
| Theming | `ThemeContext` | Global light/dark theme with custom KMRL blue color palette |
| Persistent Prefs | `AsyncStorage` | Saves user name, notification preference, and language across sessions |

---

## 🛠️ Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser
```

---

## 🎨 Brand Colors

| Color | Hex | Used For |
|---|---|---|
| KMRL Blue | `#0056b3` | Primary actions, buttons, active tabs |
| Light Blue (Dark Mode) | `#4dabf7` | Primary in dark mode |
| Urgent Red | `#ff4d4d` | Urgent document tags |
| Orange | `#ff9800` | Unread stat card |
| Green | `#4caf50` | History stat card |

---

## 🌍 Platform Support

| Platform | Supported |
|---|---|
| Android | ✅ (with adaptive icon) |
| iOS | ✅ (tablet supported) |
| Web | ✅ (via react-native-web) |

---

*App Version: 1.0.0 | Orientation: Portrait*
