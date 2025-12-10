# Deployment Quick Checklist ✅

## Pre-Deployment

- [x] Database configuration updated (SQLite + PostgreSQL support)
- [x] Health check endpoint added
- [x] Render.yaml created
- [x] .env.example created
- [ ] Code committed to GitHub
- [ ] Code pushed to GitHub

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare backend for production deployment"
git push origin main
```

### 2. Deploy to Render.com

1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "Blueprint"
4. Select your repository: `pakkeer12/Expenses-Tracker`
5. Click "Apply"
6. Wait 5-10 minutes for deployment

### 3. Get Your URL

After deployment completes:
- Your URL will be: `https://expenses-tracker-api.onrender.com`
- Test it: `https://expenses-tracker-api.onrender.com/api/health`

### 4. Update Mobile App

Edit `client/src/config/api.config.ts`:
```typescript
const PRODUCTION_URL = 'https://expenses-tracker-api.onrender.com';
```

### 5. Rebuild Mobile App

```bash
npm run build
npm run android:build
npm run android:open
# Build APK in Android Studio
```

## Verification

- [ ] Backend deployed successfully
- [ ] Health endpoint returns 200 OK
- [ ] Database connected (check Render logs)
- [ ] Mobile app config updated
- [ ] APK rebuilt
- [ ] Tested on phone

## Your URLs

- **Backend API:** `https://expenses-tracker-api.onrender.com`
- **Health Check:** `https://expenses-tracker-api.onrender.com/api/health`
- **Render Dashboard:** https://dashboard.render.com

## Important Notes

⚠️ **Render Free Tier:**
- Spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Perfect for testing and personal use

💡 **Tip:** Keep the health endpoint open in a browser tab to prevent sleep

## Need Help?

See full guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
