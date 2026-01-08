# Quick Build Instructions for Mobile APKs

## Your Setup:
- **PC IP Address**: `192.168.1.148`
- **Backend Port**: `3000`
- **Driver App**: Ready at `client/android-driver`
- **Admin App**: Ready at `client/android-admin`

## Build APKs in Android Studio

### Option 1: Build Driver APK
1. Open Android Studio
2. Click "Open" and select: `C:\Users\dhif_\OneDrive\Desktop\Project\Inex\client\android-driver`
3. Wait for Gradle sync (first time takes 5-10 minutes)
4. **Build > Build Bundle(s) / APK(s) > Build APK(s)**
5. APK will be at: `client/android-driver/app/build/outputs/apk/debug/app-debug.apk`
6. Click "locate" in the notification to find the APK

### Option 2: Build Admin APK
1. In Android Studio, click **File > Open**
2. Select: `C:\Users\dhif_\OneDrive\Desktop\Project\Inex\client\android-admin`
3. Wait for Gradle sync
4. **Build > Build Bundle(s) / APK(s) > Build APK(s)**
5. APK at: `client/android-admin/app/build/outputs/apk/debug/app-debug.apk`

### Option 3: Build Both Using Gradle (Command Line)

Driver:
```powershell
cd client\android-driver
.\gradlew assembleDebug
```

Admin:
```powershell
cd ..\android-admin
.\gradlew assembleDebug
```

## Install on Phone

### Connect phone via USB:
1. Enable USB Debugging on phone (Settings > Developer Options)
2. Connect phone to PC
3. Allow USB debugging when prompted on phone

### Install Driver App:
```powershell
adb install "client\android-driver\app\build\outputs\apk\debug\app-debug.apk"
```

### Install Admin App:
```powershell
adb install "client\android-admin\app\build\outputs\apk\debug\app-debug.apk"
```

### Or manually:
1. Copy APK files to your phone
2. Open them on phone to install
3. Allow "Install from Unknown Sources" if prompted

## Before Testing - Start Backend!

```powershell
cd C:\Users\dhif_\OneDrive\Desktop\Project\Inex
npm run dev
```

Server must be running for apps to work!

## Enable Firewall Access (if apps can't connect):

Run as Administrator:
```powershell
New-NetFirewallRule -DisplayName "Node.js Backend Port 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

## Test the Apps

### Driver App ("Inex Driver" icon):
1. Open app on phone
2. Search for reference "NUM1"
3. Should show pickup details with image

### Admin App ("Inex Admin" icon):
1. Open app on phone
2. Should show list of all pickups
3. Try creating a new pickup

## Troubleshooting

**"Cannot connect" or blank screen:**
- Make sure backend is running (`npm run dev`)
- Verify phone and PC are on same WiFi
- Try accessing `http://192.168.1.148:3000/api/admin/pickups` in phone's browser
- If that doesn't work, check firewall or IP address changed

**Need to rebuild after code changes:**
```powershell
# From root directory
npm run build:driver
npm run build:admin
Copy-Item "dist\client\driver.html" "dist\index.html" -Force
Copy-Item "dist-admin\client\admin.html" "dist-admin\index.html" -Force
cd client
Copy-Item "capacitor.config.driver.ts" "capacitor.config.ts" -Force
npx --prefix .. @capacitor/cli sync
# Rebuild in Android Studio
```

## Current Status:
✅ Both apps built with your IP (192.168.1.148)
✅ Android projects created (android-driver and android-admin)
✅ Ready to build APKs in Android Studio
