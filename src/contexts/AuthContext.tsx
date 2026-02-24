import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, hasSupabaseEnv } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInAnonymously: (nickname?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signInAnonymously: async () => {},
  signOut: async () => {},
  updateNickname: async () => {},
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAnonymously = async (nickname?: string) => {
    if (!hasSupabaseEnv || !supabase) return;
    const { error } = await supabase.auth.signInAnonymously({
        options: {
            data: nickname ? { full_name: nickname } : undefined
        }
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
    <AuthContext.Provider value={{ session, user, loading, signInAnonymously, signOut, updateNickname }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
