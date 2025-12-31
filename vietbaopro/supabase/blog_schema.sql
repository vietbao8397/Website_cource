-- Blog Posts Table Schema
-- Run this in Supabase SQL Editor

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  category TEXT DEFAULT 'Chung',
  author_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  read_time_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can read published posts
CREATE POLICY "Published posts are viewable by everyone"
  ON public.blog_posts FOR SELECT
  USING (status = 'published');

-- Admins can do anything
CREATE POLICY "Admins can manage all posts"
  ON public.blog_posts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON public.blog_posts(published_at DESC);

-- Insert sample blog posts
INSERT INTO public.blog_posts (slug, title, excerpt, content, category, status, read_time_minutes, published_at)
VALUES 
  (
    'huong-dan-su-dung-chatgpt-cho-nguoi-moi',
    'Hướng dẫn sử dụng ChatGPT cho người mới bắt đầu',
    'Khám phá cách tận dụng ChatGPT để tăng năng suất công việc hàng ngày với những tips đơn giản nhưng hiệu quả.',
    '# Giới thiệu

ChatGPT là một công cụ AI mạnh mẽ giúp bạn tạo nội dung, trả lời câu hỏi, và hỗ trợ nhiều tác vụ khác.

## Cách bắt đầu

1. Truy cập chat.openai.com
2. Đăng ký tài khoản miễn phí
3. Bắt đầu chat với AI

## Tips hiệu quả

- Viết prompt rõ ràng, cụ thể
- Cung cấp context đầy đủ
- Yêu cầu AI giải thích nếu cần',
    'AI Cơ bản',
    'published',
    5,
    NOW()
  ),
  (
    '10-prompt-marketing-hieu-qua',
    '10 Prompt Marketing hiệu quả nhất 2024',
    'Tổng hợp những prompt đã được kiểm chứng giúp bạn tạo content marketing chất lượng trong tích tắc.',
    '# 10 Prompt Marketing

## 1. Prompt viết caption Facebook
"Viết caption cho bài đăng Facebook về [sản phẩm], nhắm đến [đối tượng], giọng điệu [phong cách]"

## 2. Prompt viết email marketing
"Viết email marketing giới thiệu [sản phẩm] với tiêu đề hấp dẫn và call-to-action rõ ràng"

... và nhiều prompt khác',
    'Marketing',
    'published',
    8,
    NOW() - INTERVAL '3 days'
  ),
  (
    'xay-dung-he-thong-noi-dung-voi-ai',
    'Xây dựng hệ thống nội dung với AI từ A-Z',
    'Cách thiết lập quy trình sáng tạo nội dung có hệ thống với sự hỗ trợ của các công cụ AI hiện đại.',
    '# Xây dựng hệ thống nội dung

## Bước 1: Xác định mục tiêu
Trước khi bắt đầu, cần xác định rõ mục tiêu content của bạn.

## Bước 2: Thiết lập quy trình
Tạo workflow rõ ràng từ ideation đến publish.

## Bước 3: Tích hợp AI
Sử dụng AI ở những bước phù hợp để tăng hiệu quả.',
    'Hệ thống',
    'published',
    12,
    NOW() - INTERVAL '7 days'
  );
