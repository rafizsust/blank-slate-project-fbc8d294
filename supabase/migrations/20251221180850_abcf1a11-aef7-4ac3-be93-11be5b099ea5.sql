-- Insert the listening test
INSERT INTO listening_tests (id, book_name, test_number, title, total_questions, time_limit, is_published, audio_url)
VALUES (
  gen_random_uuid(),
  'Cambridge IELTS 19',
  4,
  'Cambridge 19 Listening Test 4',
  40,
  30,
  true,
  'https://ieltstrainingonline.com/wp-content/uploads/2024/07/cam19-test4-part1.m4a'
)
RETURNING id;