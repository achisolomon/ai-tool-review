-- Migration: 008_user_profiles.sql
-- Creates user_profiles table with auto-populate trigger and RLS

-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_sign_in TIMESTAMPTZ DEFAULT now()
);

-- Create index for sorting by last_sign_in
CREATE INDEX idx_user_profiles_last_sign_in ON public.user_profiles(last_sign_in DESC);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, avatar_url, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins/moderators can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Users can update their own last_sign_in
CREATE POLICY "Users can update own last_sign_in"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Backfill existing users
INSERT INTO public.user_profiles (id, email, display_name, avatar_url, created_at, last_sign_in)
SELECT
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'user_name',
    raw_user_meta_data->>'name',
    raw_user_meta_data->>'full_name',
    split_part(email, '@', 1)
  ),
  raw_user_meta_data->>'avatar_url',
  created_at,
  last_sign_in_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
