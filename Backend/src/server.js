
const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
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

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res) => {
    res.json({
        message: "SIH 2026 Backend is running"
    });
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


const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();