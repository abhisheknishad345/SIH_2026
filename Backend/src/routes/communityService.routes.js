const express = require("express");

const {
    createCommunityService, getAvailableCommunityServices
} = require("../controllers/communityService.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["cooperative_admin"]),
    createCommunityService
);

router.get(
    "/available",
    authMiddleware,
    roleMiddleware(["worker"]),
    getAvailableCommunityServices
);

module.exports = router;