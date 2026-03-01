import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, hasSupabaseEnv } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  updateNickname: (nickname: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => { },
  updateNickname: async () => { },
  signUp: async () => { },
  signInWithEmail: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseEnv || !supabase) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, nickname: string) => {
    if (!hasSupabaseEnv || !supabase) return;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: nickname }
      }
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!hasSupabaseEnv || !supabase) return;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  };

  const updateNickname = async (nickname: string) => {
    if (!hasSupabaseEnv || !supabase) return;
    const { error } = await supabase.auth.updateUser({
      data: { full_name: nickname }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!hasSupabaseEnv || !supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, updateNickname, signUp, signInWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
