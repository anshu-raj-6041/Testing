# KaryaSetu - Local Setup Guide

Complete guide to set up and run KaryaSetu (Kanban Board Application) on your local machine.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)
8. [Development Workflow](#development-workflow)

---

## Prerequisites

### Required Software
- **Node.js**: >= 18.18.0 (LTS recommended)
- **npm**: >= 10.0.0 (comes with Node.js)
- **Git**: Latest version
- **Code Editor**: VS Code (recommended) or any IDE

### Check Installations
```powershell
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 10.x.x or higher

# Check Git
git --version
```

### Create Accounts (Free Tier Available)
1. **Supabase**: https://supabase.com/dashboard/sign-up
   - Database and backend services
   - Free tier: 500MB database, 2GB bandwidth

2. **Clerk**: https://clerk.com/sign-up
   - Authentication and user management
   - Free tier: 10,000 monthly active users

---

## Quick Start

```powershell
# 1. Clone the repository
git clone <repository-url>
cd Hintro

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy .env.example to .env.local and fill in your values
Copy-Item .env.example .env.local

# 4. Run the development server
npm run dev

# 5. Open your browser to http://localhost:3000
```

---

## Detailed Setup

### Step 1: Clone Repository

```powershell
# Using HTTPS
git clone https://github.com/yourusername/karyasetu.git

# Or using SSH
git clone git@github.com:yourusername/karyasetu.git

# Navigate to project directory
cd karyasetu
```

### Step 2: Install Dependencies

```powershell
# Install all project dependencies
npm install

# This will install:
# - Next.js 15.5.2
# - React 19.1.0
# - TypeScript
# - Supabase client
# - Clerk authentication
# - Tailwind CSS
# - And all other dependencies
```

**Expected output:**
```
added 350 packages, and audited 351 packages in 45s
```

### Step 3: Set Up Supabase

#### 3.1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: KaryaSetu (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"** (takes ~2 minutes)

#### 3.2: Get Supabase Credentials

1. In your Supabase project dashboard
2. Go to **Settings → API**
3. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

#### 3.3: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the entire schema from `docs/DATABASE_SCHEMA.md` (SQL Schema Creation section)
4. Click **"Run"**
5. Verify tables are created in **Table Editor**

**Tables to verify:**
- ✅ boards
- ✅ columns
- ✅ tasks

### Step 4: Set Up Clerk Authentication

#### 4.1: Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click **"Add application"**
3. Configure:
   - **Name**: KaryaSetu
   - **Sign-in options**: Enable Email and/or Google
4. Click **"Create application"**

#### 4.2: Get Clerk API Keys

1. In Clerk dashboard, go to **API Keys**
2. Copy these values:
   - **Publishable Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...`

#### 4.3: Configure Clerk Webhook (Optional for production)

1. In Clerk dashboard, go to **Webhooks**
2. Click **"Add Endpoint"**
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/clerk`
4. Subscribe to events: `user.created`, `user.updated`, `user.deleted`

### Step 5: Configure Environment Variables

#### 5.1: Create .env.local File

Create a file named `.env.local` in the root directory:

```powershell
# In PowerShell
New-Item -Path . -Name ".env.local" -ItemType File

# Or use VS Code
code .env.local
```

#### 5.2: Add Environment Variables

Copy this template into `.env.local`:

```bash
# ============================================
# SUPABASE CONFIGURATION
# ============================================
# Get these from Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ============================================
# CLERK AUTHENTICATION
# ============================================
# Get these from Clerk Dashboard → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# ============================================
# CLERK REDIRECT URLS
# ============================================
# These control where users go after sign-in/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# ============================================
# APPLICATION CONFIGURATION
# ============================================
# Base URL for your application (change in production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 5.3: Replace Placeholder Values

**Before:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
```

**After:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
```

Repeat for all placeholder values.

### Step 6: Verify Setup

```powershell
# Check if .env.local exists
Test-Path .env.local
# Should output: True

# View environment variables (without showing sensitive values)
Get-Content .env.local | Select-String -Pattern "NEXT_PUBLIC"
```

---

## Database Setup

### Initial Schema Setup

The database schema is automatically created through Supabase SQL Editor. Here's what gets created:

#### Tables
1. **boards**: Store Kanban boards
2. **columns**: Store board columns (To Do, In Progress, etc.)
3. **tasks**: Store individual tasks

#### Row Level Security (RLS)
Policies are automatically applied to ensure:
- Users can only see their own boards
- Users can only modify their own data
- Proper cascading deletes

#### Sample Data (Optional)

To add sample data for testing:

```sql
-- Run this in Supabase SQL Editor after replacing 'your_clerk_user_id'

-- Insert sample board
INSERT INTO boards (id, user_id, title, description, color)
VALUES (
  'sample-board-001',
  'your_clerk_user_id',
  'Sample Project',
  'This is a sample board to get started',
  'bg-purple-500'
);

-- Insert sample columns
INSERT INTO columns (id, board_id, user_id, title, sort_order) VALUES
('col-001', 'sample-board-001', 'your_clerk_user_id', 'To Do', 0),
('col-002', 'sample-board-001', 'your_clerk_user_id', 'In Progress', 1),
('col-003', 'sample-board-001', 'your_clerk_user_id', 'Done', 2);

-- Insert sample tasks
INSERT INTO tasks (column_id, title, description, priority, sort_order) VALUES
('col-001', 'Setup development environment', 'Install Node.js, npm, and clone repo', 'high', 0),
('col-002', 'Create homepage design', 'Design in Figma', 'medium', 0),
('col-003', 'Project kickoff meeting', 'Held on Monday', 'low', 0);
```

### Database Migrations

For production deployments, use Supabase migrations:

```powershell
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Pull current schema
supabase db pull

# Apply migrations
supabase db push
```

---

## Running the Application

### Development Mode

```powershell
# Start development server with Turbopack
npm run dev

# Server will start at:
# ➜  Local:   http://localhost:3000
# ➜  Network: http://192.168.x.x:3000
```

**Features in Dev Mode:**
- ✅ Hot Module Replacement (HMR)
- ✅ Fast Refresh
- ✅ Detailed error messages
- ✅ Source maps for debugging

### Production Build

```powershell
# Create optimized production build
npm run build

# Output:
#   Route (app)                              Size     First Load JS
#   ┌ ○ /                                    5.2 kB          95 kB
#   ├ ○ /boards/[id]                         4.8 kB          94 kB
#   └ ○ /dashboard                           6.1 kB          96 kB
```

### Run Production Server

```powershell
# After building, start production server
npm run start

# Server will start at http://localhost:3000
```

### Linting

```powershell
# Check code for issues
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

---

## Accessing the Application

### 1. Open Browser
Navigate to: **http://localhost:3000**

### 2. Sign Up
1. Click **"Get Started"** or **"Sign Up"**
2. Enter email and create password
3. Verify email (check inbox)
4. You'll be redirected to dashboard

### 3. Create Your First Board
1. On dashboard, click **"Create Board"**
2. Enter:
   - **Title**: "My First Board"
   - **Description**: Optional
   - **Color**: Choose a color
3. Click **"Create"**

### 4. Add Columns
Default columns are created automatically:
- To Do
- In Progress
- Review
- Done

### 5. Add Tasks
1. Click **"+"** button in any column
2. Fill in task details:
   - Title (required)
   - Description (optional)
   - Assignee (optional)
   - Due Date (optional)
   - Priority (low/medium/high)
3. Click **"Create Task"**

### 6. Drag and Drop
- Click and drag tasks between columns
- Reorder tasks within columns
- Changes save automatically

---

## Troubleshooting

### Common Issues

#### Issue 1: Port 3000 Already in Use
**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```powershell
# Find process using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill the process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force

# Or run on different port
npm run dev -- -p 3001
```

#### Issue 2: Environment Variables Not Loading
**Error:**
```
Error: supabase client is not initialized
```

**Solution:**
```powershell
# 1. Verify .env.local exists
Test-Path .env.local

# 2. Check file contents (hide sensitive data)
Get-Content .env.local

# 3. Restart development server
# Stop server (Ctrl+C) and restart
npm run dev
```

#### Issue 3: Supabase Connection Error
**Error:**
```
Failed to fetch data from Supabase
```

**Solutions:**
```powershell
# 1. Verify Supabase URL is correct
# Should be: https://xxxxx.supabase.co (no trailing slash)

# 2. Check Supabase project status
# Go to Supabase dashboard → Project is green/active

# 3. Verify RLS policies are enabled
# Supabase → Authentication → Policies → Should see policies for boards, columns, tasks

# 4. Test connection in browser console
# Open http://localhost:3000
# Open DevTools → Console
# Check for errors
```

#### Issue 4: Clerk Authentication Error
**Error:**
```
Clerk: Missing publishable key
```

**Solution:**
```bash
# In .env.local, ensure this format:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# NOT this:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxx"

# Restart server after fixing
```

#### Issue 5: Database Tables Not Found
**Error:**
```
relation "public.boards" does not exist
```

**Solution:**
```sql
-- 1. Go to Supabase → SQL Editor
-- 2. Run this to check if tables exist:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 3. If tables missing, run full schema from DATABASE_SCHEMA.md
-- 4. Verify tables created:
--    - boards ✓
--    - columns ✓
--    - tasks ✓
```

#### Issue 6: Drag and Drop Not Working
**Problem:** Can't drag tasks between columns

**Solution:**
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh page (Ctrl + F5)
3. Check browser console for JavaScript errors
4. Verify @dnd-kit package is installed:
   ```powershell
   npm list @dnd-kit/core
   # Should show: @dnd-kit/core@6.3.1
   ```

---

## Development Workflow

### Recommended Workflow

```powershell
# 1. Pull latest changes (if working in team)
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start development server
npm run dev

# 4. Make changes to code

# 5. Test changes in browser
# http://localhost:3000

# 6. Check for errors
npm run lint

# 7. Build to verify production readiness
npm run build

# 8. Commit changes
git add .
git commit -m "Add feature: description"
git push origin main
```

### Hot Reload

When you save changes:
- **React components**: Instant update (Fast Refresh)
- **CSS/Tailwind**: Instant update
- **Environment variables**: Requires server restart
- **next.config.ts**: Requires server restart

### Browser DevTools

**Recommended extensions:**
- React Developer Tools
- Redux DevTools (if using Redux)
- Tailwind CSS IntelliSense

**Useful shortcuts:**
- `F12`: Open DevTools
- `Ctrl + Shift + C`: Inspect element
- `Ctrl + Shift + I`: Open console

---

## Project Structure Navigation

```
c:\Users\anshu\OneDrive\Desktop\Hintro\
│
├── app/                        # Next.js App Router
│   ├── (auth)/                # Authentication routes
│   ├── boards/[id]/           # Dynamic board routes
│   ├── dashboard/             # Dashboard page
│   └── page.tsx               # Homepage
│
├── components/                # Shared UI components
│   ├── layout/                # Navbar, Footer
│   ├── ui/                    # Shadcn components
│   └── common/                # Reusable components
│
├── features/                  # Feature modules
│   ├── auth/                  # Authentication
│   ├── boards/                # Board management
│   └── dashboard/             # Dashboard features
│
├── lib/                       # Core libraries
│   ├── supabase/              # Supabase client & config
│   ├── services.ts            # API service layer
│   └── utils.ts               # Utility functions
│
├── docs/                      # Documentation
│   ├── FRONTEND_ARCHITECTURE.md
│   ├── BACKEND_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_CONTRACT.md
│   └── SETUP_GUIDE.md (this file)
│
└── .env.local                 # Environment variables (not in git)
```

---

## Testing the Application

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up with email
- [ ] Sign in with credentials
- [ ] Sign out
- [ ] Redirect to dashboard after login

**Dashboard:**
- [ ] View all boards
- [ ] Create new board
- [ ] Edit board (title, description, color)
- [ ] Delete board
- [ ] Filter boards
- [ ] View stats (total boards, tasks)

**Kanban Board:**
- [ ] View board details
- [ ] Create column
- [ ] Edit column title
- [ ] Delete column
- [ ] Create task
- [ ] Edit task
- [ ] Delete task
- [ ] Drag task to different column
- [ ] Reorder tasks in same column
- [ ] Filter tasks by priority/assignee
- [ ] View task due dates

**UI/UX:**
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states shown
- [ ] Error messages displayed
- [ ] Success confirmations
- [ ] Smooth animations

---

## Performance Optimization

### Development Best Practices

```typescript
// Use React.memo for expensive components
const TaskCard = React.memo(({ task }) => {
  return <div>{task.title}</div>;
});

// Use useCallback for event handlers
const handleTaskUpdate = useCallback((id, updates) => {
  return taskService.updateTask(supabase, id, updates);
}, []);

// Use useMemo for expensive computations
const filteredTasks = useMemo(() => {
  return tasks.filter(task => task.priority === 'high');
}, [tasks]);
```

### Build Optimization

```powershell
# Analyze bundle size
npm run build

# Check output:
# Route (app)              Size     First Load JS
# Look for routes > 100 kB (investigate!)
```

---

## Deploying to Production

### Vercel (Recommended)

```powershell
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Set environment variables in Vercel dashboard
# Vercel → Project → Settings → Environment Variables
# Add all variables from .env.local
```

### Manual Deployment

```powershell
# 1. Build production
npm run build

# 2. Test production build locally
npm run start

# 3. Deploy /out folder to hosting service
# (Netlify, AWS, Azure, etc.)
```

---

## Getting Help

### Resources
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

### Common Commands Reference

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm run start

# Lint code
npm run lint

# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

---

## Next Steps

After successful setup:

1. **Explore the codebase**: Read through `docs/FRONTEND_ARCHITECTURE.md`
2. **Understand database**: Review `docs/DATABASE_SCHEMA.md`
3. **Learn API contracts**: Study `docs/API_CONTRACT.md`
4. **Customize**: Change colors, add features, modify UI
5. **Deploy**: Deploy to Vercel for production use

---

## Support

For issues or questions:
1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review documentation in `/docs` folder
3. Check browser console for errors
4. Verify environment variables are set correctly
5. Ensure database schema is applied

---

**Setup complete! 🎉 You should now have KaryaSetu running locally.**

Happy coding!