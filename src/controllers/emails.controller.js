const Email = require('../models/emails.model');
const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');

async function createEmail(req, res, next) {
  const exists = await Email.exists({ email: req.body.email });
  if (exists) {
    return next(new AppError('You have already subscribed', 200));
  }
  const email = await Email.create(req.body);
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: email,
    success: true,
    message: 'You are subscribed!.',
    res,
  });
}

async function createBulkEmail(req, res, next) {
  const emails = await Email.create(req.body.emails);
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: emails,
    success: true,
    message: 'Bulk emails created',
    res,
  });
}

async function getEmails(req, res, next) {
  const search = req.query.search || '';
  const searchRegex = new RegExp(search, 'i');

  const { page, limit, ...filteredQuery } = req.query;
  const totalCount = await Email.countDocuments(filteredQuery);

  const features = new ApiFeatures(
    Email.find({
      $or: [{ email: searchRegex }],
    }),
    req.query,
    totalCount
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const emails = await features.query.lean();

  const payload = {
    totalCount: features.totalCount,
    totalPages: features.totalPages,
    currentPage: features.currentPage,
    emails,
    length: emails.length,
  };

  sendResponse({
    statusCode: 200,
    status: 'success',
    payload,
    success: true,
    message: 'Get email list success',
    res,
  });
}

async function getEmail(req, res, next) {
  const email = await Email.findById(req.params._id);

  if (!email) {
    return next(new AppError('Email not found!', 200));
  }
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: email,
    success: true,
    message: 'Email found',
    res,
  });
}

async function updateEmail(req, res, next) {
  const email = await Email.findByIdAndUpdate(req.params._id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!email) {
    return next(new AppError('Email not found!', 204));
  }
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: email,
    success: true,
    message: 'Email updated successfully.',
    res,
  });
}

async function deleteEmail(req, res, next) {
  const email = await Email.findByIdAndDelete(req.params._id);
  if (!email) {
    return next(new AppError('Email not found!', 404));
  }
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: email,
    success: true,
    message: 'Email deleted successfully.',
    res,
  });
}

async function deleteBulkEmail(req, res, next) {
  const { deletedCount } = await Email.deleteMany({ _id: { $in: req.body.ids } });

  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: { deletedCount },
    success: true,
    message: 'Bulk email deleted successfully.',
    res,
  });
}

async function getCount(req, res, next) {
  const count = await Email.countDocuments();
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: count,
    success: true,
    message: 'Get email count successful',
    res,
  });
}

module.exports = {
  createEmail,
  createBulkEmail,
  getEmails,
  getEmail,
  updateEmail,
  deleteEmail,
  getCount,
  deleteBulkEmail,
};
