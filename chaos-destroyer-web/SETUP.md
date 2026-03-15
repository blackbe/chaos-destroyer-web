# 🚀 CHAOS DESTROYER - Web Edition Setup Guide

Complete setup instructions for getting the React web app running with Supabase.

## 📋 Prerequisites

- **Node.js 16+** (check: `node --version`)
- **npm 7+** (check: `npm --version`)
- **Supabase Account** (free at https://supabase.com)
- **Browser** (Chrome, Safari, Firefox, Edge)

## 🔧 Step 1: Supabase Project Setup

### Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose a name (e.g., "chaos-destroyer")
4. Set a strong database password
5. Select your region (closest to you)
6. Wait for project to initialize (~2 minutes)

### Get Your Credentials
1. Go to Settings → API
2. Copy your **Project URL** (starts with https://...)
3. Copy your **anon public key** (the shorter key)
4. Save these somewhere safe (you'll need them in 30 seconds)

## 📊 Step 2: Create Database Tables

Go to your Supabase dashboard → SQL Editor and run these queries:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Debts table
CREATE TABLE debts (
  id VARCHAR PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  balance DECIMAL NOT NULL,
  minimum_payment DECIMAL NOT NULL,
  due_date VARCHAR,
  apr DECIMAL NOT NULL,
  payoff_priority INT,
  original_balance DECIMAL,
  notes TEXT,
  type VARCHAR DEFAULT 'debt',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bills table
CREATE TABLE bills (
  id VARCHAR PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  amount DECIMAL NOT NULL,
  due_date VARCHAR,
  frequency VARCHAR,
  category VARCHAR,
  is_recurring BOOLEAN DEFAULT TRUE,
  split_amount DECIMAL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Income table
CREATE TABLE income (
  id VARCHAR PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR NOT NULL,
  amount DECIMAL NOT NULL,
  frequency VARCHAR,
  is_paused BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id VARCHAR PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date VARCHAR NOT NULL,
  amount DECIMAL NOT NULL,
  debt_id VARCHAR REFERENCES debts(id),
  bill_id VARCHAR REFERENCES bills(id),
  category VARCHAR,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Goals table
CREATE TABLE goals (
  id VARCHAR PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  target_amount DECIMAL,
  current_amount DECIMAL,
  due_date VARCHAR,
  progress_percent INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reminders table
CREATE TABLE reminders (
  id VARCHAR PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  due_date VARCHAR NOT NULL,
  type VARCHAR,
  status VARCHAR DEFAULT 'pending',
  days_before INT DEFAULT 2,
  related_debt_id VARCHAR REFERENCES debts(id),
  related_bill_id VARCHAR REFERENCES bills(id),
  custom_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Gamification table
CREATE TABLE gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chao_points INT DEFAULT 0,
  badges JSONB DEFAULT '[]',
  streaks JSONB DEFAULT '{"onTimePay": 0, "bestOnTimeStreak": 0}',
  daily_challenges JSONB DEFAULT '{"today": null, "completed": []}',
  milestones_achieved JSONB DEFAULT '[]',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Enable Row-Level Security (RLS)

Go to Authentication → Policies and add these policies to each table:

```sql
-- For each table, add these policies:

-- SELECT policy (users can see only their own data)
CREATE POLICY "Users can view their own data"
ON debts FOR SELECT
USING (user_id = auth.uid());

-- INSERT policy
CREATE POLICY "Users can insert their own data"
ON debts FOR INSERT
WITH CHECK (user_id = auth.uid());

-- UPDATE policy
CREATE POLICY "Users can update their own data"
ON debts FOR UPDATE
USING (user_id = auth.uid());

-- DELETE policy
CREATE POLICY "Users can delete their own data"
ON debts FOR DELETE
USING (user_id = auth.uid());

-- Repeat for: bills, income, transactions, goals, reminders, gamification
```

## 💻 Step 3: Local Setup

### 1. Install Dependencies
```bash
cd /Users/benblack/.openclaw/workspace/chaos-destroyer-web
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Development Server
```bash
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

Open http://localhost:5173 in your browser.

## 👤 Step 4: Create Your Account

1. On the login page, click "Sign Up"
2. Enter your email (e.g., ben@example.com)
3. Enter a password
4. Click "Sign Up"
5. Verify your email in the confirmation email from Supabase
6. Log in with your credentials

## 📥 Step 5: Migrate Your Data (Optional)

If you have an existing Chaos Destroyer CLI installation:

### Install dotenv
```bash
npm install dotenv
```

### Run Migration
```bash
node scripts/migrate.js
```

This will:
- Read from `../chaos-destroyer/data/store.json`
- Import all debts, bills, income, gamification data
- Preserve all IDs and timestamps
- Associate everything with your new account

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Tables created in database
- [ ] RLS policies enabled
- [ ] `.env.local` configured with Supabase URL and key
- [ ] `npm install` completed successfully
- [ ] `npm run dev` runs without errors
- [ ] Can access http://localhost:5173
- [ ] Can sign up and log in
- [ ] Can see dashboard (even if empty)
- [ ] (Optional) Data migrated from CLI

## 🐛 Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install --legacy-peer-deps @supabase/supabase-js
```

### "Supabase URL or anon key is missing"
- Check `.env.local` exists and has correct values
- Make sure you didn't include `https://` twice or extra spaces
- Restart the dev server after changing `.env.local`

### "User is not authenticated"
- Verify you've signed up in the app
- Check that Supabase Auth is enabled (should be by default)
- Check browser console for auth errors

### "Data not saving to database"
- Verify RLS policies are enabled
- Check that user_id is being set correctly
- Look at Supabase dashboard → Logs for SQL errors
- Ensure table names match (use underscores: `user_id` not `userId`)

### "Styling looks broken"
```bash
npm run build:tailwind
```

If that doesn't exist, restart dev server:
```bash
npm run dev
```

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repo
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click Deploy

### Deploy to Netlify
1. Run `npm run build`
2. Drag `dist` folder to https://app.netlify.com/drop
3. Go to Site Settings → Build & Deploy → Environment
4. Add the two Supabase environment variables
5. Trigger redeploy

## 📚 Next Steps

1. **Add Your Debts**: Dashboard → Debts → Add Debt
2. **Add Income**: Income page → Add Income
3. **View Dashboard**: See your boss fight and gamification stats
4. **Record Payments**: Make a payment to watch your streak grow
5. **Complete Challenges**: Daily Challenges page for bonus points

## 💡 Tips

- **Backup your data**: Export as JSON from Reports page periodically
- **Use Payoff Planner**: Check which debt to attack next (highest APR first)
- **Watch your streaks**: Every on-time payment counts!
- **Earn badges**: Unlock achievements as you progress
- **Check breathing room**: On-time payments free up more money

## 🎮 Playing the Game

The key to staying motivated:
1. Keep your streak alive (on-time payments)
2. Watch the boss fight HP decrease with payments
3. Earn badges for milestones
4. Complete daily challenges for points
5. Use Payoff Planner to stay on track
6. Check your progress regularly

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Look at browser console (F12 → Console tab)
3. Check Supabase dashboard → Logs for SQL errors
4. Review `.env.local` formatting (no quotes around values!)

---

**Happy debt destroying!** ⚔️🎯✨

*Build time: ~1 hour*  
*Current version: 1.0.0*
