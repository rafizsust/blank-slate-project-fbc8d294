-- Create reading_tests table
CREATE TABLE public.reading_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  book_name TEXT NOT NULL,
  test_number INTEGER NOT NULL,
  time_limit INTEGER NOT NULL DEFAULT 60,
  total_questions INTEGER NOT NULL DEFAULT 40,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reading_passages table
CREATE TABLE public.reading_passages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.reading_tests(id) ON DELETE CASCADE,
  passage_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reading_questions table
CREATE TABLE public.reading_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  passage_id UUID NOT NULL REFERENCES public.reading_passages(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  instruction TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reading_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for reading_tests (public read for published tests)
CREATE POLICY "Anyone can view published reading tests" 
ON public.reading_tests 
FOR SELECT 
USING (is_published = true);

-- Create policies for reading_passages (public read)
CREATE POLICY "Anyone can view passages for published tests" 
ON public.reading_passages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.reading_tests 
    WHERE id = reading_passages.test_id AND is_published = true
  )
);

-- Create policies for reading_questions (public read)
CREATE POLICY "Anyone can view questions for published tests" 
ON public.reading_questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.reading_passages p
    JOIN public.reading_tests t ON t.id = p.test_id
    WHERE p.id = reading_questions.passage_id AND t.is_published = true
  )
);

-- Create trigger for updated_at on reading_tests
CREATE TRIGGER update_reading_tests_updated_at
BEFORE UPDATE ON public.reading_tests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo reading test
INSERT INTO public.reading_tests (id, title, book_name, test_number, time_limit, total_questions)
VALUES ('11111111-1111-1111-1111-111111111111', 'Making Time for Science', 'Cambridge IELTS 18', 1, 60, 40);

-- Insert demo passage
INSERT INTO public.reading_passages (id, test_id, passage_number, title, content)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  1,
  'MAKING TIME FOR SCIENCE',
  'Chronobiology might sound a little futuristic – like something from a science fiction novel, perhaps – but it''s actually a field of study that concerns one of the oldest processes life on this planet has ever known: short-term rhythms of time and their effect on flora and fauna.

This can take many forms. Marine life, for example, is influenced by tidal patterns. Animals tend to be active or inactive depending on the position of the sun or moon. Numerous creatures, humans included, are largely diurnal – that is, they like to come out during the hours of sunlight. Nocturnal animals, such as bats and possums, prefer to forage by night. A third group are known as crepuscular: they thrive in the low-light of dawn and dusk and remain inactive at other hours.

When it comes to humans, chronobiologists are interested in what is known as the circadian rhythm. This is the complete cycle our bodies are naturally geared to undergo within the passage of a twenty-four hour day. Aside from sleeping at night and waking during the day, each cycle involves many other processes such as changes in blood pressure and body temperature. Not everyone has an identical circadian rhythm. ''Night people'', for example, often describe how they find it very hard to operate during the morning, but become alert and productive as the day progresses. This is a tall partly determined by genetics, but usually people can be trained to alter their habits to some extent.

The growing awareness of circadian rhythms has led to new therapies and treatments. These are designed to help people who struggle to sleep at night or stay awake during the day. Light therapy, for example, is sometimes used to help shift workers or people with jet lag adjust to new time zones. Researchers are also investigating whether disruptions to circadian rhythms may contribute to conditions like depression, obesity, and even some forms of cancer.'
);

-- Insert demo questions with various types
-- True/False/Not Given questions (1-7)
INSERT INTO public.reading_questions (passage_id, question_number, question_type, question_text, options, correct_answer, instruction)
VALUES
('22222222-2222-2222-2222-222222222222', 1, 'TRUE_FALSE_NOT_GIVEN', 'Chronobiology is the study of how living things have evolved over time.', '["TRUE", "FALSE", "NOT GIVEN"]', 'FALSE', 'Choose TRUE if the statement agrees with the information given in the text, choose FALSE if the statement contradicts the information, or choose NOT GIVEN if there is no information on this.'),
('22222222-2222-2222-2222-222222222222', 2, 'TRUE_FALSE_NOT_GIVEN', 'The rise and fall of sea levels affects how sea creatures behave.', '["TRUE", "FALSE", "NOT GIVEN"]', 'TRUE', 'Choose TRUE if the statement agrees with the information given in the text, choose FALSE if the statement contradicts the information, or choose NOT GIVEN if there is no information on this.'),
('22222222-2222-2222-2222-222222222222', 3, 'TRUE_FALSE_NOT_GIVEN', 'Most animals are active during the daytime.', '["TRUE", "FALSE", "NOT GIVEN"]', 'NOT GIVEN', 'Choose TRUE if the statement agrees with the information given in the text, choose FALSE if the statement contradicts the information, or choose NOT GIVEN if there is no information on this.'),
('22222222-2222-2222-2222-222222222222', 4, 'TRUE_FALSE_NOT_GIVEN', 'Circadian rhythms identify how we do different things on different days.', '["TRUE", "FALSE", "NOT GIVEN"]', 'FALSE', 'Choose TRUE if the statement agrees with the information given in the text, choose FALSE if the statement contradicts the information, or choose NOT GIVEN if there is no information on this.'),
('22222222-2222-2222-2222-222222222222', 5, 'TRUE_FALSE_NOT_GIVEN', 'A ''night person'' can still have a healthy circadian rhythm.', '["TRUE", "FALSE", "NOT GIVEN"]', 'TRUE', 'Choose TRUE if the statement agrees with the information given in the text, choose FALSE if the statement contradicts the information, or choose NOT GIVEN if there is no information on this.'),
('22222222-2222-2222-2222-222222222222', 6, 'TRUE_FALSE_NOT_GIVEN', 'New therapies can permanently change circadian rhythms.', '["TRUE", "FALSE", "NOT GIVEN"]', 'NOT GIVEN', 'Choose TRUE if the statement agrees with the information given in the text, choose FALSE if the statement contradicts the information, or choose NOT GIVEN if there is no information on this.'),
('22222222-2222-2222-2222-222222222222', 7, 'TRUE_FALSE_NOT_GIVEN', 'Genetics partly determines whether someone is a morning or evening person.', '["TRUE", "FALSE", "NOT GIVEN"]', 'TRUE', 'Choose TRUE if the statement agrees with the information given in the text, choose FALSE if the statement contradicts the information, or choose NOT GIVEN if there is no information on this.');

-- Matching headings questions (8-13)
INSERT INTO public.reading_questions (passage_id, question_number, question_type, question_text, options, correct_answer, instruction)
VALUES
('22222222-2222-2222-2222-222222222222', 8, 'MATCHING_HEADINGS', 'Paragraph 1', '["A. The different types of daily creatures", "B. Introduction to chronobiology", "C. Medical applications of rhythm research", "D. The human body clock", "E. Training the internal clock", "F. Effects on marine animals"]', 'B', 'Choose the correct heading for each paragraph from the list of headings below.'),
('22222222-2222-2222-2222-222222222222', 9, 'MATCHING_HEADINGS', 'Paragraph 2', '["A. The different types of daily creatures", "B. Introduction to chronobiology", "C. Medical applications of rhythm research", "D. The human body clock", "E. Training the internal clock", "F. Effects on marine animals"]', 'A', 'Choose the correct heading for each paragraph from the list of headings below.'),
('22222222-2222-2222-2222-222222222222', 10, 'MATCHING_HEADINGS', 'Paragraph 3', '["A. The different types of daily creatures", "B. Introduction to chronobiology", "C. Medical applications of rhythm research", "D. The human body clock", "E. Training the internal clock", "F. Effects on marine animals"]', 'D', 'Choose the correct heading for each paragraph from the list of headings below.'),
('22222222-2222-2222-2222-222222222222', 11, 'MATCHING_HEADINGS', 'Paragraph 4', '["A. The different types of daily creatures", "B. Introduction to chronobiology", "C. Medical applications of rhythm research", "D. The human body clock", "E. Training the internal clock", "F. Effects on marine animals"]', 'C', 'Choose the correct heading for each paragraph from the list of headings below.');

-- Multiple choice questions (12-13)
INSERT INTO public.reading_questions (passage_id, question_number, question_type, question_text, options, correct_answer, instruction)
VALUES
('22222222-2222-2222-2222-222222222222', 12, 'MULTIPLE_CHOICE', 'What is the main focus of chronobiology?', '["A. The evolution of species over millions of years", "B. Short-term rhythms and their effects on living things", "C. The study of science fiction concepts", "D. How plants grow in different climates"]', 'B', 'Choose the correct letter, A, B, C or D.'),
('22222222-2222-2222-2222-222222222222', 13, 'MULTIPLE_CHOICE', 'According to the passage, what is the circadian rhythm?', '["A. A type of music therapy", "B. A 24-hour cycle that affects human body processes", "C. A method of training athletes", "D. A pattern of ocean tides"]', 'B', 'Choose the correct letter, A, B, C or D.');