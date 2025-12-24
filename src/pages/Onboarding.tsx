import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { TermsAndConditions } from '@/components/auth/TermsAndConditions';
import { GeminiApiKeyOnboarding } from '@/components/auth/GeminiApiKeyOnboarding';
import { Loader2 } from 'lucide-react';

type OnboardingStep = 'loading' | 'terms' | 'api-key' | 'complete';

const TERMS_ACCEPTED_KEY = 'ieltsai_terms_accepted';
const ONBOARDING_COMPLETE_KEY = 'ieltsai_onboarding_complete';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('loading');
  const [, setHasGeminiKey] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Check if terms are accepted
      const termsAccepted = localStorage.getItem(TERMS_ACCEPTED_KEY) === 'true';
      
      if (!termsAccepted) {
        setStep('terms');
        return;
      }

      // If user is logged in, check for Gemini API key
      if (user) {
        try {
          const { data } = await supabase
            .from('user_secrets')
            .select('id')
            .eq('user_id', user.id)
            .eq('secret_name', 'GEMINI_API_KEY')
            .maybeSingle();
          
          if (data) {
            setHasGeminiKey(true);
            // User has API key, onboarding complete
            localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
            navigate('/');
            return;
          }
        } catch (error) {
          console.error('Error checking API key:', error);
        }

        // Check if onboarding was already completed (user skipped API key)
        const onboardingComplete = localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
        if (onboardingComplete) {
          navigate('/');
          return;
        }

        // User logged in but no API key
        setStep('api-key');
      } else if (!authLoading) {
        // Terms accepted but not logged in - go to auth
        navigate('/auth');
      }
    };

    if (!authLoading) {
      checkOnboardingStatus();
    }
  }, [user, authLoading, navigate]);

  const handleTermsAccept = () => {
    localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
    if (user) {
      setStep('api-key');
    } else {
      navigate('/auth');
    }
  };

  const handleTermsReject = () => {
    // Redirect to landing page or show a message
    navigate('/');
  };

  const handleApiKeyComplete = () => {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    navigate('/');
  };

  const handleApiKeySkip = () => {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    navigate('/');
  };

  if (step === 'loading' || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (step === 'terms') {
    return (
      <TermsAndConditions
        onAccept={handleTermsAccept}
        onReject={handleTermsReject}
      />
    );
  }

  if (step === 'api-key') {
    return (
      <GeminiApiKeyOnboarding
        onComplete={handleApiKeyComplete}
        onSkip={handleApiKeySkip}
      />
    );
  }

  return null;
}
