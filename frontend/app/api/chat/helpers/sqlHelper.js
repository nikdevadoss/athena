// sqlHelper.js
// const fetch = require('node-fetch');

async function executeSqlQuery(sqlString) {
  try {
    const response = await fetch('http://localhost:8080/supabase/query', { // Adjust the URL to your actual endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include any authentication headers if needed
      },
      body: JSON.stringify({ query: sqlString }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.text(); // or .json() if your endpoint returns JSON
    console.log('Response from server:', data);
    return data; // or process as needed
  } catch (error) {
    console.error('Failed to execute SQL query:', error);
  }
}

module.exports = { executeSqlQuery };
