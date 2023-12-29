const { Router } = require('express');
const catchAsync = require('../utils/catchAsync');

const {
  createEmail,
  getEmail,
  updateEmail,
  deleteEmail,
  getEmails,
  getCount,
  createBulkEmail,
  deleteBulkEmail,
} = require('../controllers/emails.controller');

const router = Router();

router.route('/count').get(catchAsync(getCount));
router.route('/delete-bulk').delete(catchAsync(deleteBulkEmail));
router.route('/create-bulk').post(catchAsync(createBulkEmail));
router.route('/list').get(catchAsync(getEmails));
router.route('/save').post(catchAsync(createEmail));
router.route('/update/:_id').patch(catchAsync(updateEmail));
router.route('/delete/:_id').delete(catchAsync(deleteEmail));
router.route('/:_id').get(catchAsync(getEmail));

module.exports = router;