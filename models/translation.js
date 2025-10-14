const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
    word_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word' // This creates a reference to the Word model
    },
    language: String,
    translation: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  const Translation = mongoose.model('Translation', translationSchema);
  module.exports = Translation;