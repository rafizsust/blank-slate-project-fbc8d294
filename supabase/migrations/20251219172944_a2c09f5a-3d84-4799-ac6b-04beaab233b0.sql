-- Insert Cambridge IELTS 20 Academic Reading Test 1
INSERT INTO reading_tests (id, book_name, test_number, title, test_type, time_limit, total_questions, is_published)
VALUES (gen_random_uuid(), 'Cambridge IELTS 20', 1, 'Cambridge IELTS 20 Academic Reading Test 1', 'academic', 60, 40, true);

-- Get the test_id for subsequent inserts
DO $$
DECLARE
  v_test_id uuid;
  v_passage1_id uuid;
  v_passage2_id uuid;
  v_passage3_id uuid;
  v_group1_id uuid;
  v_group2_id uuid;
  v_group3_id uuid;
  v_group4_id uuid;
  v_group5_id uuid;
  v_group6_id uuid;
  v_group7_id uuid;
  v_group8_id uuid;
  v_group9_id uuid;
BEGIN
  -- Get the test we just created
  SELECT id INTO v_test_id FROM reading_tests WHERE book_name = 'Cambridge IELTS 20' AND test_number = 1 LIMIT 1;
  
  -- Generate UUIDs for passages
  v_passage1_id := gen_random_uuid();
  v_passage2_id := gen_random_uuid();
  v_passage3_id := gen_random_uuid();
  
  -- Insert Passage 1: Deer Farming in Australia
  INSERT INTO reading_passages (id, test_id, passage_number, title, content)
  VALUES (v_passage1_id, v_test_id, 1, 'Deer Farming in Australia', 
  E'**A** The Australian deer-farming industry has grown significantly since its beginnings in the 1970s. Today, there are approximately 1,000 deer farms across the country, with the majority located in Victoria, New South Wales, and Tasmania. The industry produces venison (deer meat), velvet antler, and breeding stock for both domestic and international markets.\n\n**B** Deer are not native to Australia. The six species now farmed – red deer, fallow deer, rusa deer, chital deer, sambar deer, and elk (wapiti) – were introduced during the nineteenth and early twentieth centuries for sport hunting. Some escaped or were released, establishing wild populations that still exist in various parts of Australia. The development of deer farming has drawn on both these wild populations and imported stock.\n\n**C** The Australian deer industry has had to develop its own expertise since there was no tradition of deer farming in this country. Farmers have had to learn how to handle, feed, and breed deer, as well as how to process and market venison and velvet. This has required significant investment in research and development, much of it funded by the industry itself through levies on producers.\n\n**D** Venison is the main product of the Australian deer industry, accounting for about 60 percent of farm income. Australian venison is lean, tender, and mild-flavored, and is marketed as a healthy, premium meat. Most venison is sold domestically, though there is a growing export market, particularly in Asia. The industry has worked hard to develop a consistent, high-quality product and to establish reliable supply chains to restaurants and retailers.\n\n**E** Velvet antler, which is harvested from male deer before it hardens into bone, is the second most important product. It is used in traditional Asian medicine and as a dietary supplement. Australia exports most of its velvet to South Korea, China, and other Asian markets. The harvest of velvet is carefully regulated to ensure animal welfare standards are maintained.\n\n**F** The deer-farming industry faces several challenges. These include competition from other meats, fluctuating demand in export markets, and the need to maintain high standards of animal welfare and environmental sustainability. Climate change is also a concern, as deer are susceptible to heat stress and require access to shade and water during hot weather.\n\n**G** Despite these challenges, the industry is optimistic about its future. There is growing consumer interest in alternative meats that are seen as healthier and more environmentally sustainable than traditional beef and lamb. Deer are efficient converters of pasture to meat and have a lower environmental footprint than cattle. The industry is also exploring new products and markets, including deer milk, deer leather, and deer-based pharmaceuticals.');

  -- Insert Passage 2: The History of the Compass
  INSERT INTO reading_passages (id, test_id, passage_number, title, content)
  VALUES (v_passage2_id, v_test_id, 2, 'The History of the Compass',
  E'The magnetic compass is one of the most important inventions in human history. It enabled sailors to navigate across oceans, explorers to map continents, and armies to march across deserts. Yet its origins remain somewhat mysterious.\n\nThe earliest references to magnetic compasses come from China, dating back to around the 4th century BC. These early devices used lodestone, a naturally magnetized iron ore, to indicate direction. The Chinese initially used the compass for feng shui – the art of placing buildings and objects in harmony with their environment – rather than for navigation.\n\nThe first documented use of a magnetic compass for navigation appears in Chinese records from the 11th century AD. By this time, the Chinese had discovered that a magnetized needle, if allowed to rotate freely, would align itself with the Earth''s magnetic field. They suspended these needles on silk threads or floated them on water to create navigational instruments.\n\nThe compass reached the Islamic world by the 12th century, probably through trade routes connecting China with the Middle East. Arab scholars quickly recognized its potential for navigation and began to incorporate it into their maritime traditions. They also made improvements to the design, including the development of the dry compass, which used a pivoting needle rather than a floating one.\n\nThe compass arrived in Europe around the same time, either through Arab intermediaries or via the Silk Road. European sailors rapidly adopted it for navigation, and by the 13th century, it had become an essential tool for maritime trade. The Mediterranean maritime republics of Venice, Genoa, and Amalfi were particularly important in spreading compass technology throughout Europe.\n\nEuropean craftsmen made significant improvements to the compass during the 14th and 15th centuries. They developed the compass card, which combined the magnetic needle with a circular card marked with the cardinal and intermediate directions. They also created the gimballed compass, which remained level despite the motion of a ship. These innovations made the compass more accurate and easier to use at sea.\n\nThe compass played a crucial role in the Age of Exploration, enabling European sailors to venture beyond the sight of land and navigate across the Atlantic, Pacific, and Indian Oceans. Christopher Columbus, Vasco da Gama, and Ferdinand Magellan all relied on compasses for their historic voyages.\n\nHowever, early navigators discovered that the compass did not always point to true north. The angle between magnetic north (indicated by the compass) and true north (the direction of the North Pole) varies depending on location. This phenomenon, known as magnetic declination or variation, caused confusion and sometimes shipwrecks until it was understood and charted.\n\nScientists eventually realized that the Earth acts like a giant magnet, with a magnetic field generated by molten iron in its core. The magnetic poles do not coincide with the geographic poles and, moreover, they move over time. Understanding these phenomena allowed navigators to correct for magnetic declination and use their compasses more accurately.\n\nToday, the magnetic compass has been largely superseded by GPS and other electronic navigation systems. However, it remains a backup instrument on most ships and aircraft, as it requires no power and cannot be jammed or hacked. The simple elegance of a magnetized needle pointing north continues to fascinate and serve us, more than two thousand years after it was first discovered.');

  -- Insert Passage 3: Sleep and Memory Consolidation
  INSERT INTO reading_passages (id, test_id, passage_number, title, content)
  VALUES (v_passage3_id, v_test_id, 3, 'Sleep and Memory Consolidation',
  E'The relationship between sleep and memory has fascinated scientists for over a century. Early researchers observed that sleep seemed to protect newly acquired memories from interference and decay. More recent work has revealed that sleep does far more than simply preserve memories – it actively transforms and strengthens them through a process called consolidation.\n\nMemory consolidation is the process by which memories become stable and resistant to disruption. It involves the transfer of information from temporary storage sites in the brain to more permanent locations. This process occurs over hours, days, or even years, but research has shown that sleep plays a particularly important role, especially in the early stages of consolidation.\n\nDuring sleep, the brain cycles through different stages, each characterized by distinct patterns of neural activity. The two main types of sleep are rapid eye movement (REM) sleep, during which most dreaming occurs, and non-REM (NREM) sleep, which is further divided into three stages of increasing depth. Different stages of sleep appear to be important for consolidating different types of memory.\n\nDeclarative memories – memories for facts and events – seem to benefit particularly from slow-wave sleep, the deepest stage of NREM sleep. During this stage, the hippocampus, a brain region critical for forming new memories, replays recently acquired information to the neocortex, where it is gradually integrated into existing knowledge structures. This process is accompanied by distinctive brain waves called slow oscillations and sleep spindles.\n\nProcedural memories – memories for skills and habits – appear to depend more on REM sleep and lighter stages of NREM sleep. Studies have shown that learning a new motor skill, such as playing a sequence of notes on a piano, is followed by increases in REM sleep, and that performance on such tasks improves more after sleep that contains adequate REM than after sleep that is disrupted or REM-deprived.\n\nEmotional memories seem to be processed differently during sleep than neutral memories. REM sleep may help to preserve the content of emotional experiences while reducing their emotional intensity. This could explain why disturbing memories often become less distressing over time – the facts are retained, but the associated feelings gradually fade.\n\nSleep deprivation has profound effects on memory. People who are deprived of sleep show impaired ability to form new memories and to recall recently learned information. Chronic sleep restriction, even to seemingly moderate levels of six hours per night, leads to cumulative cognitive deficits that may not be fully reversed even after recovery sleep.\n\nThe importance of sleep for memory has practical implications for education and workplace performance. Students who sacrifice sleep to cram for exams may be undermining the very memories they are trying to form. Workers who skimp on sleep to meet deadlines may find their productivity suffering more than they realize.\n\nResearchers are now investigating whether it is possible to enhance memory consolidation during sleep. Some studies have found that playing sounds or odors during sleep that were present during learning can boost memory for the associated material. Others are exploring whether electrical stimulation of the brain during sleep can amplify the neural processes underlying consolidation.\n\nThese findings have potential applications for treating memory disorders and for enhancing memory in healthy individuals. However, much remains to be learned about the mechanisms of sleep-dependent memory consolidation and how they can be safely and effectively manipulated.');

  -- Generate UUIDs for question groups
  v_group1_id := gen_random_uuid();
  v_group2_id := gen_random_uuid();
  v_group3_id := gen_random_uuid();
  v_group4_id := gen_random_uuid();
  v_group5_id := gen_random_uuid();
  v_group6_id := gen_random_uuid();
  v_group7_id := gen_random_uuid();
  v_group8_id := gen_random_uuid();
  v_group9_id := gen_random_uuid();

  -- Passage 1 Question Groups
  INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction, options)
  VALUES 
    (v_group1_id, v_passage1_id, 'MATCHING_INFORMATION', 1, 7, 'Reading Passage 1 has seven paragraphs, A-G. Which paragraph contains the following information? Write the correct letter, A-G, in boxes 1-7 on your answer sheet. NB You may use any letter more than once.', '["A", "B", "C", "D", "E", "F", "G"]'),
    (v_group2_id, v_passage1_id, 'TRUE_FALSE_NOT_GIVEN', 8, 13, 'Do the following statements agree with the information given in Reading Passage 1? In boxes 8-13 on your answer sheet, write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.', NULL);

  -- Passage 2 Question Groups
  INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction, options)
  VALUES 
    (v_group3_id, v_passage2_id, 'SENTENCE_COMPLETION', 14, 18, 'Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 14-18 on your answer sheet.', NULL),
    (v_group4_id, v_passage2_id, 'MULTIPLE_CHOICE_SINGLE', 19, 22, 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 19-22 on your answer sheet.', NULL),
    (v_group5_id, v_passage2_id, 'YES_NO_NOT_GIVEN', 23, 26, 'Do the following statements agree with the claims of the writer in Reading Passage 2? In boxes 23-26 on your answer sheet, write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.', NULL);

  -- Passage 3 Question Groups
  INSERT INTO reading_question_groups (id, passage_id, question_type, start_question, end_question, instruction, options)
  VALUES 
    (v_group6_id, v_passage3_id, 'MATCHING_FEATURES', 27, 31, 'Look at the following statements (Questions 27-31) and the list of sleep stages below. Match each statement with the correct sleep stage, A, B or C. Write the correct letter, A, B or C, in boxes 27-31 on your answer sheet. NB You may use any letter more than once.', '{"features": ["Slow-wave sleep", "REM sleep", "Light NREM sleep"], "labels": ["A", "B", "C"]}'),
    (v_group7_id, v_passage3_id, 'SUMMARY_COMPLETION', 32, 36, 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 32-36 on your answer sheet.', NULL),
    (v_group8_id, v_passage3_id, 'MULTIPLE_CHOICE_SINGLE', 37, 40, 'Choose the correct letter, A, B, C or D. Write the correct letter in boxes 37-40 on your answer sheet.', NULL);

  -- Insert Questions for Passage 1
  INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options)
  VALUES 
    (v_passage1_id, v_group1_id, 1, 'MATCHING_INFORMATION', 'a reference to how the deer industry funded its own learning process', 'C', '["A", "B", "C", "D", "E", "F", "G"]'),
    (v_passage1_id, v_group1_id, 2, 'MATCHING_INFORMATION', 'details of a product used in traditional medicine', 'E', '["A", "B", "C", "D", "E", "F", "G"]'),
    (v_passage1_id, v_group1_id, 3, 'MATCHING_INFORMATION', 'mention of the original purpose for bringing deer to Australia', 'B', '["A", "B", "C", "D", "E", "F", "G"]'),
    (v_passage1_id, v_group1_id, 4, 'MATCHING_INFORMATION', 'information about the relative importance of different deer products', 'D', '["A", "B", "C", "D", "E", "F", "G"]'),
    (v_passage1_id, v_group1_id, 5, 'MATCHING_INFORMATION', 'reasons for optimism about the future of deer farming', 'G', '["A", "B", "C", "D", "E", "F", "G"]'),
    (v_passage1_id, v_group1_id, 6, 'MATCHING_INFORMATION', 'a problem related to weather conditions', 'F', '["A", "B", "C", "D", "E", "F", "G"]'),
    (v_passage1_id, v_group1_id, 7, 'MATCHING_INFORMATION', 'details of where deer farms are mainly located', 'A', '["A", "B", "C", "D", "E", "F", "G"]'),
    (v_passage1_id, v_group2_id, 8, 'TRUE_FALSE_NOT_GIVEN', 'Deer farming in Australia began before the 1970s.', 'FALSE', NULL),
    (v_passage1_id, v_group2_id, 9, 'TRUE_FALSE_NOT_GIVEN', 'All species of deer currently farmed in Australia were introduced for hunting purposes.', 'TRUE', NULL),
    (v_passage1_id, v_group2_id, 10, 'TRUE_FALSE_NOT_GIVEN', 'Australian venison is mainly exported to European markets.', 'FALSE', NULL),
    (v_passage1_id, v_group2_id, 11, 'TRUE_FALSE_NOT_GIVEN', 'Velvet antler is harvested from both male and female deer.', 'FALSE', NULL),
    (v_passage1_id, v_group2_id, 12, 'TRUE_FALSE_NOT_GIVEN', 'The deer industry is concerned about animal welfare during velvet harvesting.', 'TRUE', NULL),
    (v_passage1_id, v_group2_id, 13, 'TRUE_FALSE_NOT_GIVEN', 'Deer farming produces more greenhouse gases than cattle farming.', 'FALSE', NULL);

  -- Insert Questions for Passage 2
  INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options)
  VALUES 
    (v_passage2_id, v_group3_id, 14, 'SENTENCE_COMPLETION', 'The Chinese originally used compasses for _______, not navigation.', 'feng shui', NULL),
    (v_passage2_id, v_group3_id, 15, 'SENTENCE_COMPLETION', 'Arab scholars developed the _______ compass, which used a pivoting needle.', 'dry', NULL),
    (v_passage2_id, v_group3_id, 16, 'SENTENCE_COMPLETION', 'European craftsmen invented the _______ compass to keep the instrument level on ships.', 'gimballed', NULL),
    (v_passage2_id, v_group3_id, 17, 'SENTENCE_COMPLETION', 'The angle between magnetic north and true north is called magnetic _______.', 'declination', NULL),
    (v_passage2_id, v_group3_id, 18, 'SENTENCE_COMPLETION', 'The Earth''s magnetic field is generated by _______ in its core.', 'molten iron', NULL),
    (v_passage2_id, v_group4_id, 19, 'MULTIPLE_CHOICE_SINGLE', 'According to the passage, the earliest compasses were made using', 'A', '[{"label": "A", "text": "lodestone"}, {"label": "B", "text": "iron needles"}, {"label": "C", "text": "silk threads"}, {"label": "D", "text": "floating devices"}]'),
    (v_passage2_id, v_group4_id, 20, 'MULTIPLE_CHOICE_SINGLE', 'The compass card was developed', 'C', '[{"label": "A", "text": "in China during the 11th century"}, {"label": "B", "text": "by Arab scholars"}, {"label": "C", "text": "by European craftsmen"}, {"label": "D", "text": "during the Age of Exploration"}]'),
    (v_passage2_id, v_group4_id, 21, 'MULTIPLE_CHOICE_SINGLE', 'Magnetic declination caused problems because', 'B', '[{"label": "A", "text": "compasses stopped working at certain locations"}, {"label": "B", "text": "the compass did not point to true north everywhere"}, {"label": "C", "text": "magnetic poles moved too quickly to chart"}, {"label": "D", "text": "scientists did not believe it existed"}]'),
    (v_passage2_id, v_group4_id, 22, 'MULTIPLE_CHOICE_SINGLE', 'The writer suggests that magnetic compasses are still useful today because', 'D', '[{"label": "A", "text": "they are more accurate than GPS"}, {"label": "B", "text": "they are cheaper than electronic systems"}, {"label": "C", "text": "they can work in all weather conditions"}, {"label": "D", "text": "they do not need electricity and are secure"}]'),
    (v_passage2_id, v_group5_id, 23, 'YES_NO_NOT_GIVEN', 'The exact origins of the compass are well documented.', 'NO', NULL),
    (v_passage2_id, v_group5_id, 24, 'YES_NO_NOT_GIVEN', 'The compass reached Europe through multiple possible routes.', 'YES', NULL),
    (v_passage2_id, v_group5_id, 25, 'YES_NO_NOT_GIVEN', 'Columbus was the first European to use a compass for ocean navigation.', 'NOT GIVEN', NULL),
    (v_passage2_id, v_group5_id, 26, 'YES_NO_NOT_GIVEN', 'The magnetic poles are currently moving faster than in previous centuries.', 'NOT GIVEN', NULL);

  -- Insert Questions for Passage 3
  INSERT INTO reading_questions (passage_id, question_group_id, question_number, question_type, question_text, correct_answer, options)
  VALUES 
    (v_passage3_id, v_group6_id, 27, 'MATCHING_FEATURES', 'This stage involves replay of information from the hippocampus to the neocortex.', 'A', '{"features": ["Slow-wave sleep", "REM sleep", "Light NREM sleep"], "labels": ["A", "B", "C"]}'),
    (v_passage3_id, v_group6_id, 28, 'MATCHING_FEATURES', 'This stage is when most dreaming takes place.', 'B', '{"features": ["Slow-wave sleep", "REM sleep", "Light NREM sleep"], "labels": ["A", "B", "C"]}'),
    (v_passage3_id, v_group6_id, 29, 'MATCHING_FEATURES', 'This stage seems to help reduce the emotional intensity of memories.', 'B', '{"features": ["Slow-wave sleep", "REM sleep", "Light NREM sleep"], "labels": ["A", "B", "C"]}'),
    (v_passage3_id, v_group6_id, 30, 'MATCHING_FEATURES', 'This stage is particularly important for memories of facts and events.', 'A', '{"features": ["Slow-wave sleep", "REM sleep", "Light NREM sleep"], "labels": ["A", "B", "C"]}'),
    (v_passage3_id, v_group6_id, 31, 'MATCHING_FEATURES', 'This stage appears to be important for learning motor skills.', 'B', '{"features": ["Slow-wave sleep", "REM sleep", "Light NREM sleep"], "labels": ["A", "B", "C"]}'),
    (v_passage3_id, v_group7_id, 32, 'SUMMARY_COMPLETION', 'Memory consolidation is the process by which memories become stable and resistant to 32_______.', 'disruption', NULL),
    (v_passage3_id, v_group7_id, 33, 'SUMMARY_COMPLETION', 'During slow-wave sleep, the brain produces distinctive patterns called slow oscillations and 33_______.', 'sleep spindles', NULL),
    (v_passage3_id, v_group7_id, 34, 'SUMMARY_COMPLETION', 'Procedural memories relate to 34_______ and habits.', 'skills', NULL),
    (v_passage3_id, v_group7_id, 35, 'SUMMARY_COMPLETION', 'People with chronic sleep restriction experience 35_______ deficits that accumulate over time.', 'cognitive', NULL),
    (v_passage3_id, v_group7_id, 36, 'SUMMARY_COMPLETION', 'Students who reduce sleep to study for exams may be harming the 36_______ they want to create.', 'memories', NULL),
    (v_passage3_id, v_group8_id, 37, 'MULTIPLE_CHOICE_SINGLE', 'According to the passage, early researchers believed that sleep', 'A', '[{"label": "A", "text": "helped protect new memories"}, {"label": "B", "text": "actively strengthened memories"}, {"label": "C", "text": "had no effect on memory"}, {"label": "D", "text": "only affected certain types of memory"}]'),
    (v_passage3_id, v_group8_id, 38, 'MULTIPLE_CHOICE_SINGLE', 'The transfer of information from the hippocampus to the neocortex', 'C', '[{"label": "A", "text": "occurs mainly during REM sleep"}, {"label": "B", "text": "happens instantaneously"}, {"label": "C", "text": "is part of memory consolidation"}, {"label": "D", "text": "only affects procedural memories"}]'),
    (v_passage3_id, v_group8_id, 39, 'MULTIPLE_CHOICE_SINGLE', 'Research suggests that emotional memories during sleep', 'B', '[{"label": "A", "text": "become more intense over time"}, {"label": "B", "text": "retain content but lose emotional charge"}, {"label": "C", "text": "are completely erased"}, {"label": "D", "text": "are only processed during NREM sleep"}]'),
    (v_passage3_id, v_group8_id, 40, 'MULTIPLE_CHOICE_SINGLE', 'The writer implies that research into enhancing memory during sleep', 'D', '[{"label": "A", "text": "has been completed successfully"}, {"label": "B", "text": "is too dangerous to continue"}, {"label": "C", "text": "has no practical applications"}, {"label": "D", "text": "shows promise but needs more investigation"}]');

END $$;