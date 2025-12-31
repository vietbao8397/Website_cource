-- Admin RLS Policies
-- Run this in Supabase SQL Editor to enable admin functionality

-- 1. Allow admins to view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 2. Allow admins to update all orders
CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 3. Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- 4. Allow admins to view all enrollments
CREATE POLICY "Admins can view all enrollments"
  ON public.enrollments FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 5. Allow admins to insert enrollments for any user (manual enrollment)
CREATE POLICY "Admins can create enrollments"
  ON public.enrollments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- SET YOUR USER AS ADMIN
-- Replace 'your-email@example.com' with YOUR actual email
-- ============================================

-- First, check your user's email:
-- SELECT id, email, role FROM profiles;

-- Then update your role to admin:
-- UPDATE profiles SET role = 'admin' WHERE email = 'testvbp01@gmail.com';

-- Or if you know your user ID:
-- UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid-here';
