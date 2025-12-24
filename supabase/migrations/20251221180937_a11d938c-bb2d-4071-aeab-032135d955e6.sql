-- Insert Question Groups for the test
-- Part 1: Questions 1-6 (Note completion)
INSERT INTO listening_question_groups (id, test_id, question_type, instruction, start_question, end_question, options)
VALUES (
  gen_random_uuid(),
  '09c00e06-f97c-4875-8bae-542f7afeb18d',
  'note_completion',
  'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.',
  1,
  6,
  '{"title": "First day at work"}'::jsonb
);

-- Part 1: Questions 7-10 (Table completion)
INSERT INTO listening_question_groups (id, test_id, question_type, instruction, start_question, end_question, options)
VALUES (
  gen_random_uuid(),
  '09c00e06-f97c-4875-8bae-542f7afeb18d',
  'table_completion',
  'Complete the table below. Write ONE WORD ONLY for each answer.',
  7,
  10,
  '{"title": "Responsibilities"}'::jsonb
);

-- Part 2: Questions 11-12 (Multiple choice multiple)
INSERT INTO listening_question_groups (id, test_id, question_type, instruction, start_question, end_question, options)
VALUES (
  gen_random_uuid(),
  '09c00e06-f97c-4875-8bae-542f7afeb18d',
  'multiple_choice_multiple',
  'Choose TWO letters, A–E. Which TWO problems with some training programmes for new runners does Liz mention?',
  11,
  12,
  '["A. There is a risk of serious injury.", "B. They are unsuitable for certain age groups.", "C. They are unsuitable for people with health issues.", "D. It is difficult to stay motivated.", "E. There is a lack of individual support."]'::jsonb
);

-- Part 2: Questions 13-14 (Multiple choice multiple)
INSERT INTO listening_question_groups (id, test_id, question_type, instruction, start_question, end_question, options)
VALUES (
  gen_random_uuid(),
  '09c00e06-f97c-4875-8bae-542f7afeb18d',
  'multiple_choice_multiple',
  'Choose TWO letters, A–E. Which TWO tips does Liz recommend for new runners?',
  13,
  14,
  '["A. doing two runs a week", "B. running in the evening", "C. going on runs with a friend", "D. listening to music during runs", "E. running very slowly"]'::jsonb
);

-- Part 2: Questions 15-18 (Matching)
INSERT INTO listening_question_groups (id, test_id, question_type, instruction, start_question, end_question, options)
VALUES (
  gen_random_uuid(),
  '09c00e06-f97c-4875-8bae-542f7afeb18d',
  'matching',
  'What reason prevented each of the following members of the Compton Park Runners Club from joining until recently? Write the correct answer, A, B, or C next to Questions 15–18.',
  15,
  18,
  '["A. a lack of confidence", "B. a dislike of running", "C. a lack of time"]'::jsonb
);

-- Part 2: Questions 19-20 (Multiple choice single)
INSERT INTO listening_question_groups (id, test_id, question_type, instruction, start_question, end_question, options)
VALUES (
  gen_random_uuid(),
  '09c00e06-f97c-4875-8bae-542f7afeb18d',
  'multiple_choice',
  'Choose the correct letter, A, B or C.',
  19,
  20,
  null
);

-- Part 3: Questions 21-25 (Multiple choice single)
INSERT INTO listening_question_groups (id, test_id, question_type, instruction, start_question, end_question, options)
VALUES (
  gen_random_uuid(),
  '09c00e06-f97c-4875-8bae-542f7afeb18d',
  'multiple_choice',
  'Choose the correct letter, A, B or C.',
  21,
  25,
  null
);

-- Part 3: Questions 26-30 (Matching)
INSERT INTO listening_question_groups (id, test_id, question_type, instruction, start_question, end_question, options)
VALUES (
  gen_random_uuid(),
  '09c00e06-f97c-4875-8bae-542f7afeb18d',
  'matching',
  'Where does Jane''s grandfather keep each of the following types of books in his shop? Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 26–30.',
  26,
  30,
  '["A. near the entrance", "B. in the attic", "C. at the back of the shop", "D. on a high shelf", "E. near the stairs", "F. in a specially designed space", "G. within the café"]'::jsonb
);

-- Part 4: Questions 31-40 (Note completion)
INSERT INTO listening_question_groups (id, test_id, question_type, instruction, start_question, end_question, options)
VALUES (
  gen_random_uuid(),
  '09c00e06-f97c-4875-8bae-542f7afeb18d',
  'note_completion',
  'Complete the notes below. Write ONE WORD ONLY for each answer.',
  31,
  40,
  '{"title": "Tree planting"}'::jsonb
);