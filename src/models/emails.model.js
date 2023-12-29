const { Schema, model } = require('mongoose');
const validator = require('validator');

const emailSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Please provide your email.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address.'],
  },
});

const Email = model('Email', emailSchema);
module.exports = Email;
