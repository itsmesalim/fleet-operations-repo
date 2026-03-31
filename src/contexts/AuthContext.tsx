// Authentication context for managing user authentication state
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { useStore } from '../store/useStore';

interface SignUpResult {
  error: Error | null;
  requiresEmailConfirmation?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that wraps the app and provides authentication state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser: setStoreUser } = useStore();

  /**
   * Create a profile on-demand for users who signed up with email confirmation enabled.
   */
  const ensureProfile = async (authUser: User) => {
    const fullName =
      (authUser.user_metadata?.full_name as string | undefined)?.trim() ||
      (authUser.user_metadata?.fullName as string | undefined)?.trim() ||
      authUser.email?.split('@')[0] ||
      'User';

    const role =
      (authUser.user_metadata?.role as string | undefined) || 'Operator';

    const { error } = await supabase.from('profiles').upsert(
      {
        id: authUser.id,
        email: authUser.email || '',
        full_name: fullName,
        role,
      },
      {
        onConflict: 'id',
      }
    );

    if (error) throw error;
  };

  /**
   * Fetch user profile from database
   */
  const fetchProfile = async (authUser: User) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        await ensureProfile(authUser);

        const profileResponse = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        data = profileResponse.data;
        error = profileResponse.error;

        if (error) throw error;
      }

      if (data) {
        setProfile(data);
        setStoreUser(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Use async block to avoid deadlock
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          setProfile(null);
          setStoreUser(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, [setStoreUser]);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  /**
   * Sign up new user and store profile metadata for later bootstrap if email confirmation is enabled.
   */
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: string
  ): Promise<SignUpResult> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedFullName = fullName.trim();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedFullName,
            role,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // If a session already exists, the user is authenticated and we can create the profile now.
      if (authData.session) {
        await ensureProfile(authData.user);
      }

      return {
        error: null,
        requiresEmailConfirmation: !authData.session,
      };
    } catch (error) {
      return { error: error as Error };
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setStoreUser(null);
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
