-- Delete the malformed/duplicate question group with incorrect range 11-23
-- This group overlaps with the correct group (11-12) and extends beyond Part 2's range (which ends at 20)
DELETE FROM listening_question_groups 
WHERE id = 'e7640fed-ffb6-4693-9c6f-75d0436a4944';