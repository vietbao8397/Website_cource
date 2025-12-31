-- Script to fix missing profiles
-- This inserts a profile for any user in auth.users that doesn't have one in public.profiles

INSERT INTO public.profiles (id, full_name, avatar_url, email)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'Học viên'),
    raw_user_meta_data->>'avatar_url',
    email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
