const express = require('express');
const router = express.Router();
const snowflake = require('snowflake-sdk');
// Ensure your Express app uses express.json() middleware to parse JSON bodies
// Example: app.use(express.json());
router.post('/', (req, res) => {
  // Extract credentials from the request body
  credentials = req.body;
  
  fetch('http://localhost:5000/snowflake/connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })
  .then(response => response.json())
  .then(data => {
    res.json(data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    res.status(500).json({error: 'Error fetching data from Python server'});
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
