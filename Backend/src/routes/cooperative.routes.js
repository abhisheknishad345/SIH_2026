const express = require("express");

const {createCooperative,
    getAllCooperatives,
    getCooperativeById
} = require("../controllers/cooperative.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["super_admin"]),
    createCooperative
);

router.get("/", getAllCooperatives);

router.get("/:id", getCooperativeById);

module.exports = router;