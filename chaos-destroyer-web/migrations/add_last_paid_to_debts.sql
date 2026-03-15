-- Add last_paid column to debts table
ALTER TABLE public.debts 
ADD COLUMN IF NOT EXISTS last_paid TIMESTAMP WITH TIME ZONE;
