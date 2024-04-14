const { response } = require('express');
const express = require('express');
require('dotenv').config()

const router = express.Router();
const snowflake = require('snowflake-sdk');

const { insertOrUpdateMetadataInSupabase, insertOrUpdateUserCredentials, isConfigurationConnected} = require('../../supabase/client')


router.post('/', (req, res) => {
  // Extract credentials from the request body
  const {userId, credentials} = req.body;
  
  console.log(`${process.env.FLASK_API}snowflake/connect`);
  // fetch('https://athena-flask-api.azurewebsites.net/snowflake/connect', {
    fetch(`${process.env.FLASK_API}snowflake/connect`, {
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
    console.log(response);
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

router.get('/status/:userId', async (req, res) => {
  var { userId } = req.params;
  datasource = 'SNOWFLAKE';

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