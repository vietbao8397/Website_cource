-- Add send_at_time column to email_sequence_steps
-- This allows setting a specific time of day for sending emails
-- Format: "HH:MM" (24-hour format)

ALTER TABLE public.email_sequence_steps 
ADD COLUMN IF NOT EXISTS send_at_time TEXT DEFAULT NULL;

-- Example: 
-- delay_hours = 72 (3 days) + send_at_time = "13:00" 
-- means: Send 3 days after trigger at 1:00 PM
