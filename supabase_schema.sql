-- ==========================================
-- GLINTSPARK MASTER SUPABASE SCHEMA
-- ==========================================

-- 0. CLEAN SLATE (Delete existing tables to avoid conflicts)
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.hidden_test_cases CASCADE;
DROP TABLE IF EXISTS public.sample_test_cases CASCADE;
DROP TABLE IF EXISTS public.problem_languages CASCADE;
DROP TABLE IF EXISTS public.problems CASCADE;
DROP TABLE IF EXISTS public.contests CASCADE;
DROP TABLE IF EXISTS public.practice_tracks CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;


-- 1. Users Table (Core Auth & Profile)
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  name text,
  first_name text,
  last_name text,
  avatar text,
  country text,
  xp integer DEFAULT 0,
  streak integer DEFAULT 0,
  onboarding_completed boolean DEFAULT false,
  lessons_completed integer DEFAULT 0,
  completed_lesson_ids text[] DEFAULT '{}',
  unlocked_lesson_ids text[] DEFAULT '{c1}',
  activity_log jsonb DEFAULT '[]'::jsonb,
  activity_history jsonb DEFAULT '[]'::jsonb,
  last_active_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
  -- Note: If you are using Supabase Auth, you usually link this to auth.users
  -- CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- 2. Practice Tracks Table (e.g. JavaScript, C++, Python)
CREATE TABLE public.practice_tracks (
  id text NOT NULL,
  name text NOT NULL,
  initials text NOT NULL,
  "desc" text,
  difficulty text,
  icon text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT practice_tracks_pkey PRIMARY KEY (id)
);

-- 3. Contests Table
CREATE TABLE public.contests (
  id text NOT NULL,
  title text NOT NULL,
  date text NOT NULL,
  prize text,
  participants text,
  type text,
  source text DEFAULT 'custom'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contests_pkey PRIMARY KEY (id)
);

-- 4. Problems Table (Coding Challenges)
CREATE TABLE public.problems (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    input_format TEXT,
    output_format TEXT,
    constraints TEXT,
    is_practice BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Problem Languages Table (Time limits & Memory limits per language)
CREATE TABLE public.problem_languages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    problem_id TEXT REFERENCES public.problems(id) ON DELETE CASCADE,
    language_id TEXT NOT NULL,
    time_limit_seconds DECIMAL(5,2) DEFAULT 2.00,
    memory_limit_mb INTEGER DEFAULT 256,
    score INTEGER DEFAULT 10,
    UNIQUE(problem_id, language_id)
);

-- 6. Sample Test Cases (Publicly visible to users)
CREATE TABLE public.sample_test_cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    problem_id TEXT REFERENCES public.problems(id) ON DELETE CASCADE,
    input_data TEXT NOT NULL,
    output_data TEXT NOT NULL,
    explanation TEXT
);

-- 7. Hidden Test Cases (Private - Sent to Google Cloud Run for grading)
CREATE TABLE public.hidden_test_cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    problem_id TEXT REFERENCES public.problems(id) ON DELETE CASCADE,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT true
);

-- 8. User Submissions Table (Tracks user attempts and success rates)
CREATE TABLE public.submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    problem_id TEXT REFERENCES public.problems(id) ON DELETE CASCADE,
    language_id TEXT NOT NULL,
    code TEXT NOT NULL,
    status TEXT NOT NULL, -- e.g., 'Accepted', 'Wrong Answer', 'Time Limit Exceeded'
    execution_time_ms INTEGER,
    memory_used_kb INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Supabase is strictly enforcing RLS, so we explicitly create open policies 
-- to allow the Admin panel to insert data during the prototyping phase.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hidden_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all" ON public.users;
CREATE POLICY "Allow all" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON public.practice_tracks;
CREATE POLICY "Allow all" ON public.practice_tracks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON public.contests;
CREATE POLICY "Allow all" ON public.contests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON public.problems;
CREATE POLICY "Allow all" ON public.problems FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON public.problem_languages;
CREATE POLICY "Allow all" ON public.problem_languages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON public.sample_test_cases;
CREATE POLICY "Allow all" ON public.sample_test_cases FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON public.hidden_test_cases;
CREATE POLICY "Allow all" ON public.hidden_test_cases FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON public.submissions;
CREATE POLICY "Allow all" ON public.submissions FOR ALL USING (true) WITH CHECK (true);

-- 9. Solved Challenges Table (Used for tracking user progress on challenges)
CREATE TABLE IF NOT EXISTS public.solved_challenges (
    submission_id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    challenge_id TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.solved_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON public.solved_challenges;
CREATE POLICY "Allow all" ON public.solved_challenges FOR ALL USING (true) WITH CHECK (true);
