const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const BookingChatMessage = require("../models/BookingChatMessage");

const getAccessibleBooking = async (user, bookingId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new Error("Invalid booking ID");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  const isCustomer = user.role === "customer" &&
    booking.customerId.toString() === user._id.toString();
  const isWorker = user.role === "worker" &&
    booking.workerId.toString() === user._id.toString();

  if (!isCustomer && !isWorker) {
    throw new Error("You are not allowed to access this booking chat");
  }

  if (!["in_progress", "completed"].includes(booking.status)) {
    throw new Error("Chat becomes available after the worker accepts the booking");
  }

  return booking;
};

const getMessages = async (user, bookingId) => {
  const booking = await getAccessibleBooking(user, bookingId);
  return BookingChatMessage.find({ bookingId: booking._id })
    .sort({ createdAt: 1 })
    .limit(300)
    .populate("senderId", "fullName role");
};

const sendMessage = async (user, bookingId, content) => {
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Message cannot be empty");
  }
  if (content.trim().length > 2000) {
    throw new Error("Message cannot exceed 2000 characters");
  }

  const booking = await getAccessibleBooking(user, bookingId);
  const message = await BookingChatMessage.create({
    bookingId: booking._id,
    customerId: booking.customerId,
    workerId: booking.workerId,
    senderId: user._id,
    content: content.trim()
  });

  return BookingChatMessage.findById(message._id)
    .populate("senderId", "fullName role");
};

module.exports = { getAccessibleBooking, getMessages, sendMessage };
