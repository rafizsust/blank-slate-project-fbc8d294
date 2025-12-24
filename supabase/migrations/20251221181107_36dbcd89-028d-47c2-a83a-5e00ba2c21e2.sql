-- Part 1 Questions 1-6 (Note completion) - group_id: 1b6964ac-3a55-4f30-8ab5-56b187eace6e
INSERT INTO listening_questions (group_id, question_number, question_text, correct_answer) VALUES
('1b6964ac-3a55-4f30-8ab5-56b187eace6e', 1, 'Name of supervisor', 'Kaeden'),
('1b6964ac-3a55-4f30-8ab5-56b187eace6e', 2, 'Where to leave coat and bag: use __________ in staffroom', 'locker'),
('1b6964ac-3a55-4f30-8ab5-56b187eace6e', 3, 'See Tiffany in HR: to give __________ number', 'passport'),
('1b6964ac-3a55-4f30-8ab5-56b187eace6e', 4, 'See Tiffany in HR: to collect __________', 'uniform'),
('1b6964ac-3a55-4f30-8ab5-56b187eace6e', 5, 'Location of HR office: on __________ floor', 'third'),
('1b6964ac-3a55-4f30-8ab5-56b187eace6e', 6, 'Supervisor''s mobile number', '0412 665 903');

-- Part 1 Questions 7-10 (Table completion) - group_id: 543d2447-f4c8-48b3-a691-0c79b466fe46
INSERT INTO listening_questions (group_id, question_number, question_text, correct_answer) VALUES
('543d2447-f4c8-48b3-a691-0c79b466fe46', 7, 'Bakery section - Use __________ labels', 'yellow'),
('543d2447-f4c8-48b3-a691-0c79b466fe46', 8, 'Sushi takeaway counter - Re-stock with __________ boxes if needed', 'plastic'),
('543d2447-f4c8-48b3-a691-0c79b466fe46', 9, 'Meat and fish counters - Collect __________ for the fish from the cold-room', 'ice'),
('543d2447-f4c8-48b3-a691-0c79b466fe46', 10, 'Meat and fish counters - Must wear special __________', 'gloves');

-- Part 2 Questions 11-12 (Multiple choice multiple) - group_id: d201b3c0-002a-44b8-9d19-13515b21e322
INSERT INTO listening_questions (group_id, question_number, question_text, correct_answer, options) VALUES
('d201b3c0-002a-44b8-9d19-13515b21e322', 11, 'Which TWO problems with some training programmes for new runners does Liz mention?', 'C,E', '["A. There is a risk of serious injury.", "B. They are unsuitable for certain age groups.", "C. They are unsuitable for people with health issues.", "D. It is difficult to stay motivated.", "E. There is a lack of individual support."]'::jsonb),
('d201b3c0-002a-44b8-9d19-13515b21e322', 12, 'Which TWO problems with some training programmes for new runners does Liz mention?', 'C,E', '["A. There is a risk of serious injury.", "B. They are unsuitable for certain age groups.", "C. They are unsuitable for people with health issues.", "D. It is difficult to stay motivated.", "E. There is a lack of individual support."]'::jsonb);

-- Part 2 Questions 13-14 (Multiple choice multiple) - group_id: c906c2ab-9b13-4caa-83ba-21b9aab3c5e4
INSERT INTO listening_questions (group_id, question_number, question_text, correct_answer, options) VALUES
('c906c2ab-9b13-4caa-83ba-21b9aab3c5e4', 13, 'Which TWO tips does Liz recommend for new runners?', 'A,D', '["A. doing two runs a week", "B. running in the evening", "C. going on runs with a friend", "D. listening to music during runs", "E. running very slowly"]'::jsonb),
('c906c2ab-9b13-4caa-83ba-21b9aab3c5e4', 14, 'Which TWO tips does Liz recommend for new runners?', 'A,D', '["A. doing two runs a week", "B. running in the evening", "C. going on runs with a friend", "D. listening to music during runs", "E. running very slowly"]'::jsonb);

-- Part 2 Questions 15-18 (Matching) - group_id: ef1def88-10e9-4d10-ba47-6afb054f28fe
INSERT INTO listening_questions (group_id, question_number, question_text, correct_answer, options) VALUES
('ef1def88-10e9-4d10-ba47-6afb054f28fe', 15, 'Ceri', 'A', '["A. a lack of confidence", "B. a dislike of running", "C. a lack of time"]'::jsonb),
('ef1def88-10e9-4d10-ba47-6afb054f28fe', 16, 'James', 'B', '["A. a lack of confidence", "B. a dislike of running", "C. a lack of time"]'::jsonb),
('ef1def88-10e9-4d10-ba47-6afb054f28fe', 17, 'Leo', 'C', '["A. a lack of confidence", "B. a dislike of running", "C. a lack of time"]'::jsonb),
('ef1def88-10e9-4d10-ba47-6afb054f28fe', 18, 'Mark', 'A', '["A. a lack of confidence", "B. a dislike of running", "C. a lack of time"]'::jsonb);

-- Part 2 Questions 19-20 (Multiple choice single) - group_id: 800f6636-bd6b-4545-b8ae-314717547855
INSERT INTO listening_questions (group_id, question_number, question_text, correct_answer, options) VALUES
('800f6636-bd6b-4545-b8ae-314717547855', 19, 'What does Liz say about running her first marathon?', 'C', '["A. It had always been her ambition.", "B. Her husband persuaded her to do it.", "C. She nearly gave up before the end."]'::jsonb),
('800f6636-bd6b-4545-b8ae-314717547855', 20, 'Liz says new runners should sign up for a race', 'B', '["A. every six months.", "B. within a few weeks of taking up running.", "C. after completing several practice runs."]'::jsonb);

-- Part 3 Questions 21-25 (Multiple choice single) - group_id: 68cadeef-86b7-49fe-a052-3bf303f68bec
INSERT INTO listening_questions (group_id, question_number, question_text, correct_answer, options) VALUES
('68cadeef-86b7-49fe-a052-3bf303f68bec', 21, 'Kieran thinks the packing advice given by Jane''s grandfather is', 'A', '["A. common sense.", "B. hard to follow.", "C. over-protective."]'::jsonb),
('68cadeef-86b7-49fe-a052-3bf303f68bec', 22, 'How does Jane feel about the books her grandfather has given her?', 'C', '["A. They are not worth keeping.", "B. They should go to a collector.", "C. They have sentimental value for her."]'::jsonb),
('68cadeef-86b7-49fe-a052-3bf303f68bec', 23, 'Jane and Kieran agree that hardback books should be', 'A', '["A. put out on display.", "B. given as gifts to visitors.", "C. more attractively designed."]'::jsonb),
('68cadeef-86b7-49fe-a052-3bf303f68bec', 24, 'While talking about taking a book from a shelf, Jane', 'B', '["A. describes the mistakes other people make doing it.", "B. reflects on a significant childhood experience.", "C. explains why some books are easier to remove than others."]'::jsonb),
('68cadeef-86b7-49fe-a052-3bf303f68bec', 25, 'What do Jane and Kieran suggest about new books?', 'C', '["A. Their parents liked buying them as presents.", "B. They would like to buy more of them.", "C. Not everyone can afford them."]'::jsonb);

-- Part 3 Questions 26-30 (Matching) - group_id: 9d773b16-220c-48e9-a2ff-2b3e40f30d3a
INSERT INTO listening_questions (group_id, question_number, question_text, correct_answer, options) VALUES
('9d773b16-220c-48e9-a2ff-2b3e40f30d3a', 26, 'rare books', 'D', '["A. near the entrance", "B. in the attic", "C. at the back of the shop", "D. on a high shelf", "E. near the stairs", "F. in a specially designed space", "G. within the café"]'::jsonb),
('9d773b16-220c-48e9-a2ff-2b3e40f30d3a', 27, 'children''s books', 'F', '["A. near the entrance", "B. in the attic", "C. at the back of the shop", "D. on a high shelf", "E. near the stairs", "F. in a specially designed space", "G. within the café"]'::jsonb),
('9d773b16-220c-48e9-a2ff-2b3e40f30d3a', 28, 'unwanted books', 'A', '["A. near the entrance", "B. in the attic", "C. at the back of the shop", "D. on a high shelf", "E. near the stairs", "F. in a specially designed space", "G. within the café"]'::jsonb),
('9d773b16-220c-48e9-a2ff-2b3e40f30d3a', 29, 'requested books', 'C', '["A. near the entrance", "B. in the attic", "C. at the back of the shop", "D. on a high shelf", "E. near the stairs", "F. in a specially designed space", "G. within the café"]'::jsonb),
('9d773b16-220c-48e9-a2ff-2b3e40f30d3a', 30, 'coursebooks', 'G', '["A. near the entrance", "B. in the attic", "C. at the back of the shop", "D. on a high shelf", "E. near the stairs", "F. in a specially designed space", "G. within the café"]'::jsonb);

-- Part 4 Questions 31-40 (Note completion) - group_id: 64fb053e-ceba-411b-9705-9e04449e8dc7
INSERT INTO listening_questions (group_id, question_number, question_text, correct_answer) VALUES
('64fb053e-ceba-411b-9705-9e04449e8dc7', 31, 'not include invasive species because of possible __________ with native species', 'competition'),
('64fb053e-ceba-411b-9705-9e04449e8dc7', 32, 'aim to capture carbon, protect the environment and provide sustainable sources of __________ for local people', 'food'),
('64fb053e-ceba-411b-9705-9e04449e8dc7', 33, 'use tree seeds with a high genetic diversity to increase resistance to __________ and climate change', 'disease'),
('64fb053e-ceba-411b-9705-9e04449e8dc7', 34, 'plant trees on previously forested land which is in a bad condition, not select land which is being used for __________', 'agriculture'),
('64fb053e-ceba-411b-9705-9e04449e8dc7', 35, 'Base planning decisions on information from accurate __________', 'maps'),
('64fb053e-ceba-411b-9705-9e04449e8dc7', 36, 'Drones are useful for identifying areas in Brazil which are endangered by keeping __________ and illegal logging', 'cattle'),
('64fb053e-ceba-411b-9705-9e04449e8dc7', 37, 'increasing the __________ of recovery by attracting animals and birds', 'speed'),
('64fb053e-ceba-411b-9705-9e04449e8dc7', 38, '__________ were soon attracted to the area', 'monkeys'),
('64fb053e-ceba-411b-9705-9e04449e8dc7', 39, 'Destruction of mangrove forests in Madagascar made it difficult for people to make a living from __________', 'fishing'),
('64fb053e-ceba-411b-9705-9e04449e8dc7', 40, 'protects against the higher risk of __________', 'flooding');