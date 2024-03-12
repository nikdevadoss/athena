const express = require('express');
const router = express.Router();
app.use(express.json());

// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
const redshift = new AWS.Redshift();

async function fetchMetadata(client) {
  const query = `
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position;
  `;

  const { rows } = await client.query(query);
  const tables = {};

  // Organize columns by table
  rows.forEach(row => {
    if (!tables[row.table_name]) {
      tables[row.table_name] = [];
    }
    tables[row.table_name].push({ columnName: row.column_name, dataType: row.data_type });
  });

  // Format result as an array of JSON objects
  return Object.keys(tables).map(tableName => ({
    tableName,
    tableSchema: tables[tableName]
  }));
}

router.post('/', (req, res) => {
  const { user, host, database, password, port } = req.body;

  try {
    const client = new Client({
      user,
      host,
      database,
      password,
      port: port || 5439, // Default Redshift port is 5439
    });

    await client.connect();

    // Fetch metadata...
    const metadata = await fetchMetadata(client);

    await client.end();

    res.json(metadata);
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
    res.status(500).send('Failed to fetch metadata');
  }

  res.json({   
    metadata: []
  });

});

module.exports = router;


// curl -X POST http://localhost:8080/redshift/connect \
// -H "Content-Type: application/json" \
// -d '{
//   "user": "user",
//   "host": "host",
//   "database": "database",
//   "password": "password",
//   "port": "port"
// }'
