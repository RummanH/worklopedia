const { Router } = require('express');
const catchAsync = require('../utils/catchAsync');
const {dataScrapper} = require('../controllers/auth.controller')
const router = Router();
router.route('/scrape').post(catchAsync(dataScrapper));
module.exports = router;