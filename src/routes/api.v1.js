const { Router } = require('express');
const emailRouter = require('./emails.router');
const experienceRouter = require('./experience.router');
const salaryRouter = require('./salary.router');
const authRouter = require('./auth.router');
const uploadRouter = require('./upload.router');
const testRouter = require('./tests.router');

const router = Router();

router.use('/emails', emailRouter);
router.use('/uploads', uploadRouter);
router.use('/experiences', experienceRouter);
router.use('/salaries', salaryRouter);
router.use('/auth', authRouter);
router.use('/tests', testRouter);

module.exports = router;
