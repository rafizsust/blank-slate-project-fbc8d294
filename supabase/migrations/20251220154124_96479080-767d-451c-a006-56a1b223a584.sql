-- Drop the old restrictive policies that are still blocking access
DROP POLICY IF EXISTS "Anyone can view published reading tests" ON reading_tests;
DROP POLICY IF EXISTS "Anyone can view published reading passages" ON reading_passages;
DROP POLICY IF EXISTS "Anyone can view published reading questions" ON reading_questions;
DROP POLICY IF EXISTS "Anyone can view published question groups" ON reading_question_groups;
DROP POLICY IF EXISTS "Anyone can view published reading paragraphs" ON reading_paragraphs;

-- Recreate as PERMISSIVE policies (default is PERMISSIVE, but being explicit)
CREATE POLICY "Anyone can view published reading tests" 
ON reading_tests 
FOR SELECT 
TO public
USING (is_published = true);

CREATE POLICY "Anyone can view published reading passages" 
ON reading_passages 
FOR SELECT 
TO public
USING (EXISTS ( 
  SELECT 1 FROM reading_tests 
  WHERE reading_tests.id = reading_passages.test_id AND reading_tests.is_published = true
));

CREATE POLICY "Anyone can view published reading questions" 
ON reading_questions 
FOR SELECT 
TO public
USING (EXISTS ( 
  SELECT 1 FROM reading_passages p 
  JOIN reading_tests t ON t.id = p.test_id 
  WHERE p.id = reading_questions.passage_id AND t.is_published = true
));

CREATE POLICY "Anyone can view published question groups" 
ON reading_question_groups 
FOR SELECT 
TO public
USING (EXISTS ( 
  SELECT 1 FROM reading_passages p 
  JOIN reading_tests t ON t.id = p.test_id 
  WHERE p.id = reading_question_groups.passage_id AND t.is_published = true
));

CREATE POLICY "Anyone can view published reading paragraphs" 
ON reading_paragraphs 
FOR SELECT 
TO public
USING (EXISTS ( 
  SELECT 1 FROM reading_passages p 
  JOIN reading_tests t ON t.id = p.test_id 
  WHERE p.id = reading_paragraphs.passage_id AND t.is_published = true
));