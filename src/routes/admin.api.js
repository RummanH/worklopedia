const { Router } = require('express');
const adminRouter = require("./admins/admin.router")

const router = Router();


router.use("/admins", adminRouter)

module.exports = router;
