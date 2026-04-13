-- Chaos Destroyer Web - Supabase Database Schema
-- Run this in the Supabase SQL editor to set up all tables and RLS policies

-- ============================================================
-- 1. USERS TABLE (Extended Profile)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. DEBTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  original_amount DECIMAL(10, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) DEFAULT 0,
  minimum_payment DECIMAL(10, 2),
  due_date INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paid-off', 'paused')),
  notes TEXT,
  last_paid TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_amount CHECK (amount >= 0),
  CONSTRAINT positive_original CHECK (original_amount >= 0),
  CONSTRAINT valid_interest CHECK (interest_rate >= 0)
);

-- ============================================================
-- 3. BILLS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'utilities',
  amount DECIMAL(10, 2) NOT NULL,
  due_date INTEGER NOT NULL,
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_amount CHECK (amount >= 0),
  CONSTRAINT valid_due_date CHECK (due_date BETWEEN 1 AND 31)
);

-- ============================================================
-- 4. INCOME TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly', 'one-time')),
  received_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_amount CHECK (amount >= 0)
);

-- ============================================================
-- 5. GOALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) DEFAULT 0,
  deadline DATE,
  category TEXT DEFAULT 'savings',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_target CHECK (target_amount > 0),
  CONSTRAINT valid_current CHECK (current_amount >= 0)
);

-- ============================================================
-- 6. REMINDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  related_to TEXT,
  related_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. GAMIFICATION - BADGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_name)
);

-- ============================================================
-- 8. GAMIFICATION - STREAKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL DEFAULT 'payments' CHECK (streak_type IN ('payments', 'checkins', 'challenges')),
  current_count INTEGER DEFAULT 0,
  highest_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- ============================================================
-- 9. GAMIFICATION - DAILY CHALLENGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_title TEXT NOT NULL,
  challenge_description TEXT,
  reward_points INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  challenge_date DATE DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, challenge_date, challenge_title)
);

-- ============================================================
-- 10. GAMIFICATION - POINTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  points_breakdown JSONB DEFAULT '{"challenges": 0, "payments": 0, "streak_bonus": 0}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 11. PAYMENT HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  debt_id UUID REFERENCES public.debts(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- ============================================================
-- INDEXES for Performance
-- ============================================================
CREATE INDEX idx_debts_user_id ON public.debts(user_id);
CREATE INDEX idx_bills_user_id ON public.bills(user_id);
CREATE INDEX idx_income_user_id ON public.income(user_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX idx_reminders_date ON public.reminders(reminder_date);
CREATE INDEX idx_badges_user_id ON public.badges(user_id);
CREATE INDEX idx_streaks_user_id ON public.streaks(user_id);
CREATE INDEX idx_challenges_user_id ON public.daily_challenges(user_id);
CREATE INDEX idx_challenges_date ON public.daily_challenges(challenge_date);
CREATE INDEX idx_points_user_id ON public.points(user_id);
CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX idx_payment_history_debt_id ON public.payment_history(debt_id);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Users: Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Debts: Users can only CRUD their own debts
CREATE POLICY "Users can view own debts"
  ON public.debts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debts"
  ON public.debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts"
  ON public.debts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts"
  ON public.debts FOR DELETE
  USING (auth.uid() = user_id);

-- Bills: Users can only CRUD their own bills
CREATE POLICY "Users can view own bills"
  ON public.bills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bills"
  ON public.bills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bills"
  ON public.bills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bills"
  ON public.bills FOR DELETE
  USING (auth.uid() = user_id);

-- Income: Users can only CRUD their own income
CREATE POLICY "Users can view own income"
  ON public.income FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income"
  ON public.income FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income"
  ON public.income FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own income"
  ON public.income FOR DELETE
  USING (auth.uid() = user_id);

-- Goals: Users can only CRUD their own goals
CREATE POLICY "Users can view own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

-- Reminders: Users can only CRUD their own reminders
CREATE POLICY "Users can view own reminders"
  ON public.reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON public.reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON public.reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON public.reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Badges: Users can only view/insert their own badges
CREATE POLICY "Users can view own badges"
  ON public.badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON public.badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Streaks: Users can only view/update their own streaks
CREATE POLICY "Users can view own streaks"
  ON public.streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON public.streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON public.streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily Challenges: Users can only view/update their own challenges
CREATE POLICY "Users can view own challenges"
  ON public.daily_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
  ON public.daily_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON public.daily_challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- Points: Users can only view their own points
CREATE POLICY "Users can view own points"
  ON public.points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points"
  ON public.points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own points"
  ON public.points FOR UPDATE
  USING (auth.uid() = user_id);

-- Payment History: Users can only CRUD their own payment history
CREATE POLICY "Users can view own payment history"
  ON public.payment_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON public.payment_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments"
  ON public.payment_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS for automatic updated_at timestamps
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_income_updated_at
  BEFORE UPDATE ON public.income
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_points_updated_at
  BEFORE UPDATE ON public.points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- DONE
-- ============================================================
-- Schema setup complete!
-- All tables, RLS policies, indexes, and triggers are ready.
-- The app can now use Supabase with full data isolation.
