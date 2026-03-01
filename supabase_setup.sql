-- Run this entire script in your Supabase SQL Editor to prepare your database for EduPath students.

-- 1. Create Profiles Table (Linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    college TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on row level security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Trigger to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (new.id, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Create Lab Scores Table
CREATE TABLE IF NOT EXISTS public.lab_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lab_id TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, lab_id) -- One score record per lab per user
);

ALTER TABLE public.lab_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lab scores" 
    ON public.lab_scores FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own lab scores" 
    ON public.lab_scores FOR ALL
    USING (auth.uid() = user_id);


-- 3. Create Roadmap Progress Table (for checking off nodes)
CREATE TABLE IF NOT EXISTS public.roadmap_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    node_id TEXT NOT NULL,
    checked_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, node_id)
);

ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roadmap progress" 
    ON public.roadmap_progress FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own roadmap progress" 
    ON public.roadmap_progress FOR ALL
    USING (auth.uid() = user_id);

-- Done! Your database is now ready for production users.
