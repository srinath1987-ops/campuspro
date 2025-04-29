
-- Create feedback table for user feedback/complaints
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

-- Add RLS policies for feedback table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (for public feedback form)
CREATE POLICY "Allow anonymous inserts to feedback" ON public.feedback
    FOR INSERT TO anon
    WITH CHECK (true);

-- Only authenticated users can read feedback
CREATE POLICY "Allow authenticated users to read feedback" ON public.feedback
    FOR SELECT TO authenticated
    USING (true);

-- Only admins can update feedback
CREATE POLICY "Allow admins to update feedback" ON public.feedback
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- Create a function to handle new user creation
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

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage security for profile images
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles');

CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);
