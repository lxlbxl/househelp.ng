'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClientClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events
        if (event === 'SIGNED_IN') {
          // User just signed in
          console.log('User signed in:', session?.user?.email);
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          console.log('User signed out');
          router.push('/');
        } else if (event === 'TOKEN_REFRESHED') {
          // Token was refreshed
          console.log('Token refreshed');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Starting sign out process...');
      
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out from Supabase:', error);
      } else {
        console.log('Successfully signed out from Supabase');
      }
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      // Clear all possible storage items
      if (typeof window !== 'undefined') {
        try {
          // Clear localStorage
          const localKeys = Object.keys(localStorage);
          localKeys.forEach(key => {
            if (key.includes('supabase') || key.includes('sb-') || key.startsWith('supabase.auth.token')) {
              localStorage.removeItem(key);
              console.log('Removed localStorage key:', key);
            }
          });
          
          // Clear sessionStorage
          const sessionKeys = Object.keys(sessionStorage);
          sessionKeys.forEach(key => {
            if (key.includes('supabase') || key.includes('sb-')) {
              sessionStorage.removeItem(key);
              console.log('Removed sessionStorage key:', key);
            }
          });
          
          // Clear any cookies (if any)
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
          
        } catch (storageError) {
          console.error('Error clearing storage:', storageError);
        }
      }
      
      console.log('Logout complete, redirecting...');
      
      // Use router.push instead of window.location for better Next.js handling
      router.push('/');
      
      // Also refresh the page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Error in signOut:', error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setSession(null);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
    } catch (error) {
      console.error('Error in refreshSession:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}