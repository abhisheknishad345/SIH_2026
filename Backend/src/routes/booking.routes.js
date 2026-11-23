const express = require("express");

const {createBooking, getWorkerBookings, updateBookingStatus,
    getCustomerBookings, cancelBooking, completeBooking, getWorkerDashboardController,
    getWorkerEarningsController, markServiceDone, confirmDemoPayment, updateNegotiatedPrice,
    counterNegotiatedPrice, acceptNegotiatedPrice, rejectNegotiatedPrice,
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

router.put(
    "/:bookingId/service-done",
    authMiddleware,
    roleMiddleware(["worker"]),
    markServiceDone
);

router.put(
    "/:bookingId/pay",
    authMiddleware,
    roleMiddleware(["customer"]),
    confirmDemoPayment
);

router.get(
    "/customer",
    authMiddleware,
    roleMiddleware(["customer"]),
    getCustomerBookings
);


router.get(
    "/worker/dashboard",
    authMiddleware,
    roleMiddleware(["worker"]),
    getWorkerDashboardController
);

router.get(
    "/worker/earnings",
    authMiddleware,
    roleMiddleware(["worker"]),
    getWorkerEarningsController
);





const bookingChatController = require("../controllers/bookingChat.controller");
const bookingChatRoles = roleMiddleware(["customer", "worker"]);

router.put(
    "/:bookingId/chat/price",
    authMiddleware,
    roleMiddleware(["worker"]),
    updateNegotiatedPrice
);

// Negotiation actions: worker makes the initial offer; either party can counter,
// accept or reject an offer made by the other party.
router.post(
    "/:bookingId/negotiation/offer",
    authMiddleware,
    roleMiddleware(["worker"]),
    updateNegotiatedPrice
);

router.post(
    "/:bookingId/negotiation/counter",
    authMiddleware,
    bookingChatRoles,
    counterNegotiatedPrice
);

router.post(
    "/:bookingId/negotiation/accept",
    authMiddleware,
    bookingChatRoles,
    acceptNegotiatedPrice
);

router.post(
    "/:bookingId/negotiation/reject",
    authMiddleware,
    bookingChatRoles,
    rejectNegotiatedPrice
);

router.get(
    "/:bookingId/chat/booking",
    authMiddleware,
    bookingChatRoles,
    bookingChatController.getBookingSummary
);

router.get(
    "/:bookingId/chat/messages",
    authMiddleware,
    bookingChatRoles,
    bookingChatController.getMessages
);

router.post(
    "/:bookingId/chat/messages",
    authMiddleware,
    bookingChatRoles,
    bookingChatController.sendMessage
);

module.exports = router;