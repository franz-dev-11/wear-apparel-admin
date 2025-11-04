import { createClient } from "@supabase/supabase-js";

// Supabase Connection Details from .env
// Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in your .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the Supabase client for all front-end use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
