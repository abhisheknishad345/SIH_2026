
const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

require("dotenv").config();
const authRoutes = require("./routes/auth.routes");
const workerRoutes = require("./routes/worker.routes");
const customerRoutes = require("./routes/customer.routes");
const bookingRoutes = require("./routes/booking.routes");
const cooperativeRoutes = require("./routes/cooperative.routes");
const cooperativeAdminRoutes = require("./routes/cooperative-admin.routes");

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
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
app.use("/cooperatives", cooperativeRoutes);
app.use("/cooperative-admin",cooperativeAdminRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();