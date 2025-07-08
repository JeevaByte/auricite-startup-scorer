
import { supabase } from '@/integrations/supabase/client';

export interface NotificationPreference {
  id: string;
  notification_type: string;
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  last_sent?: string;
}

export interface QueuedNotification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  data?: any;
  status: 'pending' | 'sent' | 'failed';
  scheduled_for: string;
  sent_at?: string;
}

export const createNotificationPreference = async (
  notificationType: string,
  enabled: boolean = true,
  frequency: 'immediate' | 'daily' | 'weekly' = 'immediate'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        notification_type: notificationType,
        enabled,
        frequency
      }, { onConflict: 'user_id,notification_type' });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error creating notification preference:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const getNotificationPreferences = async (): Promise<NotificationPreference[]> => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return [];
  }
};

export const queueNotification = async (
  notificationType: string,
  title: string,
  message: string,
  data?: any,
  scheduledFor?: Date
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notification_queue')
      .insert({
        notification_type: notificationType,
        title,
        message,
        data,
        scheduled_for: scheduledFor?.toISOString() || new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error queueing notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const getQueuedNotifications = async (): Promise<QueuedNotification[]> => {
  try {
    const { data, error } = await supabase
      .from('notification_queue')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching queued notifications:', error);
    return [];
  }
};

// Auto-notification triggers
export const triggerAssessmentReminder = async (userId: string): Promise<void> => {
  try {
    // Check if user has incomplete assessments
    const { data: drafts } = await supabase
      .from('assessment_drafts')
      .select('*')
      .eq('user_id', userId);

    if (drafts && drafts.length > 0) {
      await queueNotification(
        'assessment_reminder',
        'Complete Your Assessment',
        'You have an incomplete investment readiness assessment. Complete it now to get your score!',
        { draft_count: drafts.length }
      );
    }
  } catch (error) {
    console.error('Error triggering assessment reminder:', error);
  }
};

export const triggerScoreUpdateNotification = async (
  userId: string,
  oldScore: number,
  newScore: number
): Promise<void> => {
  try {
    const scoreDiff = newScore - oldScore;
    const direction = scoreDiff > 0 ? 'increased' : 'decreased';
    
    await queueNotification(
      'score_update',
      'Your Score Has Been Updated',
      `Your investment readiness score has ${direction} by ${Math.abs(scoreDiff)} points to ${newScore}.`,
      { old_score: oldScore, new_score: newScore, difference: scoreDiff }
    );
  } catch (error) {
    console.error('Error triggering score update notification:', error);
  }
};
