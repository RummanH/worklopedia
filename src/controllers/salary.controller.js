const Salary = require('../models/salary.model');
const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');

async function createSalary(req, res, next) {
  const salary = await Salary.create(req.body);
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: salary,
    success: true,
    message: 'Salary submitted successfully.',
    res,
  });
}

async function createBulkSalary(req, res, next) {
  const salaries = await Salary.create(req.body.salaries);
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: salaries,
    success: true,
    message: 'Bulk salaries created',
    res,
  });
}

async function getSalaries(req, res, next) {
  const search = req.query.search || '';
  const searchRegex = new RegExp(search, 'i');

  const { page, limit, ...filteredQuery } = req.query;
  const totalCount = await Salary.countDocuments(filteredQuery);

  const features = new ApiFeatures(
    Salary.find({
      $or: [{ comment: searchRegex }],
    }),
    req.query,
    totalCount
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const salaries = await features.query.lean();

  const payload = {
    totalCount: features.totalCount,
    totalPages: features.totalPages,
    currentPage: features.currentPage,
    salaries,
    length: salaries.length,
  };

  sendResponse({
    statusCode: 200,
    status: 'success',
    payload,
    success: true,
    message: 'Get salary list success',
    res,
  });
}

async function getSalary(req, res, next) {
  const salary = await Salary.findById(req.params._id);

  if (!salary) {
    return next(new AppError('Salary not found!', 200));
  }
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: salary,
    success: true,
    message: 'Salary found',
    res,
  });
}

async function updateSalary(req, res, next) {
  const salary = await Salary.findByIdAndUpdate(req.params._id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!salary) {
    return next(new AppError('Salary not found!', 200));
  }
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: salary,
    success: true,
    message: 'Salary updated successfully.',
    res,
  });
}

async function deleteSalary(req, res, next) {
  const salary = await Salary.findByIdAndDelete(req.params._id);
  if (!salary) {
    return next(new AppError('Salary not found!', 200));
  }
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: salary,
    success: true,
    message: 'Salary deleted successfully.',
    res,
  });
}

async function deleteBulkSalary(req, res, next) {
  const { deletedCount } = await Salary.deleteMany({ _id: { $in: req.body.ids } });

  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: { deletedCount },
    success: true,
    message: 'Bulk salary deleted successfully.',
    res,
  });
}

async function getCount(req, res, next) {
  const count = await Salary.countDocuments();
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: count,
    success: true,
    message: 'Get salary count successful',
    res,
  });
}

module.exports = {
  createSalary,
  createBulkSalary,
  getSalaries,
  getSalary,
  updateSalary,
  deleteSalary,
  getCount,
  deleteBulkSalary,
};
