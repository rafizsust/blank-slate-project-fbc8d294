-- First drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;

-- Create a function to check admin status that doesn't cause recursion
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = check_user_id
  );
$$;

-- Recreate admin_users policy using the function
CREATE POLICY "Admins can view admin list"
ON public.admin_users
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Also update other admin policies to use the function to avoid recursion
DROP POLICY IF EXISTS "Admins can insert reading tests" ON public.reading_tests;
DROP POLICY IF EXISTS "Admins can update reading tests" ON public.reading_tests;
DROP POLICY IF EXISTS "Admins can delete reading tests" ON public.reading_tests;

CREATE POLICY "Admins can insert reading tests"
ON public.reading_tests
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update reading tests"
ON public.reading_tests
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete reading tests"
ON public.reading_tests
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Update policies for reading_passages
DROP POLICY IF EXISTS "Admins can insert reading passages" ON public.reading_passages;
DROP POLICY IF EXISTS "Admins can update reading passages" ON public.reading_passages;
DROP POLICY IF EXISTS "Admins can delete reading passages" ON public.reading_passages;

CREATE POLICY "Admins can insert reading passages"
ON public.reading_passages
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update reading passages"
ON public.reading_passages
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete reading passages"
ON public.reading_passages
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Update policies for reading_paragraphs
DROP POLICY IF EXISTS "Admins can insert reading paragraphs" ON public.reading_paragraphs;
DROP POLICY IF EXISTS "Admins can update reading paragraphs" ON public.reading_paragraphs;
DROP POLICY IF EXISTS "Admins can delete reading paragraphs" ON public.reading_paragraphs;

CREATE POLICY "Admins can insert reading paragraphs"
ON public.reading_paragraphs
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update reading paragraphs"
ON public.reading_paragraphs
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete reading paragraphs"
ON public.reading_paragraphs
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Update policies for reading_questions
DROP POLICY IF EXISTS "Admins can insert reading questions" ON public.reading_questions;
DROP POLICY IF EXISTS "Admins can update reading questions" ON public.reading_questions;
DROP POLICY IF EXISTS "Admins can delete reading questions" ON public.reading_questions;

CREATE POLICY "Admins can insert reading questions"
ON public.reading_questions
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update reading questions"
ON public.reading_questions
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete reading questions"
ON public.reading_questions
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Update policies for reading_question_groups
DROP POLICY IF EXISTS "Admins can insert question groups" ON public.reading_question_groups;
DROP POLICY IF EXISTS "Admins can update question groups" ON public.reading_question_groups;
DROP POLICY IF EXISTS "Admins can delete question groups" ON public.reading_question_groups;

CREATE POLICY "Admins can insert question groups"
ON public.reading_question_groups
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update question groups"
ON public.reading_question_groups
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete question groups"
ON public.reading_question_groups
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Add SELECT policies for admins to view unpublished tests
CREATE POLICY "Admins can view all reading tests"
ON public.reading_tests
FOR SELECT
USING (public.is_admin(auth.uid()) OR is_published = true);

DROP POLICY IF EXISTS "Anyone can view published reading tests" ON public.reading_tests;

-- Admins can view all passages
CREATE POLICY "Admins can view all reading passages"
ON public.reading_passages
FOR SELECT
USING (public.is_admin(auth.uid()) OR EXISTS (
  SELECT 1 FROM reading_tests WHERE reading_tests.id = reading_passages.test_id AND reading_tests.is_published = true
));

DROP POLICY IF EXISTS "Anyone can view passages for published tests" ON public.reading_passages;

-- Admins can view all paragraphs
CREATE POLICY "Admins can view all reading paragraphs"
ON public.reading_paragraphs
FOR SELECT
USING (public.is_admin(auth.uid()) OR EXISTS (
  SELECT 1 FROM reading_passages p 
  JOIN reading_tests t ON t.id = p.test_id 
  WHERE p.id = reading_paragraphs.passage_id AND t.is_published = true
));

DROP POLICY IF EXISTS "Anyone can view paragraphs for published tests" ON public.reading_paragraphs;

-- Admins can view all questions
CREATE POLICY "Admins can view all reading questions"
ON public.reading_questions
FOR SELECT
USING (public.is_admin(auth.uid()) OR EXISTS (
  SELECT 1 FROM reading_passages p 
  JOIN reading_tests t ON t.id = p.test_id 
  WHERE p.id = reading_questions.passage_id AND t.is_published = true
));

DROP POLICY IF EXISTS "Anyone can view questions for published tests" ON public.reading_questions;

-- Admins can view all question groups
CREATE POLICY "Admins can view all question groups"
ON public.reading_question_groups
FOR SELECT
USING (public.is_admin(auth.uid()) OR EXISTS (
  SELECT 1 FROM reading_passages p 
  JOIN reading_tests t ON t.id = p.test_id 
  WHERE p.id = reading_question_groups.passage_id AND t.is_published = true
));

DROP POLICY IF EXISTS "Anyone can view question groups for published tests" ON public.reading_question_groups;