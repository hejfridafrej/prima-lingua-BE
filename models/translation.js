const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  word_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Word',
    required: true
  },
  language: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
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

const Translation = mongoose.model('Translation', translationSchema, 'Translations');
module.exports = Translation;