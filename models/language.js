const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
    short_name: String,
    name: {
        type: String,
        required: true,
        trim: true
    },
    native_name: String,
    enabled: Boolean
}, {
    timestamps: true
});

const Language = mongoose.model('Language', languageSchema, 'Languages');
module.exports = Language;