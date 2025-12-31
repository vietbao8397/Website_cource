-- ============================================
-- ADD send_at_hour COLUMN
-- Run this in Supabase SQL Editor
-- ============================================

-- Add send_at_hour column to store the specific hour of day to send email (0-23)
-- Default is 9 (9:00 AM)
ALTER TABLE public.email_sequence_steps 
ADD COLUMN IF NOT EXISTS send_at_hour INTEGER DEFAULT 9 CHECK (send_at_hour >= 0 AND send_at_hour <= 23);

-- Optional: Add send_at_minute for more precision (default 0)
ALTER TABLE public.email_sequence_steps 
ADD COLUMN IF NOT EXISTS send_at_minute INTEGER DEFAULT 0 CHECK (send_at_minute >= 0 AND send_at_minute <= 59);

-- Update existing rows to have reasonable defaults based on current delay_hours
-- This converts the "hours" portion to a time of day
UPDATE public.email_sequence_steps 
SET 
    send_at_hour = 9,  -- Default to 9:00 AM
    send_at_minute = 0
WHERE send_at_hour IS NULL;

-- ============================================
-- DONE! Columns added successfully.
-- ============================================
