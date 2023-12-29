const sendResponse = ({ statusCode, status, payload, success, message, res }) =>
  res.status(statusCode).json({ status, payload, success, message });

module.exports = sendResponse;
