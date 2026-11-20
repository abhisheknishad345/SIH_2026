const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const User = require("./models/User");
const Worker = require("./models/Worker");
const ChatMessage = require("./models/ChatMessage");
const chatService = require("./services/chat.service");
const bookingChatService = require("./services/bookingChat.service");
const bookingService = require("./services/booking.service");
const app = express();

require("dotenv").config();
const authRoutes = require("./routes/auth.routes");
const workerRoutes = require("./routes/worker.routes");
const customerRoutes = require("./routes/customer.routes");
const bookingRoutes = require("./routes/booking.routes");
const ratingRoutes = require("./routes/rating.routes");
const cooperativeRoutes = require("./routes/cooperative.routes");
const superAdminBootstrapRoutes = require("./routes/super-admin-bootstrap.routes");
const cooperativeAdminRoutes = require("./routes/cooperative-admin.routes");
const communityServiceRoutes = require("./routes/communityService.routes");
const serviceRoutes = require("./routes/service.routes");
const chatRoutes = require("./routes/chat.routes");

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "").split(",")
].map(origin => origin?.trim()).filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Minor Project 2026 Backend is running" });
});

app.use("/auth", authRoutes);
app.use("/workers", workerRoutes);
app.use("/customers", customerRoutes);
app.use("/bookings", bookingRoutes);
app.use("/ratings", ratingRoutes);
app.use("/cooperatives", cooperativeRoutes);
app.use("/super-admin/bootstrap", superAdminBootstrapRoutes);
app.use("/cooperative-admins", cooperativeAdminRoutes);
app.use("/community-services", communityServiceRoutes);
app.use("/services", serviceRoutes);
app.use("/chats", chatRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Temporary live locations: kept in memory only, never persisted to MongoDB.
const bookingMapLocations = new Map();
const getBookingMapRoom = bookingId => "booking-map:" + bookingId;

const getCookieToken = (cookieHeader = "") => {
  const tokenCookie = cookieHeader
    .split(";")
    .map(item => item.trim())
    .find(item => item.startsWith("token="));

  if (!tokenCookie) return null;

  try {
    return decodeURIComponent(tokenCookie.slice("token=".length));
  } catch {
    return tokenCookie.slice("token=".length);
  }
};

// Authenticate every socket using the same JWT cookie as the REST API.
io.use(async (socket, next) => {
  try {
    const authHeader = socket.handshake.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    const token = bearerToken || getCookieToken(socket.handshake.headers.cookie);

    if (!token) return next(new Error("Authentication required"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.emailVerified) {
      return next(new Error("Invalid or unverified account"));
    }

    if (!["worker", "cooperative_admin", "customer"].includes(user.role)) {
      return next(new Error("Chat access is not allowed for this account"));
    }

    socket.user = user;
    next();
  } catch {
    next(new Error("Invalid or expired authentication token"));
  }
});

io.on("connection", socket => {
  socket.activeMapRoom = null;
  socket.activeMapBookingId = null;
  socket.activeChatRoom = null;
  socket.activeWorkerId = null;
  socket.activeBookingRoom = null;
  socket.activeBookingId = null;

  socket.on("booking-map:join", async (payload = {}, acknowledge = () => {}) => {
    try {
      const bookingId = String(payload.bookingId || "");
      const booking = await bookingChatService.getAccessibleBooking(socket.user, bookingId);
      if (booking.status !== "in_progress") {
        return acknowledge({ success: false, message: "Live location is available only while the booking is in progress" });
      }

      if (socket.activeMapRoom) socket.leave(socket.activeMapRoom);
      const room = getBookingMapRoom(booking._id.toString());
      await socket.join(room);
      socket.activeMapRoom = room;
      socket.activeMapBookingId = booking._id.toString();

      const saved = bookingMapLocations.get(socket.activeMapBookingId) || {};
      const workerProfile = await Worker.findOne({ userId: booking.workerId }).select("location");
      const coordinates = booking.location?.coordinates || [];
      const customerLocation = coordinates.length === 2
        ? { longitude: Number(coordinates[0]), latitude: Number(coordinates[1]) }
        : null;
      const workerCoordinates = workerProfile?.location?.coordinates || [];
      const workerInitialLocation = workerCoordinates.length === 2
        ? { longitude: Number(workerCoordinates[0]), latitude: Number(workerCoordinates[1]) }
        : null;

      acknowledge({
        success: true,
        role: socket.user.role,
        customerLocation,
        workerInitialLocation,
        workerLiveLocation: saved.worker || workerInitialLocation
      });
    } catch (error) {
      acknowledge({ success: false, message: error.message });
    }
  });

  socket.on("booking-map:location", async (payload = {}, acknowledge = () => {}) => {
    try {
      const bookingId = String(payload.bookingId || "");
      if (!socket.activeMapBookingId || socket.activeMapBookingId !== bookingId) {
        return acknowledge({ success: false, message: "Join this booking map before sharing location" });
      }
      if (socket.user.role !== "worker") {
        return acknowledge({ success: false, message: "Only the assigned worker shares live GPS location" });
      }
      const booking = await bookingChatService.getAccessibleBooking(socket.user, bookingId);
      if (booking.status !== "in_progress") {
        return acknowledge({ success: false, message: "Live location sharing has ended for this booking" });
      }

      const latitude = Number(payload.latitude);
      const longitude = Number(payload.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
          latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return acknowledge({ success: false, message: "Invalid location coordinates" });
      }

      const locations = bookingMapLocations.get(bookingId) || {};
      const location = { latitude, longitude, updatedAt: Date.now(), role: "worker" };
      locations.worker = location;
      bookingMapLocations.set(bookingId, locations);
      socket.to(getBookingMapRoom(bookingId)).emit("booking-map:worker-location", location);
      acknowledge({ success: true });
    } catch (error) {
      acknowledge({ success: false, message: error.message });
    }
  });

  socket.on("booking-map:leave", () => {
    if (socket.activeMapRoom) socket.leave(socket.activeMapRoom);
    socket.activeMapRoom = null;
    socket.activeMapBookingId = null;
  });

  socket.on("booking-chat:join", async (payload = {}, acknowledge = () => {}) => {
    try {
      const bookingId = String(payload.bookingId || "");
      const booking = await bookingChatService.getAccessibleBooking(socket.user, bookingId);
      const room = `booking-chat:${booking._id}`;

      if (socket.activeBookingRoom) socket.leave(socket.activeBookingRoom);
      await socket.join(room);
      socket.activeBookingRoom = room;
      socket.activeBookingId = booking._id.toString();
      acknowledge({ success: true });
    } catch (error) {
      acknowledge({ success: false, message: error.message });
    }
  });

  socket.on("booking-chat:update-price", async (payload = {}, acknowledge = () => {}) => {
    try {
      const bookingId = String(payload.bookingId || "");
      if (!socket.activeBookingId || socket.activeBookingId !== bookingId || socket.user.role !== "worker") {
        return acknowledge({ success: false, message: "Only the assigned worker can update this booking price" });
      }
      const result = await bookingService.updateNegotiatedPrice({
        bookingId,
        workerId: socket.user._id,
        price: Number(payload.price)
      });
      io.to(socket.activeBookingRoom).emit("booking-chat:price", {
        bookingId,
        price: result.booking.price,
        pricingStatus: result.booking.pricingStatus
      });
      acknowledge({ success: true, booking: result.booking });
    } catch (error) {
      acknowledge({ success: false, message: error.message });
    }
  });

  socket.on("booking-chat:send", async (payload = {}, acknowledge = () => {}) => {
    try {
      const bookingId = String(payload.bookingId || "");
      if (!socket.activeBookingId || socket.activeBookingId !== bookingId) {
        return acknowledge({ success: false, message: "Join this booking chat before sending a message" });
      }

      const savedMessage = await bookingChatService.sendMessage(
        socket.user,
        bookingId,
        payload.content
      );

      io.to(socket.activeBookingRoom).emit("booking-chat:message", savedMessage);
      acknowledge({ success: true, message: savedMessage });
    } catch (error) {
      acknowledge({ success: false, message: error.message });
    }
  });

  socket.on("chat:join", async (payload = {}, acknowledge = () => {}) => {
    try {
      const workerId = String(payload.workerId || "");
      const { worker } = await chatService.getWorkerAndAdmin(socket.user, workerId);
      const room = `cooperative-chat:${worker._id}`;

      if (socket.activeChatRoom) socket.leave(socket.activeChatRoom);
      await socket.join(room);
      socket.activeChatRoom = room;
      socket.activeWorkerId = worker._id.toString();

      acknowledge({ success: true });
    } catch (error) {
      acknowledge({ success: false, message: error.message });
    }
  });

  socket.on("chat:send", async (payload = {}, acknowledge = () => {}) => {
    try {
      const workerId = String(payload.workerId || "");
      if (!socket.activeWorkerId || socket.activeWorkerId !== workerId) {
        return acknowledge({ success: false, message: "Join this conversation before sending a message" });
      }

      const savedMessage = await chatService.sendMessage(
        socket.user,
        workerId,
        payload.content
      );

      const message = await ChatMessage.findById(savedMessage._id)
        .populate("senderId", "fullName role");

      // Broadcast only after MongoDB confirms the message has been saved.
      io.to(socket.activeChatRoom).emit("chat:message", message);
      acknowledge({ success: true, message });
    } catch (error) {
      acknowledge({ success: false, message: error.message });
    }
  });

  socket.on("disconnect", () => {
    if (socket.activeMapRoom) socket.leave(socket.activeMapRoom);
    socket.activeMapRoom = null;
    socket.activeMapBookingId = null;
    socket.activeChatRoom = null;
    socket.activeWorkerId = null;
    socket.activeBookingRoom = null;
    socket.activeBookingId = null;
  });
});

const PORT = process.env.PORT || 5500;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
