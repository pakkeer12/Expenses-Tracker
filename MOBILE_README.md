# Mobile App (Android) 📱

Your Expenses Tracker app can now be built as an Android APK!

## Quick Start

### 1. Install Prerequisites
- **Java JDK 17** - [Download](https://adoptium.net/)
- **Android Studio** - [Download](https://developer.android.com/studio)

### 2. Build the APK

```bash
# Build and prepare the Android project
npm run android:build

# Open in Android Studio
npm run android:open
```

### 3. In Android Studio
- Wait for Gradle sync to complete
- Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
- Find your APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

### 4. Install on Your Phone
- Transfer the APK to your Android phone
- Open it and tap "Install"
- Or connect via USB and run: `adb install android/app/build/outputs/apk/debug/app-debug.apk`

## Important: Backend Configuration ⚠️

The app currently connects to `localhost:5000` which won't work on mobile. You need to:

### Option A: Deploy Backend Online (Recommended)
Deploy your backend to:
- Render.com
- Railway.app
- Heroku
- DigitalOcean
- AWS/Google Cloud

### Option B: Use Local Network IP (For Testing)
1. Find your computer's IP:
   ```bash
   ifconfig | grep "inet "
   ```

2. Make sure your phone and computer are on the same WiFi network

3. Update the API URL in your app configuration to use your computer's IP (e.g., `http://192.168.1.XXX:5000`)

## Available Scripts

```bash
# Build web assets and sync to Android
npm run android:build

# Open project in Android Studio
npm run android:open

# Build, sync, and run on connected device
npm run android:run
```

## Full Documentation

For complete setup instructions, troubleshooting, and production deployment guide, see:
📖 **[ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md)**

## Features on Mobile
✅ Full expense tracking
✅ Budget management
✅ Business transactions
✅ Loan tracking
✅ Analytics and reports
✅ Responsive mobile UI
✅ Offline-capable (with proper setup)

## Notes
- First build may take 10-15 minutes while downloading dependencies
- Make sure you have at least 5GB of free disk space
- Android SDK and build tools will be downloaded automatically by Android Studio

---

Need help? Check the [detailed guide](./ANDROID_BUILD_GUIDE.md) or open an issue!
