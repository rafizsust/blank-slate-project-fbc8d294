-- Create a comprehensive dummy reading test covering all question types

-- 1. Create the reading test
INSERT INTO reading_tests (id, book_name, title, test_number, is_published, test_type, time_limit, total_questions)
VALUES (
  'f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0',
  'Dummy Book',
  'Dummy test covering all question types',
  99,
  true,
  'academic',
  60,
  40
);

-- 2. Create 3 passages
INSERT INTO reading_passages (id, test_id, passage_number, title, content)
VALUES 
(
  'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
  'f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0',
  1,
  'The History of Coffee',
  'Coffee is one of the most popular beverages in the world. Its origins can be traced back to Ethiopia, where legend has it that a goat herder named Kaldi discovered the energizing effects of coffee beans after noticing his goats becoming more active after eating them.

From Ethiopia, coffee spread to the Arabian Peninsula, where it became an integral part of social and religious life. By the 15th century, coffee was being cultivated in Yemen, and coffeehouses, known as qahveh khaneh, began to appear in cities across the Middle East.

The popularity of coffee continued to grow, reaching Europe by the 17th century. Initially met with suspicion and even condemnation by some religious authorities, coffee eventually won over European society. Coffeehouses became centers of intellectual discourse, earning the nickname "penny universities" in England.

Today, coffee is grown in numerous countries around the world, with Brazil being the largest producer. The coffee industry employs millions of people globally, from farmers to baristas, making it one of the most economically significant agricultural commodities.'
),
(
  'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
  'f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0',
  2,
  'Renewable Energy Sources',
  'A) Solar power has emerged as one of the fastest-growing energy sources. Photovoltaic cells convert sunlight directly into electricity, while solar thermal systems use the sun''s heat to generate power. The cost of solar panels has decreased dramatically over the past decade.

B) Wind energy harnesses the power of moving air to generate electricity. Modern wind turbines can generate significant amounts of power, and offshore wind farms are becoming increasingly common in coastal areas.

C) Hydroelectric power uses the force of flowing water to generate electricity. Large dams have been built around the world, though there are environmental concerns about their impact on river ecosystems.

D) Geothermal energy taps into the heat stored beneath the Earth''s surface. Countries like Iceland have successfully utilized geothermal resources for both electricity generation and heating.

E) Dr. Sarah Chen, a renewable energy expert, argues that a diverse energy mix is essential for a sustainable future. Professor James Miller believes that solar power will dominate within the next two decades. Environmental advocate Maria Garcia emphasizes the importance of community-based renewable projects.'
),
(
  'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3',
  'f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0',
  3,
  'The Evolution of Communication',
  'Human communication has evolved dramatically throughout history. From cave paintings to instant messaging, each advancement has transformed how we share information and connect with one another.

The invention of the printing press in the 15th century revolutionized the spread of knowledge. Books became more accessible, literacy rates increased, and ideas could travel farther than ever before.

The telegraph, invented in the 1830s, marked the beginning of electronic communication. For the first time, messages could be sent over long distances almost instantaneously.

The telephone, developed by Alexander Graham Bell in 1876, allowed people to hear each other''s voices across great distances. This invention fundamentally changed both personal and business communication.

The internet, emerging in the late 20th century, has perhaps been the most transformative communication technology. Email, social media, and video conferencing have made global communication instantaneous and ubiquitous.'
);

-- 3. Create paragraphs for Passage 1 (for MATCHING_HEADINGS)
INSERT INTO reading_paragraphs (passage_id, label, content, order_index, is_heading)
VALUES 
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'A', 'Coffee is one of the most popular beverages in the world. Its origins can be traced back to Ethiopia.', 1, false),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'B', 'From Ethiopia, coffee spread to the Arabian Peninsula, where it became an integral part of social and religious life.', 2, false),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'C', 'The popularity of coffee continued to grow, reaching Europe by the 17th century.', 3, false),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'D', 'Today, coffee is grown in numerous countries around the world, with Brazil being the largest producer.', 4, false);

-- GROUP 1: TRUE_FALSE_NOT_GIVEN (Questions 1-4)
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
  'TRUE_FALSE_NOT_GIVEN',
  1, 4,
  'Do the following statements agree with the information given in the passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.'
);

INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options)
VALUES 
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '11111111-1111-1111-1111-111111111111', 1, 'TRUE_FALSE_NOT_GIVEN', 'Coffee was first discovered in Ethiopia.', 'TRUE', '["TRUE", "FALSE", "NOT GIVEN"]'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '11111111-1111-1111-1111-111111111111', 2, 'TRUE_FALSE_NOT_GIVEN', 'Coffee was immediately accepted in Europe.', 'FALSE', '["TRUE", "FALSE", "NOT GIVEN"]'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '11111111-1111-1111-1111-111111111111', 3, 'TRUE_FALSE_NOT_GIVEN', 'Kaldi was a farmer from Yemen.', 'FALSE', '["TRUE", "FALSE", "NOT GIVEN"]'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '11111111-1111-1111-1111-111111111111', 4, 'TRUE_FALSE_NOT_GIVEN', 'Coffee is more popular than tea worldwide.', 'NOT GIVEN', '["TRUE", "FALSE", "NOT GIVEN"]');

-- GROUP 2: MATCHING_HEADINGS (Questions 5-8)
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction, options)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
  'MATCHING_HEADINGS',
  5, 8,
  'Choose the correct heading for each paragraph from the list of headings below.',
  '[{"id": "i", "text": "The discovery of coffee"}, {"id": "ii", "text": "Coffee reaches the Middle East"}, {"id": "iii", "text": "European adoption of coffee"}, {"id": "iv", "text": "Modern coffee production"}, {"id": "v", "text": "The health benefits of coffee"}, {"id": "vi", "text": "Coffee farming techniques"}]'
);

INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer)
VALUES 
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '22222222-2222-2222-2222-222222222222', 5, 'MATCHING_HEADINGS', 'Paragraph A', 'i'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '22222222-2222-2222-2222-222222222222', 6, 'MATCHING_HEADINGS', 'Paragraph B', 'ii'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '22222222-2222-2222-2222-222222222222', 7, 'MATCHING_HEADINGS', 'Paragraph C', 'iii'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '22222222-2222-2222-2222-222222222222', 8, 'MATCHING_HEADINGS', 'Paragraph D', 'iv');

-- GROUP 3: MULTIPLE_CHOICE (Questions 9-10)
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
  'MULTIPLE_CHOICE',
  9, 10,
  'Choose the correct letter, A, B, C or D.'
);

INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options, option_format)
VALUES 
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '33333333-3333-3333-3333-333333333333', 9, 'MULTIPLE_CHOICE', 'According to the passage, who discovered coffee?', 'A', '["A goat herder named Kaldi", "A farmer in Yemen", "European traders", "Arabian merchants"]', 'A'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '33333333-3333-3333-3333-333333333333', 10, 'MULTIPLE_CHOICE', 'Coffeehouses in England were called:', 'B', '["Coffee palaces", "Penny universities", "Qahveh khaneh", "Social clubs"]', 'A');

-- GROUP 4: YES_NO_NOT_GIVEN (Questions 11-13)
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
  'YES_NO_NOT_GIVEN',
  11, 13,
  'Do the following statements agree with the claims of the writer?'
);

INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options)
VALUES 
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '44444444-4444-4444-4444-444444444444', 11, 'YES_NO_NOT_GIVEN', 'Brazil is the world''s largest coffee producer.', 'YES', '["YES", "NO", "NOT GIVEN"]'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '44444444-4444-4444-4444-444444444444', 12, 'YES_NO_NOT_GIVEN', 'Coffee cultivation began in the 14th century.', 'NO', '["YES", "NO", "NOT GIVEN"]'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '44444444-4444-4444-4444-444444444444', 13, 'YES_NO_NOT_GIVEN', 'Coffee farmers earn higher wages than other agricultural workers.', 'NOT GIVEN', '["YES", "NO", "NOT GIVEN"]');

-- GROUP 5: MATCHING_INFORMATION (Questions 14-17)
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
  'MATCHING_INFORMATION',
  14, 17,
  'Which paragraph contains the following information? Write the correct letter, A-E.'
);

INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options)
VALUES 
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '55555555-5555-5555-5555-555555555555', 14, 'MATCHING_INFORMATION', 'A reference to using heat from underground', 'D', '["A", "B", "C", "D", "E"]'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '55555555-5555-5555-5555-555555555555', 15, 'MATCHING_INFORMATION', 'A mention of decreasing costs', 'A', '["A", "B", "C", "D", "E"]'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '55555555-5555-5555-5555-555555555555', 16, 'MATCHING_INFORMATION', 'Environmental concerns about a power source', 'C', '["A", "B", "C", "D", "E"]'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '55555555-5555-5555-5555-555555555555', 17, 'MATCHING_INFORMATION', 'A prediction about future energy dominance', 'E', '["A", "B", "C", "D", "E"]');

-- GROUP 6: MATCHING_FEATURES (Questions 18-20)
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction, options)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
  'MATCHING_FEATURES',
  18, 20,
  'Match each statement with the correct person, A-C.',
  '["Dr. Sarah Chen", "Professor James Miller", "Maria Garcia"]'
);

INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options)
VALUES 
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '66666666-6666-6666-6666-666666666666', 18, 'MATCHING_FEATURES', 'believes solar energy will become the primary power source', 'B', '["A", "B", "C"]'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '66666666-6666-6666-6666-666666666666', 19, 'MATCHING_FEATURES', 'supports local renewable energy initiatives', 'C', '["A", "B", "C"]'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '66666666-6666-6666-6666-666666666666', 20, 'MATCHING_FEATURES', 'advocates for using multiple energy sources', 'A', '["A", "B", "C"]');

-- GROUP 7: SENTENCE_COMPLETION (Questions 21-23)
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
  'SENTENCE_COMPLETION',
  21, 23,
  'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.'
);

INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer)
VALUES 
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '77777777-7777-7777-7777-777777777777', 21, 'SENTENCE_COMPLETION', 'Photovoltaic cells convert sunlight into _____.', 'electricity'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '77777777-7777-7777-7777-777777777777', 22, 'SENTENCE_COMPLETION', 'Offshore wind farms are common in _____ areas.', 'coastal'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '77777777-7777-7777-7777-777777777777', 23, 'SENTENCE_COMPLETION', 'Iceland uses geothermal resources for electricity and _____.', 'heating');

-- GROUP 8: SHORT_ANSWER (Questions 24-26)
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
  'SHORT_ANSWER',
  24, 26,
  'Answer the questions below. Choose NO MORE THAN THREE WORDS from the passage for each answer.'
);

INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer)
VALUES 
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '88888888-8888-8888-8888-888888888888', 24, 'SHORT_ANSWER', 'What type of cells convert sunlight to electricity?', 'photovoltaic cells'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '88888888-8888-8888-8888-888888888888', 25, 'SHORT_ANSWER', 'What environmental concerns are associated with hydroelectric dams?', 'river ecosystems'),
('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', '88888888-8888-8888-8888-888888888888', 26, 'SHORT_ANSWER', 'Which country has successfully utilized geothermal resources?', 'Iceland');

-- GROUP 9: SUMMARY_COMPLETION with word bank (Questions 27-29)
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction, options)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3',
  'SUMMARY_COMPLETION',
  27, 29,
  'Complete the summary below. Choose words from the box.',
  '["printing press", "telegraph", "telephone", "internet", "email", "knowledge", "literacy", "instantaneous"]'
);

INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options)
VALUES 
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', '99999999-9999-9999-9999-999999999999', 27, 'SUMMARY_COMPLETION', 'The invention of the _____ in the 15th century made books more accessible.', 'printing press', '["printing press", "telegraph", "telephone", "internet", "email", "knowledge", "literacy", "instantaneous"]'),
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', '99999999-9999-9999-9999-999999999999', 28, 'SUMMARY_COMPLETION', 'The telegraph allowed messages to be sent _____.', 'instantaneous', '["printing press", "telegraph", "telephone", "internet", "email", "knowledge", "literacy", "instantaneous"]'),
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', '99999999-9999-9999-9999-999999999999', 29, 'SUMMARY_COMPLETION', 'As a result, _____ rates increased significantly.', 'literacy', '["printing press", "telegraph", "telephone", "internet", "email", "knowledge", "literacy", "instantaneous"]');

-- GROUP 10: FILL_IN_BLANK (Questions 30-32)
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3',
  'FILL_IN_BLANK',
  30, 32,
  'Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.'
);

INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer)
VALUES 
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 30, 'FILL_IN_BLANK', 'Human communication began with _____ paintings.', 'cave'),
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 31, 'FILL_IN_BLANK', 'The telegraph was invented in the _____.', '1830s'),
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 32, 'FILL_IN_BLANK', 'The telephone was developed by Alexander Graham _____.', 'Bell');

-- GROUP 11: MATCHING_SENTENCE_ENDINGS (Questions 33-36)
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction, options)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3',
  'MATCHING_SENTENCE_ENDINGS',
  33, 36,
  'Complete each sentence with the correct ending, A-G, below.',
  '["revolutionized the spread of knowledge.", "allowed instant long-distance messaging.", "enabled people to hear voices remotely.", "made global communication instantaneous.", "replaced all previous forms of communication.", "was rejected by most societies.", "had no significant impact on literacy."]'
);

INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options)
VALUES 
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 33, 'MATCHING_SENTENCE_ENDINGS', 'The printing press', 'A', '["A", "B", "C", "D", "E", "F", "G"]'),
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 34, 'MATCHING_SENTENCE_ENDINGS', 'The telegraph', 'B', '["A", "B", "C", "D", "E", "F", "G"]'),
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 35, 'MATCHING_SENTENCE_ENDINGS', 'The telephone', 'C', '["A", "B", "C", "D", "E", "F", "G"]'),
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 36, 'MATCHING_SENTENCE_ENDINGS', 'The internet', 'D', '["A", "B", "C", "D", "E", "F", "G"]');

-- GROUP 12: NOTE_COMPLETION (Questions 37-38)
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3',
  'NOTE_COMPLETION',
  37, 38,
  'Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.'
);

INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer)
VALUES 
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 37, 'NOTE_COMPLETION', 'The telephone was invented in _____.', '1876'),
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 38, 'NOTE_COMPLETION', 'The internet emerged in the late _____ century.', '20th');

-- GROUP 13: MULTIPLE_CHOICE_MULTIPLE (Questions 39-40)
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3',
  'MULTIPLE_CHOICE_MULTIPLE',
  39, 40,
  'Choose TWO letters, A-E.'
);

INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options, option_format)
VALUES 
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 39, 'MULTIPLE_CHOICE_MULTIPLE', 'Which TWO of the following are mentioned as effects of the printing press?', 'A,B', '["Books became more accessible", "Literacy rates increased", "Newspapers were invented", "Schools were established", "Libraries were built"]', 'A'),
('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 40, 'MULTIPLE_CHOICE_MULTIPLE', 'Which TWO features of internet communication are mentioned?', 'C,D', '["Slow connection speeds", "Limited accessibility", "Email", "Video conferencing", "Paper-based records"]', 'A');