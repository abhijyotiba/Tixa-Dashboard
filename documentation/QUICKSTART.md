# ⚡ Quick Start Guide

Get your Tixa Dashboard running with Supabase in 5 minutes!

---

## 🏃 Fast Track Setup

### 1️⃣ Get Supabase Credentials (2 min)

1. Go to [supabase.com](https://supabase.com) → Create account
2. Create new project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** 
   - **Anon key**

### 2️⃣ Configure Environment (1 min)

Create `.env.local` in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key...
API_BASE_URL=http://localhost:8000/api/v1
```

### 3️⃣ Configure Supabase Auth (1 min)

In Supabase Dashboard:
1. **Authentication** → **URL Configuration**
2. Add redirect URL: `http://localhost:3000/auth/callback`
3. Set Site URL: `http://localhost:3000`

### 4️⃣ Configure Backend (1 min)

Add to your FastAPI backend `.env`:

```bash
SUPABASE_PROJECT_URL=https://xxxxx.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase
```

**Get JWT Secret:** Supabase Dashboard → Settings → API → JWT Secret

**Restart backend:** `uvicorn app.main:app --reload`

### 5️⃣ Start Frontend (30 sec)

```bash
npm run dev
```

---

## ✅ Test It!

### Create Account
1. Visit `http://localhost:3000/auth/signup`
2. Enter email + password
3. Check email for confirmation (or confirm in Supabase Dashboard)

### Login
1. Visit `http://localhost:3000/auth/login`
2. Enter credentials
3. You should see the dashboard!

### Create API Key
1. Click **Settings** in sidebar
2. Enter key name (e.g., "Test Key")
3. Click **Generate Key**
4. **Copy the key** (shown only once!)

### Test API Key
```bash
curl -X GET http://localhost:8000/api/v1/logs \
  -H "X-API-Key: YOUR_KEY_HERE"
```

---

## 🎉 Done!

You now have:
- ✅ Working authentication
- ✅ API key management
- ✅ Secure backend integration

---

## 📚 Need More Details?

- **Full Setup Guide:** [FRONTEND_SETUP.md](./FRONTEND_SETUP.md)
- **Step-by-Step Checklist:** [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)
- **Implementation Details:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 🚨 Common Issues

**Can't login?**
- Clear browser cookies
- Check if env vars are correct

**Backend 401 error?**
- Verify `SUPABASE_JWT_SECRET` in backend
- Restart backend after adding env vars

**Email not received?**
- Check spam folder
- Manually confirm user in Supabase Dashboard → Auth → Users

---

## 🎯 What's Next?

1. Deploy to production (update URLs)
2. Customize email templates
3. Add team management
4. Set up monitoring

**Status:** Ready to code! 🚀
