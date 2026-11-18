const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const User = require("./models/User");
const ChatMessage = require("./models/ChatMessage");
const chatService = require("./services/chat.service");
const bookingChatService = require("./services/bookingChat.service");
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
  process.env.FRONTEND_URL
].filter(Boolean);

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
  socket.activeChatRoom = null;
  socket.activeWorkerId = null;
  socket.activeBookingRoom = null;
  socket.activeBookingId = null;

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
    socket.activeChatRoom = null;
    socket.activeWorkerId = null;
    socket.activeBookingRoom = null;
    socket.activeBookingId = null;
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
