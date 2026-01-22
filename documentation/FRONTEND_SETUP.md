# Frontend Setup Guide - Supabase Authentication & API Key Management

This guide will help you configure the Tixa Dashboard with Supabase authentication and API key management.

---

## 📋 Prerequisites

1. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
2. **Supabase Project** - Create a new project in Supabase Dashboard
3. **Backend Running** - Your FastAPI backend should be running with the new API key system

---

## 🚀 Setup Instructions

### Step 1: Get Supabase Credentials

1. Go to your Supabase Project Dashboard
2. Navigate to **Settings > API**
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGc...`)

### Step 2: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   API_BASE_URL=http://localhost:8000/api/v1
   ```

### Step 3: Configure Supabase Authentication Settings

1. In Supabase Dashboard, go to **Authentication > URL Configuration**
2. Add the following URLs:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/dashboard`

3. Enable Email Provider:
   - Go to **Authentication > Providers**
   - Ensure **Email** is enabled
   - Configure email templates if needed

### Step 4: Backend Configuration

Make sure your FastAPI backend has these environment variables:

```bash
SUPABASE_PROJECT_URL=https://your-project-ref.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-api-settings
```

**To get JWT Secret:**
1. Supabase Dashboard > Settings > API
2. Copy the **JWT Secret** (different from the anon key)

### Step 5: Install Dependencies & Run

```bash
# Install dependencies (already done)
npm install

# Run development server
npm run dev
```

---

## 🔐 How Authentication Works

### User Flow

1. **Signup** (`/auth/signup`)
   - User creates account with email/password
   - Supabase sends confirmation email
   - User clicks link to verify

2. **Login** (`/auth/login`)
   - User enters credentials
   - Supabase validates and creates session
   - JWT token stored in cookies

3. **Protected Routes**
   - Middleware checks for valid session
   - Redirects to login if not authenticated

4. **API Key Management** (`/settings`)
   - User creates API keys for SDK/automation
   - Keys stored in database (hashed)
   - Used with `X-API-Key` header

### Technical Flow

```
Frontend (Next.js)
    ↓
    ↓ [JWT in Cookie]
    ↓
Middleware (Auth Check)
    ↓
    ↓ [Valid Session]
    ↓
Proxy Route (/api/proxy/*)
    ↓
    ↓ [Bearer Token: JWT]
    ↓
Backend (FastAPI)
    ↓
    ↓ [Validates JWT]
    ↓
Database (Supabase)
```

---

## 🔑 API Key Management

### Creating API Keys

1. Login to dashboard
2. Navigate to **Settings**
3. Enter a descriptive name (e.g., "Production Server")
4. Click **Generate Key**
5. **Copy the key immediately** (shown only once!)

### Using API Keys

#### Python SDK Example

```python
import requests

headers = {
    "X-API-Key": "tixa_live_xxxxxxxxxx"  # Your generated key
}

response = requests.post(
    "https://your-backend.com/api/v1/logs",
    json={
        "message": "User logged in",
        "level": "info"
    },
    headers=headers
)
```

#### cURL Example

```bash
curl -X POST https://your-backend.com/api/v1/logs \
  -H "X-API-Key: tixa_live_xxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test log", "level": "info"}'
```

### Revoking Keys

1. Go to **Settings**
2. Find the key in the list
3. Click the trash icon
4. Confirm deletion

**Note**: Revoked keys stop working immediately!

---

## 🗂️ New Files Created

```
utils/
  supabase/
    client.ts           # Browser Supabase client
    server.ts           # Server-side Supabase client

middleware.ts           # Route protection
app/
  auth/
    login/page.tsx      # Login page
    signup/page.tsx     # Signup page
    callback/route.ts   # OAuth callback handler
  api/
    proxy/[...path]/route.ts  # Updated with Bearer auth
  settings/page.tsx     # API key management UI

.env.local.example      # Environment template
```

---

## 🧪 Testing the Setup

### 1. Test Signup

```bash
# Visit http://localhost:3000/auth/signup
# Enter email and password
# Check your email for confirmation
```

### 2. Test Login

```bash
# Visit http://localhost:3000/auth/login
# Enter credentials
# Should redirect to dashboard
```

### 3. Test API Key Creation

```bash
# Login to dashboard
# Go to Settings
# Create new API key
# Copy the generated key
```

### 4. Test API Key Usage

```bash
# Use the copied key in a request
curl -X GET http://localhost:8000/api/v1/logs \
  -H "X-API-Key: YOUR_GENERATED_KEY"
```

---

## 🚨 Common Issues

### "Unauthorized: No active session"

**Cause**: User not logged in or session expired

**Fix**: 
- Clear cookies and login again
- Check if Supabase URL/keys are correct in `.env.local`

### "JWT Secret not configured"

**Cause**: Backend missing `SUPABASE_JWT_SECRET`

**Fix**: 
- Add JWT secret to backend `.env` file
- Get it from Supabase Dashboard > Settings > API

### "Failed to connect to backend service"

**Cause**: Backend not running or wrong URL

**Fix**:
- Start FastAPI backend: `uvicorn app.main:app --reload`
- Check `API_BASE_URL` in `.env.local`

### Email Confirmation Not Working

**Cause**: Supabase email settings not configured

**Fix**:
- Go to Authentication > Email Templates
- Configure SMTP settings or use Supabase's built-in service
- For development, check Supabase Dashboard > Authentication > Users

---

## 📚 Architecture Overview

### Authentication Layers

1. **Middleware** (`middleware.ts`)
   - Runs on every request
   - Checks for valid Supabase session
   - Protects dashboard routes

2. **Proxy Route** (`app/api/proxy/[...path]/route.ts`)
   - Bridges frontend and backend
   - Injects JWT bearer token
   - Handles all HTTP methods

3. **Backend Validation** (FastAPI)
   - Validates JWT signature
   - Extracts user_id from token
   - Enforces user isolation

### Database Schema

**api_keys table** (Supabase):
- `id` - UUID primary key
- `user_id` - UUID (links to auth.users)
- `name` - String (user-defined)
- `key_hash` - SHA-256 hash
- `prefix` - First 8 chars (for display)
- `is_active` - Boolean
- `created_at` - Timestamp
- `last_used_at` - Timestamp

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Rotate API keys regularly** - Revoke and create new ones
3. **Use descriptive names** - Know which key is for what
4. **Monitor last_used_at** - Detect unused/compromised keys
5. **Enable MFA** - In Supabase for admin accounts

---

## 📞 Support

For issues:
1. Check backend logs: `tail -f logs/app.log`
2. Check browser console for frontend errors
3. Verify environment variables are loaded: `console.log(process.env)`

---

## ✅ Next Steps

- [ ] Deploy to production (update redirect URLs)
- [ ] Configure custom SMTP for emails
- [ ] Set up API key rotation policies
- [ ] Add usage analytics dashboard
- [ ] Implement rate limiting per key

---

**Status**: ✅ Frontend Setup Complete!

You can now:
- Sign up and login users
- Create and manage API keys
- Make authenticated requests to backend
- View logs associated with your account
