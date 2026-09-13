const express = require("express");

const {
    createCustomerProfile,
    getCustomerProfile,
    updateCustomerProfile
} = require("../controllers/customer.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
    "/profile",
    authMiddleware,
    roleMiddleware(["customer"]),
    createCustomerProfile
);

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware(["customer"]),
    getCustomerProfile
);

router.put(
    "/profile",
    authMiddleware,
    roleMiddleware(["customer"]),
    updateCustomerProfile
);

module.exports = router;