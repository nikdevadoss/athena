const { Client, Pool } = require('pg');
 
const express = require('express');
require('dotenv').config()

const router = express.Router();
// const { createClient, insertOrUpdateMetadataInSupabase } = require('@supabase/supabase-js');
const { insertOrUpdateMetadataInSupabase, insertOrUpdateUserCredentials, isConfigurationConnected} = require('../../supabase/client')



//TODO: Use supabase URL and Key instead of pooling. We want to be able to access all databases in the user's org
router.post('/', async (req, res) => {
  const {userId, credentials} = req.body;

  // Check if credentials and user_id were provided
  if (!credentials || !userId) {
    return res.status(400).send('Both user ID and database credentials are required');
  }

  // Extract necessary info from the parsed credentials
  const { host, port, database, user, password } = credentials;

  console.log(credentials)

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

  const getTablesWithColumns = async () => {
    const { rows } = await pool.query(`
        SELECT t.table_name, c.column_name, c.data_type
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_schema = 'public'
        ORDER BY t.table_name, c.ordinal_position
    `);
    return rows.reduce((acc, { table_name, column_name, data_type }) => {
        if (!acc[table_name]) {
            acc[table_name] = [];
        }
        acc[table_name].push({ column_name, data_type });
        return acc;
    }, {});
  }

  const metadata = await getTablesWithColumns()

  insertOrUpdateMetadataInSupabase(metadata, userId, "POSTGRES").then(result => {
    if (result.error) {
      console.error(result.error);
    } else {
      console.log('Success:', result.data);
    }
  });

  insertOrUpdateUserCredentials(userId, 'POSTGRES', credentials).then(result => {
    if (result.error) {
      console.error(result.error);
    } else {
      console.log('Success:', result.data);
    }
  });

  res.json(metadata)
});

router.get('/status/:userId', async (req, res) => {
  var { userId } = req.params;
  datasource = 'POSTGRES';

  console.log('REQUEST: ' + userId)

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  console.log("CHECKING STATUS")

  try {
    const isConnected = await isConfigurationConnected(userId, datasource);
    console.log(isConnected)
    if (!isConnected) {
      return res.json({ status: "DISCONNECTED" });
    }
    res.json({ status: "CONNECTED" });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;

