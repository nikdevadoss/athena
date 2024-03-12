const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg')


//TODO: Use supabase URL and Key instead of pooling. We want to be able to access all databases in the user's org
router.post('/', async (req, res) => {
  const credentials = req.body;

  // Check if credentials were provided
  if (!credentials) {
    return res.status(400).send('Database credentials are required');
  }

  // let credentials;
  // try {
  //   // Attempt to parse the JSON string to an object
  //   // credentials = JSON.parse(credentialsString);
  //   credentials = credentialsString
  // } catch (error) {
  //   console.log(error)
  //   return res.status(400).send('Invalid JSON format for credentials');
  // }


  // Extract necessary info from the parsed credentials
  const { host, port, database, user, password } = credentials;

  if (!host || !port || !database || !user || !password) {
    return res.status(400).send('Incomplete database credentials');
  }

  // supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmYXh0ZW1id2Nsb2RqYW1odGhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTA5MTA1NywiZXhwIjoyMDI0NjY3MDU3fQ.t5IaOKHRHzcdxdjBj1nD32XKP1b6Ct_0ayW1CiGms0A'

  // const supabase = createClient(supabaseUrl, supabaseKey)

  // {
  //   "host": "aws-0-us-west-1.pooler.supabase.com",
  //   "port": "5432",
  //   "database": "postgres",
  //   "user": "postgres.ufaxtembwclodjamhthf",
  //   "password": "DH(9x/?BYyeq6R."
  // }
  

  const pool = new Pool({
    host: host,
    port: port,
    database: database,
    user: user,
    password: password,
  })
  


  const getTableNames = async () => {
    const { rows } = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `)
    return rows.map(row => row.table_name)
  }
  
  const getTableColumns = async (tableName) => {
    const { rows } = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = $1
    `, [tableName])
    return rows
  }
  
  const getTableInfo = async () => {
    const tableNames = await getTableNames()
    const tableInfo = {}
    for (const tableName of tableNames) {
      const columns = await getTableColumns(tableName)
      tableInfo[tableName] = columns
    }
    console.log(tableInfo)
    return tableInfo
  }
  
  const metadata = await getTableInfo()
  console.log(metadata)
  
  res.json(metadata);
});
module.exports = router;


/*

curl -X POST http://localhost:8080/supabase/connect \
-H "Content-Type: application/json" \
-d '{
  "supabaseUrl": "https://ufaxtembwclodjamhthf.supabase.co",
  "supabaseKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmYXh0ZW1id2Nsb2RqYW1odGhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTA5MTA1NywiZXhwIjoyMDI0NjY3MDU3fQ.t5IaOKHRHzcdxdjBj1nD32XKP1b6Ct_0ayW1CiGms0A"
}'


*/
/*
COMMANDS TO RUN:

GRANT USAGE ON SCHEMA information_schema TO service_role;

GRANT USAGE ON ALL SCHEMAS IN DATABASE your_database TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated, service_role;

*/
