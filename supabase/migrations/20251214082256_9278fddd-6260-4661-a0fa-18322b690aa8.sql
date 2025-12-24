-- Create reading test submissions table
CREATE TABLE public.reading_test_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_id UUID NOT NULL REFERENCES public.reading_tests(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 40,
  band_score NUMERIC,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create listening test submissions table
CREATE TABLE public.listening_test_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_id UUID NOT NULL REFERENCES public.listening_tests(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 40,
  band_score NUMERIC,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcard decks table
CREATE TABLE public.flashcard_decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcard cards table
CREATE TABLE public.flashcard_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  translation TEXT,
  status TEXT NOT NULL DEFAULT 'learning' CHECK (status IN ('learning', 'reviewing', 'mastered')),
  review_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  next_review_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user analytics table
CREATE TABLE public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('reading', 'listening', 'writing', 'speaking')),
  analysis_data JSONB NOT NULL DEFAULT '{}',
  tests_analyzed INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_type)
);

-- Enable RLS on all tables
ALTER TABLE public.reading_test_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_test_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for reading_test_submissions
CREATE POLICY "Users can insert their own reading submissions"
ON public.reading_test_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reading submissions"
ON public.reading_test_submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view top scores for reading"
ON public.reading_test_submissions FOR SELECT
USING (true);

-- RLS policies for listening_test_submissions
CREATE POLICY "Users can insert their own listening submissions"
ON public.listening_test_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own listening submissions"
ON public.listening_test_submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view top scores for listening"
ON public.listening_test_submissions FOR SELECT
USING (true);

-- RLS policies for flashcard_decks
CREATE POLICY "Users can manage their own flashcard decks"
ON public.flashcard_decks FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for flashcard_cards
CREATE POLICY "Users can manage their own flashcard cards"
ON public.flashcard_cards FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_analytics
CREATE POLICY "Users can manage their own analytics"
ON public.user_analytics FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_reading_submissions_test_score ON public.reading_test_submissions(test_id, score DESC);
CREATE INDEX idx_listening_submissions_test_score ON public.listening_test_submissions(test_id, score DESC);
CREATE INDEX idx_flashcard_cards_deck ON public.flashcard_cards(deck_id);
CREATE INDEX idx_flashcard_cards_status ON public.flashcard_cards(user_id, status);
CREATE INDEX idx_user_analytics_module ON public.user_analytics(user_id, module_type);

-- Add trigger for updated_at on flashcard tables
CREATE TRIGGER update_flashcard_decks_updated_at
BEFORE UPDATE ON public.flashcard_decks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcard_cards_updated_at
BEFORE UPDATE ON public.flashcard_cards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();