
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BotProtectionProps {
  onVerificationChange: (isVerified: boolean) => void;
}

export const BotProtection: React.FC<BotProtectionProps> = ({ onVerificationChange }) => {
  const { toast } = useToast();
  const [honeypotValue, setHoneypotValue] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [mathQuestion, setMathQuestion] = useState({ question: '', answer: 0 });
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Generate a simple math CAPTCHA
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setMathQuestion({
      question: `What is ${num1} + ${num2}?`,
      answer: num1 + num2
    });
  }, []);

  useEffect(() => {
    // Check if bot protection is passed
    const verified = honeypotValue === '' && parseInt(captchaAnswer) === mathQuestion.answer;
    setIsVerified(verified);
    onVerificationChange(verified);

    // Log suspicious activity if honeypot is filled
    if (honeypotValue !== '') {
      logSuspiciousActivity();
    }
  }, [honeypotValue, captchaAnswer, mathQuestion.answer, onVerificationChange]);

  const logSuspiciousActivity = async () => {
    try {
      await supabase.from('honeypot_submissions').insert({
        ip_address: '0.0.0.0', // Would be actual IP in production
        user_agent: navigator.userAgent,
        submission_data: { honeypot_value: honeypotValue }
      });
    } catch (error) {
      console.error('Error logging suspicious activity:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Honeypot field - hidden from users */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <Label htmlFor="website">Website (leave empty)</Label>
        <Input
          id="website"
          name="website"
          value={honeypotValue}
          onChange={(e) => setHoneypotValue(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Math CAPTCHA */}
      <div className="space-y-2">
        <Label htmlFor="captcha">Security Check *</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm">{mathQuestion.question}</span>
          <Input
            id="captcha"
            type="number"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
            className="w-20"
            placeholder="Answer"
            required
            aria-label="Math CAPTCHA answer"
          />
        </div>
        {captchaAnswer && parseInt(captchaAnswer) !== mathQuestion.answer && (
          <p className="text-sm text-red-600" role="alert">
            Incorrect answer. Please try again.
          </p>
        )}
      </div>

      {isVerified && (
        <div className="text-sm text-green-600" role="status" aria-live="polite">
          ✓ Verification complete
        </div>
      )}
    </div>
  );
};
