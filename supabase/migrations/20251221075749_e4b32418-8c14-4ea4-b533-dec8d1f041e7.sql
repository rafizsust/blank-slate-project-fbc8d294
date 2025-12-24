-- Create IELTS Demo Listening Test (Part 3 - Flowchart Completion)
INSERT INTO listening_tests (id, book_name, test_number, title, total_questions, time_limit, is_published, audio_url)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'IELTS Official Demo',
  1,
  'Procedure for detecting life on another planet',
  5,
  30,
  true,
  'https://jtfbocwsfxwrzfzvzgja.supabase.co/storage/v1/object/public/listening-audios/new-test/Cam50.mp3'
);

-- Create the question group for flowchart completion
INSERT INTO listening_question_groups (id, test_id, question_type, instruction, start_question, end_question, options)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'FLOWCHART_COMPLETION',
  'Complete the flow-chart. Choose the correct answer and move it into the gap.',
  1,
  5,
  '{
    "title": "Procedure for detecting life on another planet",
    "options": ["fossils", "contamination", "vehicle", "powder", "heat", "results", "radiation", "site", "microbes"],
    "option_format": "A",
    "steps": [
      {"text": "A spacecraft lands on a planet and sends out a rover.", "hasBlank": false},
      {"text": "The rover is directed to a ____1____ which has organic material.", "hasBlank": true, "blankNumber": 1},
      {"text": "It collects a sample from below the surface (in order to avoid the effects of ____2____).", "hasBlank": true, "blankNumber": 2},
      {"text": "The soil and rocks are checked to look for evidence of fossils.", "hasBlank": false},
      {"text": "The sample is converted to powder.", "hasBlank": false},
      {"text": "The sample is subjected to ____3____.", "hasBlank": true, "blankNumber": 3},
      {"text": "A mass spectrometer is used to search for potential proof of life, e.g. ____4____.", "hasBlank": true, "blankNumber": 4},
      {"text": "The ____5____ are compared with existing data from Earth.", "hasBlank": true, "blankNumber": 5}
    ]
  }'::jsonb
);

-- Create the 5 questions (blanks in the flowchart)
INSERT INTO listening_questions (id, group_id, question_number, question_text, correct_answer, is_given)
VALUES 
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 1, 'The rover is directed to a ______ which has organic material.', 'site', false),
  ('d4e5f6a7-b8c9-0123-def0-234567890123', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 2, 'It collects a sample from below the surface (in order to avoid the effects of ______).', 'radiation', false),
  ('e5f6a7b8-c9d0-1234-ef01-345678901234', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 3, 'The sample is subjected to ______.', 'heat', false),
  ('f6a7b8c9-d0e1-2345-f012-456789012345', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 4, 'A mass spectrometer is used to search for potential proof of life, e.g. ______.', 'microbes', false),
  ('a7b8c9d0-e1f2-3456-0123-567890123456', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 5, 'The ______ are compared with existing data from Earth.', 'results', false);