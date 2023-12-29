const { Schema, model } = require('mongoose');

const testSchema = new Schema(
  {
    name: { type: String, required: [true, 'Please provide name!'] },
    description: { type: String, required: [true, 'Please provide description!'] },
    createdBy: { type: Schema.ObjectId },
  },
  { timestamps: true }
);

const Test = model('Test', testSchema);
module.exports = Test;
