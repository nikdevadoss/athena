// https://docs.databricks.com/en/dev-tools/auth/oauth-m2m.html
//https://docs.databricks.com/en/dev-tools/nodejs-sql-driver.html

const { DBSQLClient } = require('@databricks/sql');


const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');



router.post('/', async (req, res) => {
  const credentials = req.body;

  // Check if credentials were provided
  if (!credentials) {
    return res.status(400).send('Database credentials are required');
  }

  // Extract necessary info from the parsed credentials
  const { host, path, clientId, clientSecret } = credentials;


  const client = new DBSQLClient();
  const connectOptions = {
    authType:          "databricks-oauth",
    host:              host,
    path:              path,
    oauthClientId:     clientId,
    oauthClientSecret: clientSecret
  };

  console.log(connectOptions)

  var metadata = []

  client.connect(connectOptions)
  .then(async client => {
    const session = await client.openSession();

    const getTableNames = async () => {
        const { rows } = await session.executeStatement(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
        `).fetchAll()
        return rows.map(row => row.table_name)
    }

    const getTableColumns = async (tableName) => {
        const { rows } = await session.executeStatement(`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = $1
        `, [tableName]).fetchAll()
        return rows
    }

    const getTableInfo = async () => {
        const tableNames = await getTableNames()
        const tableInfo = {}
        for (const tableName of tableNames) {
          const columns = await getTableColumns(tableName)
          tableInfo[tableName] = columns
        }
        return tableInfo
    }

    metadata = await getTableInfo()

    await session.close();
    await client.close();
})
.catch((error) => {
  console.log(error);
});
    
  res.json(metadata);
});
module.exports = router;