-- Add heading column for sub-headings in fill-in-blank questions
ALTER TABLE public.reading_questions 
ADD COLUMN heading TEXT;