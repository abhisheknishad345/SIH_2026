const express = require("express");

const {
    createWorkerProfile, getWorkerProfile, updateWorkerProfile, getApprovedWorkers,
    getNearbyWorkers, getPendingWorkers, verifyWorker, rejectWorker, getRejectedWorkers,
    updateWorkerAvailability, updateWorkerSchedule, getWorkerSchedule, resubmitWorkerProfile
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

router.put(
    "/editprofile",
    authMiddleware,
    roleMiddleware(["worker"]),
    updateWorkerProfile
);

router.put(
    "/profile/resubmit",
    authMiddleware,
    resubmitWorkerProfile
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

router.put(
    "/:workerId/verify",
    authMiddleware,
    roleMiddleware(["cooperative_admin"]),
    verifyWorker
);

router.put(
    "/:workerId/reject",
    authMiddleware,
    roleMiddleware(["cooperative_admin"]),
    rejectWorker
);

router.patch(
    "/working-hours",
    authMiddleware,
    roleMiddleware(["worker"]),
    updateWorkerSchedule
);

router.get(
    "/working-hours",
    authMiddleware,
    roleMiddleware(["worker"]),
    getWorkerSchedule
);

router.get(
    "/approved",
    authMiddleware,
    roleMiddleware(["cooperative_admin"]),
    getApprovedWorkers
);

router.get(
    "/rejected",
    authMiddleware,
    roleMiddleware(["cooperative_admin"]),
    getRejectedWorkers
);



module.exports = router;