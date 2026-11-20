const express = require("express");

const {
    createCooperativeAdmin, createBootstrapAdmin, getDashboardStats, getAdminServices, getAdminBookings
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
    "/services",
    authMiddleware,
    roleMiddleware("cooperative_admin"),
    getAdminServices
);

router.get(
    "/bookings",
    authMiddleware,
    roleMiddleware("cooperative_admin"),
    getAdminBookings
);

router.get(
    "/dashboard/stats",
    authMiddleware,
    roleMiddleware("cooperative_admin"),
    getDashboardStats
);

module.exports = router;