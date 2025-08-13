
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
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: any }>;
  signUpWithPassword: (email: string, password: string, fullName?: string) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
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
    const rateLimitKey = `login_${email}`;
    
    // Check rate limit
    if (authRateLimiter.isRateLimited(rateLimitKey)) {
      const remainingTime = authRateLimiter.getRemainingTime(rateLimitKey);
      logSecurityEvent({
        type: 'AUTH_FAILURE',
        details: `Login rate limited for ${email}. ${remainingTime}s remaining.`,
        timestamp: new Date()
      });
      return { error: { message: `Too many login attempts. Try again in ${remainingTime} seconds.` } };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logSecurityEvent({
          type: 'AUTH_FAILURE',
          details: `Login failed for ${email}: ${error.message}`,
          timestamp: new Date()
        });
        return { error };
      }

      logSecurityEvent({
        type: 'AUTH_SUCCESS',
        details: `Successful login for ${email}`,
        timestamp: new Date()
      });

      return { error: null };
    } catch (error) {
      logSecurityEvent({
        type: 'AUTH_FAILURE',
        details: `Login error for ${email}`,
        timestamp: new Date()
      });
      return { error };
    }
  };

  const signUpWithPassword = async (email: string, password: string, fullName?: string) => {
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
      signOut, 
      signInWithGoogle, 
      signInWithPassword, 
      signUpWithPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
