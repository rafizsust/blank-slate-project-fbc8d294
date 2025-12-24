-- Create a dummy reading test for Matching Grid verification
INSERT INTO reading_tests (id, title, book_name, test_number, is_published, total_questions, time_limit, test_type)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Matching Grid Test', 'Test Book', 999, true, 7, 60, 'academic');

-- Create a passage for the test
INSERT INTO reading_passages (id, test_id, passage_number, title, content)
VALUES ('b1b2c3d4-e5f6-7890-abcd-ef1234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 'Sweater Reviews', 
'**Review A - Sarah M.**
I absolutely love this sweater! The quality is amazing and it fits perfectly. I ordered my usual size and it was spot on. The color is exactly as shown in the pictures. I''ve already worn it to work and received many compliments. The material is soft and comfortable, perfect for both casual and smart occasions.

**Review B - Emma K.**
The sweater arrived quickly and was well packaged. However, I was disappointed to find that the color was slightly different from what I expected based on the website image. The material is nice though, and the sizing was accurate. I decided to keep it anyway.

**Review C - Lucy T.**
I initially ordered the wrong size and had to exchange it. The customer service was helpful and the exchange process was smooth. Once I got the right size, I was very happy with the purchase. The sweater is warm and cozy.

**Review D - Hannah R.**
I was going to return this sweater because I wasn''t sure if it suited my style. After trying it on a few more times, I changed my mind and decided to keep it. It''s actually quite versatile and looks great with jeans or dress pants.

**Review E - Olivia P.**
Great quality sweater! I usually wear a medium but decided to size up for a more relaxed fit. The larger size works perfectly for layering. The sweater is well-made and I can tell it will last for years.');

-- Create a question group for Matching Grid questions
INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction, options)
VALUES ('c1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', 'TABLE_SELECTION', 8, 14, 
'Reading Passage has five online customer reviews of sweaters, **A-E**. For which review are the following statements true? Choose the correct letter, A-E.

*NB* You may use any letter more than once.', '["A", "B", "C", "D", "E"]');

-- Insert questions for Matching Grid
INSERT INTO reading_questions (id, passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options)
VALUES 
('d1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c1b2c3d4-e5f6-7890-abcd-ef1234567890', 8, 'TABLE_SELECTION', 'The colour of the sweater did not match the website image.', 'B', '["A", "B", "C", "D", "E"]'),
('d2b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c1b2c3d4-e5f6-7890-abcd-ef1234567890', 9, 'TABLE_SELECTION', 'The customer took some time to decide on the purchase.', 'D', '["A", "B", "C", "D", "E"]'),
('d3b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c1b2c3d4-e5f6-7890-abcd-ef1234567890', 10, 'TABLE_SELECTION', 'The customer initially bought the wrong size.', 'C', '["A", "B", "C", "D", "E"]'),
('d4b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c1b2c3d4-e5f6-7890-abcd-ef1234567890', 11, 'TABLE_SELECTION', 'The customer changed her mind about returning a sweater.', 'D', '["A", "B", "C", "D", "E"]'),
('d5b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c1b2c3d4-e5f6-7890-abcd-ef1234567890', 12, 'TABLE_SELECTION', 'The customer bought a bigger size than she usually does.', 'E', '["A", "B", "C", "D", "E"]'),
('d6b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c1b2c3d4-e5f6-7890-abcd-ef1234567890', 13, 'TABLE_SELECTION', 'The sweater can be worn for smart or casual occasions.', 'A', '["A", "B", "C", "D", "E"]'),
('d7b2c3d4-e5f6-7890-abcd-ef1234567890', 'b1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c1b2c3d4-e5f6-7890-abcd-ef1234567890', 14, 'TABLE_SELECTION', 'The customer was worried that the sweater would not suit her.', 'D', '["A", "B", "C", "D", "E"]');