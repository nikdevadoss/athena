const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

//https://ufaxtembwclodjamhthf.supabase.co
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;

const supabaseUrl = 'https://ufaxtembwclodjamhthf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmYXh0ZW1id2Nsb2RqYW1odGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwOTEwNTcsImV4cCI6MjAyNDY2NzA1N30.cIycdAA2kBYD6nSCj0Dghi-B29aYPPcPVIPgzTkFKsE';

const supabase = createClient(supabaseUrl, supabaseKey);

const insertOrUpdateMetadataInSupabase = async (metadata, userId, datasource) => {
    const serializedMetadata = JSON.stringify(metadata);
  
    // Try to fetch existing row's ID
    const { data: existingData, error: fetchError } = await supabase
      .from('user_metadata')
      .select('id')
      .eq('user_id', userId)
      .eq('datasource', datasource)
      .maybeSingle();
  
    if (fetchError) {
      console.error('Fetch Error:', fetchError);
      return { error: fetchError.message };
    }
  
    if (existingData) {
      // Update existing row
      const { data, error } = await supabase
        .from('user_metadata')
        .update({
          metadata: serializedMetadata
        })
        .match({ id: existingData.id }); // Use match for WHERE clause
  
      if (error) {
        console.error('Update Error:', error);
        return { error: error.message };
      }
      return { data };
    } else {
      // Insert new row
      const { data, error } = await supabase
        .from('user_metadata')
        .insert([{
          user_id: userId,
          metadata: serializedMetadata,
          datasource: datasource
        }]);
  
      if (error) {
        console.error('Insert Error:', error);
        return { error: error.message };
      }
      return { data };
    }
  };

  const getMetadataForUser = async (userId) => {
    const { data: metadata, error: fetchError } = await supabase
      .from('user_metadata')
      .select('datasource, metadata')
      .eq('user_id', userId);

    return metadata
  };

  const insertOrUpdateUserCredentials = async (userId, datasource, credentials) => {
    const serializedCredentials = JSON.stringify(credentials);

    // Try to fetch existing row's ID
    const { data: existingData, error: fetchError } = await supabase
      .from('user_credentials')
      .select('id')
      .eq('user_id', userId)
      .eq('datasource', datasource)
      .maybeSingle();

    if (fetchError) {
      console.error('Fetch Error:', fetchError);
      return { error: fetchError.message };
    }

    if (existingData) {
      // Update existing row
      const { data, error } = await supabase
        .from('user_credentials')
        .update({
          credentials: serializedCredentials
        })
        .match({ id: existingData.id }); // Use match for WHERE clause

      if (error) {
        console.error('Update Error:', error);
        return { error: error.message };
      }
      return { data };
    } else {
      // Insert new row
      const { data, error } = await supabase
        .from('user_credentials')
        .insert([{
          user_id: userId,
          credentials: serializedCredentials,
          datasource: datasource
        }]);

      if (error) {
        console.error('Insert Error:', error);
        return { error: error.message };
      }
      return { data };
    }
  };

  const getCredentialsForUser = async (userId, datasource) => {
    const { data: credentials, error: fetchError } = await supabase
      .from('user_credentials')
      .select('credentials')
      .eq('user_id', userId)
      .eq('datasource', datasource);

    return credentials
  };



  module.exports = { insertOrUpdateMetadataInSupabase, getMetadataForUser , insertOrUpdateUserCredentials, getCredentialsForUser};