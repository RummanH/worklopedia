const Experience = require('../models/experience.model');
const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');

async function createExperience(req, res, next) {
  const experience = await Experience.create(req.body);
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: experience,
    success: true,
    message: 'Experience submitted successfully.',
    res,
  });
}

async function createBulkExperience(req, res, next) {
  const experiences = await Experience.create(req.body.experiences);
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: experiences,
    success: true,
    message: 'Bulk experiences created',
    res,
  });
}

async function getExperiences(req, res, next) {
  const search = req.query.search || '';
  const searchRegex = new RegExp(search, 'i');

  const { page, limit, ...filteredQuery } = req.query;
  const totalCount = await Experience.countDocuments(filteredQuery);

  const features = new ApiFeatures(
    Experience.find({
      $or: [{ experience: searchRegex }],
    }),
    req.query,
    totalCount
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const experiences = await features.query.lean();

  const payload = {
    totalCount: features.totalCount,
    totalPages: features.totalPages,
    currentPage: features.currentPage,
    experiences,
    length: experiences.length,
  };

  sendResponse({
    statusCode: 200,
    status: 'success',
    payload,
    success: true,
    message: 'Get experience list success',
    res,
  });
}

async function getExperience(req, res, next) {
  const experience = await Experience.findById(req.params._id);

  if (!experience) {
    return next(new AppError('Experience not found!', 200));
  }
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: experience,
    success: true,
    message: 'Experience found',
    res,
  });
}

async function updateExperience(req, res, next) {
  const experience = await Experience.findByIdAndUpdate(req.params._id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!experience) {
    return next(new AppError('Experience not found!', 200));
  }
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: experience,
    success: true,
    message: 'Experience updated successfully.',
    res,
  });
}

async function deleteExperience(req, res, next) {
  const experience = await Experience.findByIdAndDelete(req.params._id);
  if (!experience) {
    return next(new AppError('Experience not found!', 200));
  }
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: experience,
    success: true,
    message: 'Experience deleted successfully.',
    res,
  });
}

async function deleteBulkExperience(req, res, next) {
  const { deletedCount } = await Experience.deleteMany({ _id: { $in: req.body.ids } });

  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: { deletedCount },
    success: true,
    message: 'Bulk experience deleted successfully.',
    res,
  });
}

async function getCount(req, res, next) {
  const count = await Experience.countDocuments();
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: count,
    success: true,
    message: 'Get experience count successful',
    res,
  });
}

module.exports = {
  createExperience,
  createBulkExperience,
  getExperiences,
  getExperience,
  updateExperience,
  deleteExperience,
  getCount,
  deleteBulkExperience,
};
