# Backend Deployment Guide 🚀

## Option 1: Deploy to Render.com (Recommended - Free Tier Available)

### Prerequisites
- GitHub account
- Your code pushed to GitHub
- Render.com account (free)

### Step-by-Step Instructions

#### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. Create Render Account

1. Go to [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub

#### 3. Deploy Using Blueprint (Easiest Method)

1. In Render Dashboard, click "New +" → "Blueprint"
2. Connect your GitHub repository: `pakkeer12/Expenses-Tracker`
3. Render will automatically detect `render.yaml`
4. Click "Apply"
5. Wait for deployment (5-10 minutes)

#### 4. Get Your Deployment URL

Once deployed, you'll see:
- Service Name: `expenses-tracker-api`
- URL: `https://expenses-tracker-api.onrender.com`

**Copy this URL! You'll need it for the mobile app.**

---

### Alternative: Manual Setup on Render

If the Blueprint doesn't work:

#### 1. Create PostgreSQL Database

1. In Render Dashboard: New + → PostgreSQL
2. Name: `expenses-tracker-db`
3. Plan: Free
4. Region: Choose closest to you
5. Click "Create Database"
6. Copy the "Internal Database URL"

#### 2. Create Web Service

1. In Render Dashboard: New + → Web Service
2. Connect your GitHub repo
3. Configure:
   - **Name:** `expenses-tracker-api`
   - **Runtime:** Node
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build && npm run db:push`
   - **Start Command:** `npm start`
   - **Plan:** Free

#### 3. Add Environment Variables

In the Web Service settings, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | [Paste Internal Database URL from step 1] |
| `SESSION_SECRET` | [Generate random string] |
| `PORT` | `10000` |

To generate SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. Deploy

Click "Create Web Service" and wait for deployment.

---

## Option 2: Deploy to Railway.app

### Step-by-Step

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `Expenses-Tracker` repository
6. Railway auto-detects Node.js:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
7. Add PostgreSQL:
   - In your project, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Railway automatically sets `DATABASE_URL`
8. Add environment variables:
   - `NODE_ENV`: `production`
   - `SESSION_SECRET`: [random string]
9. Click "Deploy"

Your URL will be: `https://your-project.railway.app`

---

## Option 3: Deploy to Heroku

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

```bash
# 1. Login to Heroku
heroku login

# 2. Create app
heroku create expenses-tracker-app

# 3. Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 5. Deploy
git push heroku main

# 6. Run migrations
heroku run npm run db:push

# 7. Open app
heroku open
```

Your URL: `https://expenses-tracker-app.herokuapp.com`

---

## After Deployment

### 1. Test Your Backend

Visit your deployment URL + `/api/health`:
```
https://your-app.onrender.com/api/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-12-10T...",
  "environment": "production"
}
```

### 2. Update Mobile App Configuration

Edit `client/src/config/api.config.ts`:

```typescript
const PRODUCTION_URL = 'https://your-app.onrender.com';
```

### 3. Rebuild Mobile App

```bash
# Build for production
npm run build

# Sync with Android
npm run android:build

# Open in Android Studio
npm run android:open

# Build APK in Android Studio
```

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (`production` or `development`) | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes (production) |
| `SESSION_SECRET` | Secret key for sessions | Yes |
| `PORT` | Server port (usually 10000 for Render) | Optional |
| `CORS_ORIGINS` | Allowed origins for CORS | Optional |

---

## Troubleshooting

### Build Fails

**Error:** `Cannot find module`
```bash
# Ensure all dependencies are in package.json dependencies, not devDependencies
npm install --save [missing-package]
```

**Error:** `Database connection failed`
- Check DATABASE_URL is set correctly
- Ensure database is created and accessible

### Database Issues

**Error:** `relation does not exist`
```bash
# Run migrations on your cloud database
# On Render: happens automatically in build command
# On Railway: add to start command
npm run db:push
```

### App Crashes on Start

Check logs:
- **Render:** Dashboard → Service → Logs tab
- **Railway:** Dashboard → Deployments → View logs
- **Heroku:** `heroku logs --tail`

Common issues:
- Missing environment variables
- Database not connected
- Port binding (use `process.env.PORT`)

---

## Cost Breakdown

### Free Tier Limits

**Render.com (Recommended):**
- ✅ Free PostgreSQL: 1GB storage, 97 connection limit
- ✅ Free Web Service: 750 hours/month, sleeps after 15min inactivity
- ⚠️ Cold start: 30-60 seconds on first request after sleep
- 💰 Paid: $7/month for always-on

**Railway.app:**
- ✅ $5 free credit/month
- ✅ No sleep
- 💰 Pay-as-you-go after free credit

**Heroku:**
- ❌ No free tier anymore
- 💰 $5/month minimum (Eco dynos)

---

## Production Checklist

Before going live:

- [ ] Code pushed to GitHub
- [ ] DATABASE_URL configured
- [ ] SESSION_SECRET set (random, secure)
- [ ] Environment variables set
- [ ] Database migrations run (`db:push`)
- [ ] Health check endpoint working
- [ ] API tested with Postman/curl
- [ ] Mobile app updated with production URL
- [ ] APK rebuilt with production config
- [ ] Tested on actual phone

---

## Next Steps

1. ✅ Deploy backend following steps above
2. ✅ Get your deployment URL
3. ✅ Update mobile app config
4. ✅ Rebuild APK
5. ✅ Test on your phone
6. 🎉 Enjoy your app working anywhere!

---

## Need Help?

- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app
- **PostgreSQL Migration:** See `migrations/` folder
- **GitHub Issues:** Open an issue in your repo

---

**Your backend is now ready for deployment! Follow the steps above and your app will be live in minutes.** 🚀
