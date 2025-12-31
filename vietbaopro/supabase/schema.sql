-- ============================================
-- VIETBAOPRO DATABASE SCHEMA
-- Chạy script này trong Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'learner' CHECK (role IN ('guest', 'learner', 'instructor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  thumbnail_url TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  sale_price INTEGER,
  instructor_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  youtube_preview_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. LESSONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  chapter_title TEXT NOT NULL,
  chapter_index INTEGER NOT NULL DEFAULT 0,
  lesson_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  youtube_video_id TEXT,
  duration_minutes INTEGER,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  course_id UUID REFERENCES public.courses(id),
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'bank_transfer',
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  transaction_note TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. ENROLLMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  progress JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ============================================
-- 6. LESSON PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. CREATE POLICIES (after all tables exist)
-- ============================================

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Courses policies
CREATE POLICY "Published courses are viewable by everyone"
  ON public.courses FOR SELECT
  USING (status = 'published' OR auth.uid() = instructor_id);

CREATE POLICY "Instructors can insert own courses"
  ON public.courses FOR INSERT
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update own courses"
  ON public.courses FOR UPDATE
  USING (auth.uid() = instructor_id);

-- Lessons policies
CREATE POLICY "Preview lessons are viewable by everyone"
  ON public.lessons FOR SELECT
  USING (is_preview = true);

CREATE POLICY "Enrolled users can view all lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = lessons.course_id
      AND e.user_id = auth.uid()
    )
  );

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own pending orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Enrollments policies
CREATE POLICY "Users can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- Lesson progress policies
CREATE POLICY "Users can view own progress"
  ON public.lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. CREATE TRIGGER FOR NEW USER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 10. INSERT SAMPLE DATA
-- ============================================

-- Insert sample course: Pro Content System
INSERT INTO public.courses (
  title,
  slug,
  description,
  short_description,
  price,
  sale_price,
  status,
  youtube_preview_id
) VALUES (
  'Pro Content System',
  'pro-content-system',
  'Khóa học toàn diện giúp bạn làm chủ quy trình sáng tạo nội dung bằng AI. Từ tư duy nền tảng đến thực hành chuyên sâu.',
  'Hệ Thống Làm Chủ Content A-Z - Từ Zero đến Pro trong 30 ngày',
  2500000,
  1890000,
  'published',
  'dQw4w9WgXcQ'
) ON CONFLICT (slug) DO NOTHING;

-- Insert sample course: Prompt Mastery
INSERT INTO public.courses (
  title,
  slug,
  description,
  short_description,
  price,
  sale_price,
  status
) VALUES (
  'Prompt Mastery',
  'prompt-mastery',
  '50+ Công Thức Prompt đã được kiểm chứng, copy-paste và dùng ngay.',
  '50+ Công Thức Prompt Mì Ăn Liền - Copy-Paste và dùng ngay',
  99000,
  NULL,
  'published'
) ON CONFLICT (slug) DO NOTHING;

-- Insert sample course: Content Planning Pro
INSERT INTO public.courses (
  title,
  slug,
  description,
  short_description,
  price,
  sale_price,
  status
) VALUES (
  'Content Planning Pro',
  'content-planning',
  'Quy trình lập kế hoạch nội dung đa kênh, lên lịch 1 tháng trong 1 buổi chiều.',
  'Quy Trình Lập Kế Hoạch Đa Kênh - Lên lịch 1 tháng trong 1 buổi chiều',
  199000,
  NULL,
  'published'
) ON CONFLICT (slug) DO NOTHING;

-- Add sample lessons for Pro Content System
DO $$
DECLARE
  course_uuid UUID;
BEGIN
  SELECT id INTO course_uuid FROM public.courses WHERE slug = 'pro-content-system';
  
  IF course_uuid IS NOT NULL THEN
    INSERT INTO public.lessons (course_id, chapter_title, chapter_index, lesson_index, title, duration_minutes, is_preview)
    VALUES 
      (course_uuid, 'Module 1: The Mindset Shift', 0, 0, 'Tại sao bạn ở đây?', 2, true),
      (course_uuid, 'Module 1: The Mindset Shift', 0, 1, '3 Cạm bẫy giết chết người mới', 3, true),
      (course_uuid, 'Module 1: The Mindset Shift', 0, 2, 'Tư duy "Content Factory"', 4, false),
      (course_uuid, 'Module 1: The Mindset Shift', 0, 3, 'Định vị lại quan hệ với AI', 3, false),
      (course_uuid, 'Module 1: The Mindset Shift', 0, 4, 'Lộ trình 30 ngày', 2, false),
      (course_uuid, 'Module 2: Workspace Setup', 1, 0, 'Tư duy "Clean Desk"', 3, false),
      (course_uuid, 'Module 2: Workspace Setup', 1, 1, 'Quy hoạch "Kho Hàng Số"', 5, false),
      (course_uuid, 'Module 2: Workspace Setup', 1, 2, 'Quy trình GTD', 5, false),
      (course_uuid, 'Module 2: Workspace Setup', 1, 3, 'Kỹ thuật P.A.R.A', 4, false),
      (course_uuid, 'Module 2: Workspace Setup', 1, 4, 'Xây dựng "Second Brain"', 3, false),
      (course_uuid, 'Module 3: Content Agent', 2, 0, 'Tư duy "Content Agent"', 3, false),
      (course_uuid, 'Module 3: Content Agent', 2, 1, 'Định vị bản thân & La bàn mục tiêu', 6, false),
      (course_uuid, 'Module 3: Content Agent', 2, 2, 'Thấu thị khách hàng', 5, false),
      (course_uuid, 'Module 3: Content Agent', 2, 3, 'Kỹ thuật đóng gói "File Hiến Pháp"', 6, false)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- DONE! Database schema created successfully
-- ============================================
