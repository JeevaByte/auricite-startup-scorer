import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validatePassword } from '@/utils/passwordValidation';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { sanitizeText, sanitizeEmail, validateEmail } from '@/utils/inputSanitization';
import { authRateLimiter } from '@/utils/rateLimiting';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const passwordValidation = validatePassword(password);

  const handleSocialSignIn = async (provider: 'google' | 'github' | 'linkedin_oidc' | 'twitter' | 'facebook') => {
    setSocialLoading(provider);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) throw error;

      toast({
        title: 'Redirecting...',
        description: `Connecting with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
      });
    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
      toast({
        title: 'Error',
        description: error.message || `An error occurred with ${provider} authentication`,
        variant: 'destructive',
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedFullName = sanitizeText(fullName);
      const sanitizedCompanyName = sanitizeText(companyName);

      if (!validateEmail(sanitizedEmail)) {
        throw new Error('Please enter a valid email address');
      }

      if (!passwordValidation.isValid) {
        throw new Error('Please ensure your password meets all requirements');
      }

      const clientIP = 'signup-' + sanitizedEmail;
      if (authRateLimiter.isRateLimited(clientIP)) {
        const remainingTime = authRateLimiter.getRemainingTime(clientIP);
        throw new Error(`Too many signup attempts. Please try again in ${remainingTime} seconds.`);
      }

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: sanitizedFullName,
            company_name: sanitizedCompanyName,
            email: sanitizedEmail,
          },
        },
      });

      if (error) throw error;

      if (data.user && data.user.email_confirmed_at) {
        await createUserProfile(data.user.id, sanitizedFullName, sanitizedCompanyName, sanitizedEmail);
      }

      toast({
        title: 'Account created successfully!',
        description: data.user?.email_confirmed_at 
          ? 'You can now start using the platform.' 
          : 'Please check your email to confirm your account.',
      });
      
      onClose();
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during signup',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string, fullName: string, companyName: string, email: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName,
          company_name: companyName,
          email: email,
        });

      if (error) {
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sanitizedEmail = sanitizeEmail(email);

      if (!validateEmail(sanitizedEmail)) {
        throw new Error('Please enter a valid email address');
      }

      const clientIP = 'signin-' + sanitizedEmail;
      if (authRateLimiter.isRateLimited(clientIP)) {
        const remainingTime = authRateLimiter.getRemainingTime(clientIP);
        throw new Error(`Too many login attempts. Please try again in ${remainingTime} seconds.`);
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw error;
      }

      authRateLimiter.reset('signin-' + sanitizedEmail);

      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      onClose();
    } catch (error: any) {
      console.error('Signin error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during signin',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const SocialButton = ({ provider, icon, label }: { provider: string, icon: string, label: string }) => (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => handleSocialSignIn(provider as any)}
      disabled={socialLoading === provider}
    >
      <span className="mr-2">{icon}</span>
      {socialLoading === provider ? 'Connecting...' : `Continue with ${label}`}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Auricite InvestX</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-2">
              <SocialButton provider="google" icon="🔍" label="Google" />
              <SocialButton provider="github" icon="⚡" label="GitHub" />
              <SocialButton provider="linkedin_oidc" icon="💼" label="LinkedIn" />
              <SocialButton provider="twitter" icon="🐦" label="Twitter" />
              <SocialButton provider="facebook" icon="📘" label="Facebook" />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={254}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <SocialButton provider="google" icon="🔍" label="Google" />
              <SocialButton provider="github" icon="⚡" label="GitHub" />
              <SocialButton provider="linkedin_oidc" icon="💼" label="LinkedIn" />
              <SocialButton provider="twitter" icon="🐦" label="Twitter" />
              <SocialButton provider="facebook" icon="📘" label="Facebook" />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or create account with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="companyName">Company Name (Optional)</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="signupEmail">Email</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={254}
                />
              </div>
              <div>
                <Label htmlFor="signupPassword">Password</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={128}
                />
                <PasswordStrengthIndicator validation={passwordValidation} password={password} />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !passwordValidation.isValid}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
