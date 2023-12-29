const { Router } = require('express');
const catchAsync = require('../utils/catchAsync');

const {
  createExperience,
  getExperience,
  updateExperience,
  deleteExperience,
  getExperiences,
  getCount,
  createBulkExperience,
  deleteBulkExperience,
} = require('../controllers/experience.controller');

const router = Router();

router.route('/count').get(catchAsync(getCount));
router.route('/delete-bulk').delete(catchAsync(deleteBulkExperience));
router.route('/create-bulk').post(catchAsync(createBulkExperience));
router.route('/list').get(catchAsync(getExperiences));
router.route('/save').post(catchAsync(createExperience));
router.route('/update/:_id').patch(catchAsync(updateExperience));
router.route('/delete/:_id').delete(catchAsync(deleteExperience));
router.route('/:_id').get(catchAsync(getExperience));

module.exports = router;
