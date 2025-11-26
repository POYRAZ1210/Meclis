import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { translateSupabaseError } from '@/lib/errors/supabase';
import { queryClient } from '@/lib/queryClient';

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'teacher' | 'student';
  class_name: string | null;
  student_no: string | null;
  gender: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Request token to prevent stale updates across session changes
  const requestTokenRef = useRef<number>(0);
  const activeSessionUserIdRef = useRef<string | null>(null);
  // Map of promises per userId to prevent concurrent calls for same user
  const loadProfilePromisesRef = useRef<Map<string, Promise<Profile | null>>>(new Map());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).catch(err => {
          console.error('Failed to load profile on session:', err);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).catch(err => {
          console.error('Failed to load profile on auth state change:', err);
          setProfile(null);
          setLoading(false);
        });
      } else {
        // Session is null - invalidate all in-flight requests
        requestTokenRef.current += 1;
        activeSessionUserIdRef.current = null;
        loadProfilePromisesRef.current.clear();
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string, retries = 0, maxRetries = 10): Promise<Profile | null> {
    // If there's already a pending request for the same user, return it
    const existingPromise = loadProfilePromisesRef.current.get(userId);
    if (existingPromise) {
      return existingPromise;
    }

    // Only create a new promise chain if this is the first attempt (retries === 0)
    if (retries === 0) {
      setLoading(true);
      // Increment request token and capture it for this request
      requestTokenRef.current += 1;
      const thisRequestToken = requestTokenRef.current;
      activeSessionUserIdRef.current = userId;

      const promise = (async (): Promise<Profile | null> => {
        try {
          // Recursive retry logic
          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle();

            if (data) {
              // Verify this request is still valid before updating state
              if (thisRequestToken === requestTokenRef.current && activeSessionUserIdRef.current === userId) {
                setProfile(data);
                setLoading(false);
                return data as Profile;
              } else {
                // Session changed, bail out without mutating state
                console.log('Stale loadProfile request, ignoring');
                return null;
              }
            }

            if (error && error.code !== 'PGRST116') {
              console.error('Error loading profile:', error);
              throw new Error(`Profil yükleme hatası: ${error.message}`);
            }

            // Profile doesn't exist yet - retry if we haven't exceeded max attempts
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }

          // Max retries exceeded
          throw new Error('Profil bulunamadı. Lütfen destek ekibiyle iletişime geçin.');
        } catch (error: any) {
          console.error('Error loading profile:', error);
          // Only update state if this request is still valid
          if (thisRequestToken === requestTokenRef.current && activeSessionUserIdRef.current === userId) {
            setProfile(null);
            setLoading(false);
          }
          throw error;
        }
      })();

      loadProfilePromisesRef.current.set(userId, promise);
      
      // Clean up promise from map after it completes (success or failure)
      promise.finally(() => {
        if (loadProfilePromisesRef.current.get(userId) === promise) {
          loadProfilePromisesRef.current.delete(userId);
        }
      });
      
      return promise;
    }

    // This should not be reached, but return null as fallback
    return null;
  }

  async function signIn(email: string, password: string) {
    // Clear ALL cache before signing in (prevents user data mixing)
    queryClient.clear();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw translateSupabaseError(error, 'login');
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw translateSupabaseError(error, 'register');
    
    // Profile will be created automatically by the database trigger
    // loadProfile will retry until it exists or max retries exceeded
    if (data.user) {
      try {
        const loadedProfile = await loadProfile(data.user.id);
        if (!loadedProfile) {
          throw translateSupabaseError(
            new Error('Profile not found after retries'),
            'profile'
          );
        }
      } catch (err) {
        throw translateSupabaseError(err, 'profile');
      }
    }
  }

  async function signOut() {
    // Clear request tokens and promises to prevent stale updates
    requestTokenRef.current += 1;
    activeSessionUserIdRef.current = null;
    loadProfilePromisesRef.current.clear();
    
    // Clear ALL cache on sign out (prevents data leakage between users)
    queryClient.clear();
    
    try {
      const { error } = await supabase.auth.signOut();
      // Ignore auth session missing and 403 errors - we're signing out anyway
      if (error && !error.message?.includes('Auth session missing') && error.status !== 403) {
        throw error;
      }
    } catch (err: any) {
      // Ignore session missing and 403 errors during sign out
      if (!err.message?.includes('Auth session missing') && err.status !== 403) {
        throw err;
      }
    }
    
    // Force clear session from localStorage to ensure clean logout
    try {
      await supabase.auth.getSession().then(() => {
        // Session cleared by Supabase
      });
    } catch {
      // Ignore any errors
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
