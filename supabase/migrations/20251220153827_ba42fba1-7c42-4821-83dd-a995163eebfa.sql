-- Fix RLS policies for reading_tests to be PERMISSIVE (using OR logic)
DROP POLICY IF EXISTS "Admins can view all reading tests" ON reading_tests;

CREATE POLICY "Anyone can view published reading tests" 
ON reading_tests 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can view all reading tests" 
ON reading_tests 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Fix RLS policies for reading_passages to be PERMISSIVE
DROP POLICY IF EXISTS "Admins can view all reading passages" ON reading_passages;

CREATE POLICY "Anyone can view published reading passages" 
ON reading_passages 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1 FROM reading_tests 
  WHERE reading_tests.id = reading_passages.test_id AND reading_tests.is_published = true
));

CREATE POLICY "Admins can view all reading passages" 
ON reading_passages 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Fix RLS policies for reading_questions to be PERMISSIVE
DROP POLICY IF EXISTS "Admins can view all reading questions" ON reading_questions;

CREATE POLICY "Anyone can view published reading questions" 
ON reading_questions 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1 FROM reading_passages p 
  JOIN reading_tests t ON t.id = p.test_id 
  WHERE p.id = reading_questions.passage_id AND t.is_published = true
));

CREATE POLICY "Admins can view all reading questions" 
ON reading_questions 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Fix RLS policies for reading_question_groups to be PERMISSIVE
DROP POLICY IF EXISTS "Admins can view all question groups" ON reading_question_groups;

CREATE POLICY "Anyone can view published question groups" 
ON reading_question_groups 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1 FROM reading_passages p 
  JOIN reading_tests t ON t.id = p.test_id 
  WHERE p.id = reading_question_groups.passage_id AND t.is_published = true
));

CREATE POLICY "Admins can view all question groups" 
ON reading_question_groups 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Fix RLS policies for reading_paragraphs to be PERMISSIVE
DROP POLICY IF EXISTS "Admins can view all reading paragraphs" ON reading_paragraphs;

CREATE POLICY "Anyone can view published reading paragraphs" 
ON reading_paragraphs 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1 FROM reading_passages p 
  JOIN reading_tests t ON t.id = p.test_id 
  WHERE p.id = reading_paragraphs.passage_id AND t.is_published = true
));

CREATE POLICY "Admins can view all reading paragraphs" 
ON reading_paragraphs 
FOR SELECT 
USING (is_admin(auth.uid()));