const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
    short_name: String,
    name: String,
    native_name: String,
    enabled: Boolean,
      createdAt: {
    type: Date,
    default: Date.now
  }
})

const Language = mongoose.model('Language', languageSchema, 'Languages');
module.exports = Language;