const { Client, Pool } = require('pg');
 
const express = require('express');
require('dotenv').config()

const router = express.Router();

const { getCredentialsForUser} = require('../../supabase/client')


router.post('/', async (req, res) => {
  const {userId, query} = req.body;


  const credentials = await getCredentialsForUser(userId, 'POSTGRES')
  const credentialsJson = JSON.parse(credentials[0]['credentials']);
  console.log(credentialsJson)
  // Extract necessary info from the parsed credentials
  const { host, port, database, user, password } = credentialsJson;

  console.log(query)


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

  try {
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    res.json(error);
  }

});
module.exports = router;