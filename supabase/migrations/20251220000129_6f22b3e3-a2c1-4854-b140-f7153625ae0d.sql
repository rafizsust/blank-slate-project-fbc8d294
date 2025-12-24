-- Passage 1 Question Groups
INSERT INTO public.reading_question_groups (passage_id, question_type, start_question, end_question, instruction)
VALUES 
  ('97402285-3d78-4ed8-bd6d-79e0cc84260b', 'TRUE_FALSE_NOT_GIVEN', 1, 8, 'Do the following statements agree with the information given in Reading Passage 1? Write **TRUE** if the statement agrees with the information, **FALSE** if the statement contradicts the information, **NOT GIVEN** if there is no information on this.'),
  ('97402285-3d78-4ed8-bd6d-79e0cc84260b', 'SENTENCE_COMPLETION', 9, 13, 'Complete the sentences below. Choose **ONE WORD ONLY** from the passage for each answer.');

-- Passage 2 Question Groups  
INSERT INTO public.reading_question_groups (passage_id, question_type, start_question, end_question, instruction)
VALUES
  ('7df4cbd7-e054-4204-90a8-fd2d0d2d8810', 'MATCHING_INFORMATION', 14, 17, 'Reading Passage 2 has five paragraphs, **A-E**. Which paragraph contains the following information?'),
  ('7df4cbd7-e054-4204-90a8-fd2d0d2d8810', 'TRUE_FALSE_NOT_GIVEN', 18, 22, 'Do the following statements agree with the claims of the writer in Reading Passage 2? Write **TRUE** if the statement agrees with the claims of the writer, **FALSE** if the statement contradicts the claims of the writer, **NOT GIVEN** if it is impossible to say what the writer thinks about this.'),
  ('7df4cbd7-e054-4204-90a8-fd2d0d2d8810', 'MULTIPLE_CHOICE_SINGLE', 23, 26, 'Choose the correct letter, **A**, **B**, **C** or **D**.');

-- Passage 3 Question Groups
INSERT INTO public.reading_question_groups (passage_id, question_type, start_question, end_question, instruction)
VALUES
  ('34bee743-8384-43b5-9b77-8d10b5588955', 'SUMMARY_COMPLETION', 27, 31, 'Complete the summary using the list of words, **A-G**, below.'),
  ('34bee743-8384-43b5-9b77-8d10b5588955', 'TRUE_FALSE_NOT_GIVEN', 32, 36, 'Do the following statements agree with the claims of the writer in Reading Passage 3? Write **YES** if the statement agrees with the claims of the writer, **NO** if the statement contradicts the claims of the writer, **NOT GIVEN** if it is impossible to say what the writer thinks about this.'),
  ('34bee743-8384-43b5-9b77-8d10b5588955', 'MULTIPLE_CHOICE_SINGLE', 37, 40, 'Choose the correct letter, **A**, **B**, **C** or **D**.');