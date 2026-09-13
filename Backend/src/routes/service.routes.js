const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
    createService, createPaidService, getActiveServices, getServiceWorkers
} = require("../controllers/service.controller");

router.post(
    "/free",
    authMiddleware,
    roleMiddleware(["cooperative_admin"]),
    createService
);

router.post(
    "/paid",
    authMiddleware,
    roleMiddleware(["cooperative_admin"]),
    createPaidService
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware(["customer"]),
    getActiveServices
);

router.get(
    "/:serviceId/workers",
    authMiddleware,
    roleMiddleware(["customer"]),
    getServiceWorkers
);

module.exports = router;