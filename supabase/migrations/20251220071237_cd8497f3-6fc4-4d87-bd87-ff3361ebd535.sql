-- Add display options columns to reading_question_groups
ALTER TABLE public.reading_question_groups
ADD COLUMN IF NOT EXISTS display_as_paragraph boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_bullets boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_headings boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS use_dropdown boolean DEFAULT false;