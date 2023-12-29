const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');

function sendErrorDev(err, res) {
  return sendResponse({
    statusCode: err.statusCode,
    status: err.status,
    payload: null,
    success: false,
    message: err.message,
    res,
  });
}

function sendErrorProd(err, req, res) {
  // operation error that I CREATED
  if (err.isOperational) {
    sendResponse({
      statusCode: err.statusCode,
      status: err.status,
      payload: null,
      success: false,
      message: err.message,
      res,
    });
    return;
  }

  // programming error. don't leak console it
  console.error(err);
  return sendResponse({
    statusCode: 500,
    status: 'error',
    payload: null,
    success: false,
    message: 'Something went wrong',
    res,
  });
}

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 200);
}

function handleDuplicateFieldErrDB(err) {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value ${value}. Please use another value`;
  return new AppError(message, 200);
}

function handleValidationErrorDB(err) {
  const errors = Object.values(err.errors).map((value) => value.message);
  const message = `Invalid data input. ${errors.join('. ')}`;
  return new AppError(message, 200);
}

function handleJWTError() {
  return new AppError('Invalid token. Please log in again!', 401);
}

function handleTokenExpireError() {
  return new AppError('Token expired. Please log in again!', 401);
}

function handleNoDirectoryErr() {
  return new AppError('The directory or file you are trying to access does not exist!', 200);
}

function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldErrDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleTokenExpireError();
    if (err.code === 'ENOENT') err = handleNoDirectoryErr();
    sendErrorProd(err, req, res);
  }
}

module.exports = globalErrorHandler;
