const express = require("express");

const {
    createWorkerProfile, getWorkerProfile, updateWorkerProfile, getNearbyWorkers
} = require("../controllers/worker.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
    "/profile",
    authMiddleware,
    roleMiddleware(["worker"]),
    createWorkerProfile
);

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware(["worker"]),
    getWorkerProfile
);

router.patch(
    "/editprofile",
    authMiddleware,
    roleMiddleware(["worker"]),
    updateWorkerProfile
);

router.get(
    "/nearby",
    authMiddleware,
    roleMiddleware(["customer"]),
    getNearbyWorkers
);



module.exports = router;