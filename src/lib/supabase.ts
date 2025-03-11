import { createClient } from '@supabase/supabase-js';

// These would typically come from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://afzcxezdnhcsutjtgqzf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmemN4ZXpkbmhjc3V0anRncXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NTA4NzEsImV4cCI6MjA1NjMyNjg3MX0.nSktJQyhcOEDU9R8xMUs7xpoZqk8V0UTb_avyejSIrc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);