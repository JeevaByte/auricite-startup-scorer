
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'fund_seeker' | 'investor'>('fund_seeker');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for redirect back to home if already authenticated
  useEffect(() => {
    if (user && !loading) {
      const returnTo = searchParams.get('returnTo') || '/';
      navigate(returnTo);
    }
  }, [user, loading, navigate, searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Basic validation
      if (!email || !password || !fullName) {
        setError('Please fill in all required fields');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      let data, error;
      try {
        const result = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName.trim(),
              role: role,
            }
          }
        });
        data = result.data;
        error = result.error;
        clearTimeout(timeoutId);
      } catch (networkError: any) {
        clearTimeout(timeoutId);
        console.error('Network error during signup:', networkError);
        if (networkError.name === 'AbortError') {
          setError('Request timed out. Please check your internet connection and try again.');
        } else {
          setError('Network error. Please check your internet connection and try again.');
        }
        return;
      }

      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.');
          setIsSignUp(false);
        } else if (error.message.includes('Invalid email')) {
          setError('Please enter a valid email address');
        } else if (error.message.includes('Password')) {
          setError('Password must be at least 6 characters long');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        toast({
          title: 'Account created successfully!',
          description: data.user.email_confirmed_at 
            ? 'You can now start using the platform.' 
            : 'Please check your email to confirm your account before signing in.',
        });
        
        // If email is already confirmed, redirect to main page
        if (data.user.email_confirmed_at) {
          const returnTo = searchParams.get('returnTo') || '/';
          navigate(returnTo);
        } else {
          // Switch to sign in tab for email confirmation
          setIsSignUp(false);
          setPassword('');
        }
      }
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Basic validation
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Signin error:', error);
        if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else if (error.message.includes('Too many requests')) {
          setError('Too many login attempts. Please wait a few minutes before trying again.');
        } else {
          setError('Unable to sign in. Please check your credentials and try again.');
        }
        return;
      }

      if (data.user) {
        toast({
          title: 'Welcome back!',
          description: 'You have been signed in successfully.',
        });
        
        const returnTo = searchParams.get('returnTo') || '/';
        navigate(returnTo);
      }
    } catch (error: any) {
      console.error('Unexpected signin error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="text-muted-foreground">
            {isSignUp ? 'Create your account to get started' : 'Sign in to your account'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={isSignUp ? 'signup' : 'signin'} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="signin" 
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                  }}
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">I am a *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('fund_seeker')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          role === 'fund_seeker'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">🚀</div>
                          <div className="font-medium">Fund Seeker</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Looking for funding
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('investor')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          role === 'investor'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">💼</div>
                          <div className="font-medium">Investor</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Looking to invest
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {isSignUp && (
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground mt-4">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    onClick={() => {
                      setIsSignUp(false);
                      setError('');
                    }}
                    className="p-0 h-auto"
                  >
                    Sign in
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <div>
                    Don't have an account?{' '}
                    <Button
                      variant="link"
                      onClick={() => {
                        setIsSignUp(true);
                        setError('');
                      }}
                      className="p-0 h-auto"
                    >
                      Sign up
                    </Button>
                  </div>
                  <div>
                    <ForgotPasswordDialog>
                      <Button variant="link" className="p-0 h-auto text-xs">
                        Forgot your password?
                      </Button>
                    </ForgotPasswordDialog>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
