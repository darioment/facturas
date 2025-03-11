import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { CFDI, CFDIState } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useCFDIStore = create<CFDIState>((set, get) => ({
  cfdis: [],
  currentCFDI: null,
  loading: false,
  error: null,

  fetchCFDIs: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('cfdis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ cfdis: data as CFDI[], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  getCFDI: async (id) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('cfdis')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentCFDI: data as CFDI, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createCFDI: async (cfdi) => {
    try {
      set({ loading: true, error: null });
      const newCFDI = {
        ...cfdi,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('cfdis')
        .insert([newCFDI]);

      if (error) throw error;
      
      set((state) => ({ 
        cfdis: [newCFDI as CFDI, ...state.cfdis],
        currentCFDI: newCFDI as CFDI,
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateCFDI: async (id, cfdi) => {
    try {
      set({ loading: true, error: null });
      const updatedCFDI = {
        ...cfdi,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('cfdis')
        .update(updatedCFDI)
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({ 
        cfdis: state.cfdis.map(c => c.id === id ? { ...c, ...updatedCFDI } as CFDI : c),
        currentCFDI: state.currentCFDI?.id === id 
          ? { ...state.currentCFDI, ...updatedCFDI } as CFDI 
          : state.currentCFDI,
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteCFDI: async (id) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('cfdis')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({ 
        cfdis: state.cfdis.filter(c => c.id !== id),
        currentCFDI: state.currentCFDI?.id === id ? null : state.currentCFDI,
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  cancelCFDI: async (id) => {
    try {
      set({ loading: true, error: null });
      
      // In a real application, this would involve calling the SAT's web service
      // For this example, we'll just update the status
      const { error } = await supabase
        .from('cfdis')
        .update({ 
          estado: 'cancelado',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({ 
        cfdis: state.cfdis.map(c => c.id === id 
          ? { ...c, estado: 'cancelado', updated_at: new Date().toISOString() } as CFDI 
          : c
        ),
        currentCFDI: state.currentCFDI?.id === id 
          ? { ...state.currentCFDI, estado: 'cancelado', updated_at: new Date().toISOString() } as CFDI 
          : state.currentCFDI,
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearCurrentCFDI: () => {
    set({ currentCFDI: null });
  }
}));