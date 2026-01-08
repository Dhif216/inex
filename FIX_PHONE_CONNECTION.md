# Quick Fix for Phone Connection Issue

## Step 1: Add Firewall Rule (Required!)

**Right-click PowerShell icon → Run as Administrator**, then run:

```powershell
cd C:\Users\dhif_\OneDrive\Desktop\Project\Inex
.\enable-firewall.ps1
```

Or manually add the rule:
```powershell
New-NetFirewallRule -DisplayName "Inex Backend Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Any
```

## Step 2: Test Connection from Your Phone

Open **Chrome browser** on your phone and visit:
```
http://192.168.1.148:3000/api/admin/pickups
```

**Expected result:** You should see JSON data with pickups

**If you see "Connection refused" or "Can't reach":**
- Make sure you ran the firewall script as Administrator
- Both phone and PC must be on same WiFi network
- Check Windows Firewall isn't blocking Node.js

## Step 3: Try the Apps Again

Now open the Inex Admin or Driver app and try creating a pickup.

## Still Not Working?

### Check Your IP Address
Your IP might have changed. Run:
```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like '*Wi-Fi*' -or $_.InterfaceAlias -like '*Ethernet*'} | Where-Object {$_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*'}).IPAddress
```

If it's different from **192.168.1.148**, you need to:
1. Update `client/src/api.ts` with new IP
2. Rebuild both apps: `npm run build:driver` and `npm run build:admin`
3. Sync to Android: Follow the rebuild steps in QUICK_INSTALL.md

### Alternative: Use IP Address Instead of Localhost

Make sure backend is accessible. Test from PC browser:
```
http://192.168.1.148:3000/api/admin/pickups
```

Should show JSON data.
