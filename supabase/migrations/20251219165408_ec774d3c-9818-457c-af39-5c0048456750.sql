-- Insert dummy data for Flowchart Completion and Diagram Labeling question types
-- Using the test with test_number 999

-- First, get the passage_id for the test
DO $$
DECLARE
  v_passage_id UUID;
  v_flowchart_group_id UUID;
  v_diagram_group_id UUID;
BEGIN
  -- Get the passage_id from the existing test
  SELECT id INTO v_passage_id FROM reading_passages 
  WHERE test_id = (SELECT id FROM reading_tests WHERE test_number = 999 LIMIT 1)
  LIMIT 1;

  -- Generate new UUIDs for groups
  v_flowchart_group_id := gen_random_uuid();
  v_diagram_group_id := gen_random_uuid();

  -- Insert Flowchart Completion question group (questions 35-38)
  INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction, options)
  VALUES (
    v_flowchart_group_id,
    v_passage_id,
    'FLOWCHART_COMPLETION',
    35,
    38,
    'Complete the flowchart below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
    '{
      "title": "Process of Photosynthesis",
      "direction": "vertical",
      "steps": [
        {"id": "step1", "label": "Sunlight absorbed by chlorophyll", "isBlank": false},
        {"id": "step2", "label": "Carbon dioxide enters through:", "questionNumber": 35, "isBlank": true},
        {"id": "step3", "label": "Water transported from:", "questionNumber": 36, "isBlank": true},
        {"id": "step4", "label": "Light reactions produce:", "questionNumber": 37, "isBlank": true},
        {"id": "step5", "label": "Final product is:", "questionNumber": 38, "isBlank": true},
        {"id": "step6", "label": "Oxygen released into atmosphere", "isBlank": false}
      ]
    }'::jsonb
  );

  -- Insert questions for Flowchart Completion
  INSERT INTO reading_questions (passage_id, question_group_id, question_type, question_number, question_text, correct_answer, options)
  VALUES
    (v_passage_id, v_flowchart_group_id, 'FLOWCHART_COMPLETION', 35, 'Carbon dioxide enters through:', 'stomata', NULL),
    (v_passage_id, v_flowchart_group_id, 'FLOWCHART_COMPLETION', 36, 'Water transported from:', 'roots', NULL),
    (v_passage_id, v_flowchart_group_id, 'FLOWCHART_COMPLETION', 37, 'Light reactions produce:', 'ATP', NULL),
    (v_passage_id, v_flowchart_group_id, 'FLOWCHART_COMPLETION', 38, 'Final product is:', 'glucose', NULL);

  -- Insert Diagram Labeling question group (questions 39-40)
  INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction, options)
  VALUES (
    v_diagram_group_id,
    v_passage_id,
    'DIAGRAM_LABELING',
    39,
    40,
    'Label the diagram below. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
    '{
      "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Leaf_diagram.svg/800px-Leaf_diagram.svg.png",
      "imageAlt": "Cross-section of a leaf",
      "labels": [
        {"id": "label1", "questionNumber": 39, "x": 30, "y": 25, "label": "Upper layer"},
        {"id": "label2", "questionNumber": 40, "x": 70, "y": 75, "label": "Gas exchange"}
      ]
    }'::jsonb
  );

  -- Insert questions for Diagram Labeling
  INSERT INTO reading_questions (passage_id, question_group_id, question_type, question_number, question_text, correct_answer, options)
  VALUES
    (v_passage_id, v_diagram_group_id, 'DIAGRAM_LABELING', 39, 'Upper protective layer', 'epidermis', NULL),
    (v_passage_id, v_diagram_group_id, 'DIAGRAM_LABELING', 40, 'Opening for gas exchange', 'stomata', NULL);

END $$;