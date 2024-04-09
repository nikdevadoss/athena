const express = require('express');
const router = express.Router();
const snowflake = require('snowflake-sdk');
const { getCredentialsForUser } = require('../../supabase/client')


// Execute a query
router.post('/', async (req, res) => {
  // Execute query logic here
  const { userId, query } = req.body;
  const credentialsResponse = await getCredentialsForUser(userId, 'SNOWFLAKE');
  const credentialsJson = JSON.parse(credentialsResponse[0]['credentials']);

  const payload = {
    ...credentialsJson, // Spread the credentials object
    query: query // Add the query field
  };
  
  console.log(payload)
  fetch('http://localhost:5000/snowflake/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(queryResponse => {
    console.log(queryResponse)
    res.json(queryResponse)
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    res.status(500).json({error: 'Error fetching data from Python server'});
  });
});

module.exports = router;