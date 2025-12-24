-- Update Cambridge 19 Test 4 with multi-part audio URLs
UPDATE listening_tests 
SET 
  audio_url_part1 = 'https://ieltstrainingonline.com/wp-content/uploads/2024/07/cam19-test4-part1.m4a',
  audio_url_part2 = 'https://ieltstrainingonline.com/wp-content/uploads/2024/07/cam19-test4-part2.m4a',
  audio_url_part3 = 'https://ieltstrainingonline.com/wp-content/uploads/2024/07/cam19-test4-part3.m4a',
  audio_url_part4 = 'https://ieltstrainingonline.com/wp-content/uploads/2024/07/cam19-test4-part4.m4a'
WHERE id = '09c00e06-f97c-4875-8bae-542f7afeb18d';