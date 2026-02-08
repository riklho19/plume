-- Plume - Invitation Emails
-- Emails are now sent via Supabase Edge Function (send-invitation-email)
-- This script disables the old pg_net trigger approach.
--
-- Run this in Supabase SQL Editor.

-- ============================================================
-- Remove the old pg_net trigger (emails are now sent from Edge Function)
-- ============================================================
DROP TRIGGER IF EXISTS on_invitation_created ON invitations;
DROP FUNCTION IF EXISTS send_invitation_email();

-- The app_config table and pg_net extension are no longer needed for emails.
-- You can optionally clean them up:
-- DROP TABLE IF EXISTS app_config;
