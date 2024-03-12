const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

//https://ufaxtembwclodjamhthf.supabase.co
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;