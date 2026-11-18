const bookingChatService = require("../services/bookingChat.service");

const getMessages = async (req, res) => {
  try {
    const messages = await bookingChatService.getMessages(req.user, req.params.bookingId);
    return res.status(200).json({ success: true, messages });
  } catch (error) {
    return res.status(403).json({ success: false, message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const message = await bookingChatService.sendMessage(
      req.user,
      req.params.bookingId,
      req.body.content
    );
    return res.status(201).json({ success: true, message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getMessages, sendMessage };
