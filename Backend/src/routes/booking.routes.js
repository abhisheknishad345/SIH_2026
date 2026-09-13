const express = require("express");

const {createBooking, getWorkerBookings, updateBookingStatus,
    getCustomerBookings, cancelBooking, completeBooking } = require("../controllers/booking.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["customer"]),
    createBooking
);

router.get(
    "/worker",
    authMiddleware,
    roleMiddleware(["worker"]),
    getWorkerBookings
);

router.put(
    "/:bookingId/status",
    authMiddleware,
    roleMiddleware(["worker"]),
    updateBookingStatus
);

router.put(
    "/:bookingId/cancel",
    authMiddleware,
    roleMiddleware(["customer"]),
    cancelBooking
);

router.put(
    "/:bookingId/complete",
    authMiddleware,
    roleMiddleware(["worker"]),
    completeBooking
);

router.get(
    "/customer",
    authMiddleware,
    roleMiddleware(["customer"]),
    getCustomerBookings
);




module.exports = router;