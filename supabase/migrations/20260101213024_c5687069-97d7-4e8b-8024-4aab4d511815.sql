-- ============================================
-- BULK GENERATION JOBS TABLE
-- Tracks background job status for test generation
-- ============================================
CREATE TABLE public.bulk_generation_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  module TEXT NOT NULL CHECK (module IN ('listening', 'speaking', 'reading', 'writing')),
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 20),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  error_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bulk_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Only admins can manage bulk generation jobs
CREATE POLICY "Admins can manage bulk_generation_jobs"
  ON public.bulk_generation_jobs
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Enable realtime for job status updates
ALTER TABLE public.bulk_generation_jobs REPLICA IDENTITY FULL;

-- ============================================
-- GENERATED TEST AUDIO TABLE
-- Stores generated test content with audio URLs
-- ============================================
CREATE TABLE public.generated_test_audio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.bulk_generation_jobs(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('listening', 'speaking', 'reading', 'writing')),
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  voice_id TEXT, -- e.g., 'en-US-AriaNeural', 'en-GB-RyanNeural'
  accent TEXT, -- 'US', 'GB', 'AU', etc.
  
  -- Content payload (questions, answers, scripts)
  content_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Audio URLs (stored in R2)
  audio_url TEXT,
  audio_duration_seconds INTEGER,
  
  -- For speaking tests: sample answer audio
  sample_audio_url TEXT,
  
  -- For listening tests: transcript
  transcript TEXT,
  
  -- Status and timestamps
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'audio_failed', 'content_only')),
  times_used INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_test_audio ENABLE ROW LEVEL SECURITY;

-- Admins can manage all generated tests
CREATE POLICY "Admins can manage generated_test_audio"
  ON public.generated_test_audio
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Anyone can view published generated tests
CREATE POLICY "Anyone can view published generated_test_audio"
  ON public.generated_test_audio
  FOR SELECT
  USING (is_published = true);

-- Create index for smart rotation queries
CREATE INDEX idx_generated_test_audio_rotation 
  ON public.generated_test_audio(module, topic, is_published, times_used, last_used_at);

-- Create index for accent-based selection
CREATE INDEX idx_generated_test_audio_accent 
  ON public.generated_test_audio(module, accent, is_published);

-- ============================================
-- USER TEST HISTORY TABLE
-- Tracks which tests a user has taken (for LRU rotation)
-- ============================================
CREATE TABLE public.user_test_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_id UUID NOT NULL REFERENCES public.generated_test_audio(id) ON DELETE CASCADE,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, test_id)
);

-- Enable RLS
ALTER TABLE public.user_test_history ENABLE ROW LEVEL SECURITY;

-- Users can manage their own test history
CREATE POLICY "Users can manage their own test_history"
  ON public.user_test_history
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for efficient LRU queries
CREATE INDEX idx_user_test_history_lru 
  ON public.user_test_history(user_id, taken_at DESC);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================
CREATE TRIGGER update_bulk_generation_jobs_updated_at
  BEFORE UPDATE ON public.bulk_generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_test_audio_updated_at
  BEFORE UPDATE ON public.generated_test_audio
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();