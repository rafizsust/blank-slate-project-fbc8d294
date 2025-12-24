import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AccessStatus {
  canSubmit: boolean;
  isSubscribed: boolean;
  isPromotionActive: boolean;
  loading: boolean;
}

export const useAccessControl = (): AccessStatus => {
  const { user, loading: authLoading } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPromotionActive, setIsPromotionActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;
      
      setLoading(true);
      
      try {
        // Check if promotion is active (public query)
        const { data: promotions } = await supabase
          .from('promotions')
          .select('id')
          .limit(1);
        
        setIsPromotionActive(!!(promotions && promotions.length > 0));

        // Check subscription if user is logged in
        if (user) {
          const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('id, status, end_date')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .gte('end_date', new Date().toISOString())
            .limit(1);
          
          setIsSubscribed(!!(subscriptions && subscriptions.length > 0));
        } else {
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, authLoading]);

  // User can submit if logged in AND (subscribed OR promotion active)
  const canSubmit = !!user && (isSubscribed || isPromotionActive);

  return {
    canSubmit,
    isSubscribed,
    isPromotionActive,
    loading: loading || authLoading
  };
};
