# 🚀 GymOS v4.0

**The ultimate Operating System for Coaches and Students.**

GymOS is a high-performance fitness application built with **Expo SDK 54** and **Supabase**, designed to bridge the gap between teachers and athletes with a professional, data-driven experience.

![GymOS Banner](https://img.shields.io/badge/GymOS-v4.0--Pro-FBFF00?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000000?style=for-the-badge&logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind](https://img.shields.io/badge/NativeWind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## ✨ Key Features

### 🏛️ SSOT Architecture (Single Source of Truth)
- **Multi-Layer Caching**: MMKV -> Supabase -> RapidAPI (ExerciseDB).
- **Global Dictionary**: Unified exercise database with over 1,300+ tracked movements.
- **Real-time Sync**: Automatic session persistence and snapshot recovery.

### 🎯 Professional Onboarding
- **Ready-to-use Templates**: Instant plans like PPL (Push/Pull/Legs) and Full Body.
- **Customization Flow**: Modify existing templates to fit individual needs.
- **Blank Canvas**: Total freedom for expert coaches to build from scratch.

### ⚡ Live Workout Engine
- **Active Tracking**: Smooth set-by-set execution with haptic feedback.
- **Rest Timers**: Context-aware timers with visual overlaps.
- **Progressive Overload**: Integrated logic to suggest weight/rep increases based on history.

### 🖼️ Universal Exercise Picker
- **Interactive Search**: Debounced 300ms lookup with muscle group filters.
- **Visual Cues**: Animated GIFs powered by `expo-image` for smooth playback and low memory usage.
- **Skeleton States**: Premium loading experience using Phosphor design language.

---

## 🛠️ Tech Stack

- **Core**: React Native (via Expo), TypeScript.
- **Backend / Auth**: Supabase.
- **State Management**: Zustand + Immer (Live Store).
- **Data Fetching**: TanStack Query v5.
- **Styling**: NativeWind (Tailwind CSS) + CSS Variables.
- **Icons**: Phosphor Icons.
- **Database**: PostgreSQL (Supabase) + MMKV (Local storage).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Expo Go (on iOS/Android) or a Development Client.

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# ExerciseDB (RapidAPI)
EXPO_PUBLIC_RAPIDAPI_KEY=your_key_here
EXPO_PUBLIC_RAPIDAPI_HOST=exercisedb.p.rapidapi.com

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Installation
```bash
# Clone the repository
git clone https://github.com/caiom21/AppGymCM.git

# Install dependencies
npm install

# Start the development server
npx expo start
```

---

## 🏗️ Architecture Design (SDD v4.0)

This project follows a **Feature-Based Architecture**:
- `/src/features`: Domain-specific logic (Workout Engine, Auth, Exercises).
- `/src/services`: Shared infrastructure (API clients, Database mappers).
- `/src/components`: Atomic UI elements and cross-feature components.
- `/src/shared`: Generic hooks, libs, and global types.

---

## 📄 License
Privately owned for GymOS development.

---
*Created with ❤️ by Caio Miranda & Antigravity (Google Deepmind)*
