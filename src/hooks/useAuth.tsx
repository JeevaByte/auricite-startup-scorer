
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/securityLogger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  signInWithGoogle: async () => {},
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
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Log security events
        if (event === 'SIGNED_IN' && session?.user) {
          logSecurityEvent({
            type: 'AUTH_FAILURE',
            userId: session.user.id,
            details: 'User signed in successfully',
            timestamp: new Date()
          });
        }
        
        if (event === 'SIGNED_OUT') {
          // Security: Clear sensitive data on signout
          localStorage.removeItem('assessment_cache');
          sessionStorage.clear();
          
          // Clear any cached user data
          if (user) {
            logSecurityEvent({
              type: 'AUTH_FAILURE',
              userId: user.id,
              details: 'User signed out',
              timestamp: new Date()
            });
          }
        }
        
        if (event === 'TOKEN_REFRESHED') {
          logSecurityEvent({
            type: 'AUTH_FAILURE',
            userId: session?.user?.id,
            details: 'Token refreshed',
            timestamp: new Date()
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logSecurityEvent({
          type: 'AUTH_FAILURE',
          details: 'Error getting session',
          timestamp: new Date()
        });
      }
      setSession(session);
      setUser(session?.user ?? null);
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
    <AuthContext.Provider value={{ user, session, loading, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
