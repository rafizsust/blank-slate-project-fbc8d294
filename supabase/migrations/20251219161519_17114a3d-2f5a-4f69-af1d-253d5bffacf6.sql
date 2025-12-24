-- Insert question groups for new question types with proper UUIDs
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction, options)
VALUES 
  -- Note Completion (Questions 20-24)
  ('11111111-1111-1111-1111-111111111120', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', 'NOTE_COMPLETION', 20, 24, 
   'Complete the notes below. Write ONE WORD ONLY from the passage in each gap.', 
   '{"title": "Britain''s Industrial Revolution", "sections": [{"heading": "Steam power", "items": [{"question_number": 20, "text_before": "Newcomen''s steam engine was used in mines to remove water. In Watt and Boulton''s steam engine, the movement of the", "text_after": "was linked to a gear system."}, {"question_number": 21, "text_before": "A greater supply of", "text_after": "was required to power steam engines."}]}, {"heading": "Textile industry", "items": [{"question_number": 22, "text_before": "Before the Industrial Revolution, spinners and weavers worked at home and in", "text_after": "."}, {"question_number": 23, "text_before": "Not as much", "text_after": "was needed to produce cloth once the spinning jenny and power loom were invented."}, {"question_number": 24, "text_before": "The cotton industry grew rapidly due to", "text_after": "from the Americas."}]}]}'::jsonb),
  
  -- Matching Features (Questions 25-28)
  ('22222222-2222-2222-2222-222222222225', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', 'MATCHING_FEATURES', 25, 28,
   'Look at the following statements and the list of people below. Match each statement with the correct person, A, B, or C. NB You may use any letter more than once.',
   '{"optionsTitle": "List of People", "options": [{"letter": "A", "text": "Matt Elliot"}, {"letter": "B", "text": "Karen Russell"}, {"letter": "C", "text": "Peter Bourne"}]}'::jsonb),

  -- Summary Word Bank (Questions 29-34)
  ('33333333-3333-3333-3333-333333333329', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SUMMARY_WORD_BANK', 29, 34,
   'Complete the summary using the list of phrases. Choose the correct answer and move it into the gap.',
   '{"title": "What happens when people encounter misinformation", "content": "Although people have {{29}} to misinformation, there is debate about precisely how and when we label something as true or untrue. The philosophers Descartes and Spinoza had {{30}} about how people engage with information. While Descartes believed that people accept or reject information after considering whether it is true or not, Spinoza argued that people accepted all information they encountered. Moreover, Spinoza believed that a distinct {{31}} is involved in these stages. Recent research has provided {{32}} for Spinoza''s theory and it would appear that people accept all encountered information as if it were true, even if this is for an extremely {{33}}, and do not label the information as true or false until later. This is consistent with the fact that the resources for scepticism and the resources for perceiving and encoding are in {{34}} in the brain.", "wordBank": ["constant conflict", "additional evidence", "different locations", "experimental subjects", "short period", "extreme distrust", "frequent exposure", "mental operation", "dubious reason", "different ideas"]}'::jsonb);

-- Insert questions for Note Completion
INSERT INTO reading_questions (id, passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options)
VALUES
  ('44444444-4444-4444-4444-444444444420', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111120', 20, 'NOTE_COMPLETION', 'piston', 'piston', NULL),
  ('44444444-4444-4444-4444-444444444421', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111120', 21, 'NOTE_COMPLETION', 'coal', 'coal', NULL),
  ('44444444-4444-4444-4444-444444444422', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111120', 22, 'NOTE_COMPLETION', 'factories', 'factories', NULL),
  ('44444444-4444-4444-4444-444444444423', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111120', 23, 'NOTE_COMPLETION', 'labor', 'labor', NULL),
  ('44444444-4444-4444-4444-444444444424', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111120', 24, 'NOTE_COMPLETION', 'cotton', 'cotton', NULL);

-- Insert questions for Matching Features
INSERT INTO reading_questions (id, passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options)
VALUES
  ('55555555-5555-5555-5555-555555555525', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '22222222-2222-2222-2222-222222222225', 25, 'MATCHING_FEATURES', 'If a tree gets infected with Dutch elm disease, the damage rapidly becomes visible.', 'A', '{"statement_before": "If a tree gets infected with Dutch elm disease, the damage rapidly becomes visible.", "statement_after": ""}'::jsonb),
  ('55555555-5555-5555-5555-555555555526', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '22222222-2222-2222-2222-222222222225', 26, 'MATCHING_FEATURES', 'It may be better to wait and see if the mature elms that have survived continue to flourish.', 'B', '{"statement_before": "It may be better to wait and see if the mature elms that have survived continue to flourish.", "statement_after": ""}'::jsonb),
  ('55555555-5555-5555-5555-555555555527', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '22222222-2222-2222-2222-222222222225', 27, 'MATCHING_FEATURES', 'There must be an explanation for the survival of some mature elms.', 'C', '{"statement_before": "There must be an explanation for the survival of some mature elms.", "statement_after": ""}'::jsonb),
  ('55555555-5555-5555-5555-555555555528', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '22222222-2222-2222-2222-222222222225', 28, 'MATCHING_FEATURES', 'We need to be aware that insects carrying Dutch elm disease are not very far away.', 'A', '{"statement_before": "We need to be aware that insects carrying Dutch elm disease are not very far away.", "statement_after": ""}'::jsonb);

-- Insert questions for Summary Word Bank
INSERT INTO reading_questions (id, passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options)
VALUES
  ('66666666-6666-6666-6666-666666666629', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '33333333-3333-3333-3333-333333333329', 29, 'SUMMARY_WORD_BANK', 'gap 29', 'frequent exposure', NULL),
  ('66666666-6666-6666-6666-666666666630', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '33333333-3333-3333-3333-333333333329', 30, 'SUMMARY_WORD_BANK', 'gap 30', 'different ideas', NULL),
  ('66666666-6666-6666-6666-666666666631', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '33333333-3333-3333-3333-333333333329', 31, 'SUMMARY_WORD_BANK', 'gap 31', 'mental operation', NULL),
  ('66666666-6666-6666-6666-666666666632', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '33333333-3333-3333-3333-333333333329', 32, 'SUMMARY_WORD_BANK', 'gap 32', 'additional evidence', NULL),
  ('66666666-6666-6666-6666-666666666633', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '33333333-3333-3333-3333-333333333329', 33, 'SUMMARY_WORD_BANK', 'gap 33', 'short period', NULL),
  ('66666666-6666-6666-6666-666666666634', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', '33333333-3333-3333-3333-333333333329', 34, 'SUMMARY_WORD_BANK', 'gap 34', 'different locations', NULL);