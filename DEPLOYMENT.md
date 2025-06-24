# Deployment Guide

## Frontend Deployment on Vercel

### 1. Prepare Frontend

```bash
cd frontend
npm install
npm run build  # Test build locally
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project" and import your GitHub repository
3. Set these configurations:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 3. Environment Variables in Vercel

Add these in Vercel dashboard under Settings > Environment Variables:

```
REACT_APP_API_URL=https://your-backend-domain.com
```

## Backend Deployment Options

### Option 1: Railway (Recommended)

#### Why Railway?

- Free tier with 500 hours/month
- Built-in PostgreSQL database
- Zero-config deployment
- Automatic HTTPS

#### Steps:

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the `railway.toml` file
5. Add PostgreSQL database:
   - Click "New" > "Database" > "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

#### Environment Variables in Railway:

```
SECRET_KEY=your_super_secret_key_here_at_least_32_characters_long
JWT_SECRET_KEY=your_jwt_secret_key_here_at_least_32_characters
FLASK_ENV=production
FLASK_DEBUG=False
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
```

### Option 2: Render

#### Steps:

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click "New" > "Web Service"
3. Connect your GitHub repository
4. Use these settings:
   - **Runtime**: Python 3
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && gunicorn --bind 0.0.0.0:$PORT app:create_app()`

#### Add PostgreSQL Database:

1. Click "New" > "PostgreSQL"
2. Copy the database URL
3. Add it as `DATABASE_URL` environment variable

### Option 3: Heroku

#### Steps:

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add PostgreSQL: `heroku addons:create heroku-postgresql:hobby-dev`
5. Deploy: `git push heroku main`

## Required Environment Variables

### Backend (Minimum Required):

```bash
SECRET_KEY=your_super_secret_key_here_at_least_32_characters_long
JWT_SECRET_KEY=your_jwt_secret_key_here_at_least_32_characters
FLASK_ENV=production
FLASK_DEBUG=False
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

### Frontend:

```bash
REACT_APP_API_URL=https://your-backend-domain.com
```

## Post-Deployment Steps

### 1. Update CORS Origins

After deploying frontend to Vercel, update the backend environment variable:

```bash
CORS_ORIGINS=https://your-actual-vercel-domain.vercel.app
```

### 2. Update Frontend API URL

After deploying backend, update the frontend environment variable:

```bash
REACT_APP_API_URL=https://your-actual-backend-domain.com
```

### 3. Test the Deployment

1. Visit your Vercel frontend URL
2. Try logging in with:
   - Email: `manager1@company.com`
   - Password: `password123`

## Troubleshooting

### CORS Issues

- Make sure `CORS_ORIGINS` includes your exact Vercel domain
- Check browser console for CORS errors

### Database Issues

- Ensure `DATABASE_URL` is set correctly
- Check if database service is running

### 502/503 Errors

- Check if `PORT` environment variable is being used
- Verify the start command is correct

## Security Notes

Since your app uses hardcoded authentication:

1. **This is for demo purposes only**
2. **Don't use in production with real user data**
3. **Consider implementing proper JWT authentication for production**

## Cost Estimation

### Railway (Recommended):

- **Free**: 500 hours/month (about 20 days)
- **Pro**: $5/month for unlimited

### Render:

- **Free**: Limited hours, spins down after 15 mins
- **Paid**: $7/month minimum

### Vercel:

- **Free**: Generous limits for most projects
- **Pro**: $20/month if needed
