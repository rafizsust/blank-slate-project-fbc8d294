-- Add group_heading and group_heading_alignment columns to listening_question_groups
ALTER TABLE public.listening_question_groups 
ADD COLUMN IF NOT EXISTS group_heading TEXT,
ADD COLUMN IF NOT EXISTS group_heading_alignment TEXT DEFAULT 'center';