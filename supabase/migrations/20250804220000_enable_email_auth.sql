-- Enable email authentication
-- This migration enables email/password authentication in Supabase

-- Enable email auth provider (this is usually enabled by default)
-- The following settings ensure email auth is properly configured

-- Enable email confirmations (optional - you can disable this for testing)
-- UPDATE auth.config SET enable_signup = true;
-- UPDATE auth.config SET enable_email_confirmations = false;

-- Note: Email authentication is typically enabled by default in Supabase
-- This migration serves as documentation and can be used to customize settings

-- If you want to disable email confirmations for testing, uncomment the following:
-- UPDATE auth.config SET enable_email_confirmations = false;

-- If you want to allow users to sign up without email confirmation, uncomment:
-- UPDATE auth.config SET enable_confirmations = false; 