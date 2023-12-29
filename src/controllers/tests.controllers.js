const Test = require('../models/tests.model');
const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');

async function createTest(req, res, next) {
  req.body.createdBy = req.user._id;
  const test = await Test.create(req.body);
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: test,
    success: true,
    message: 'Test created successfully.',
    res,
  });
}

async function createBulkTest(req, res, next) {
  const tests = await Test.create(req.body.tests);
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: tests,
    success: true,
    message: 'Bulk tests created successfully.',
    res,
  });
}

async function getTests(req, res, next) {
  const searchString = req.query.search || '';
  const searchRegex = new RegExp(searchString, 'i');

  // eslint-disable-next-line no-unused-vars
  const { page, limit, sort, ...filteredQuery } = req.query;
  const totalCount = await Test.countDocuments(filteredQuery);

  let searchCriteria = {};
  if (searchString) {
    searchCriteria = {
      $or: [{ name: searchRegex }, { description: searchRegex }],
    };
  }

  const features = new ApiFeatures(Test.find(Test.find(searchCriteria), req.query, totalCount))
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tests = await features.query.lean();

  const payload = {
    totalCount: features.totalCount,
    totalPages: features.totalPages,
    currentPage: features.currentPage,
    currentCount: tests.length,
    tests,
  };

  sendResponse({
    statusCode: 200,
    status: 'success',
    payload,
    success: true,
    message: 'Get test list successfully.',
    res,
  });
}

async function getTest(req, res, next) {
  const test = await Test.findById(req.params._id);

  if (!test) {
    return next(new AppError('Test not found!', 404));
  }
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: test,
    success: true,
    message: 'Test found',
    res,
  });
}

async function updateTest(req, res, next) {
  const test = await Test.findByIdAndUpdate(req.params._id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!test) {
    return next(new AppError('Test not found!', 404));
  }
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: test,
    success: true,
    message: 'Test updated successfully.',
    res,
  });
}

async function deleteTest(req, res, next) {
  const test = await Test.findByIdAndDelete(req.params._id);

  if (!test) {
    return next(new AppError('Test not found!', 404));
  }

  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: test,
    success: true,
    message: 'Test deleted successfully.',
    res,
  });
}

async function deleteBulkTest(req, res, next) {
  const { deletedCount } = await Test.deleteMany({ _id: { $in: req.body.ids } });

  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: { deletedCount },
    success: true,
    message: 'Bulk test deleted successfully.',
    res,
  });
}

async function getCount(req, res, next) {
  const count = await Test.countDocuments();
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: count,
    success: true,
    message: 'Get test count successful',
    res,
  });
}

module.exports = {
  createTest,
  createBulkTest,
  getTests,
  getTest,
  updateTest,
  deleteTest,
  getCount,
  deleteBulkTest,
};
