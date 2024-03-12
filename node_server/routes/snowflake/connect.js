const express = require('express');
const router = express.Router();
const snowflake = require('snowflake-sdk');
// Ensure your Express app uses express.json() middleware to parse JSON bodies
// Example: app.use(express.json());

router.post('/', (req, res) => {
  // Extract credentials from the request body
  const { account, username, password, application } = req.body;

  // Configure and connect to Snowflake with the provided credentials
  var connection = snowflake.createConnection({
    account,
    username,
    password,
    application
  });

  console.log('Successfully connected to Snowflake.');

  connection.connect((err, conn) => {
    if (err) {
      console.error('Unable to connect: ', err.message);
      return res.status(500).send('Failed to connect to Snowflake.');
    } 
    console.log('Successfully connected to Snowflake.');
    // Example query to fetch the current version
    connection.execute({
      sqlText: 'SELECT CURRENT_VERSION();',
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Failed to execute statement: ', err.message);
          return res.status(500).send('Failed to execute query.');
        }
        console.log('Query executed successfully, rows:', rows);
        res.send('Connected to Snowflake and query executed');
      }
    });
  });

  res.json({   
    metadata: []
  });

});

module.exports = router;


// curl -X POST http://localhost:8080/snowflake/connect \
// -H "Content-Type: application/json" \
// -d '{
//   "account": "your_account",
//   "username": "your_username",
//   "password": "your_password",
//   "application": "your_application"
// }'
