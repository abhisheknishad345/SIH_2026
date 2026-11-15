const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  getChatContacts,
  getMessages,
  sendMessage
} = require("../controllers/chat.controller");

const router = express.Router();
const chatRoles = roleMiddleware(["worker", "cooperative_admin"]);

router.use(authMiddleware, chatRoles);

router.get("/contacts", getChatContacts);
router.get("/:workerId/messages", getMessages);
router.post("/:workerId/messages", sendMessage);

module.exports = router;
