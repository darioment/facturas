import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { AuthState, User } from '../types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user?.id)
        .single();

      if (userError) throw userError;

      set({ 
        user: userData as User, 
        session: data.session, 
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  register: async (email, password, role = 'user') => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create user profile
      if (data.user && !error) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            { 
              id: data.user.id, 
              email, 
              role 
            },
          ]);

        if (profileError) throw profileError;
      }

      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  resetPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateUser: async (data) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', data.id);
      
      if (error) throw error;
      
      set((state) => ({ 
        user: state.user ? { ...state.user, ...data } : null,
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

// Initialize auth state from session
export const initializeAuth = async () => {
  const { data } = await supabase.auth.getSession();
  
  if (data.session) {
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.session.user.id)
      .single();
    
    useAuthStore.setState({ 
      user: userData as User, 
      session: data.session, 
      loading: false 
    });
  } else {
    useAuthStore.setState({ loading: false });
  }

  // Set up auth state change listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      useAuthStore.setState({ 
        user: userData as User, 
        session, 
        loading: false 
      });
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ 
        user: null, 
        session: null, 
        loading: false 
      });
    }
  });
};
