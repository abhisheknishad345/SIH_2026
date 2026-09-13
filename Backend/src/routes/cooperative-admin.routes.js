const express = require("express");

const {
    createCooperativeAdmin, createBootstrapAdmin
} = require("../controllers/cooperative-admin.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const adminSetupMiddleware = require("../middlewares/adminSetup.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("super_admin"),
    createCooperativeAdmin
);

router.post(
    "/bootstrap",
    adminSetupMiddleware,
    createBootstrapAdmin
);

module.exports = router;