
import { supabase } from '@/integrations/supabase/client';

interface SendReportEmailParams {
  email: string;
  name?: string;
  companyName?: string;
  totalScore: number;
  assessmentId: string;
}

export const sendReportEmail = async (params: SendReportEmailParams): Promise<boolean> => {
  try {
    const reportUrl = `${window.location.origin}/results?id=${params.assessmentId}`;
    
    const { data, error } = await supabase.functions.invoke('send-report-email', {
      body: {
        to: params.email,
        name: params.name,
        companyName: params.companyName,
        totalScore: params.totalScore,
        reportUrl,
        assessmentId: params.assessmentId,
      },
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to send report email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (email: string, name?: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-report-email', {
      body: {
        to: email,
        name,
        totalScore: 0, // This will be a welcome email variant
        reportUrl: `${window.location.origin}/assessment`,
        assessmentId: 'welcome',
      },
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
};
