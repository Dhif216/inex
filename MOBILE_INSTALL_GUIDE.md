# Mobile App Installation Guide

## Prerequisites
1. Android Studio installed
2. Your PC (backend server) and phone on the same WiFi network
3. USB debugging enabled on your phone

## Step 1: Get Your PC's Local IP Address

Run this in PowerShell:
```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like '*Wi-Fi*'}).IPAddress
```

You'll get something like: `192.168.1.XXX`

## Step 2: Update API Configuration

**IMPORTANT**: Before building the APKs, you must update the backend URL in the API file:

Edit: `client/src/api.ts`

Replace line 8 with your actual IP:
```typescript
const baseURL = isCapacitor 
  ? 'http://YOUR_PC_IP:3000/api'  // Replace with your actual IP like 192.168.1.100
  : '/api';
```

## Step 3: Rebuild the Apps

After updating the IP address:
```powershell
npm run build:driver
npm run build:admin
Copy-Item "dist\client\driver.html" "dist\index.html" -Force
Copy-Item "dist-admin\client\admin.html" "dist-admin\index.html" -Force
```

## Step 4: Sync to Android Projects

Driver app:
```powershell
cd client
Copy-Item "capacitor.config.driver.ts" "capacitor.config.ts" -Force
npx --prefix .. @capacitor/cli sync
```

Admin app:
```powershell
Copy-Item "capacitor.config.admin.ts" "capacitor.config.ts" -Force
npx --prefix .. @capacitor/cli sync
```

## Step 5: Build APKs with Android Studio

### Driver App:
1. Open Android Studio
2. Open project: `Inex/client/android`
3. Wait for Gradle sync to complete
4. Build > Build Bundle(s) / APK(s) > Build APK(s)
5. APK location: `client/android/app/build/outputs/apk/debug/app-debug.apk`

### Admin App:
1. After building driver, copy the admin config:
   ```powershell
   cd client
   Copy-Item "capacitor.config.admin.ts" "capacitor.config.ts" -Force
   npx --prefix .. @capacitor/cli sync
   ```
2. In Android Studio, click "Sync Project with Gradle Files"
3. Build > Build Bundle(s) / APK(s) > Build APK(s)
4. Rename the APK to `app-admin-debug.apk` to distinguish it

## Step 6: Install on Your Phone

### Via USB:
```powershell
# Make sure phone is connected and USB debugging enabled
adb install "client/android/app/build/outputs/apk/debug/app-debug.apk"
```

### Via File Transfer:
1. Copy the APK file to your phone
2. Open the file on your phone to install
3. Enable "Install from Unknown Sources" if prompted

## Step 7: Start the Backend Server

On your PC:
```powershell
npm run dev
```

The server must be running on port 3000 for the mobile apps to connect.

## Testing the Apps

### Driver App:
1. Open "Inex Driver" app on your phone
2. Search for a reference number (e.g., "NUM1")
3. The app should connect to your PC's backend

### Admin App:
1. Open "Inex Admin" app
2. You should see the pickup list
3. You can create new pickups and upload images

## Troubleshooting

### Can't connect to backend:
- Verify your PC's IP address hasn't changed
- Make sure Windows Firewall allows port 3000
- Check that both devices are on the same WiFi network
- Try accessing `http://YOUR_PC_IP:3000/api/admin/pickups` in your phone's browser

### Firewall command (run as Administrator):
```powershell
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

## Quick Rebuild (after code changes):

```powershell
# Rebuild apps
npm run build:driver
npm run build:admin

# Fix HTML names
Copy-Item "dist\client\driver.html" "dist\index.html" -Force
Copy-Item "dist-admin\client\admin.html" "dist-admin\index.html" -Force

# Sync and rebuild in Android Studio
cd client
npx --prefix .. @capacitor/cli sync
# Then use Android Studio to build new APK
```
