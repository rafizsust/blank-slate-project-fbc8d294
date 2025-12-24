-- Add test_type column to listening_tests table
ALTER TABLE public.listening_tests 
ADD COLUMN IF NOT EXISTS test_type text NOT NULL DEFAULT 'academic';

-- Add a comment for clarity
COMMENT ON COLUMN public.listening_tests.test_type IS 'Type of test: academic, general, model, other';