const mongoose = require("mongoose");
const ChatMessage = require("../models/ChatMessage");
const Worker = require("../models/Worker");
const CooperativeAdmin = require("../models/CooperativeAdmin");
const User = require("../models/User");

const getWorkerAndAdmin = async (user, workerId) => {
  let worker;
  let admin;

  if (user.role === "worker") {
    worker = await Worker.findOne({
      userId: user._id,
      verificationStatus: "approved",
      isVerified: true
    });

    if (!worker) {
      throw new Error("Chat is available only after your worker profile is approved");
    }

    if (workerId && worker._id.toString() !== workerId) {
      throw new Error("You can only access your own cooperative chat");
    }

    admin = await CooperativeAdmin.findOne({
      cooperativeId: worker.cooperativeId,
      isActive: true
    });

    if (!admin) {
      throw new Error("No active cooperative admin is available");
    }
  } else if (user.role === "cooperative_admin") {
    admin = await CooperativeAdmin.findOne({
      userId: user._id,
      isActive: true
    });

    if (!admin) {
      throw new Error("Active cooperative admin account not found");
    }

    if (!mongoose.Types.ObjectId.isValid(workerId || "")) {
      throw new Error("Valid worker ID is required");
    }

    worker = await Worker.findOne({
      _id: workerId,
      cooperativeId: admin.cooperativeId,
      verificationStatus: "approved",
      isVerified: true
    });

    if (!worker) {
      throw new Error("Approved worker not found in your cooperative");
    }
  } else {
    throw new Error("Only workers and cooperative admins can use this chat");
  }

  return { worker, admin };
};

const getChatContacts = async (user) => {
  if (user.role === "worker") {
    const { worker, admin } = await getWorkerAndAdmin(user);
    const adminUser = await User.findById(admin.userId).select("fullName email");

    return [{
      workerId: worker._id,
      userId: adminUser._id,
      fullName: adminUser.fullName,
      email: adminUser.email,
      role: "cooperative_admin"
    }];
  }

  if (user.role === "cooperative_admin") {
    const admin = await CooperativeAdmin.findOne({
      userId: user._id,
      isActive: true
    });

    if (!admin) {
      throw new Error("Active cooperative admin account not found");
    }

    const workers = await Worker.find({
      cooperativeId: admin.cooperativeId,
      verificationStatus: "approved",
      isVerified: true
    }).populate("userId", "fullName email");

    return workers
      .filter(worker => worker.userId)
      .map(worker => ({
        workerId: worker._id,
        userId: worker.userId._id,
        fullName: worker.userId.fullName,
        email: worker.userId.email,
        role: "worker"
      }));
  }

  throw new Error("Only workers and cooperative admins can use this chat");
};

const getMessages = async (user, workerId) => {
  const { worker, admin } = await getWorkerAndAdmin(user, workerId);

  return ChatMessage.find({
    cooperativeId: worker.cooperativeId,
    workerId: worker._id,
    adminId: admin.userId
  })
    .sort({ createdAt: 1 })
    .limit(200)
    .populate("senderId", "fullName role");
};

const sendMessage = async (user, workerId, content) => {
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Message cannot be empty");
  }

  if (content.trim().length > 2000) {
    throw new Error("Message cannot exceed 2000 characters");
  }

  const { worker, admin } = await getWorkerAndAdmin(user, workerId);

  return ChatMessage.create({
    cooperativeId: worker.cooperativeId,
    workerId: worker._id,
    adminId: admin.userId,
    senderId: user._id,
    content: content.trim()
  });
};

module.exports = { getChatContacts, getMessages, sendMessage };
