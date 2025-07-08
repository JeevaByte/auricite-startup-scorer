
-- Add notification_preferences column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN notification_preferences JSONB DEFAULT '{
  "email_assessments": true,
  "email_recommendations": true,
  "email_updates": false,
  "push_notifications": true,
  "marketing_emails": false
}'::jsonb;
