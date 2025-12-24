-- Add table_data column to reading_questions table (similar to listening_questions)
ALTER TABLE public.reading_questions
ADD COLUMN table_data jsonb DEFAULT NULL;