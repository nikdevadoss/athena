const express = require('express');
const router = express.Router();
const snowflake = require('snowflake-sdk');
const { insertOrUpdateMetadataInSupabase, insertOrUpdateUserCredentials } = require('../../supabase/client')


router.post('/', (req, res) => {
  // Extract credentials from the request body
  const {userId, credentials} = req.body;
  
  // fetch('https://athena-flask-api.azurewebsites.net/snowflake/connect', {
    fetch('http://localhost:5000/snowflake/connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...credentials, // Spread the credentials object
      userId, // Include the userId in the payload
    })
  })
  .then(response => response.json())
  .then(metadata => {
    insertOrUpdateMetadataInSupabase(metadata, userId, "SNOWFLAKE").then(result => {
      if (result.error) {
        console.error(result.error);
      } else {
        console.log('Success:', result.data);
      }
    });
    insertOrUpdateUserCredentials(userId, 'SNOWFLAKE', credentials).then(result => {
      if (result.error) {
        console.error(result.error);
      } else {
        console.log('Success:', result.data);
      }
    });
    res.json(metadata)
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    res.status(500).json({error: 'Error fetching data from Python server'});
  });
  


   
});

module.exports = router;