-- Add name field to user_onboarding table
ALTER TABLE public.user_onboarding 
ADD COLUMN name TEXT;

-- Make name required for new records (allow NULL for existing records for now)
-- We'll update existing records separately if needed
