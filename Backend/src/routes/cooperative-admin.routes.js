const express = require("express");

const {
    createCooperativeAdmin, createBootstrapAdmin, getDashboardStats
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

router.get(
    "/dashboard/stats",
    authMiddleware,
    roleMiddleware("cooperative_admin"),
    getDashboardStats
);

module.exports = router;