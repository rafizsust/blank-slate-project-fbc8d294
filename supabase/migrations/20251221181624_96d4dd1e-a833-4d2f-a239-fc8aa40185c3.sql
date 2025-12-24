-- Update group question types to uppercase format
UPDATE listening_question_groups 
SET question_type = 'FILL_IN_BLANK' 
WHERE test_id = '09c00e06-f97c-4875-8bae-542f7afeb18d' 
AND question_type IN ('note_completion', 'table_completion');

UPDATE listening_question_groups 
SET question_type = 'MATCHING_CORRECT_LETTER' 
WHERE test_id = '09c00e06-f97c-4875-8bae-542f7afeb18d' 
AND question_type = 'matching';

UPDATE listening_question_groups 
SET question_type = 'MULTIPLE_CHOICE_SINGLE' 
WHERE test_id = '09c00e06-f97c-4875-8bae-542f7afeb18d' 
AND question_type = 'multiple_choice';

UPDATE listening_question_groups 
SET question_type = 'MULTIPLE_CHOICE_MULTIPLE' 
WHERE test_id = '09c00e06-f97c-4875-8bae-542f7afeb18d' 
AND question_type = 'multiple_choice_multiple';