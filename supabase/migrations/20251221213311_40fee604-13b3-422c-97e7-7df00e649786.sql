-- Add transcript fields for each part of listening tests
ALTER TABLE public.listening_tests 
ADD COLUMN IF NOT EXISTS transcript_part1 TEXT,
ADD COLUMN IF NOT EXISTS transcript_part2 TEXT,
ADD COLUMN IF NOT EXISTS transcript_part3 TEXT,
ADD COLUMN IF NOT EXISTS transcript_part4 TEXT;