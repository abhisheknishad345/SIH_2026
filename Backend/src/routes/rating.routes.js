const express = require("express");

const { createRating, getWorkerRatings } = require("../controllers/rating.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["customer"]),
    createRating
);

router.get(
    "/worker/:workerId",
    getWorkerRatings
);

module.exports = router;