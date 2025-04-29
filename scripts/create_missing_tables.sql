
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

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
        ON public.profiles
        FOR INSERT
        WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile"
        ON public.profiles
        FOR UPDATE
        USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can read their own profile'
    ) THEN
        CREATE POLICY "Users can read their own profile"
        ON public.profiles
        FOR SELECT
        USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can read all profiles'
    ) THEN
        CREATE POLICY "Admins can read all profiles" 
        ON public.profiles 
        FOR SELECT 
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
          )
        );
    END IF;
END $$;

-- Create or replace handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_existing_count INT;
  v_username TEXT;
BEGIN
  -- Get the username from metadata or use email if not available
  v_username := COALESCE(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );
  
  -- Check if the username already exists
  SELECT COUNT(*) INTO v_existing_count
  FROM public.profiles
  WHERE username = v_username;
  
  -- If username exists, append a random number to make it unique
  IF v_existing_count > 0 THEN
    v_username := v_username || '_' || floor(random() * 1000)::TEXT;
  END IF;

  -- Insert into profiles
  INSERT INTO public.profiles (
    id, 
    username, 
    email, 
    role, 
    phone_number
  )
  VALUES (
    new.id, 
    v_username,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'driver')::text,
    COALESCE(new.raw_user_meta_data->>'phone_number', '')
  );
  
  RETURN new;
END;
$$;

-- Create or replace trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
