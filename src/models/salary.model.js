const { Schema, model } = require('mongoose');

const salarySchema = new Schema({
  experienceId: {
    type: Schema.Types.ObjectId,
    ref: 'Experience',
    required: [true, 'Please provide experience id'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user id'],
  },
  salaryBreakdown: {
    base: { type: Number, required: [true, 'Please provide base salary'] },
    relocation: { type: Number, required: [true, 'Please provide relocation salary'] },
    signOnBonus: { type: Number, required: [true, 'Please provide sign on bonus'] },
    stockAward: String,
    levelAtCompany: { type: String, required: [true, 'Please provide level at company'] },
    race: { type: String, required: [true, 'Please provide race'] },
    education: { type: String, required: [true, 'Please provide education'] },
    gender: { type: String, required: [true, 'Please provide gender'] },
  },
  document: { type: String },
  comment: { type: String },
});

const Salary = model('Salary', salarySchema);
module.exports = Salary;
