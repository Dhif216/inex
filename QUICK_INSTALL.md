# Install Apps on Your Samsung Phone (RZCY60D7GRB)

Your phone is detected! ✅

## Quick Install Method

### Step 1: Open Android Studio
1. Launch **Android Studio**
2. Click **File > Open**
3. Navigate to and select: `C:\Users\dhif_\OneDrive\Desktop\Project\Inex\client\android-driver`
4. Click **OK**

### Step 2: Wait for Sync
- Gradle will sync automatically (takes 2-5 minutes first time)
- You'll see progress at the bottom of Android Studio

### Step 3: Run on Your Phone
1. At the top, you should see your device: **Samsung SM-... (RZCY60D7GRB)**
2. Click the green **Run** button (▶) or press **Shift+F10**
3. App will build and install automatically!
4. The "Inex Driver" app will launch on your phone

### Step 4: Install Admin App
1. In Android Studio, click **File > Open**
2. Select: `C:\Users\dhif_\OneDrive\Desktop\Project\Inex\client\android-admin`
3. Wait for sync
4. Click Run button again
5. "Inex Admin" app will install on your phone

## Before Testing - Start Backend!

In PowerShell:
```powershell
cd C:\Users\dhif_\OneDrive\Desktop\Project\Inex
npm run dev
```

Your phone will connect to: **192.168.1.148:3000**

## Troubleshooting

**Don't see your device in Android Studio?**
- Make sure USB debugging is still enabled
- Try unplugging and reconnecting the USB cable
- In phone settings, change USB mode to "File Transfer"

**Build fails with Java error?**
- Android Studio will prompt to download correct Java version
- Click "Download" when prompted
- Wait for it to complete and try building again

**Apps can't connect to backend?**
- Make sure backend is running: `npm run dev`
- Both phone and PC must be on the same WiFi
- Test in phone browser: `http://192.168.1.148:3000/api/admin/pickups`

## Your Device Info
- Device ID: RZCY60D7GRB
- Status: Connected ✅
- PC IP: 192.168.1.148
- Backend Port: 3000
