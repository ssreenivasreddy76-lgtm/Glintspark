-- Run this in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run

-- 1. Create public.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id                    uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email                 text,
  name                  text,
  first_name            text,
  last_name             text,
  avatar                text,
  lessons_completed     int DEFAULT 0,
  completed_lesson_ids  text[] DEFAULT '{}',
  unlocked_lesson_ids   text[] DEFAULT '{"c1"}',
  onboarding_completed  boolean DEFAULT false,
  streak                int DEFAULT 0,
  xp                    int DEFAULT 0,
  last_active_at        timestamptz,
  activity_log          jsonb DEFAULT '[]',
  activity_history      jsonb DEFAULT '[]',
  created_at            timestamptz DEFAULT now()
);

-- Ensure xp column exists on public.users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS xp int DEFAULT 0;

-- 2. Create solved_challenges table
CREATE TABLE IF NOT EXISTS public.solved_challenges (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id  text NOT NULL,
  language      text NOT NULL,
  code          text,
  points_earned int  DEFAULT 0,
  solved_at     timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable Row Level Security for solved_challenges
ALTER TABLE public.solved_challenges ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Users can view own solved challenges" ON public.solved_challenges;
DROP POLICY IF EXISTS "Users can insert own solved challenges" ON public.solved_challenges;
DROP POLICY IF EXISTS "Users can update own solved challenges" ON public.solved_challenges;

-- Users can only see their own solved challenges
CREATE POLICY "Users can view own solved challenges"
  ON public.solved_challenges FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert/upsert their own solves
CREATE POLICY "Users can insert own solved challenges"
  ON public.solved_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own solves (for upsert)
CREATE POLICY "Users can update own solved challenges"
  ON public.solved_challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. Create interview_sessions table
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic       text NOT NULL,
  transcript  jsonb NOT NULL,
  feedback    jsonb NOT NULL,
  score       int DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- Enable Row Level Security for interview_sessions
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Users can view own interview sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can insert own interview sessions" ON public.interview_sessions;

-- Users can only see their own interview sessions
CREATE POLICY "Users can view own interview sessions"
  ON public.interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own interview sessions
CREATE POLICY "Users can insert own interview sessions"
  ON public.interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Sync Auth users to public.users automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, first_name)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'first_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

