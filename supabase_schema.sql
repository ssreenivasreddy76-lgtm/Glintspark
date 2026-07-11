-- Supabase SQL Schema for Glintspark
-- Paste this entirely into the Supabase SQL Editor and run it!

-- 1. Users Table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  first_name text,
  last_name text,
  avatar text,
  xp integer DEFAULT 0,
  streak integer DEFAULT 0,
  onboarding_completed boolean DEFAULT false,
  lessons_completed integer DEFAULT 0,
  completed_lesson_ids text[] DEFAULT '{}',
  unlocked_lesson_ids text[] DEFAULT '{c1}',
  activity_log jsonb DEFAULT '[]',
  activity_history jsonb DEFAULT '[]',
  last_active_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Practice Tracks
CREATE TABLE IF NOT EXISTS public.practice_tracks (
  id text PRIMARY KEY,
  name text NOT NULL,
  initials text NOT NULL,
  "desc" text,
  difficulty text,
  icon text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Contests
CREATE TABLE IF NOT EXISTS public.contests (
  id text PRIMARY KEY,
  title text NOT NULL,
  date text NOT NULL,
  prize text,
  participants text,
  type text,
  source text DEFAULT 'custom',
  created_at timestamp with time zone DEFAULT now()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read tracks and contests
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Tracks are viewable by everyone." ON public.practice_tracks FOR SELECT USING (true);
CREATE POLICY "Contests are viewable by everyone." ON public.contests FOR SELECT USING (true);

-- Allow admins (for now, anyone since we haven't defined roles) to insert/update tracks and contests
CREATE POLICY "Anyone can modify tracks (dev mode)" ON public.practice_tracks FOR ALL USING (true);
CREATE POLICY "Anyone can modify contests (dev mode)" ON public.contests FOR ALL USING (true);

-- Users can only modify their own profile data
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- SEED DATA (Optional but recommended)
-- ==========================================

INSERT INTO public.practice_tracks (id, name, initials, "desc", difficulty, icon) VALUES
('c', 'C', 'C', 'Master low-level system programming.', 'Beginner to Advanced', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg'),
('sql', 'SQL', 'SQL', 'Learn relational database design and queries.', 'Beginner to Advanced', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'),
('javascript', 'JavaScript', 'JS', 'Master prototype closures, and async JS.', 'Beginner to Advanced', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'),
('java', 'Java', 'J', 'Excel in OOP and robust threading models.', 'Beginner to Advanced', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg'),
('python', 'Python', 'PY', 'Acquire pythonic elegance and scripting.', 'Beginner to Advanced', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg'),
('data-structures', 'Data Structures & Algos', 'DS', 'Design highly efficient algorithms.', 'Beginner to Advanced', 'https://img.icons8.com/color/96/data-configuration.png')
ON CONFLICT (id) DO NOTHING;

-- Trigger to automatically create a public.users row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, first_name, last_name, avatar)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists so we can recreate it easily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
