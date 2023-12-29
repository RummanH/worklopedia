const { Router } = require('express');
const catchAsync = require('../utils/catchAsync');

const {
  createTest,
  getTest,
  updateTest,
  deleteTest,
  getTests,
  getCount,
  createBulkTest,
  deleteBulkTest,
} = require('../controllers/tests.controllers');

const router = Router();

router.route('/count').get(catchAsync(getCount));
router.route('/delete-bulk').delete(catchAsync(deleteBulkTest));
router.route('/create-bulk').post(catchAsync(createBulkTest));
router.route('/list').get(catchAsync(getTests));
router.route('/save').post(catchAsync(createTest));
router.route('/update/:_id').patch(catchAsync(updateTest));
router.route('/delete/:_id').delete(catchAsync(deleteTest));
router.route('/:_id').get(catchAsync(getTest));

module.exports = router;
