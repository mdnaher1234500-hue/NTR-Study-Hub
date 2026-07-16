# NTR Study Hub — Vercel Deployment Guide

## Project Structure

This is a monorepo with two separate Next.js apps:

| App | Directory | Purpose |
|-----|-----------|---------|
| Admin Panel | `ntr_admin_panel/` | Upload PDFs, manage curriculum, manage admins |
| Student Website | `ntr_web_student/` | Students browse and download study materials |

Each app is deployed as a **separate Vercel project** using the monorepo's Root Directory setting.

---

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for production deployment"
git push
```

---

## Step 2: Deploy Student Website First

> Deploy the student website **first** so you have its URL for the admin panel env vars.

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your `NTR-Study-Hub` GitHub repository
3. Set **Root Directory** → `ntr_web_student`
4. Framework Preset: **Next.js** (auto-detected)
5. Build Command: `npm run build`
6. Install Command: `npm install`
7. Click **Deploy**

### Student App — Environment Variables

Add these in Vercel → Project Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyApL_VqIdpvYVpmUsNtLIVD6rC_fNr5zFY` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `ntr-study-hub-4df5f.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `ntr-study-hub-4df5f` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `ntr-study-hub-4df5f.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `252600020571` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:252600020571:web:7b49c6b7ea7941fdf6597e` |
| `NEXT_PUBLIC_ADMIN_APP_URL` | *(set after admin panel is deployed, e.g. `https://ntr-admin.vercel.app`)* |

After first deploy, note your student app URL (e.g. `https://ntr-web-student.vercel.app`).

---

## Step 3: Deploy Admin Panel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your `NTR-Study-Hub` GitHub repository
3. Set **Root Directory** → `ntr_admin_panel`
4. Framework Preset: **Next.js** (auto-detected)
5. Build Command: `npm run build`
6. Install Command: `npm install`
7. Click **Deploy**

### Admin Panel — Environment Variables

Add these in Vercel → Project Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyApL_VqIdpvYVpmUsNtLIVD6rC_fNr5zFY` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `ntr-study-hub-4df5f.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `ntr-study-hub-4df5f` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `ntr-study-hub-4df5f.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `252600020571` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:252600020571:web:7b49c6b7ea7941fdf6597e` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://huqzrlhcwznpedwgasrd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(your Supabase anon key)* |
| `NEXT_PUBLIC_STUDENT_APP_URL` | *(student app URL from Step 2, e.g. `https://ntr-web-student.vercel.app`)* |
| `FIREBASE_PROJECT_ID` | `ntr-study-hub-4df5f` *(for Add Admin Member feature)* |
| `FIREBASE_CLIENT_EMAIL` | *(from Firebase service account JSON)* |
| `FIREBASE_PRIVATE_KEY` | *(from Firebase service account JSON — paste with newlines)* |

---

## Step 4: Update NEXT_PUBLIC_ADMIN_APP_URL in Student App

Once the Admin Panel is deployed:

1. Go to your **Student App** in Vercel → Settings → Environment Variables
2. Add/update: `NEXT_PUBLIC_ADMIN_APP_URL` = `https://your-admin-panel.vercel.app`
3. Redeploy the student app (Vercel → Deployments → Redeploy)

---

## Step 5: Firebase — Add Production Domains

Firebase requires authorized domains before it will allow authentication from your deployed URLs.

1. Go to [Firebase Console](https://console.firebase.google.com) → `ntr-study-hub-4df5f`
2. Navigate to: **Authentication → Settings → Authorized Domains**
3. Click **Add domain** and add both your Vercel URLs:
   - `ntr-admin-panel.vercel.app` (your actual admin URL)
   - `ntr-web-student.vercel.app` (your actual student URL)

---

## Step 6: Firebase Admin SDK — Service Account (Optional)

> Required only for the **Add Admin Member** feature in the admin panel.

1. Go to [Firebase Console](https://console.firebase.google.com) → Project Settings → **Service Accounts**
2. Click **Generate New Private Key** → Download the JSON file
3. Open the JSON file and copy the values into Vercel env vars:
   - `FIREBASE_PROJECT_ID` → `project_id` field
   - `FIREBASE_CLIENT_EMAIL` → `client_email` field
   - `FIREBASE_PRIVATE_KEY` → `private_key` field (paste the entire `-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----` string)

> ⚠️ Never commit the service account JSON to GitHub.

---

## Step 7: Supabase — Add Production URLs to Allowed Origins

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → **Settings → API**
2. Under **CORS Allowed Origins**, add:
   - `https://your-admin-panel.vercel.app`

---

## Production Checklist

### Before Deploying
- [ ] All env vars added to Vercel for both projects
- [ ] Firebase authorized domains updated
- [ ] Supabase CORS origins updated

### After Deploying — Test Each Feature
- [ ] Admin login works on production URL
- [ ] Curriculum loads correctly
- [ ] Select a subject → go to Materials tab
- [ ] Select a unit → click SELECT FILE → Windows file picker opens
- [ ] Upload a PDF → progress bar fills → success message shown
- [ ] Student website loads uploaded PDFs
- [ ] PDF download/view works from student site
- [ ] Curriculum sync (Admin change → student sees it) works

---

## Local Development (No Changes Required)

Both apps continue to work locally with `npm run dev` without any `.env.local` file — hardcoded fallback values are in place.
