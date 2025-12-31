-- Blog Categories Table
-- Run this in Supabase SQL Editor AFTER running blog_schema.sql

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "Categories are viewable by everyone"
  ON public.blog_categories FOR SELECT
  USING (true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
  ON public.blog_categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Add scheduled_at column to blog_posts if not exists
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

-- Add cover_image_url column if not exists
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Insert default categories
INSERT INTO public.blog_categories (name, slug, description) VALUES
  ('AI Cơ bản', 'ai-co-ban', 'Các bài viết về AI cho người mới'),
  ('Marketing', 'marketing', 'Chiến lược và kỹ thuật Marketing'),
  ('Hệ thống', 'he-thong', 'Xây dựng hệ thống và quy trình'),
  ('Prompt Engineering', 'prompt-engineering', 'Kỹ thuật viết prompt hiệu quả'),
  ('Tin tức', 'tin-tuc', 'Tin tức cập nhật về AI và công nghệ')
ON CONFLICT (name) DO NOTHING;

-- Update policy for scheduled posts
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON public.blog_posts;
CREATE POLICY "Published or scheduled posts are viewable"
  ON public.blog_posts FOR SELECT
  USING (
    status = 'published' AND (scheduled_at IS NULL OR scheduled_at <= NOW())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
