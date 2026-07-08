# 🏥 HealthTracker - Personal Health Journal

A secure, privacy-focused web application for patients to track their health vitals, medications, food intake, and get AI-powered health insights.

## ✨ Features

### 📊 Health Tracking
- **Blood Pressure Monitoring**: Track systolic and diastolic readings with timestamps
- **Blood Sugar Logging**: Record glucose levels (fasting, post-meal, random, bedtime)
- **Food Diary**: Log meals with descriptions and calorie estimates
- **Medicine Tracker**: Keep track of medications, dosages, and frequencies

### 🤖 AI Health Assistant
- Powered by MESH API
- Context-aware responses based on your health data
- General health advice and information
- Secure, encrypted communication

### 📈 Insights & Analytics
- Visual charts showing BP and blood sugar trends
- Personalized health insights based on your data
- Comparison with baseline values
- Health status indicators

### 📄 Reports & Export
- Generate PDF reports for doctor visits
- Export all your data as JSON backup
- Include patient info and health history

### 🔒 Privacy & Security
- **100% LOCAL DATA STORAGE**: All your health data is stored only on your device
- **NO SERVER UPLOADS**: We (developers) do NOT have access to your personal health information
- **USER AUTHENTICATION**: Secure login system with password protection
- **DATA ISOLATION**: Each user's data is completely separate
- **EXPORT ANYTIME**: Full control over your data with export/delete options

---

## 🚀 Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/healthtracker)

### Manual Deployment Steps

#### 1. Prerequisites
- A [Vercel account](https://vercel.com/signup) (free)
- Your MESH API key from [meshconnect.com](https://meshconnect.com/)
- Git installed on your computer

#### 2. Prepare Your Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - HealthTracker app"

# Create a repository on GitHub and push
git remote add origin https://github.com/yourusername/healthtracker.git
git branch -M main
git push -u origin main
```

#### 3. Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? healthtracker (or your choice)
# - Directory? ./
# - Override settings? No
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: (leave empty)

#### 4. Configure Environment Variables

🔐 **IMPORTANT: Never commit your API key to git!**

**In Vercel Dashboard:**

1. Go to your project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_MESH_API_KEY` | `rsk_01KWYMTF1PY1HE7EAZ2BK8CPTW` | Production, Preview, Development |
| `VITE_MESH_API_URL` | `https://api.meshconnect.com/v1/chat/completions` | Production, Preview, Development |

**Using Vercel CLI:**

```bash
# Add environment variables
vercel env add VITE_MESH_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, Development

vercel env add VITE_MESH_API_URL
# Paste: https://api.meshconnect.com/v1/chat/completions
# Select: Production, Preview, Development

# Redeploy to apply changes
vercel --prod
```

#### 5. Verify Deployment

1. Visit your deployed URL (e.g., `https://healthtracker.vercel.app`)
2. Test the signup/login flow
3. Try the AI chatbot to verify API key is working
4. Check browser console for any errors

---

## 🔐 Environment Variables Security

### What NOT to Do ❌
- ❌ Never commit `.env` file to git
- ❌ Never hardcode API keys in client-side code
- ❌ Never share your API keys publicly

### What TO Do ✅
- ✅ Use Vercel's environment variables dashboard
- ✅ Keep `.env` in `.gitignore`
- ✅ Use `.env.example` as a template (without real values)
- ✅ Rotate API keys if accidentally exposed

### How Environment Variables Work in This App

1. **Local Development**: 
   - API key is in `script.js` as fallback (for testing only)
   - Should be moved to `.env` for production code

2. **Vercel Production**:
   - API key is stored securely in Vercel's environment
   - Injected at build/runtime
   - Not exposed in client code

---

## 📁 Project Structure

```
HealthTracker/
├── auth.html              # Login/signup page (entry point)
├── auth.css               # Authentication styling
├── auth.js                # Authentication logic
├── index.html             # Main application
├── styles.css             # Main application styling
├── script.js              # Main application logic
├── vercel.json            # Vercel configuration
├── .env.example           # Environment variables template
├── .env                   # Your actual env vars (NOT in git)
├── .gitignore             # Git ignore file
└── README.md              # This file
```

---

## 🔧 Configuration Files

### `vercel.json`
Configures how Vercel builds and serves your app:
- Sets default route to `auth.html`
- Configures security headers
- Specifies static file handling

### `.env.example`
Template for required environment variables. Copy to `.env` and fill in:
```bash
cp .env.example .env
# Edit .env with your actual values
```

### `.gitignore`
Prevents sensitive files from being committed:
- `.env` (contains your API key)
- `node_modules/`
- `.vercel/` (Vercel CLI cache)

---

## 🛠️ Local Development

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/healthtracker.git
cd healthtracker

# Copy environment variables
cp .env.example .env

# Edit .env and add your MESH API key
nano .env  # or use your preferred editor
```

### Run Locally

```bash
# Option 1: Python HTTP Server
python3 -m http.server 8080

# Option 2: Node.js HTTP Server
npx serve

# Option 3: PHP Server
php -S localhost:8080
```

Visit: `http://localhost:8080/auth.html`

---

## 🚨 Troubleshooting Vercel Deployment

### Issue: Environment Variables Not Working

**Symptoms**: AI chatbot shows error, console shows "API key not defined"

**Solution**:
1. Check Vercel Dashboard → Settings → Environment Variables
2. Ensure variables are set for all environments
3. Redeploy: `vercel --prod`
4. Clear browser cache and try again

### Issue: 404 on Page Refresh

**Symptoms**: Direct links or page refresh shows 404

**Solution**: 
- Already handled by `vercel.json` routing
- If issue persists, check that `vercel.json` is in root directory

### Issue: Static Files Not Loading

**Symptoms**: No styles, scripts not working

**Solution**:
1. Check all files are committed to git
2. Verify file paths in HTML are relative (no leading `/`)
3. Check Vercel build logs for errors

### Issue: API Key Exposed in Client Code

**Symptoms**: API key visible in browser DevTools

**Note**: For static sites, environment variables are injected at build time and may be visible in the client bundle. This is a limitation of static hosting. Consider these options:

1. **Accept the risk** - For free-tier APIs with rate limits
2. **Use API proxy** - Create a Vercel serverless function to proxy API calls
3. **Upgrade to server-side** - Use Next.js or similar framework

---

## 📖 User Guide

### First Time Setup
1. Visit your deployed URL (e.g., `https://yourapp.vercel.app`)
2. Click "Sign up here"
3. Fill in your details and accept privacy policy
4. Complete your health profile
5. Start tracking your health!

### Daily Use
- **Dashboard**: View your latest readings and insights
- **Vitals**: Record BP and blood sugar
- **Food Diary**: Log meals
- **Medicines**: Track medications
- **AI Assistant**: Ask health questions
- **Profile**: View your information

---

## 🔒 Privacy & Data Security

### Where Data is Stored
- ✅ **Browser localStorage**: All health data
- ✅ **Your device only**: No server storage
- ✅ **Vercel Environment**: Only API keys (secure)

### What Gets Sent to External Services
- ✅ **MESH API**: Only chat messages (for AI responses)
- ❌ **No health data**: BP, sugar, food logs stay local
- ❌ **No analytics**: No tracking scripts

### Data Backup Recommendations
1. **Export regularly**: Use "Export Data" button
2. **Save JSON files**: Keep backups offline
3. **Before clearing browser**: Always export first

---

## 🆘 Support & Issues

### Getting Help
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check browser console for errors
4. Verify environment variables are set

### Common Questions

**Q: Can other users see my data?**  
A: No! All data is stored in your browser's localStorage, isolated by user.

**Q: What happens if I clear my browser data?**  
A: All health records will be lost. Export regularly!

**Q: Can I use this on multiple devices?**  
A: You can login from any device, but data is device-specific. Consider regular exports.

**Q: Is the AI chatbot safe?**  
A: Yes, it uses encrypted HTTPS. However, avoid sharing extremely sensitive information.

---

## 📄 License

This project is open source and available for personal use.

---

## 🙏 Acknowledgments

- Chart.js for visualization
- jsPDF for report generation  
- MESH API for AI capabilities
- Vercel for hosting

---

## 🔄 Updates & Maintenance

### Updating API Keys

```bash
# Update environment variable in Vercel
vercel env rm VITE_MESH_API_KEY production
vercel env add VITE_MESH_API_KEY production

# Redeploy
vercel --prod
```

### Deploying Updates

```bash
# Commit your changes
git add .
git commit -m "Your update message"
git push origin main

# Vercel auto-deploys from main branch
# Or manually: vercel --prod
```

---

**Last Updated**: July 2024  
**Version**: 1.0.0  
**Deployment Platform**: Vercel

---

## 📞 Quick Links

- 🌐 **Live Demo**: [Your Vercel URL]
- 📚 **GitHub Repo**: [Your GitHub URL]
- 🔑 **MESH API**: https://meshconnect.com/
- 🚀 **Vercel Docs**: https://vercel.com/docs

---

**Remember**: Your health data is YOUR data. We never see it, never store it on servers, and you have complete control. 🔒
