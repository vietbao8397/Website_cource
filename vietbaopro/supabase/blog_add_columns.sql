-- Add missing columns to blog_posts table
-- Run this in Supabase SQL Editor

-- Add cover_image_url column
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Add scheduled_at column for scheduling posts
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
