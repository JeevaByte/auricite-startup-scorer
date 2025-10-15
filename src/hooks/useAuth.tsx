
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/securityLogger';
import { authRateLimiter } from '@/utils/rateLimiting';
import { validatePassword } from '@/utils/passwordValidation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: 'investor' | 'fund_seeker' | 'free';
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: any }>;
  signUpWithPassword: (email: string, password: string, fullName?: string, role?: string) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  userRole: 'free',
  signOut: async () => {},
  signInWithGoogle: async () => {},
  signInWithPassword: async () => ({ error: null }),
  signUpWithPassword: async () => ({ error: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'investor' | 'fund_seeker' | 'free'>('free');

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Get role from user metadata or database
        if (session?.user) {
          const role = session.user.user_metadata?.role;
          if (role === 'investor' || role === 'fund_seeker') {
            setUserRole(role);
          } else {
            setUserRole('free');
          }
        } else {
          setUserRole('free');
        }
        
        setLoading(false);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          // Successful sign in
          setTimeout(() => {
            logSecurityEvent({
              type: 'AUTH_SUCCESS',
              userId: session.user.id,
              details: 'User signed in successfully',
              timestamp: new Date()
            });
          }, 0);
        }
        
        if (event === 'SIGNED_OUT') {
          // Security: Clear sensitive data on signout
          localStorage.removeItem('assessment_cache');
          sessionStorage.clear();
          
          // Clear any cached user data
          setTimeout(() => {
            if (user) {
              logSecurityEvent({
                type: 'AUTH_SUCCESS',
                userId: user.id,
                details: 'User signed out',
                timestamp: new Date()
              });
            }
          }, 0);
        }
        
        if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Token successfully refreshed
          setTimeout(() => {
            logSecurityEvent({
              type: 'AUTH_SUCCESS',
              userId: session.user.id,
              details: 'Token refreshed successfully',
              timestamp: new Date()
            });
          }, 0);
        }
        
        // Handle authentication errors - check if session is invalid
        if (!session && event === 'SIGNED_OUT') {
          // Check if this was due to token issues
          setTimeout(async () => {
            try {
              const { error } = await supabase.auth.getSession();
              if (error?.message?.includes('refresh_token_not_found') || error?.message?.includes('Invalid Refresh Token')) {
                console.error('Invalid refresh token detected, clearing auth state');
                logSecurityEvent({
                  type: 'AUTH_FAILURE',
                  details: 'Invalid refresh token - user session cleared',
                  timestamp: new Date()
                });
              }
            } catch (err) {
              console.error('Error checking session:', err);
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setTimeout(() => {
          logSecurityEvent({
            type: 'AUTH_FAILURE',
            details: `Error getting session: ${error.message}`,
            timestamp: new Date()
          });
        }, 0);
        
        // If there's an error getting session, clear any corrupted auth data
        setSession(null);
        setUser(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('Existing session found for user:', session.user.id);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) {
        logSecurityEvent({
          type: 'AUTH_FAILURE',
          details: 'Google sign in failed',
          timestamp: new Date()
        });
        throw error;
      }
    } catch (error) {
      logSecurityEvent({
        type: 'AUTH_FAILURE',
        details: 'Google sign in error',
        timestamp: new Date()
      });
      throw error;
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      // Server-side rate limiting check (primary defense)
      const { data: rateLimitCheck, error: rateLimitError } = await supabase
        .rpc('should_block_login', { 
          _email: email,
          _ip_address: null // IP will be captured server-side if needed
        });

      if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError);
      }

      // Type guard for rate limit response
      const rateLimitData = rateLimitCheck as { blocked: boolean; retry_after_seconds?: number; reason?: string; failed_attempts?: number } | null;

      if (rateLimitData?.blocked) {
        const remainingSeconds = rateLimitData.retry_after_seconds || 900;
        const remainingMinutes = Math.ceil(remainingSeconds / 60);
        
        await logSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          userId: undefined,
          details: `Blocked login attempt for ${email}: ${rateLimitData.reason || 'Too many attempts'}`,
          timestamp: new Date(),
        });
        
        return { 
          error: { 
            message: `Account temporarily locked due to too many failed attempts. Please try again in ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}.` 
          } 
        };
      }

      // Attempt sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Record the login attempt (success or failure)
      const { error: recordError } = await supabase
        .rpc('record_login_attempt', {
          _email: email,
          _success: !error,
          _ip_address: null,
          _user_agent: navigator.userAgent
        });

      if (recordError) {
        console.error('Failed to record login attempt:', recordError);
      }

      if (error) {
        await logSecurityEvent({
          type: 'AUTH_FAILURE',
          userId: undefined,
          details: `Failed login attempt for ${email}: ${error.message}`,
          timestamp: new Date(),
        });
        return { error };
      }

      await logSecurityEvent({
        type: 'AUTH_SUCCESS',
        details: `Successful login for ${email}`,
        timestamp: new Date(),
      });

      // Reset client-side rate limiter on successful login
      const rateLimitKey = `login_${email}`;
      authRateLimiter.reset(rateLimitKey);

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      await logSecurityEvent({
        type: 'AUTH_FAILURE',
        details: `Login error for ${email}: ${error.message || 'Unknown error'}`,
        timestamp: new Date()
      });
      return { error };
    }
  };

  const signUpWithPassword = async (email: string, password: string, fullName?: string, role?: string) => {
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { error: { message: passwordValidation.errors[0] } };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName || '',
            role: role || 'fund_seeker',
          }
        }
      });

      if (error) {
        logSecurityEvent({
          type: 'AUTH_FAILURE',
          details: `Sign up failed for ${email}: ${error.message}`,
          timestamp: new Date()
        });
        return { error };
      }

      logSecurityEvent({
        type: 'AUTH_SUCCESS',
        details: `Successful sign up for ${email}`,
        timestamp: new Date()
      });

      return { error: null };
    } catch (error) {
      logSecurityEvent({
        type: 'AUTH_FAILURE',
        details: `Sign up error for ${email}`,
        timestamp: new Date()
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logSecurityEvent({
          type: 'AUTH_FAILURE',
          userId: user?.id,
          details: 'Sign out failed',
          timestamp: new Date()
        });
        throw error;
      }
    } catch (error) {
      logSecurityEvent({
        type: 'AUTH_FAILURE',
        userId: user?.id,
        details: 'Sign out error',
        timestamp: new Date()
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading,
      userRole,
      signOut, 
      signInWithGoogle, 
      signInWithPassword, 
      signUpWithPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
