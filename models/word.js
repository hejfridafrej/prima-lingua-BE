const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  identifier: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const Word = mongoose.model('Word', wordSchema, "Words");
module.exports = Word;