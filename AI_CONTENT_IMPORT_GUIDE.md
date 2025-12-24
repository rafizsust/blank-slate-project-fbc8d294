# IELTS Test Content Import Guide

Use this guide to generate SQL INSERT statements for adding listening and reading tests to the database.

---

## DATABASE SCHEMA OVERVIEW

### LISTENING TESTS

**Table Hierarchy:**
```
listening_tests (parent)
  └── listening_question_groups (groups questions by type/section)
        └── listening_questions (individual questions)
```

### READING TESTS

**Table Hierarchy:**
```
reading_tests (parent)
  └── reading_passages (3 passages per test)
        ├── reading_paragraphs (optional: labeled paragraphs A, B, C, etc.)
        └── reading_question_groups (groups questions by type)
              └── reading_questions (individual questions)
```

---

## LISTENING TESTS STRUCTURE

### 1. listening_tests

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Auto | Primary key (use `gen_random_uuid()`) |
| title | TEXT | Yes | Test title (e.g., "Cambridge 18 Test 1") |
| book_name | TEXT | Yes | Book identifier (e.g., "Cambridge 18") |
| test_number | INTEGER | Yes | Test number within book (1, 2, 3, 4) |
| time_limit | INTEGER | Yes | Default: 30 (minutes) |
| total_questions | INTEGER | Yes | Default: 40 |
| is_published | BOOLEAN | Yes | Set to `true` to make visible |
| audio_url | TEXT | No | Legacy: single audio URL |
| audio_url_part1 | TEXT | No | Part 1 audio URL |
| audio_url_part2 | TEXT | No | Part 2 audio URL |
| audio_url_part3 | TEXT | No | Part 3 audio URL |
| audio_url_part4 | TEXT | No | Part 4 audio URL |
| transcript_part1 | TEXT | No | Part 1 transcript |
| transcript_part2 | TEXT | No | Part 2 transcript |
| transcript_part3 | TEXT | No | Part 3 transcript |
| transcript_part4 | TEXT | No | Part 4 transcript |

### 2. listening_question_groups

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Auto | Primary key |
| test_id | UUID | Yes | Foreign key to listening_tests |
| question_type | TEXT | Yes | See "Question Types" below |
| start_question | INTEGER | Yes | First question number in group |
| end_question | INTEGER | Yes | Last question number in group |
| instruction | TEXT | No | Instructions shown to user |
| options | JSONB | No | Shared options for the group |
| start_timestamp_seconds | NUMERIC | No | When this section starts in audio |

### 3. listening_questions

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Auto | Primary key |
| group_id | UUID | Yes | Foreign key to listening_question_groups |
| question_number | INTEGER | Yes | Question number (1-40) |
| question_text | TEXT | Yes | The question text |
| correct_answer | TEXT | Yes | Correct answer(s) |
| options | JSONB | No | Question-specific options |
| heading | TEXT | No | Section heading |
| option_format | TEXT | No | 'A', '1', 'i', etc. |
| is_given | BOOLEAN | No | For matching - if this is an example |
| table_data | JSONB | No | For table completion questions |

---

## READING TESTS STRUCTURE

### 1. reading_tests

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Auto | Primary key |
| title | TEXT | Yes | Test title |
| book_name | TEXT | Yes | Book identifier |
| test_number | INTEGER | Yes | Test number |
| test_type | TEXT | Yes | 'academic' or 'general' |
| time_limit | INTEGER | Yes | Default: 60 (minutes) |
| total_questions | INTEGER | Yes | Default: 40 |
| is_published | BOOLEAN | Yes | Set to `true` to make visible |

### 2. reading_passages

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Auto | Primary key |
| test_id | UUID | Yes | Foreign key to reading_tests |
| passage_number | INTEGER | Yes | 1, 2, or 3 |
| title | TEXT | Yes | Passage title |
| content | TEXT | Yes | Full passage text (can include HTML) |

### 3. reading_paragraphs (Optional - for labeled paragraphs)

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Auto | Primary key |
| passage_id | UUID | Yes | Foreign key to reading_passages |
| label | TEXT | Yes | Paragraph label (A, B, C, etc.) |
| content | TEXT | Yes | Paragraph content |
| order_index | INTEGER | Yes | Order of paragraph |
| is_heading | BOOLEAN | No | If this is a heading, not paragraph |

### 4. reading_question_groups

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Auto | Primary key |
| passage_id | UUID | Yes | Foreign key to reading_passages |
| question_type | TEXT | Yes | See "Question Types" below |
| start_question | INTEGER | Yes | First question number |
| end_question | INTEGER | Yes | Last question number |
| instruction | TEXT | No | Instructions for this group |
| options | JSONB | No | Shared options (headings, word bank, etc.) |
| display_as_paragraph | BOOLEAN | No | For summary completion |
| show_bullets | BOOLEAN | No | Show bullet points |
| show_headings | BOOLEAN | No | Show headings |
| use_dropdown | BOOLEAN | No | Use dropdown for answers |

### 5. reading_questions

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Auto | Primary key |
| passage_id | UUID | Yes | Foreign key to reading_passages |
| question_group_id | UUID | No | Foreign key to reading_question_groups |
| question_number | INTEGER | Yes | Question number (1-40) |
| question_type | TEXT | Yes | Same as group type |
| question_text | TEXT | Yes | The question text |
| correct_answer | TEXT | Yes | Correct answer |
| options | JSONB | No | Question-specific options |
| heading | TEXT | No | Section heading |
| option_format | TEXT | No | 'A', '1', 'i', etc. |
| instruction | TEXT | No | Question-specific instruction |

---

## QUESTION TYPES

### Listening Question Types:
- `form_completion` - Fill in blanks in a form
- `note_completion` - Fill in blanks in notes
- `table_completion` - Fill in a table
- `sentence_completion` - Complete sentences
- `summary_completion` - Complete a summary
- `multiple_choice` - Single answer MCQ
- `multiple_choice_multiple` - Multiple answers MCQ
- `matching` - Match items to options
- `map_labeling` - Label a map/diagram
- `flowchart_completion` - Complete a flowchart
- `short_answer` - Short answer questions

### Reading Question Types:
- `true_false_not_given` - TRUE/FALSE/NOT GIVEN
- `yes_no_not_given` - YES/NO/NOT GIVEN
- `multiple_choice` - Single answer MCQ
- `multiple_choice_multiple` - Multiple answers MCQ
- `matching_headings` - Match paragraphs to headings
- `matching_information` - Match statements to paragraphs
- `matching_features` - Match features to categories
- `matching_sentence_endings` - Match sentence beginnings to endings
- `sentence_completion` - Complete sentences
- `summary_completion` - Complete a summary (no word bank)
- `summary_word_bank` - Complete summary from word bank
- `note_completion` - Complete notes
- `table_completion` - Complete a table
- `flowchart_completion` - Complete a flowchart
- `diagram_labeling` - Label a diagram
- `short_answer` - Short answer questions

---

## CORRECT ANSWER FORMATS

### Single Answer:
```sql
correct_answer = 'answer'
```

### Multiple Acceptable Answers (any one is correct):
```sql
correct_answer = 'answer1/answer2/answer3'
```

### Multiple Required Answers (for multiple_choice_multiple):
```sql
correct_answer = 'A,B,C'  -- comma-separated
```

### Case Sensitivity:
Answers are compared case-insensitively. Store in lowercase or natural case.

---

## OPTIONS JSONB FORMATS

### Multiple Choice Options:
```json
[
  {"label": "A", "text": "Option A text"},
  {"label": "B", "text": "Option B text"},
  {"label": "C", "text": "Option C text"},
  {"label": "D", "text": "Option D text"}
]
```

### Matching Headings (in question_groups.options):
```json
{
  "headings": [
    {"numeral": "i", "text": "First heading"},
    {"numeral": "ii", "text": "Second heading"},
    {"numeral": "iii", "text": "Third heading"}
  ]
}
```

### Matching Features Categories:
```json
{
  "categories": [
    {"label": "A", "text": "Category A"},
    {"label": "B", "text": "Category B"},
    {"label": "C", "text": "Category C"}
  ]
}
```

### Word Bank (for summary_word_bank):
```json
{
  "wordBank": ["word1", "word2", "word3", "word4"]
}
```

---

## TABLE_DATA FORMAT (for table_completion)

```json
{
  "headers": ["Column 1", "Column 2", "Column 3"],
  "rows": [
    {
      "cells": [
        {"type": "text", "content": "Static text"},
        {"type": "input", "questionNumber": 1},
        {"type": "text", "content": "More static"}
      ]
    },
    {
      "cells": [
        {"type": "text", "content": "Row 2"},
        {"type": "input", "questionNumber": 2},
        {"type": "input", "questionNumber": 3}
      ]
    }
  ]
}
```

---

## SQL TEMPLATE: LISTENING TEST

```sql
-- Step 1: Create the test
INSERT INTO listening_tests (
  id, title, book_name, test_number, time_limit, total_questions, is_published,
  audio_url_part1, audio_url_part2, audio_url_part3, audio_url_part4,
  transcript_part1, transcript_part2, transcript_part3, transcript_part4
) VALUES (
  gen_random_uuid(),
  'Cambridge 18 Listening Test 1',
  'Cambridge 18',
  1,
  30,
  40,
  true,
  'https://storage-url/part1.mp3',
  'https://storage-url/part2.mp3',
  'https://storage-url/part3.mp3',
  'https://storage-url/part4.mp3',
  'Part 1 transcript text...',
  'Part 2 transcript text...',
  'Part 3 transcript text...',
  'Part 4 transcript text...'
) RETURNING id;

-- Step 2: Create question groups (use the returned test_id)
-- Replace 'TEST_ID_HERE' with actual UUID from step 1

-- Part 1: Form Completion (Questions 1-10)
INSERT INTO listening_question_groups (
  id, test_id, question_type, start_question, end_question, instruction
) VALUES (
  gen_random_uuid(),
  'TEST_ID_HERE',
  'form_completion',
  1,
  10,
  'Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.'
) RETURNING id;

-- Step 3: Create questions (use the returned group_id)
-- Replace 'GROUP_ID_HERE' with actual UUID from step 2

INSERT INTO listening_questions (group_id, question_number, question_text, correct_answer) VALUES
('GROUP_ID_HERE', 1, 'Name: _____', 'smith'),
('GROUP_ID_HERE', 2, 'Phone: _____', '07865 312890'),
('GROUP_ID_HERE', 3, 'Address: 42 _____ Street', 'oak/Oak');
```

---

## SQL TEMPLATE: READING TEST

```sql
-- Step 1: Create the test
INSERT INTO reading_tests (
  id, title, book_name, test_number, test_type, time_limit, total_questions, is_published
) VALUES (
  gen_random_uuid(),
  'Cambridge 18 Academic Reading Test 1',
  'Cambridge 18',
  1,
  'academic',
  60,
  40,
  true
) RETURNING id;

-- Step 2: Create passages (use the returned test_id)
INSERT INTO reading_passages (
  id, test_id, passage_number, title, content
) VALUES (
  gen_random_uuid(),
  'TEST_ID_HERE',
  1,
  'The History of Glass',
  '<p>Paragraph content here...</p><p>More content...</p>'
) RETURNING id;

-- Step 3: Create question groups (use the returned passage_id)
INSERT INTO reading_question_groups (
  id, passage_id, question_type, start_question, end_question, instruction, options
) VALUES (
  gen_random_uuid(),
  'PASSAGE_ID_HERE',
  'matching_headings',
  1,
  6,
  'The reading passage has seven paragraphs, A-G. Choose the correct heading for each paragraph from the list of headings below.',
  '{"headings": [{"numeral": "i", "text": "Heading one"}, {"numeral": "ii", "text": "Heading two"}]}'
) RETURNING id;

-- Step 4: Create questions
INSERT INTO reading_questions (
  passage_id, question_group_id, question_number, question_type, question_text, correct_answer
) VALUES
('PASSAGE_ID_HERE', 'GROUP_ID_HERE', 1, 'matching_headings', 'Paragraph A', 'iv'),
('PASSAGE_ID_HERE', 'GROUP_ID_HERE', 2, 'matching_headings', 'Paragraph B', 'ii');
```

---

## COMPLETE EXAMPLE: LISTENING TEST WITH MULTIPLE QUESTION TYPES

```sql
-- Create test
WITH new_test AS (
  INSERT INTO listening_tests (title, book_name, test_number, is_published, audio_url_part1)
  VALUES ('Sample Test', 'Sample Book', 1, true, 'https://example.com/audio.mp3')
  RETURNING id
),

-- Create groups
group1 AS (
  INSERT INTO listening_question_groups (test_id, question_type, start_question, end_question, instruction)
  SELECT id, 'form_completion', 1, 5, 'Complete the form below.'
  FROM new_test
  RETURNING id
),

group2 AS (
  INSERT INTO listening_question_groups (test_id, question_type, start_question, end_question, instruction, options)
  SELECT id, 'multiple_choice', 6, 10, 'Choose the correct letter, A, B or C.', NULL
  FROM new_test
  RETURNING id
)

-- Create questions for group 1
INSERT INTO listening_questions (group_id, question_number, question_text, correct_answer)
SELECT id, 1, 'Customer name: _____', 'johnson' FROM group1
UNION ALL
SELECT id, 2, 'Membership number: _____', '7264' FROM group1
UNION ALL
SELECT id, 3, 'Type of room: _____', 'double/twin' FROM group1;

-- Note: Run separate INSERT for group2 questions with their options
```

---

## INSTRUCTIONS FOR AI

When the user provides:
1. **Audio URL(s)** - Use for audio_url_part1, part2, etc.
2. **Transcript(s)** - Use for transcript_part1, part2, etc.
3. **Questions and Answers** - Parse and create appropriate question groups and questions

**Process:**
1. Identify the test metadata (book name, test number)
2. Group questions by type and section
3. Determine correct question_type for each group
4. Format options as proper JSONB
5. Handle answer alternatives with forward slashes
6. Generate SQL with `gen_random_uuid()` for IDs
7. Use CTEs (WITH clauses) to chain inserts when possible

**Important:**
- Question numbers must be unique within a test (1-40)
- Each question must belong to exactly one group
- Groups should not have overlapping question ranges
- Use lowercase for correct_answer when case doesn't matter
- Escape single quotes in SQL strings with two single quotes ('')
