# Deploy to Firebase Guide

Your Firebase project **"rahti-819cb"** is now initialized!

## Quick Summary

**What you need:**
- Convert Express backend to Firebase Functions
- Use Firestore instead of SQLite
- Deploy frontend to Firebase Hosting
- Update mobile apps with new Firebase URL

## Option 1: Simple Approach (Recommended for Quick Start)

Use a cloud hosting service like **Render** or **Railway** for the backend (keeps your existing code) + Firebase just for hosting the web frontend.

### Why this is easier:
- Keep all your existing Express/Prisma code
- No need to rewrite for Firebase Functions
- Can still use PostgreSQL/MySQL
- Firebase free tier for hosting only

## Option 2: Full Firebase (More Work)

Convert everything to Firebase native services.

### What needs to change:
1. **Backend API** → Firebase Cloud Functions
2. **SQLite Database** → Firestore
3. **Local file storage** → Firebase Storage
4. **Prisma ORM** → Firestore SDK

### Estimated time: 4-6 hours of development

## Recommended: Hybrid Approach

Let me help you deploy the backend to **Render** (free tier) and use Firebase just for the web frontend hosting:

### Step 1: Deploy Backend to Render

1. Go to https://render.com
2. Sign up with GitHub
3. Create new "Web Service"
4. Connect your GitHub repo (or create one)
5. Settings:
   - **Build Command**: `npm install && npx prisma generate && npm run build:server`
   - **Start Command**: `npm start`
   - **Environment**: Node
6. Add PostgreSQL database (free tier)
7. Set environment variables

### Step 2: Get Your Backend URL

After deploy, you'll get: `https://inex-backend.onrender.com`

### Step 3: Update Mobile Apps

1. Edit `client/src/api.ts`:
```typescript
const baseURL = isCapacitor 
  ? 'https://inex-backend.onrender.com/api'  // Your Render URL
  : '/api';
```

2. Rebuild apps:
```powershell
npm run build:driver
npm run build:admin
Copy-Item "dist\client\driver.html" "dist\index.html" -Force
Copy-Item "dist-admin\client\admin.html" "dist-admin\index.html" -Force
```

3. Sync to Android:
```powershell
cd client
Copy-Item "capacitor.config.driver.ts" "capacitor.config.ts" -Force
npx --prefix .. @capacitor/cli sync
# Rebuild in Android Studio
```

### Step 4: Deploy Web Frontend to Firebase (Optional)

```powershell
# Build web version
npm run build:client

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Need Help with Full Firebase Conversion?

Let me know and I can:
1. Convert Express routes to Cloud Functions
2. Migrate Prisma/SQLite to Firestore
3. Set up Firebase Storage for PDFs
4. Handle authentication with Firebase Auth

## Current Status

✅ Firebase initialized with project "rahti-819cb"
✅ Functions folder created
✅ Firestore configured
⏳ Backend needs deployment
⏳ Mobile apps need production URL

**Next step:** Choose between Render (easy) or Firebase (more work) for backend deployment.
