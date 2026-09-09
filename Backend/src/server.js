require("dotenv").config();
const authRoutes = require("./routes/auth.routes");
const workerRoutes = require("./routes/worker.routes");
const customerRoutes = require("./routes/customer.routes");

const express = require("express");
const connectDB = require("./config/db");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "SIH 2026 Backend is running"
    });
});

app.use("/auth", authRoutes);
app.use("/workers", workerRoutes);
app.use("/customers", customerRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();