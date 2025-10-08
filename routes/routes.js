const express = require('express');
const router = express.Router();
const Word = require('../models/word'); // Adjust the path to your model
const Translation = require('../models/translation'); // Adjust the path to your model

// Get all items
router.get('/', async (req, res) => {
  try {
    console.log("Get word");
    const words = await Word.find();
    res.json(words);
  } catch (err) {
    res.status(500).json({ message: "Sorry" + err.message });
  }
});

// Add more routes as needed

module.exports = router;