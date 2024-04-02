// import { RedshiftDataClient, BatchExecuteStatementCommand } from "@aws-sdk/client-redshift-data"; // ES Modules import

const { RedshiftDataClient, BatchExecuteStatementCommand } = require("@aws-sdk/client-redshift-data"); // CommonJS import

const express = require('express');
const router = express.Router();

const config = {
  region: "us-west-2",
  credentials: {
    accessKeyId: "YOUR_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  },
};


const client = new RedshiftDataClient(config);
const input = { // BatchExecuteStatementInput
  Sqls: [ // SqlList // required
    "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position",
  ],
  ClusterIdentifier: "STRING_VALUE",
  SecretArn: "arn:aws:redshift-serverless:us-east-2:533266988677:workgroup/6822e676-51a6-4ede-bdae-84a7b9e13c7e",
  DbUser: "STRING_VALUE",
  Database: "dev", // required
  WithEvent: false,
  StatementName: "STRING_VALUE",
  WorkgroupName: "athena-test",
  ClientToken: "STRING_VALUE",
};

// Load the AWS SDK for Node.js
// var AWS = require("aws-sdk");
// const redshift = new AWS.Redshift();

// var Redshift = require('node-redshift');

// async function fetchMetadata(client) {
//   const query = `
//     SELECT table_name, column_name, data_type 
//     FROM information_schema.columns 
//     WHERE table_schema = 'public' 
//     ORDER BY table_name, ordinal_position;
//   `;

//   const { rows } = await client.query(query);
//   const tables = {};

//   // Organize columns by table
//   rows.forEach(row => {
//     if (!tables[row.table_name]) {
//       tables[row.table_name] = [];
//     }
//     tables[row.table_name].push({ columnName: row.column_name, dataType: row.data_type });
//   });

//   // Format result as an array of JSON objects
//   return Object.keys(tables).map(tableName => ({
//     tableName,
//     tableSchema: tables[tableName]
//   }));
// }

router.post('/', (req, res) => {
  const { user, host, database, password, port } = req.body;

  var client = {
    user: "admin",
    database: database,
    password: "Chinmay123",
    port: 5439,
    host: "athena-test.533266988677.us-east-2.redshift-serverless.amazonaws.com:5439/dev",
  };

  const command = new BatchExecuteStatementCommand(input);
  const response = client.send(command);

  try {
    metadata = response
    // const client = new Client({
    //   user: "admin",
    //   host: "athena-test.533266988677.us-east-2.redshift-serverless.amazonaws.com:5439/dev",
    //   database,
    //   password: "Chinmay123",
    //   port: port || 5439, // Default Redshift port is 5439
    // });


    // "admin, Chinmay123"
    
    // await client.connect();

    // // Fetch metadata...
    // const metadata = await fetchMetadata(client);

    // await client.end();

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
