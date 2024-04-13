const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg')

const {getMetadataForUser} = require('../../supabase/client')

//TODO: Use supabase URL and Key instead of pooling. We want to be able to access all databases in the user's org
router.post('/', async (req, res) => {
    const userId = req.body.userId;
    const metadata = await getMetadataForUser(userId);
    res.json(metadata);
});
module.exports = router;