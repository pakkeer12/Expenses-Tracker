# Android APK Build Guide

## Prerequisites

Before building the Android APK, make sure you have the following installed:

### 1. **Java Development Kit (JDK) 17**
```bash
# Check if Java is installed
java -version

# If not installed, download from:
# https://adoptium.net/ (Recommended: Eclipse Temurin 17)
```

### 2. **Android Studio**
- Download from: https://developer.android.com/studio
- Install Android Studio
- During installation, make sure to install:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (optional, for testing)

### 3. **Set up Environment Variables (macOS)**

Add these to your `~/.zshrc` or `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Then reload your shell:
```bash
source ~/.zshrc
```

### 4. **Accept Android SDK Licenses**
```bash
yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
```

---

## Building the APK

### Option 1: Using NPM Scripts (Recommended)

1. **Build and sync the project:**
   ```bash
   npm run android:build
   ```

2. **Open in Android Studio:**
   ```bash
   npm run android:open
   ```

3. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Go to `Build > Build Bundle(s) / APK(s) > Build APK(s)`
   - Once built, click "locate" in the notification to find your APK
   - APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Command Line Build

1. **Navigate to android folder:**
   ```bash
   cd android
   ```

2. **Build debug APK:**
   ```bash
   ./gradlew assembleDebug
   ```

3. **Build release APK (signed):**
   ```bash
   ./gradlew assembleRelease
   ```

4. **Find your APK:**
   - Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Release: `android/app/build/outputs/apk/release/app-release.apk`

---

## Installing the APK on Your Phone

### Method 1: USB Connection

1. **Enable Developer Options on your Android phone:**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging"

2. **Connect your phone via USB**

3. **Install APK:**
   ```bash
   cd android
   ./gradlew installDebug
   ```

   Or use ADB directly:
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

### Method 2: Direct APK Transfer

1. **Copy APK to your phone:**
   - Transfer `app-debug.apk` to your phone via:
     - USB cable
     - Email
     - Cloud storage (Google Drive, Dropbox, etc.)
     - AirDrop (if using iOS first)

2. **Install on phone:**
   - Open the APK file on your phone
   - Allow "Install from Unknown Sources" if prompted
   - Tap "Install"

---

## Creating a Signed Release APK (For Production)

### 1. Generate a Keystore

```bash
cd android
keytool -genkey -v -keystore expenses-tracker-release.keystore -alias expenses-tracker -keyalg RSA -keysize 2048 -validity 10000
```

Follow the prompts and **remember your passwords!**

### 2. Configure Signing in Android Studio

1. Open `android/app/build.gradle`
2. Add signing configuration:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('expenses-tracker-release.keystore')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'expenses-tracker'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build Release APK

```bash
cd android
./gradlew assembleRelease
```

Your signed APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## Testing Your App

### Run on Connected Device

```bash
npm run android:run
```

Or:

```bash
cd android
./gradlew installDebug
adb shell am start -n com.expenses.tracker/.MainActivity
```

---

## Important Notes

### Backend Server Configuration

⚠️ **Critical:** Your app currently connects to `http://localhost:5000` which won't work on a mobile device.

**You need to:**

1. **Option A: Host your server online**
   - Deploy to services like:
     - Render.com
     - Railway.app
     - Heroku
     - DigitalOcean
     - AWS/Google Cloud

2. **Option B: Use local network IP (for testing)**
   - Find your computer's IP: `ifconfig` (look for `inet` under `en0` or `en1`)
   - Update API base URL in your app to use your IP:
     ```typescript
     // In your API configuration
     const API_URL = 'http://192.168.1.XXX:5000'
     ```

3. **Update Capacitor config for API calls:**
   
   Add to `capacitor.config.ts`:
   ```typescript
   const config: CapacitorConfig = {
     appId: 'com.expenses.tracker',
     appName: 'Expenses Tracker',
     webDir: 'dist/public',
     server: {
       // For local testing (replace with your computer's IP)
       url: 'http://192.168.1.XXX:5000',
       cleartext: true // Allows HTTP (not recommended for production)
     }
   };
   ```

---

## Troubleshooting

### Common Issues:

1. **Gradle build fails:**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew build
   ```

2. **License not accepted:**
   ```bash
   yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
   ```

3. **App crashes on start:**
   - Check that backend server is accessible
   - Check logcat: `adb logcat | grep -i error`

4. **"Command not found" errors:**
   - Ensure Android SDK paths are in your environment variables
   - Restart your terminal

---

## Useful Commands

```bash
# Check connected devices
adb devices

# View logs from your app
adb logcat | grep "Expenses Tracker"

# Uninstall app from device
adb uninstall com.expenses.tracker

# Clear app data
adb shell pm clear com.expenses.tracker

# Open Android Studio
npm run android:open

# Rebuild and sync
npm run android:build
```

---

## Next Steps

1. ✅ Install prerequisites (JDK 17, Android Studio)
2. ✅ Set up environment variables
3. ✅ Run `npm run android:build`
4. ✅ Open in Android Studio: `npm run android:open`
5. ✅ Build APK in Android Studio
6. ✅ Transfer APK to your phone
7. ✅ Install and test!

---

## Production Deployment Checklist

- [ ] Set up production backend server
- [ ] Update API URLs in the app
- [ ] Generate release keystore
- [ ] Configure signing in build.gradle
- [ ] Build signed release APK
- [ ] Test on multiple devices
- [ ] Prepare for Google Play Store (if publishing)

---

For more information, visit:
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/studio/build/building-cmdline)
