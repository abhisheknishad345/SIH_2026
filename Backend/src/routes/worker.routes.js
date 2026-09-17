const express = require("express");

const {
    createWorkerProfile, getWorkerProfile, updateWorkerProfile,
    getNearbyWorkers, getPendingWorkers, verifyWorker, rejectWorker,
    updateWorkerAvailability
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

router.put(
    "/availability",
    authMiddleware,
    roleMiddleware(["worker"]),
    updateWorkerAvailability
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

router.get(
    "/pending",
    authMiddleware,
    roleMiddleware(["cooperative_admin"]),
    getPendingWorkers
);

router.patch(
    "/:workerId/verify",
    authMiddleware,
    roleMiddleware(["cooperative_admin"]),
    verifyWorker
);

router.patch(
    "/:workerId/reject",
    authMiddleware,
    roleMiddleware(["cooperative_admin"]),
    rejectWorker
);



module.exports = router;