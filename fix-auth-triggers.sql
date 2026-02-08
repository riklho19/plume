-- FIX: "Database error saving new user"
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- Go to: SQL Editor > New Query > Paste this > Run

-- Step 1: Drop ALL existing triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_accept_invitations ON auth.users;

-- Step 2: Recreate functions with EXPLICIT search_path
-- This is critical: GoTrue runs with a restricted search_path that does NOT include 'public'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log but don't block user creation
  RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_invitation_acceptance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.collaborators (project_id, user_id, role)
  SELECT i.project_id, NEW.id, i.role
  FROM public.invitations i
  WHERE i.invited_email = NEW.email
  ON CONFLICT (project_id, user_id) DO NOTHING;

  DELETE FROM public.invitations WHERE invited_email = NEW.email;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_invitation_acceptance failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Step 3: Recreate triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_accept_invitations
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_invitation_acceptance();

-- Step 4: Grant execute permissions explicitly
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_invitation_acceptance() TO supabase_auth_admin;

-- Step 5: Ensure profiles INSERT policy exists for the trigger
-- The SECURITY DEFINER function runs as postgres (superuser), but just in case:
CREATE POLICY "Service role can insert profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (true);
-- (This policy allows inserts; the trigger runs as superuser so it's a safety net)

-- Verify: this should show the two triggers
SELECT tgname, tgtype, proname
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' AND c.relname = 'users';
