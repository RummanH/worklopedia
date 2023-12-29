const { Router } = require('express');
const catchAsync = require('../utils/catchAsync');

const { saveFile, uploadFile } = require('../controllers/uploads.controller');

const router = Router();

router.route('/upload-file').post(uploadFile, catchAsync(saveFile));

module.exports = router;
