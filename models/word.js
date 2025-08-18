const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  class: String,
    category: String,
    identifier: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Word = mongoose.model('Word', wordSchema, 'Words');
module.exports = Word;