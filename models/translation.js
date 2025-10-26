const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  word_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Word', // Reference to the Word model
    required: true
  },
  language: {
    type: String,
    required: true,
    trim: true
  },
  translation: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const Translation = mongoose.model('Translation', translationSchema);
module.exports = Translation;