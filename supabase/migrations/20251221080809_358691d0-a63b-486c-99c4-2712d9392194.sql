-- Insert Cambridge IELTS 12 Listening Test 1 with all 40 questions

-- Insert the main test
INSERT INTO listening_tests (id, book_name, test_number, title, total_questions, time_limit, is_published, audio_url)
VALUES (
  'c12a1b2c-3d4e-5f60-7890-abc0ef123456',
  'Cambridge IELTS 12',
  1,
  'Listening Test 1',
  40,
  30,
  true,
  NULL
);

-- PART 1: Questions 1-10 (Form Completion / Fill in Blank)
INSERT INTO listening_question_groups (id, test_id, question_type, start_question, end_question, instruction, options)
VALUES (
  'c12a1111-3d4e-5f60-7890-abc0ef123456',
  'c12a1b2c-3d4e-5f60-7890-abc0ef123456',
  'FILL_IN_BLANK',
  1,
  10,
  'Complete the notes. Write ONE WORD AND/OR A NUMBER in each gap.',
  '{"title": "FAMILY EXCURSIONS"}'
);

-- Part 1 Questions
INSERT INTO listening_questions (id, group_id, question_number, question_text, correct_answer, heading)
VALUES 
  ('c12a0001-3d4e-5f60-7890-abc0ef123456', 'c12a1111-3d4e-5f60-7890-abc0ef123456', 1, 'Can take photos of the _____ that surround the lake', 'mountains', 'Cruise on a lake'),
  ('c12a0002-3d4e-5f60-7890-abc0ef123456', 'c12a1111-3d4e-5f60-7890-abc0ef123456', 2, 'Visit can include a 40-minute ride on a _____', 'horse', 'Farm visit'),
  ('c12a0003-3d4e-5f60-7890-abc0ef123456', 'c12a1111-3d4e-5f60-7890-abc0ef123456', 3, 'Visitors can walk in the farm''s _____ by the lake', 'garden', NULL),
  ('c12a0004-3d4e-5f60-7890-abc0ef123456', 'c12a1111-3d4e-5f60-7890-abc0ef123456', 4, '_____ is available at extra cost', 'Fishing', NULL),
  ('c12a0005-3d4e-5f60-7890-abc0ef123456', 'c12a1111-3d4e-5f60-7890-abc0ef123456', 5, 'Only suitable for cyclists who have some _____', 'experience', 'Cycling trips'),
  ('c12a0006-3d4e-5f60-7890-abc0ef123456', 'c12a1111-3d4e-5f60-7890-abc0ef123456', 6, 'A _____ is provided', 'map', NULL),
  ('c12a0007-3d4e-5f60-7890-abc0ef123456', 'c12a1111-3d4e-5f60-7890-abc0ef123456', 7, 'Bikes can be hired from _____ (near the Cruise Ship Terminal)', 'hotel', NULL),
  ('c12a0008-3d4e-5f60-7890-abc0ef123456', 'c12a1111-3d4e-5f60-7890-abc0ef123456', 8, 'Cyclists need a _____ (can be hired)', 'helmet', NULL),
  ('c12a0009-3d4e-5f60-7890-abc0ef123456', 'c12a1111-3d4e-5f60-7890-abc0ef123456', 9, 'There are no _____ or accommodation in the area', 'shops', NULL),
  ('c12a0010-3d4e-5f60-7890-abc0ef123456', 'c12a1111-3d4e-5f60-7890-abc0ef123456', 10, 'Total cost for whole family of cruise and farm visit: $_____', '27', 'Cost');

-- PART 2: Questions 11-14 (Multiple Choice Single)
INSERT INTO listening_question_groups (id, test_id, question_type, start_question, end_question, instruction, options)
VALUES (
  'c12a2111-3d4e-5f60-7890-abc0ef123456',
  'c12a1b2c-3d4e-5f60-7890-abc0ef123456',
  'MULTIPLE_CHOICE_SINGLE',
  11,
  14,
  'Choose the correct answer.',
  '{"title": "Talk to new kitchen assistants"}'
);

INSERT INTO listening_questions (id, group_id, question_number, question_text, correct_answer, options)
VALUES 
  ('c12a0011-3d4e-5f60-7890-abc0ef123456', 'c12a2111-3d4e-5f60-7890-abc0ef123456', 11, 'According to the manager, what do most people like about the job of kitchen assistant?', 'B', '["A. the variety of work", "B. the friendly atmosphere", "C. the opportunities for promotion"]'),
  ('c12a0012-3d4e-5f60-7890-abc0ef123456', 'c12a2111-3d4e-5f60-7890-abc0ef123456', 12, 'The manager is concerned about some of the new staff''s', 'C', '["A. jewellery", "B. hair styles", "C. shoes"]'),
  ('c12a0013-3d4e-5f60-7890-abc0ef123456', 'c12a2111-3d4e-5f60-7890-abc0ef123456', 13, 'The manager says that the day is likely to be busy for kitchen staff because', 'C', '["A. it is a public holiday", "B. the head chef is absent", "C. the restaurant is almost fully booked"]'),
  ('c12a0014-3d4e-5f60-7890-abc0ef123456', 'c12a2111-3d4e-5f60-7890-abc0ef123456', 14, 'Only kitchen staff who are 18 or older are allowed to use', 'C', '["A. the waste disposal unit", "B. the electric mixer", "C. the meat slicer"]');

-- PART 2: Questions 15-16 (Choose Two)
INSERT INTO listening_question_groups (id, test_id, question_type, start_question, end_question, instruction, options)
VALUES (
  'c12a2222-3d4e-5f60-7890-abc0ef123456',
  'c12a1b2c-3d4e-5f60-7890-abc0ef123456',
  'MULTIPLE_CHOICE_MULTIPLE',
  15,
  16,
  'Choose TWO correct answers. According to the manager, which TWO things can make the job of kitchen assistant stressful?',
  '{"options": ["A. They have to follow orders immediately", "B. The kitchen gets very hot", "C. They may not be able to take a break", "D. They have to do overtime", "E. The work is physically demanding"]}'
);

INSERT INTO listening_questions (id, group_id, question_number, question_text, correct_answer)
VALUES 
  ('c12a0015-3d4e-5f60-7890-abc0ef123456', 'c12a2222-3d4e-5f60-7890-abc0ef123456', 15, 'First stressful factor', 'B'),
  ('c12a0016-3d4e-5f60-7890-abc0ef123456', 'c12a2222-3d4e-5f60-7890-abc0ef123456', 16, 'Second stressful factor', 'C');

-- PART 2: Questions 17-20 (Matching)
INSERT INTO listening_question_groups (id, test_id, question_type, start_question, end_question, instruction, options)
VALUES (
  'c12a2333-3d4e-5f60-7890-abc0ef123456',
  'c12a1b2c-3d4e-5f60-7890-abc0ef123456',
  'MATCHING_CORRECT_LETTER',
  17,
  20,
  'What is the responsibility of each of the following restaurant staff? Choose the correct letter, A-F.',
  '{"options": ["A. training courses", "B. food stocks", "C. first aid", "D. breakages", "E. staff discounts", "F. timetables"], "title": "Restaurant staff"}'
);

INSERT INTO listening_questions (id, group_id, question_number, question_text, correct_answer)
VALUES 
  ('c12a0017-3d4e-5f60-7890-abc0ef123456', 'c12a2333-3d4e-5f60-7890-abc0ef123456', 17, 'Joy Parkins', 'F'),
  ('c12a0018-3d4e-5f60-7890-abc0ef123456', 'c12a2333-3d4e-5f60-7890-abc0ef123456', 18, 'David Field', 'B'),
  ('c12a0019-3d4e-5f60-7890-abc0ef123456', 'c12a2333-3d4e-5f60-7890-abc0ef123456', 19, 'Dexter Wills', 'C'),
  ('c12a0020-3d4e-5f60-7890-abc0ef123456', 'c12a2333-3d4e-5f60-7890-abc0ef123456', 20, 'Mike Smith', 'A');

-- PART 3: Questions 21-23 (Multiple Choice Single)
INSERT INTO listening_question_groups (id, test_id, question_type, start_question, end_question, instruction, options)
VALUES (
  'c12a3111-3d4e-5f60-7890-abc0ef123456',
  'c12a1b2c-3d4e-5f60-7890-abc0ef123456',
  'MULTIPLE_CHOICE_SINGLE',
  21,
  23,
  'Choose the correct answer.',
  '{"title": "Paper on Public Libraries"}'
);

INSERT INTO listening_questions (id, group_id, question_number, question_text, correct_answer, options)
VALUES 
  ('c12a0021-3d4e-5f60-7890-abc0ef123456', 'c12a3111-3d4e-5f60-7890-abc0ef123456', 21, 'What will be the main topic of Trudie and Stewart''s paper?', 'B', '["A. how public library services are organised in different countries", "B. how changes in society are reflected in public libraries", "C. how the funding of public libraries has changed"]'),
  ('c12a0022-3d4e-5f60-7890-abc0ef123456', 'c12a3111-3d4e-5f60-7890-abc0ef123456', 22, 'They agree that one disadvantage of free digitalised books is that', 'C', '["A. they may take a long time to read", "B. they can be difficult to read", "C. they are generally old"]'),
  ('c12a0023-3d4e-5f60-7890-abc0ef123456', 'c12a3111-3d4e-5f60-7890-abc0ef123456', 23, 'Stewart expects that in the future libraries will', 'B', '["A. maintain their traditional function", "B. become centres for local communities", "C. no longer contain any books"]');

-- PART 3: Questions 24-30 (Note Completion)
INSERT INTO listening_question_groups (id, test_id, question_type, start_question, end_question, instruction, options)
VALUES (
  'c12a3222-3d4e-5f60-7890-abc0ef123456',
  'c12a1b2c-3d4e-5f60-7890-abc0ef123456',
  'FILL_IN_BLANK',
  24,
  30,
  'Complete the notes below. Write ONE WORD ONLY in each gap.',
  '{"title": "Study of local library: possible questions"}'
);

INSERT INTO listening_questions (id, group_id, question_number, question_text, correct_answer)
VALUES 
  ('c12a0024-3d4e-5f60-7890-abc0ef123456', 'c12a3222-3d4e-5f60-7890-abc0ef123456', 24, 'whether it has a _____ of its own', 'cafe'),
  ('c12a0025-3d4e-5f60-7890-abc0ef123456', 'c12a3222-3d4e-5f60-7890-abc0ef123456', 25, 'its policy regarding noise of various kinds', 'children'),
  ('c12a0026-3d4e-5f60-7890-abc0ef123456', 'c12a3222-3d4e-5f60-7890-abc0ef123456', 26, 'how it''s affected by laws regarding all aspects of _____', 'safety'),
  ('c12a0027-3d4e-5f60-7890-abc0ef123456', 'c12a3222-3d4e-5f60-7890-abc0ef123456', 27, 'how the design needs to take the _____ of customers into account', 'age'),
  ('c12a0028-3d4e-5f60-7890-abc0ef123456', 'c12a3222-3d4e-5f60-7890-abc0ef123456', 28, 'what _____ is required in case of accidents', 'insurance'),
  ('c12a0029-3d4e-5f60-7890-abc0ef123456', 'c12a3222-3d4e-5f60-7890-abc0ef123456', 29, 'why a famous person''s _____ is located in the library', 'statue'),
  ('c12a0030-3d4e-5f60-7890-abc0ef123456', 'c12a3222-3d4e-5f60-7890-abc0ef123456', 30, 'whether it has a _____ of local organisations', 'directory');

-- PART 4: Questions 31-40 (Note Completion)
INSERT INTO listening_question_groups (id, test_id, question_type, start_question, end_question, instruction, options)
VALUES (
  'c12a4111-3d4e-5f60-7890-abc0ef123456',
  'c12a1b2c-3d4e-5f60-7890-abc0ef123456',
  'FILL_IN_BLANK',
  31,
  40,
  'Complete the notes. Write NO MORE THAN TWO WORDS in each gap.',
  '{"title": "Four business values"}'
);

INSERT INTO listening_questions (id, group_id, question_number, question_text, correct_answer, heading)
VALUES 
  ('c12a0031-3d4e-5f60-7890-abc0ef123456', 'c12a4111-3d4e-5f60-7890-abc0ef123456', 31, 'Many business values can result in _____', 'failure', NULL),
  ('c12a0032-3d4e-5f60-7890-abc0ef123456', 'c12a4111-3d4e-5f60-7890-abc0ef123456', 32, 'Senior managers need to understand and deal with the potential _____ that may result', 'conflict', NULL),
  ('c12a0033-3d4e-5f60-7890-abc0ef123456', 'c12a4111-3d4e-5f60-7890-abc0ef123456', 33, 'During a training course, the speaker was in a team that had to build a _____', 'bridge', 'Collaboration'),
  ('c12a0034-3d4e-5f60-7890-abc0ef123456', 'c12a4111-3d4e-5f60-7890-abc0ef123456', 34, 'Other teams experienced _____ from trying to collaborate', 'delays', NULL),
  ('c12a0035-3d4e-5f60-7890-abc0ef123456', 'c12a4111-3d4e-5f60-7890-abc0ef123456', 35, 'Sales of a _____ were poor because of collaboration', 'smartphone', NULL),
  ('c12a0036-3d4e-5f60-7890-abc0ef123456', 'c12a4111-3d4e-5f60-7890-abc0ef123456', 36, 'Hard work may be a bad use of various company _____', 'resources', 'Industriousness'),
  ('c12a0037-3d4e-5f60-7890-abc0ef123456', 'c12a4111-3d4e-5f60-7890-abc0ef123456', 37, 'The word ''lazy'' in this context refers to people who avoid doing tasks that are _____', 'unnecessary', NULL),
  ('c12a0038-3d4e-5f60-7890-abc0ef123456', 'c12a4111-3d4e-5f60-7890-abc0ef123456', 38, 'An advertising campaign for a _____ was memorable but failed to boost sales', 'insurance', 'Creativity'),
  ('c12a0039-3d4e-5f60-7890-abc0ef123456', 'c12a4111-3d4e-5f60-7890-abc0ef123456', 39, 'Creativity should be used as a response to a particular _____', 'problem', NULL),
  ('c12a0040-3d4e-5f60-7890-abc0ef123456', 'c12a4111-3d4e-5f60-7890-abc0ef123456', 40, 'According to one study, on average, pioneers had a _____ that was far higher than that of followers', 'failure rate', 'Excellence');