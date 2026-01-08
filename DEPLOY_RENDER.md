# Deploy to Render - Step by Step Guide

## Step 1: Push to GitHub

1. Go to https://github.com/new
2. Create a new repository:
   - Name: `inex-pickup-system`
   - Description: `Logistics pickup management system`
   - Keep it Private or Public (your choice)
   - **Don't** initialize with README (we already have one)

3. Copy the repository URL (something like: `https://github.com/yourusername/inex-pickup-system.git`)

4. Run these commands:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/inex-pickup-system.git
git branch -M main
git push -u origin main
```

## Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

## Step 3: Create PostgreSQL Database

1. In Render Dashboard, click **New +**
2. Select **PostgreSQL**
3. Settings:
   - **Name**: `inex-database`
   - **Database**: `inex`
   - **User**: `inex_user`
   - **Region**: Choose closest to you (Europe for best performance)
   - **Plan**: Free (or Starter $7/month for better performance)
4. Click **Create Database**
5. **IMPORTANT**: Copy the **Internal Database URL** (starts with `postgresql://`)

## Step 4: Deploy Backend

1. Click **New +** → **Web Service**
2. Connect your GitHub repository: `inex-pickup-system`
3. Settings:
   - **Name**: `inex-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter $7/month)

4. **Environment Variables** (Click "Advanced"):
   ```
   DATABASE_URL = [Paste the Internal Database URL from Step 3]
   NODE_ENV = production
   PORT = 3000
   ```

5. Click **Create Web Service**

6. Wait for deployment (5-10 minutes)

## Step 5: Initialize Database

Once deployed, you need to create the database tables:

1. In Render Dashboard, go to your `inex-backend` service
2. Click **Shell** tab
3. Run:
```bash
npx prisma db push
```

This creates all the tables in your PostgreSQL database.

## Step 6: Get Your Backend URL

After deployment completes:
1. Your backend URL will be: `https://inex-backend.onrender.com`
2. Test it by visiting: `https://inex-backend.onrender.com/api/admin/pickups`
3. Should see: `{"success":true,"pickups":[]}`

## Step 7: Update Mobile Apps

Now update the apps to use the production URL:

1. Edit `client/src/api.ts`:
```typescript
const baseURL = isCapacitor 
  ? 'https://inex-backend.onrender.com/api'  // Your Render URL
  : '/api';
```

2. Rebuild both apps:
```powershell
cd C:\Users\dhif_\OneDrive\Desktop\Project\Inex
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
```

4. Open in Android Studio and rebuild both apps

## Step 8: Test Production Apps

1. Install updated apps on your phone
2. Apps now work from anywhere (WiFi or mobile data!)
3. Test creating a pickup, driver workflow, PDF generation

## Troubleshooting

### "Connection failed" in apps:
- Make sure Render service is running (not sleeping)
- Free tier sleeps after 15min inactivity - first request wakes it (takes 30s)
- Check backend URL is correct in `api.ts`

### Database errors:
- Make sure you ran `npx prisma db push` in Render shell
- Check DATABASE_URL environment variable is set correctly

### Build fails on Render:
- Check build logs in Render dashboard
- Make sure all dependencies are in `package.json`

## Current Status

✅ Git repository initialized
✅ Code committed
⏳ Waiting for: GitHub push
⏳ Waiting for: Render setup
⏳ Waiting for: Mobile app updates

## Next Steps

1. Create GitHub repository
2. Push code: `git push -u origin main`
3. Follow Steps 2-8 above

Your backend will be live at: `https://inex-backend.onrender.com`
