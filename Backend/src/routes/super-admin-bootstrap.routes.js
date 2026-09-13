const express = require("express");

const {
    createSuperAdmin
} = require("../controllers/super-admin-bootstrap.controller");

const adminSetupMiddleware = require("../middlewares/adminSetup.middleware");

const router = express.Router();

router.post(
    "/",
    adminSetupMiddleware,
    createSuperAdmin
);

module.exports = router;