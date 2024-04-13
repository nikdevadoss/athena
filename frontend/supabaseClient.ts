// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.SUPABASE_URL;
const supabaseUrl = "https://ufaxtembwclodjamhthf.supabase.co"
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmYXh0ZW1id2Nsb2RqYW1odGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwOTEwNTcsImV4cCI6MjAyNDY2NzA1N30.cIycdAA2kBYD6nSCj0Dghi-B29aYPPcPVIPgzTkFKsE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);