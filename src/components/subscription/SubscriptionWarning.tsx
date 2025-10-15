import React, { useEffect, useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';

export const SubscriptionWarning: React.FC = () => {
  const { subscription, hasPremiumAccess } = useSubscription();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!subscription || !subscription.current_period_end) return;

    const endDate = new Date(subscription.current_period_end);
    const today = new Date();
    const days = differenceInDays(endDate, today);

    setDaysRemaining(days);

    // Show warning 2 days before expiry or if already expired
    if (days <= 2 && days >= -1) {
      setShowWarning(true);
    }
  }, [subscription]);

  if (!showWarning || !daysRemaining) return null;

  const isExpired = daysRemaining < 0;
  const title = isExpired 
    ? 'Your Subscription Has Expired' 
    : `Subscription Expiring in ${daysRemaining} Day${daysRemaining === 1 ? '' : 's'}`;
  
  const description = isExpired
    ? 'Your premium features have been disabled. Renew your subscription to regain access to all premium features.'
    : `Your subscription will expire soon. Renew now to continue enjoying premium features without interruption.`;

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setShowWarning(false)}>
            Dismiss
          </AlertDialogAction>
          <Button onClick={() => {
            setShowWarning(false);
            navigate('/pricing');
          }}>
            Renew Subscription
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
