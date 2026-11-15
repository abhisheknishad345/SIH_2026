const chatService = require("../services/chat.service");

const getChatContacts = async (req, res) => {
  try {
    const contacts = await chatService.getChatContacts(req.user);
    res.status(200).json({ success: true, contacts });
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await chatService.getMessages(req.user, req.params.workerId);
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const message = await chatService.sendMessage(
      req.user,
      req.params.workerId,
      req.body.content
    );
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getChatContacts, getMessages, sendMessage };
