import { useState, useEffect } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { Session, User, SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from "@supabase/supabase-js";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"student" | "teacher" | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Helper to load profile data for a given user
    const fetchProfile = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_completed')
        .eq('id', userId)
        .single();
      setRole(profile?.role ?? 'student');
      setOnboardingCompleted(profile?.onboarding_completed ?? false);
    };

    // Initial fetch
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();

    // Bug fix: also fetch profile on every auth state change so
    // onboardingCompleted / role are always in sync after login
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setRole(null);
        setOnboardingCompleted(false);
      }
      setLoading(false);
      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (credentials: SignUpWithPasswordCredentials, role: "student" | "teacher" = "student") => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        ...credentials,
        options: {
          data: { role }
        }
      });
      if (error) throw error;
      
      // Manual profile check/init if trigger is not ready
      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          role: role,
          updated_at: new Date().toISOString()
        });
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    session,
    user,
    role,
    onboardingCompleted,
    loading,
    isInitialized,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!session,
  };
};

