const { promisify } = require('util');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const Admin = require('../../models/admins/admin.models');
const ApiFeatures = require('../../utils/ApiFeatures');
const AppError = require('../../utils/AppError');
const sendResponse = require('../../utils/sendResponse');

function generateRandomNumber() {
  return Math.floor(Math.random() * 90000000) + 7000000;
}

function sendCookie(currentToken, res) {
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === 'production',
    // secure: false,
    httpOnly: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  };

  res.cookie('token', currentToken, cookieOptions);
}

module.exports = sendCookie;

async function createAdmin(req, res, next) {
  const admin = await Admin.create(req.body);
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: admin,
    success: true,
    message: 'Admin created successfully.',
    res,
  });
}

async function createBulkAdmin(req, res, next) {
  const admins = await Admin.create(req.body.admins);
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: admins,
    success: true,
    message: 'Bulk admins created successfully.',
    res,
  });
}

async function getAdmins(req, res, next) {
  const searchString = req.query.search || '';
  const searchRegex = new RegExp(searchString, 'i');

  // eslint-disable-next-line no-unused-vars
  const { page, limit, sort, ...filteredQuery } = req.query;
  const totalCount = await Admin.countDocuments(filteredQuery);

  let searchCriteria = {};
  if (searchString) {
    searchCriteria = {
      $or: [{ name: searchRegex }, { description: searchRegex }],
    };
  }

  const features = new ApiFeatures(Admin.find(searchCriteria), req.query, totalCount)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const admins = await features.query.lean();

  const payload = {
    totalCount: features.totalCount,
    totalPages: features.totalPages,
    currentPage: features.currentPage,
    currentCount: admins.length,
    admins,
  };

  sendResponse({
    statusCode: 200,
    status: 'success',
    payload,
    success: true,
    message: 'Get admin list successfully.',
    res,
  });
}

async function getAdmin(req, res, next) {
  const admin = await Admin.findById(req.params._id);

  if (!admin) {
    return next(new AppError('Admin not found!', 404));
  }
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: admin,
    success: true,
    message: 'Admin found',
    res,
  });
}

async function updateAdmin(req, res, next) {
  const admin = await Admin.findByIdAndUpdate(req.params._id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!admin) {
    return next(new AppError('Admin not found!', 404));
  }
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: admin,
    success: true,
    message: 'Admin updated successfully.',
    res,
  });
}

async function deleteAdmin(req, res, next) {
  const admin = await Admin.findByIdAndDelete(req.params._id);

  if (!admin) {
    return next(new AppError('Admin not found!', 404));
  }

  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: admin,
    success: true,
    message: 'Admin deleted successfully.',
    res,
  });
}

async function deleteBulkAdmin(req, res, next) {
  const { deletedCount } = await Admin.deleteMany({ _id: { $in: req.body.ids } });

  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: { deletedCount },
    success: true,
    message: 'Bulk admin deleted successfully.',
    res,
  });
}

async function getCount(req, res, next) {
  const count = await Admin.countDocuments();
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: count,
    success: true,
    message: 'Get admin count successful',
    res,
  });
}

async function httpLoginAdmin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  const admin = await Admin.findOne({ email }).select('+isDeleted');

  if (!admin || !(await admin.correctPassword(password, admin.password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }

  if (admin.isDeleted) {
    return next(
      new AppError('Your have deleted your account. Please contact super admin to recover!', 400)
    );
  }

  // const otpCode = generateRandomNumber();
  const otpCode = '1234';

  // await new Email({
  //   to: admin.email,
  //   adminName,
  //   otpCode,
  //   otpUrl: 'example.com',
  // }).sendTwoFactorOtp();

  admin.otpCode = otpCode;
  admin.otpCodeExpires = Date.now() + 10 * 60 * 1000;
  await admin.save({ validateBeforeSave: false });

  return sendResponse({
    status: 'success',
    statusCode: 200,
    message: 'Two factor code sent successfully',
    payload: null,
    res,
  });
}

async function httpLoginViaOtp(req, res, next) {
  const { otpCode } = req.body;

  if (!otpCode) {
    return next(new AppError('Please provide otp code', 400));
  }

  const admin = await Admin.findOne({
    otpCode: otpCode,
    otpCodeExpires: { $gt: Date.now() },
  });

  if (!admin) {
    return next(new AppError('Otp code is invalid or has expired!', 400));
  }

  admin.otpCode = undefined;
  admin.otpCodeExpires = undefined;
  admin.lastLogin = Date.now() - 3000;
  await admin.save({ validateBeforeSave: false });

  const token = await admin.createJWT();
  sendCookie(token, res);
  admin.password = undefined;
  return sendResponse({
    status: 'success',
    statusCode: 200,
    message: 'Admin LoggedIn successfully.',
    payload: admin,
    res,
  });
}

async function httpProtect(req, res, next) {
  let token;
  if (req.cookies.token) {
    // eslint-disable-next-line prefer-destructuring
    token = req.cookies.token;
  }

  if (token === 'null') {
    token = null;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentAdmin = await Admin.findById(decoded._id).select('+deletedMe');
  if (!currentAdmin) {
    return next(new AppError('The admin belonging to this token does no longer exist.', 401));
  }

  if (currentAdmin.isDeleted) {
    return next(
      new AppError(
        'The admin belonging to this token has deleted his account. Please contact super admin.',
        401
      )
    );
  }

  if (currentAdmin.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Admin recently changed password! Please log in again', 401));
  }

  // 5) Check If admin logged in with multiple devices. It is not for all applications. If need I will use
  // if (currentAdmin.loginAfter(decoded.iat)) {
  //   return next(
  //     new AppError(
  //       'Admin recently logged in with another device. Please login again.',
  //       401
  //     )
  //   );
  // }

  req.admin = currentAdmin;
  next();
}

async function httpGetMe(req, res, next) {
  const admin = await Admin.findById(req.admin._id);

  if (!admin) {
    return next(new AppError('User not found!', 404));
  }

  return sendResponse({
    status: 'success',
    statusCode: 200,
    message: 'Get profile successfully!',
    payload: admin,
    res,
  });
}

function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return next(new AppError('You are not allowed to perform this action', 403));
    }
    next();
  };
}

function logout(req, res) {
  const cookieOptions = {
    httpOnly: process.env.NODE_ENV === 'production',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  };

  res.clearCookie('token', cookieOptions);
  return sendResponse({
    status: 'success',
    statusCode: 200,
    message: 'Cookie cleared!',
    payload: null,
    res,
  });
}

module.exports = {
  httpGetMe,
  createAdmin,
  createBulkAdmin,
  getAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
  getCount,
  deleteBulkAdmin,
  httpLoginAdmin,
  httpLoginViaOtp,
  httpProtect,
  restrictTo,
  logout,
};
