const { Router } = require('express');
const catchAsync = require('../../utils/catchAsync');

const {
  createAdmin,
  getAdmin,
  updateAdmin,
  deleteAdmin,
  getAdmins,
  getCount,
  createBulkAdmin,
  deleteBulkAdmin,
  httpLoginAdmin,
  httpLoginViaOtp,
  logout,
  httpGetMe,
  httpProtect,
} = require('../../controllers/admin/admin.controllers');

const router = Router();

router.route('/me').get(catchAsync(httpProtect), catchAsync(httpGetMe));
router.route('/login').post(catchAsync(httpLoginAdmin));
router.route('/logout').post(catchAsync(logout));
router.route('/otp-login').post(catchAsync(httpLoginViaOtp));
router.route('/count').get(catchAsync(getCount));
router.route('/delete-bulk').delete(catchAsync(deleteBulkAdmin));
router.route('/create-bulk').post(catchAsync(createBulkAdmin));
router.route('/list').get(catchAsync(getAdmins));
router.route('/save').post(catchAsync(createAdmin));
router.route('/update/:_id').patch(catchAsync(updateAdmin));
router.route('/delete/:_id').delete(catchAsync(deleteAdmin));
router.route('/:_id').get(catchAsync(getAdmin));

module.exports = router;
