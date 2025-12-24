-- Add indexes on frequently queried foreign keys for faster lookups
-- These will significantly speed up test loading

-- Listening tables
CREATE INDEX IF NOT EXISTS idx_listening_question_groups_test_id 
  ON public.listening_question_groups(test_id);

CREATE INDEX IF NOT EXISTS idx_listening_questions_group_id 
  ON public.listening_questions(group_id);

-- Reading tables  
CREATE INDEX IF NOT EXISTS idx_reading_paragraphs_passage_id 
  ON public.reading_paragraphs(passage_id);

CREATE INDEX IF NOT EXISTS idx_reading_question_groups_passage_id 
  ON public.reading_question_groups(passage_id);

CREATE INDEX IF NOT EXISTS idx_reading_questions_passage_id 
  ON public.reading_questions(passage_id);

CREATE INDEX IF NOT EXISTS idx_reading_questions_group_id 
  ON public.reading_questions(question_group_id);

-- Speaking tables
CREATE INDEX IF NOT EXISTS idx_speaking_question_groups_test_id 
  ON public.speaking_question_groups(test_id);

CREATE INDEX IF NOT EXISTS idx_speaking_questions_group_id 
  ON public.speaking_questions(group_id);

-- Writing tables
CREATE INDEX IF NOT EXISTS idx_writing_tasks_test_id 
  ON public.writing_tasks(writing_test_id);

-- Submissions by user (for faster history lookups)
CREATE INDEX IF NOT EXISTS idx_listening_submissions_user_id 
  ON public.listening_test_submissions(user_id);

CREATE INDEX IF NOT EXISTS idx_reading_submissions_user_id 
  ON public.reading_test_submissions(user_id);

CREATE INDEX IF NOT EXISTS idx_speaking_submissions_user_id 
  ON public.speaking_submissions(user_id);

CREATE INDEX IF NOT EXISTS idx_writing_submissions_user_id 
  ON public.writing_submissions(user_id);