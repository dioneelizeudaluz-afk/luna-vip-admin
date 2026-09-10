import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jvbbpfxxqmachbkhozxc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YmJwZnh4cW1hY2hia2hvenhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNTExNjksImV4cCI6MjEwNDYyNzE2OX0.ebegar8LAEheAbx3SxB20c5ErXus4U_eKlXEPbi9UzY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);