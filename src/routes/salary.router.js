const { Router } = require('express');
const catchAsync = require('../utils/catchAsync');

const {
  createSalary,
  getSalary,
  updateSalary,
  deleteSalary,
  getSalaries,
  getCount,
  createBulkSalary,
  deleteBulkSalary,
} = require('../controllers/salary.controller');

const router = Router();

router.route('/count').get(catchAsync(getCount));
router.route('/delete-bulk').delete(catchAsync(deleteBulkSalary));
router.route('/create-bulk').post(catchAsync(createBulkSalary));
router.route('/list').get(catchAsync(getSalaries));
router.route('/save').post(catchAsync(createSalary));
router.route('/update/:_id').patch(catchAsync(updateSalary));
router.route('/delete/:_id').delete(catchAsync(deleteSalary));
router.route('/:_id').get(catchAsync(getSalary));

module.exports = router;
