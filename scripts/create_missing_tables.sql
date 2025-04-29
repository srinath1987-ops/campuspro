-- Create feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.feedback (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    bus_number TEXT,
    feedback_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Check if avatar_url column exists in profiles table and add it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Add RLS policies for feedback table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (for public feedback form)
CREATE POLICY IF NOT EXISTS "Allow anonymous inserts to feedback" ON public.feedback
    FOR INSERT TO anon
    WITH CHECK (true);

-- Only authenticated users can read feedback
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read feedback" ON public.feedback
    FOR SELECT TO authenticated
    USING (true);

-- Only admins can update feedback
CREATE POLICY IF NOT EXISTS "Allow admins to update feedback" ON public.feedback
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- Create storage bucket for profile images if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM storage.buckets WHERE id = 'profiles'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('profiles', 'profiles', true);
    END IF;
END $$;

-- Set up storage security for profile images
DO $$
BEGIN
    -- Anyone can view profile images
    IF NOT EXISTS (
        SELECT FROM storage.policies WHERE name = 'Anyone can view profile images'
    ) THEN
        CREATE POLICY "Anyone can view profile images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'profiles');
    END IF;

    -- Authenticated users can upload profile images
    IF NOT EXISTS (
        SELECT FROM storage.policies WHERE name = 'Authenticated users can upload profile images'
    ) THEN
        CREATE POLICY "Authenticated users can upload profile images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'profiles');
    END IF;

    -- Users can update their own profile images
    IF NOT EXISTS (
        SELECT FROM storage.policies WHERE name = 'Users can update their own profile images'
    ) THEN
        CREATE POLICY "Users can update their own profile images"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'profiles');
    END IF;

    -- Users can delete their own profile images
    IF NOT EXISTS (
        SELECT FROM storage.policies WHERE name = 'Users can delete their own profile images'
    ) THEN
        CREATE POLICY "Users can delete their own profile images"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'profiles');
    END IF;
END $$; 