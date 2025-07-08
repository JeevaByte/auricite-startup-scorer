
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { scheduleNotification } from '@/utils/notificationService';

export const NotificationService: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkForNotifications = async () => {
      // Check for assessment completion reminders
      const lastAssessmentDate = localStorage.getItem(`lastAssessment_${user.id}`);
      if (lastAssessmentDate) {
        const daysSinceAssessment = Math.floor(
          (Date.now() - parseInt(lastAssessmentDate)) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceAssessment >= 30) {
          await scheduleNotification(
            user.id,
            'assessment_reminder',
            'Time for a New Assessment',
            'It\'s been 30 days since your last assessment. Consider taking a new one to track your progress.',
            { lastAssessment: lastAssessmentDate }
          );
        }
      }

      // Check for score improvement opportunities
      const lastScore = localStorage.getItem(`lastScore_${user.id}`);
      if (lastScore && parseInt(lastScore) < 600) {
        await scheduleNotification(
          user.id,
          'score_improvement',
          'Improve Your Score',
          'Your last assessment score was below 600. Here are some recommendations to improve your startup readiness.',
          { lastScore: parseInt(lastScore) }
        );
      }
    };

    // Check immediately and then every hour
    checkForNotifications();
    const interval = setInterval(checkForNotifications, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  return null; // This is a service component, no UI
};
