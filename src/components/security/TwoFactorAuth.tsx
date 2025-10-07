import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';

export const TwoFactorAuth: React.FC = () => {
  const { user } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    checkTwoFactorStatus();
  }, [user]);

  const checkTwoFactorStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_2fa')
        .select('enabled')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIs2FAEnabled(data?.enabled || false);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const generateSecret = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-2fa', {
        body: { action: 'generate' }
      });

      if (error) throw error;

      setSecret(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      setBackupCodes(data.backupCodes);
      setShowSetup(true);
    } catch (error) {
      toast.error('Failed to generate 2FA secret');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-2fa', {
        body: {
          action: 'enable',
          secret,
          token: verificationCode
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Two-factor authentication enabled successfully');
        setIs2FAEnabled(true);
        setShowSetup(false);
        setVerificationCode('');
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      toast.error('Failed to enable 2FA');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('setup-2fa', {
        body: { action: 'disable' }
      });

      if (error) throw error;

      toast.success('Two-factor authentication disabled');
      setIs2FAEnabled(false);
    } catch (error) {
      toast.error('Failed to disable 2FA');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('Backup codes copied to clipboard');
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <CardTitle>Two-Factor Authentication</CardTitle>
        </div>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {is2FAEnabled ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication is currently enabled on your account.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication is not enabled. Enable it to secure your account.
            </AlertDescription>
          </Alert>
        )}

        {!showSetup && !is2FAEnabled && (
          <Button onClick={generateSecret} disabled={loading}>
            Enable Two-Factor Authentication
          </Button>
        )}

        {showSetup && !is2FAEnabled && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Step 1: Scan QR Code</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCode value={qrCodeUrl} size={200} level="M" title="2FA QR Code" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Or enter this code manually:</h3>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-3 py-2 rounded text-sm flex-1">
                  {secret}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(secret);
                    toast.success('Secret copied');
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Step 2: Verify Code</h3>
              <Label htmlFor="verification-code">Enter 6-digit code from your app</Label>
              <Input
                id="verification-code"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="mt-2"
              />
              <Button 
                onClick={enable2FA} 
                disabled={loading || verificationCode.length !== 6}
                className="mt-4"
              >
                Verify and Enable
              </Button>
            </div>

            {backupCodes.length > 0 && (
              <Alert>
                <AlertDescription>
                  <h3 className="font-medium mb-2">Backup Codes</h3>
                  <p className="text-sm mb-2">
                    Save these backup codes in a safe place. Each code can be used once if you lose access to your authenticator app.
                  </p>
                  <div className="bg-muted p-3 rounded font-mono text-xs space-y-1">
                    {backupCodes.map((code, i) => (
                      <div key={i}>{code}</div>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" onClick={copyBackupCodes} className="mt-2">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Codes
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {is2FAEnabled && (
          <Button variant="destructive" onClick={disable2FA} disabled={loading}>
            Disable Two-Factor Authentication
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
