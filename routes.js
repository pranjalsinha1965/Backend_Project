const express = require('express');

const router = express.Router();

// Endpoint: Welcome message
router.get('/getAll', (req, res) => {
    res.send('Getting all the data')
  });

  module.exports = router;

  