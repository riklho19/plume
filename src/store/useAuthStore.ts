import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { DbProfile } from '../types/database';

interface AuthState {
  user: User | null;
  profile: DbProfile | null;
  loading: boolean;
  initialized: boolean;
  passwordRecovery: boolean;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<DbProfile, 'display_name' | 'avatar_url' | 'preferred_font'>>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  passwordRecovery: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user });
        await get().fetchProfile(session.user.id);
      }
    } finally {
      set({ loading: false, initialized: true });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        set({ passwordRecovery: true });
      }
      if (session?.user) {
        set({ user: session.user });
        await get().fetchProfile(session.user.id);
      } else {
        set({ user: null, profile: null });
      }
    });
  },

  signUp: async (email, password, displayName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) return { error: error.message };
    return { error: null };
  },

  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    set({ passwordRecovery: false });
    return { error: null };
  },

  fetchProfile: async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) {
      set({ profile: data as DbProfile });
    }
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (data) {
      set({ profile: data as DbProfile });
    }
  },
}));
