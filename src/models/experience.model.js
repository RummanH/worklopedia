const { Schema, model } = require('mongoose');

const experienceSchema = new Schema({
  post: { type: String, required: [true, 'Please provide experience post!'] },
  institution: { type: String, required: [true, 'Please provide experience institution!'] },
  location: { city: String, country: String },
  duration: { from: Date, to: Date },
  isVerified: { type: Boolean, default: false },
  document: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Please provide user id!'] },
});

const Experience = model('Experience', experienceSchema);
module.exports = Experience;
