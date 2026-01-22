# 🚀 Frontend Migration Checklist

Use this checklist to complete your Supabase integration setup.

---

## ⚙️ Configuration Steps

### 1. Environment Setup
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` from Supabase Dashboard
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase Dashboard
- [ ] Set `API_BASE_URL` to your backend URL

### 2. Supabase Project Setup
- [ ] Create Supabase account (if not done)
- [ ] Create new Supabase project
- [ ] Enable Email authentication
- [ ] Configure redirect URLs in Authentication settings:
  - [ ] `http://localhost:3000/auth/callback`
  - [ ] `http://localhost:3000/dashboard`
  - [ ] Production URLs (when ready)

### 3. Backend Configuration
- [ ] Ensure backend has `api_keys` table created
- [ ] Add `SUPABASE_PROJECT_URL` to backend `.env`
- [ ] Add `SUPABASE_JWT_SECRET` to backend `.env`
- [ ] Restart backend server

### 4. Test Authentication Flow
- [ ] Visit `http://localhost:3000/auth/signup`
- [ ] Create test account
- [ ] Check email for confirmation link
- [ ] Click confirmation link
- [ ] Login at `http://localhost:3000/auth/login`
- [ ] Verify redirect to dashboard

### 5. Test API Key Management
- [ ] Navigate to Settings page
- [ ] Create new API key with test name
- [ ] Copy generated key (save it!)
- [ ] Verify key appears in list
- [ ] Test key with cURL or Python:
  ```bash
  curl -X GET http://localhost:8000/api/v1/logs \
    -H "X-API-Key: YOUR_KEY_HERE"
  ```
- [ ] Revoke test key
- [ ] Verify revoked key no longer works

### 6. Test Route Protection
- [ ] Logout
- [ ] Try accessing `/dashboard` (should redirect to login)
- [ ] Try accessing `/settings` (should redirect to login)
- [ ] Login
- [ ] Try accessing `/auth/login` (should redirect to dashboard)

---

## 🔍 Verification Commands

### Check if dependencies installed:
```bash
npm list @supabase/supabase-js @supabase/ssr
```

### Check environment variables loaded:
```bash
# Add this temporarily to a page and check browser console
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

### Test backend connectivity:
```bash
curl http://localhost:8000/health
```

---

## 📝 What Changed

### New Files ✅
- `utils/supabase/client.ts` - Browser Supabase client
- `utils/supabase/server.ts` - Server Supabase client
- `middleware.ts` - Route protection
- `app/auth/callback/route.ts` - Email confirmation handler
- `.env.local.example` - Environment template
- `FRONTEND_SETUP.md` - Setup documentation

### Updated Files 🔄
- `app/auth/login/page.tsx` - Now functional with Supabase
- `app/auth/signup/page.tsx` - Now functional with Supabase
- `app/settings/page.tsx` - Full API key management UI
- `app/api/proxy/[...path]/route.ts` - Bearer token authentication
- `components/layout/Header.tsx` - User menu with logout
- `package.json` - Added Supabase dependencies

---

## 🎯 Expected Behavior

### After Complete Setup:

1. **Unauthenticated users:**
   - Can only access `/auth/login` and `/auth/signup`
   - Redirected to login when accessing protected routes

2. **Authenticated users:**
   - Can access all dashboard routes
   - Can create/manage API keys
   - See their email in header
   - Can logout

3. **API Keys:**
   - Generated keys work with backend
   - Revoked keys immediately stop working
   - Keys are user-specific (isolation enforced)

---

## 🐛 Troubleshooting

### Issue: "Unauthorized: No active session"
**Solution:** Clear browser cookies and login again

### Issue: Backend returns 401
**Solutions:**
1. Check `SUPABASE_JWT_SECRET` in backend
2. Restart backend after adding env vars
3. Verify JWT secret matches Supabase project

### Issue: Email confirmation not received
**Solutions:**
1. Check spam folder
2. Use Supabase Dashboard > Auth > Users to manually confirm
3. Configure custom SMTP in Supabase

### Issue: API key doesn't work
**Solutions:**
1. Verify backend has `api_keys` table
2. Check if key is active (not revoked)
3. Ensure using `X-API-Key` header (not Authorization)

---

## 📊 Migration Status

```
✅ Phase 1: Dependencies Installed
✅ Phase 2: Supabase Clients Created  
✅ Phase 3: Middleware Configured
✅ Phase 4: Auth Pages Updated
✅ Phase 5: Proxy Route Updated
✅ Phase 6: Settings Page Created
✅ Phase 7: Header with Logout Added
✅ Phase 8: Documentation Created

🎉 FRONTEND MIGRATION COMPLETE!
```

---

## 🚀 Production Deployment Checklist

When deploying to production:

- [ ] Update Supabase redirect URLs
- [ ] Set production `API_BASE_URL` in Vercel/hosting
- [ ] Configure custom domain in Supabase
- [ ] Enable rate limiting
- [ ] Set up monitoring/alerts
- [ ] Configure email templates
- [ ] Enable MFA for admin accounts
- [ ] Set up backup strategy

---

## 📞 Need Help?

1. Check [FRONTEND_SETUP.md](./FRONTEND_SETUP.md) for detailed docs
2. Review backend logs for API errors
3. Check browser console for frontend errors
4. Verify all environment variables are set

**Status**: Ready for testing! 🎉
