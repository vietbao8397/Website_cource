-- Add INSERT policy for enrollments
CREATE POLICY "Users can enroll themselves"
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add UPDATE policy for profiles (if not exists)
-- (Users can update own profile was already added in schema.sql)

-- Add INSERT policy for orders (already added: "Anyone can create orders")

-- Ensure unauthenticated users can create orders (already added: "Anyone can create orders" with true)
-- But if RLS is enabled, we need to make sure anonymous users can actually INSERT.
-- "Anyone can create orders" using (true) check covers anon.

-- Optional: Allow Guest users to view their Order by ID? Hard with RLS unless we use a "secret" token.
-- For now, we rely on the returned object from INSERT.
