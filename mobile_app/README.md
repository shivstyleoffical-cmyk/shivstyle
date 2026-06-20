# ShopEase Mobile App

A modern, beautiful e-commerce mobile application built with Flutter.

## Features
- **Splash Screen**: Animated entry with gradient background.
- **Onboarding**: Smooth introduction to the app features.
- **Authentication**: Phone Number Authentication using Firebase.

## Setup Requirements

### 1. Firebase Configuration
The `google-services.json` file has already been configured for the package `com.shiv.enterprise`.

**Important**: For Phone Authentication to work, you MUST:
1. Enable **Phone Provider** in Firebase Console -> Authentication -> Sign-in method.
2. Add the **SHA-1 Fingerprint** of your machine to the Firebase Console.

### 2. How to get SHA-1
Run the following command in your terminal (from `mobile_app/android` folder):
```bash
./gradlew signingReport
```
Or on Windows:
```cmd
cd android
gradlew signingReport
```
Find the `SHA1` under `Task :app:signingReport` -> `Variant: debug`, copy it, and paste it in Firebase Project Settings.

### 3. Run the App
```bash
flutter run
```
