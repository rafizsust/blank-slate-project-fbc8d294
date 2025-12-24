-- Add multi-part audio support to listening_tests
ALTER TABLE listening_tests
ADD COLUMN audio_url_part1 TEXT,
ADD COLUMN audio_url_part2 TEXT,
ADD COLUMN audio_url_part3 TEXT,
ADD COLUMN audio_url_part4 TEXT;

-- Migrate existing audio_url to part1 if it exists
UPDATE listening_tests 
SET audio_url_part1 = audio_url 
WHERE audio_url IS NOT NULL;

-- Add a comment explaining the columns
COMMENT ON COLUMN listening_tests.audio_url_part1 IS 'Audio URL for Part 1 (Questions 1-10)';
COMMENT ON COLUMN listening_tests.audio_url_part2 IS 'Audio URL for Part 2 (Questions 11-20)';
COMMENT ON COLUMN listening_tests.audio_url_part3 IS 'Audio URL for Part 3 (Questions 21-30)';
COMMENT ON COLUMN listening_tests.audio_url_part4 IS 'Audio URL for Part 4 (Questions 31-40)';