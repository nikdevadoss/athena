const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


// Import routes
const snowflakeConnect = require('./routes/snowflake/connect');
const snowflakeQuery = require('./routes/snowflake/query');

const redshiftConnect = require('./routes/snowflake/connect');
const redshiftQuery = require('./routes/snowflake/query');

const supabaseConnect = require('./routes/supabase/connect');
// const supabaseConnect = require('./routes/supabase/query');

// Use routes
app.use('/snowflake/connect', snowflakeConnect);
app.use('/snowflake/query', snowflakeQuery);

app.use('/redshift/connect', redshiftConnect);
app.use('/redshift/query', redshiftQuery);

app.use('/supabase/connect', supabaseConnect);
