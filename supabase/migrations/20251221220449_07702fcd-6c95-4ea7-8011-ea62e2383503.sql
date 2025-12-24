-- Add timestamp column to listening_question_groups for audio synchronization
ALTER TABLE public.listening_question_groups
ADD COLUMN start_timestamp_seconds numeric NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.listening_question_groups.start_timestamp_seconds IS 'Starting timestamp in seconds for when this question group audio begins';