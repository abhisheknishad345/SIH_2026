const express = require("express");

const {
    createBooking, getWorkerBookings, updateBookingStatus, getCustomerBookings
} = require("../controllers/booking.controller");

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

router.patch(
    "/:bookingId/status",
    authMiddleware,
    roleMiddleware(["worker"]),
    updateBookingStatus
);

router.get(
    "/customer",
    authMiddleware,
    roleMiddleware(["customer"]),
    getCustomerBookings
);



module.exports = router;