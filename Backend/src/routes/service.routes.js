const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
    createService, getServiceCategories,
    getActiveServices, getServiceWorkers
} = require("../controllers/service.controller");

router.post(
    "/create",
    authMiddleware,
    roleMiddleware(["cooperative_admin"]),
    createService
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware(["customer", "worker"]),
    getActiveServices
);

router.get(
    "/categories",
    authMiddleware,
    roleMiddleware(["worker"]),
    getServiceCategories
);

router.get(
    "/:serviceId/workers",
    authMiddleware,
    roleMiddleware(["customer"]),
    getServiceWorkers
);

module.exports = router;