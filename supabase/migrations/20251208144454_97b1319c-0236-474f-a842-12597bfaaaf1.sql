-- Add paragraphs table for storing passage content paragraph by paragraph
CREATE TABLE public.reading_paragraphs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  passage_id UUID NOT NULL REFERENCES public.reading_passages(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  content TEXT NOT NULL,
  is_heading BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reading_paragraphs ENABLE ROW LEVEL SECURITY;

-- Public can view paragraphs for published tests
CREATE POLICY "Anyone can view paragraphs for published tests"
ON public.reading_paragraphs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reading_passages p
    JOIN reading_tests t ON t.id = p.test_id
    WHERE p.id = reading_paragraphs.passage_id
    AND t.is_published = true
  )
);

-- Add test_type column to reading_tests (academic/general)
ALTER TABLE public.reading_tests ADD COLUMN IF NOT EXISTS test_type TEXT NOT NULL DEFAULT 'academic';

-- Add question_group_id to group related questions together
ALTER TABLE public.reading_questions ADD COLUMN IF NOT EXISTS question_group_id UUID;
ALTER TABLE public.reading_questions ADD COLUMN IF NOT EXISTS option_format TEXT DEFAULT 'A';

-- Create question groups table for grouping questions with shared instructions
CREATE TABLE public.reading_question_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  passage_id UUID NOT NULL REFERENCES public.reading_passages(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL,
  instruction TEXT,
  start_question INTEGER NOT NULL,
  end_question INTEGER NOT NULL,
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reading_question_groups ENABLE ROW LEVEL SECURITY;

-- Public can view question groups for published tests
CREATE POLICY "Anyone can view question groups for published tests"
ON public.reading_question_groups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM reading_passages p
    JOIN reading_tests t ON t.id = p.test_id
    WHERE p.id = reading_question_groups.passage_id
    AND t.is_published = true
  )
);

-- Create admin_users table to track admin access
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users
CREATE POLICY "Admins can view admin list"
ON public.admin_users
FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admin policies for reading_tests (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can insert reading tests"
ON public.reading_tests
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can update reading tests"
ON public.reading_tests
FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can delete reading tests"
ON public.reading_tests
FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admin policies for reading_passages
CREATE POLICY "Admins can insert reading passages"
ON public.reading_passages
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can update reading passages"
ON public.reading_passages
FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can delete reading passages"
ON public.reading_passages
FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admin policies for reading_paragraphs
CREATE POLICY "Admins can insert reading paragraphs"
ON public.reading_paragraphs
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can update reading paragraphs"
ON public.reading_paragraphs
FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can delete reading paragraphs"
ON public.reading_paragraphs
FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admin policies for reading_questions
CREATE POLICY "Admins can insert reading questions"
ON public.reading_questions
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can update reading questions"
ON public.reading_questions
FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can delete reading questions"
ON public.reading_questions
FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Admin policies for reading_question_groups
CREATE POLICY "Admins can insert question groups"
ON public.reading_question_groups
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can update question groups"
ON public.reading_question_groups
FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can delete question groups"
ON public.reading_question_groups
FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM admin_users));