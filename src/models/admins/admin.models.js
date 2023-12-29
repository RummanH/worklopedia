const crypto = require('crypto');

const { Schema, model } = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const adminSchema = new Schema(
  {


    email: {
      unique: true,
      type: String,
      required: [true, 'Email is required.'],
      validate: [validator.isEmail, 'Please provide a valid email address.'],
    },
    fullName: { type: String, default: 'Admin' },
    password: { type: String, required:[true, "Password is required."], },
    passwordConfirm: {
      type: String,
      required:[true, "Password confirm is required."],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },

    role: {
      type: String,
      enum: ['admin', 'super-admin'],
      default: 'admin',
    },
    thumbnail: {
      type: String,
      default: 'https://gravatar.com/avatar/3385a4b3c13baa8a700cb41a27ef87c1',
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    otpCode: String,
    otpCodeExpires: Date,
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);


adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});



adminSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 3000;
  next();
});

adminSchema.methods.createJWT = async function () {
  return await jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

adminSchema.methods.correctPassword = async function (candidatePassword, adminPassword) {
  return await bcrypt.compare(candidatePassword, adminPassword);
};

adminSchema.methods.changedPasswordAfter = function (JWTTime) {
  if (this.passwordChangedAt) {
    const changedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTime < changedTime;
  }

  return false;
};

adminSchema.methods.loginAfter = function (JWTTime) {
  if (this.lastLogin) {
    const loginTime = parseInt(this.lastLogin.getTime() / 1000, 10);
    return JWTTime < loginTime;
  }

  return false;
};

adminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(16).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const Admin = model('Admin', adminSchema);
module.exports = Admin;
