const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    enabled: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Class = mongoose.model('Class', classSchema, 'Classes');
module.exports = Class;