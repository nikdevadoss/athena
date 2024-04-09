const { Client, Pool } = require('pg');
 

const express = require('express');
const router = express.Router();
// const { createClient, insertOrUpdateMetadataInSupabase } = require('@supabase/supabase-js');
const { getCredentialsForUser} = require('../../supabase/client')



//TODO: Use supabase URL and Key instead of pooling. We want to be able to access all databases in the user's org
router.post('/', async (req, res) => {
  const {userId, query} = req.body;

  const credentials = await getCredentialsForUser(userId, 'POSTGRES')
  const credentialsJson = JSON.parse(credentials[0]['credentials']);
  console.log(credentialsJson)
  // Extract necessary info from the parsed credentials
  const { host, port, database, user, password } = credentialsJson;


  if (!host || !port || !database || !user || !password) {
    return res.status(400).send('Incomplete database credentials');
  }
  const pool = new Pool({
    host: host,
    port: port,
    database: database,
    user: user,
    password: password,
  })

  const { rows } = await pool.query(query);

  console.log(rows)
  res.json(rows)
});
module.exports = router;