# 🚀 Vercel Deployment Guide

## Quick Setup

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/healthtracker.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables:
   - `VITE_MESH_API_KEY` = `rsk_01KWYMTF1PY1HE7EAZ2BK8CPTW`
   - `VITE_MESH_API_URL` = `https://api.meshconnect.com/v1/chat/completions`
4. Click Deploy

### 3. Test Your Site
Visit your Vercel URL and test:
- Signup/Login
- AI Chatbot (confirms API key works)
- All features

## Environment Variables Security

**Important:** Your API key is stored securely in Vercel's environment and injected at build time. It's NOT visible in your git repository.

## Files Needed for Deployment

✅ Already created:
- `vercel.json` - Vercel configuration
- `.env.example` - Template for environment variables
- `.gitignore` - Prevents committing sensitive files

## Troubleshooting

**API key not working?**
- Check Vercel Dashboard → Environment Variables
- Ensure variables are set for all environments
- Redeploy the project

**404 errors?**
- `vercel.json` handles routing to `auth.html`
- Make sure it's committed to git
